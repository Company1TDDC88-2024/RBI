from flask import Flask, request, jsonify, Response
import pyodbc
from src.database_connect import get_db_connection
from datetime import datetime
from datetime import timedelta
import requests

from cryptography.fernet import Fernet

key = b'3wqWt9HPKvl0MGA6TL5x18As--2L6mdoZsPRTzSkE3A=' 
cipher_suite = Fernet(key)

# Dictionary to store the last timestamp for each ROI
timestamps_roi = {}
timestamps_start = {}
last_upload_time = None
count_prev: int

#Function that calculates if a point x,y is in a rectangle defined by bl_x, bl_y, tr_x, tr_y
def point_in_zone(x, y, bl_x, bl_y, tr_x, tr_y):
    return bl_x <= x <= tr_x and bl_y <= y <= tr_y

#Function that calculates the amount of coordinates in "points" that intersect with an arbitary amount of regions of interest.
def count_points_in_zones(points, zones):
    counts = [0] * len(zones)  
    for i, (_, top, bot, lef, rig, _, _, _, _) in enumerate(zones):
        for x, y in points:
            if point_in_zone(x, y, lef, bot, rig, top):
                counts[i] += 1 

    return counts

#Function that calculates the bottom middle coord of an input object.
def to_coord(b,l,r):
    #returns 1-b since the camera starts 0,0 top left instead of bot left
    return [(l+r)/2, 1-b]

async def upload_function(i, counts, incoming_datetime, ROIs):
    
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH LatestCustomerCount AS (
                SELECT 
                    ROI,
                    NumberOfCustomers,
                    Timestamp,
                    ROW_NUMBER() OVER (PARTITION BY ROI ORDER BY Timestamp DESC) AS row_num
                FROM QueueCount
                )
                SELECT 
                    ROI,
                    NumberOfCustomers,
                    Timestamp
                    FROM LatestCustomerCount
                WHERE row_num = 1;
                """)
        # create a list of these rows "current_count"
        current_count = cursor.fetchall()
    except:
        return "Error uploading data"
    finally:
        conn.close()

    await play_sound(counts[i], ROIs[i])

    #CALL THE SPEAKER SOUND HERE
    #await play_sound(counts, [38, 0, 0, 0, 0, 0])#TEST REMOVE LATER

    #Check if amount if people has changed in the ROI
    if (counts[i] != current_count[i][1]):
        conn = await get_db_connection()
        if conn is None:
            return "Failed to connect to database"
        cursor = conn.cursor()

        try:
            # Adding data to the "QueueCount" table
            cursor.execute("""
            INSERT INTO QueueCount (NumberOfCustomers, Timestamp, ROI)
                VALUES (?, ?, ?)
                """, (counts[i], incoming_datetime, ROIs[i][0]))
            conn.commit()
            print("Data uploaded successfully")
            return "Data uploaded successfully"
        except pyodbc.Error as e:
            print(f"Error inserting data: {e}")
            return "Error uploading data"
        finally:
            conn.close()
    else: 
        #print("Data not uploaded, queue is too small")
        return "Data not uploaded, queue is too small"
    
async def upload_data_to_db(data):

    #coords of each person in frame
    points = [
        to_coord(obs["bounding_box"]["bottom"], obs["bounding_box"]["left"], obs["bounding_box"]["right"])
        for obs in data.get("observations", [])
    ]

    #Get ROI data from coordinates table in DB where the camera id matches post request id
    #ROI[i] = ID : TopBound : BottomBound : LeftBound : RightBound : Threshold : CameraID : Name : CooldownTime
    #so in coordinates of a rectangle, TR_y, BL_y, BL_x, TR_x
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        camera_id = data.get("camera_id")
        query = "SELECT * FROM Coordinates WHERE CameraID = ?"
        cursor.execute(query, (camera_id,))
        ROIs = cursor.fetchall()
    except pyodbc.Error as e:
        print(f"Error getting ROI data: {e}")
        return "Error getting ROI data"
    finally:
        conn.close()
    
    #counts represent the amount of people in each ROI
    counts = count_points_in_zones(points, ROIs)

    incoming_datetime = datetime.strptime(data['timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")

    for i in range(len(ROIs)):
        await upload_function(i, counts, incoming_datetime, ROIs)

async def get_data_from_db():
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Hämta all data från CustomerCount-tabellen
        cursor.execute("SELECT ID, NumberOfCustomers, Timestamp, ROI FROM QueueCount")
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'NumberOfCustomers': row[1],
                'Timestamp': row[2],
                'ROI': row[3],
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()

async def play_sound(count, ROI):
    ROI_id = ROI[0]
    threshold = ROI[5]
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

    if await check_threshold(threshold, number_of_customers) and (datetime.now() - timestamps_roi[ROI_id]) > cooldown_period and datetime.now() - timestamps_start[ROI_id] > timedelta(seconds=10):
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
    #         print(f"Removing ROI {ROI_id} from timestamps_start due to cooldown")
    #         del timestamps_start[ROI_id]
    
async def check_threshold(threshold, count):
    if count >= threshold: #If the queue count is greater than or equal to the threshold, might change
        return True
    else:
        return False
    
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
        cursor.execute("""
            WITH LatestCustomerCount AS (
                SELECT 
                    ROI,
                    NumberOfCustomers,
                    Timestamp,
                    ROW_NUMBER() OVER (PARTITION BY ROI ORDER BY Timestamp DESC) AS row_num
                FROM QueueCount
                )
                SELECT 
                    ROI,
                    NumberOfCustomers,
                    Timestamp
                    FROM LatestCustomerCount
                WHERE row_num = 1;
                """)
        rows = cursor.fetchall()
        
        # Convert rows to list of dictionaries
        current_count = [
            {"ROI": row[0], "NumberOfCustomers": row[1], "Timestamp": row[2]}
            for row in rows
        ]
        return current_count
    except:
        return "Error uploading data"
    finally:
        conn.close()

