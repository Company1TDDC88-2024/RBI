from flask import Flask, request, jsonify, Response
from flask import Blueprint, request, jsonify, session
import pyodbc
from src.database_connect import get_db_connection
from src.login.login_routes import get_email
from datetime import datetime
from datetime import timedelta
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

from cryptography.fernet import Fernet

key = b'3wqWt9HPKvl0MGA6TL5x18As--2L6mdoZsPRTzSkE3A=' 
cipher_suite = Fernet(key)

# Dictionary to store the last timestamp for each ROI
timestamps_roi = {}
timestamps_start = {}
last_upload_time = None
count_prev: int

#temp
bol_check = True

last_email_time = None

#Function that calculates if a point x,y is in a rectangle defined by bl_x, bl_y, tr_x, tr_y
def point_in_zone(x, y, bl_x, bl_y, tr_x, tr_y):
    return bl_x <= x <= tr_x and bl_y <= y <= tr_y

#Function that calculates the amount of coordinates in "points" that intersect with an arbitary amount of regions of interest.
def count_points_in_zones(points, zones):
    counts = [0] * len(zones)  
    for i, (_, top, bot, lef, rig, _, _, _, _, _) in enumerate(zones):
        for x, y in points:
            if point_in_zone(x, y, lef, bot, rig, top):
                counts[i] += 1 
    return counts


#Function that calculates the bottom middle coord of an input object.
def to_coord(b,l,r):
    #returns 1-b since the camera starts 0,0 top left instead of bot left
    return [(l+r)/2, 1-b]

async def upload_queue_alert(ROI_id, count, timestamp):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()

    encrypted_count = cipher_suite.encrypt(str(count).encode())
    try:
        # Adding data to the "QueueCount" table
        cursor.execute("""
            INSERT INTO QueueCount (NumberOfCustomers, Timestamp, ROI)
            VALUES (?, ?, ?)
            """, (encrypted_count, timestamp, ROI_id))
        conn.commit()
        print("Data uploaded successfully")
        return "Data uploaded successfully"
    except pyodbc.Error as e:
        print(f"Error inserting data: {e}")
        return "Error uploading data"
    finally:
        conn.close()

async def upload_function_fast(i, ROIs, counts, timestamp):
    ROI_id = ROIs[i][0]
    count = counts[i]
    old_count = ROIs[i][9]

    if old_count != count:
        #change RoI currenctcount value in DB
        conn = await get_db_connection()
        if conn is None:
            return "Failed to connect to database"
        cursor = conn.cursor()
        try:
            query = "UPDATE Coordinates SET CurrentCount = ? WHERE id = ? " #Make real logic for this
            cursor.execute(query, (count, ROI_id))
            conn.commit()
        except pyodbc.Error as e:
            print(f"Error setting new queue count: {e}")
            return "Error setting new queue count"
        finally:
            conn.close()

    await play_sound(counts[i], ROIs[i], timestamp)

