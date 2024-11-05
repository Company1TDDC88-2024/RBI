import pyodbc
from src.database_connect import get_db_connection

def point_in_zone(x, y, bl_x, bl_y, tr_x, tr_y):
    return bl_x <= x <= tr_x and bl_y <= y <= tr_y

def count_points_in_zones(points, zones):
    counts = [0] * len(zones)  

    for x, y in points:
        for i, (bl_x, bl_y, tr_x, tr_y) in enumerate(zones):
            if point_in_zone(x, y, bl_x, bl_y, tr_x, tr_y):
                counts[i] += 1 

    return counts

def to_coord(b,l,r):
    return [(l+r)/2, b]

async def upload_data_to_db(data):
    # Count how many key-value pairs are in the data dictionary

    print(f"Number of key-value pairs in data: {data_count}")
    
    #ROIs defined here as bottomleft coord, topright coord, and the queue threshhold for the roi
    ROIs = [ 
        [ [0.0, 0.0], [0.5, 0.5] , 2],
        [ [0.5, 0.5], [1, 1], 1]
    ]

    points = [
        to_coord(obs["bounding_box"]["bottom"], obs["bounding_box"]["left"], obs["bounding_box"]["right"])
        for obs in data.get("observations", [])
    ]
    

    counts = count_points_in_zones(points, ROIs)


    for i in range(points):
        if (counts[i] >= ROIs[i][3]):
            
            conn = await get_db_connection()
            if conn is None:
                return "Failed to connect to database"

            cursor = conn.cursor()

            try:
                # Kontrollera om ROI existerar i Coordinates-tabellen
                cursor.execute("SELECT COUNT(*) FROM Coordinates WHERE ID = ?", data['ROI'])
                roi_exists = cursor.fetchone()[0]

                if roi_exists == 0:
                    return f"Error: ROI with ID {data['ROI']} does not exist. Please choose a valid ROI."

                # Lägger till data i QueueCount-tabellen
                cursor.execute("""
                    INSERT INTO QueueCount (NumberOfCustomers, Timestamp, ROI)
                    VALUES (?, ?, ?)
                """, (counts[i], data['Timestamp'], i ))
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
