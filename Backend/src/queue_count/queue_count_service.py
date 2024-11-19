import pyodbc
from src.database_connect import get_db_connection
from datetime import datetime

#Function that calculates if a point x,y is in a rectangle defined by bl_x, bl_y, tr_x, tr_y
def point_in_zone(x, y, bl_x, bl_y, tr_x, tr_y):
    return bl_x <= x <= tr_x and bl_y <= y <= tr_y

#Function that calculates the amount of coordinates in "points" that intersect with an arbitary amount of regions of interest.
def count_points_in_zones(points, zones):
    counts = [0] * len(zones)  
    for i, (_, top, bot, lef, rig, _, _, _) in enumerate(zones):
        for x, y in points:
            if point_in_zone(x, y, lef, bot, rig, top):
                counts[i] += 1 

    return counts

#Function that calculates the bottom middle coord of an input object.
def to_coord(b,l,r):
    #returns 1-b since the camera starts 0,0 top left instead of bot left
    return [(l+r)/2, 1-b]



async def upload_function(i, counts, incoming_datetime, RoIs):
    #search and find lastest timestamp for each roi in queue count  
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH LatestCustomerCount AS (
                SELECT 
                    RoI,
                    NumberOfCustomers,
                    Timestamp,
                    ROW_NUMBER() OVER (PARTITION BY RoI ORDER BY Timestamp DESC) AS row_num
                FROM QueueCount
                )
                SELECT 
                    RoI,
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

    #Check if amount if people has changed in the RoI
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
                """, (counts[i], incoming_datetime, RoIs[i][0]))
            conn.commit()
            print("Data uploaded successfully")
            return "Data uploaded successfully"
        except pyodbc.Error as e:
            print(f"Error inserting data: {e}")
            return "Error uploading data"
        finally:
            conn.close()
    else: 
        print("Data not uploaded, queue is too small")
        return "Data not uploaded, queue is too small"
    
async def upload_data_to_db(data):

    #coords of each person in frame
    points = [
        to_coord(obs["bounding_box"]["bottom"], obs["bounding_box"]["left"], obs["bounding_box"]["right"])
        for obs in data.get("observations", [])
    ]

    #Get RoI data from coordinates table in DB where the camera id matches post request id
    #RoI[i] = id : top : bot : left : right : threshhold : cameraID : name
    #so in coordinates of a rectangle, TR_y, BL_y, BL_x, TR_x
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        camera_id = data.get("camera_id")
        query = "SELECT * FROM Coordinates WHERE CameraID = ?"
        cursor.execute(query, (camera_id,))
        RoIs = cursor.fetchall()
    except pyodbc.Error as e:
        print(f"Error getting RoI data: {e}")
        return "Error getting RoI data"
    finally:
        conn.close()
    
    #counts represent the amount of people in each ROI
    counts = count_points_in_zones(points, RoIs)

    incoming_datetime = datetime.strptime(data['timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")

    for i in range(len(RoIs)):
        await upload_function(i, counts, incoming_datetime, RoIs)

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
