import pyodbc
from src.database_connect import get_db_connection
from datetime import datetime

#Function that calculates if a point x,y is in a rectangle defined by bl_x, bl_y, tr_x, tr_y
def point_in_zone(x, y, bl_x, bl_y, tr_x, tr_y):
    return bl_x <= x <= tr_x and bl_y <= y <= tr_y

#Function that calculates the amount of coordinates in "points" that intersect with an arbitary amount of regions of interest.
def count_points_in_zones(points, zones):
    counts = [0] * len(zones)  
    for i, (_, top, bot, lef, rig) in enumerate(zones):
        for x, y in points:
            if point_in_zone(x, y, lef, bot, rig, top):
                counts[i] += 1 

    return counts

#Function that calculates the bottom middle coord of an input object.
def to_coord(b,l,r):
    #returns 1-b since the camera starts 0,0 top left instead of bot left
    return [(l+r)/2, 1-b]



async def upload_function(i, counts, incoming_datetime, RoIs):
    #this could easily be any value with another row in coordinate table
    QUEUE_THRESHOLD = 1
    if (counts[i] > QUEUE_THRESHOLD): #Check if there are more people than "allowed"

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

    #Get RoI data from coordinates table in DB
    #RoI[i]  = id : top : bot : left : right
    #so in coordinates of a rectangle, TR_y, BL_y, BL_x, TR_x
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Coordinates")
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
                'ROI': row[3]
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()