async def upload_data_to_db(data):
    #Get the timestamp from camera to correct format for DB
    incoming_datetime = datetime.strptime(data['timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
    #Get the camera_id of the camera
    camera_id = data.get("camera_id")

    #Check that we dont upload too often, there might be an issue with 2 cameras here.
    global last_upload_time
    # Check if the last upload was within the last x seconds
    if last_upload_time and (datetime.now() - last_upload_time) < timedelta(seconds=2):
        return "Upload skipped to avoid frequent uploads"
    last_upload_time = datetime.now()

    #Get ROI data from coordinates table in DB where the camera id matches post request id
    #ROI[i] = ID : TopBound : BottomBound : LeftBound : RightBound : Threshold : CameraID : Name : CooldownTime
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        
        query = "SELECT * FROM Coordinates WHERE CameraID = ?"
        cursor.execute(query, (camera_id,))
        ROIs = cursor.fetchall()
    except pyodbc.Error as e:
        print(f"Error getting ROI data: {e}")
        return "Error getting ROI data"
    finally:
        conn.close()

    #Calculate the coords of each person in the frame
    points = [
        to_coord(obs["bounding_box"]["bottom"], obs["bounding_box"]["left"], obs["bounding_box"]["right"])
        for obs in data.get("observations", [])
    ]
    
    #counts represent the amount of people in each ROI
    counts = count_points_in_zones(points, ROIs)

    for i in range(len(ROIs)):
        await upload_function_fast(i, ROIs, counts, incoming_datetime)

async def get_data_from_db():
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fetch data from QueueCount table
        cursor.execute("SELECT ID, NumberOfCustomers, Timestamp, ROI FROM QueueCount")
        rows = cursor.fetchall()
        data = []

        for row in rows:
            # Decrypt the 'NumberOfCustomers' field
            encrypted_count = row[1]  # Assuming encrypted count is in the second column
            try:
                decrypted_count = cipher_suite.decrypt(encrypted_count).decode('utf-8')  # Decrypt and convert to string
            except Exception as e:
                print(f"Error decrypting NumberOfCustomers: {e}")
                decrypted_count = None  # Handle decryption failure
            
            data.append({
                'ID': row[0],
                'NumberOfCustomers': decrypted_count,
                'Timestamp': row[2],
                'ROI': row[3],
            })

        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()

async def play_sound(count, ROI, timestamp):
    ROI_id = ROI[0]
    threshold = ROI[5]
    name = ROI[7]
    clip_id = 39
    cooldown = ROI[8]
    cooldown_period = timedelta(minutes=cooldown)
    
    if ROI_id == 1:
        clip_id = 39
    else:
        clip_id = 38

    if ROI_id not in timestamps_roi:
        timestamps_roi[ROI_id] = datetime.now() - cooldown_period

    if ROI_id not in timestamps_start:
        timestamps_start[ROI_id] = datetime.now()
    elif datetime.now() - timestamps_start[ROI_id] > timedelta(seconds=15):
        timestamps_start[ROI_id] = datetime.now()

    number_of_customers = count

    # if (ROI_id == 1):
    #     print(f"NUMBER OF CUSTOMERS IN ROI {ROI_id}: {number_of_customers}")
    #     print(f"Threshold for ROI {ROI_id}: {threshold}")
    #     print(f"Timestamp in ROI list {ROI_id}: {timestamps_roi[ROI_id]}")
    #     print(f"Cooldown period: {cooldown_period}")
    #     print(f"Time left for cooldown: {datetime.now() - timestamps_roi[ROI_id]}")
    #     print(f"Timestamp in start list for ROI {ROI_id}: {timestamps_start[ROI_id]}")
    #     print(f"Current time: {datetime.now()}")
    #     print(f"Time difference for ROI {ROI_id}: {datetime.now() - timestamps_start[ROI_id]}")

    await upload_queue_alert(ROI_id, count, timestamp) #this should be called whenever we make sound, unsure if correct position
    if await check_threshold(threshold, number_of_customers) and (datetime.now() - timestamps_roi[ROI_id]) > cooldown_period and datetime.now() - timestamps_start[ROI_id] > timedelta(seconds=10):
        sendAlertEmail()
        target_url = f"http://localhost:4000/forward_to_speaker?sound_id={str(clip_id)}"
        timestamps_roi[ROI_id] = datetime.now()
        try:
            response = requests.get(target_url)
            if response.status_code == 200:
                return jsonify({'status': 'success', 'message': 'Data forwarded successfully'}), 200
            else:
                return jsonify({'status': 'error', 'message': 'Failed to forward data'}), response.status_code
        except requests.exceptions.RequestException as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    # elif ROI_id in timestamps_start and timestamps_start[ROI_id] is not None and datetime.now() - timestamps_start[ROI_id] > timedelta(seconds=20):
    #     print(f"Queue count for ROI {ROI_id} is below threshold or cooldown period has not passed")
    #     if ROI_id in timestamps_start:
    #         print(f"Removing ROI {ROI_id} from timestamps_start due 
    # to cooldown")
    #         del timestamps_start[ROI_id]
    
async def check_threshold(threshold, count):
    
    if count >= threshold: #If the queue count is greater than or equal to the threshold, might change
        return True
    else:
        return False

async def sendAlertEmail(name):
    # Check if the user is logged in by accessing 'user_id' in the session
    user_id = session.get('user_id')  # Get user_id from the session

    if not user_id:
        print("Error: User is not logged in.")
        return  # Exit the function if user_id is not found

    # If user_id is found, proceed with the email
    print(f"User ID: {user_id}")

    # URL for the API, passing user_id as part of the URL
    url = f'http://127.0.0.1:5555/api/login/get_email/{user_id}'  # Pass user_id in the URL

    try:
        # Make the GET request with the cookies
        response = requests.get(url)
        
        # Check if the response is successful
        if response.status_code == 200:
            email_data = response.json()
            email_receiver = email_data.get('email')
            
            if email_receiver is None:
                print("Error: No email found in the response.")
            else:
                print(f"Email: {email_receiver}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error calling /get_email route: {e}")

    # Log the email receiver
    print("THE EMAIL RECEIVER IS: " + email_receiver)
    
    email_sender = "company1.customer@gmail.com"
    email_password = "rpmu qrel qczc jmhd"

    # Create the email content (including Queue Label and Timestamp of the threshold being executed)
    subject = "Queue Alert!"
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Format the current time
    body = (
        f"The queue in area of interest: {name} has surpassed the threshold. Time of this alert: {current_time}"
    )

    # Create a multipart email
    msg = MIMEMultipart()
    msg['From'] = email_sender
    msg['To'] = email_receiver
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Secure the connection
            server.login(email_sender, email_password)
            server.send_message(msg)
            print("Email sent successfully!")
    except Exception as e:
        print(f"Error occurred: {e}")


# async def check_queue_time(count, ROI_id, threshold):
#     if ROI_id not in timestamps_start:
#         timestamps_start[ROI_id] = datetime.now()
#         print(f"Initialized timestamp for ROI {ROI_id} at {timestamps_start[ROI_id]}")

#     current_time = datetime.now()
#     time_difference = current_time - timestamps_start[ROI_id]

#     print(f"Timestamp in start list for ROI {ROI_id}: {timestamps_start[ROI_id]}")
#     print(f"Current time: {current_time}")
#     print(f"Time difference for ROI {ROI_id}: {time_difference}")

#     if count >= threshold and time_difference > timedelta(seconds=20):
#         timestamps_start[ROI_id] = current_time
#         print(f"Queue time check passed for ROI {ROI_id}. Updated timestamp to {timestamps_start[ROI_id]}")
#         return True
#     else:
#         print(f"Queue time check failed for ROI {ROI_id}. Count: {count}, Threshold: {threshold}, Time difference: {time_difference}")
#         return False
    


async def get_queues_from_db():
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Coordinates")
        rows = cursor.fetchall()
        
        # Convert rows to list of dictionaries
        current_count = [
            {"ROI": row[0], "NumberOfCustomers": row[9], "Timestamp": row[1]}
            for row in rows
        ]
        return current_count
    except:
        return "Error uploading data"
    finally:
        conn.close()

