import pyodbc
from src.database_connect import get_db_connection


async def upload_data_to_db(data):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Lägger till data i Coordinates-tabellen
        cursor.execute("""
            INSERT INTO Coordinates (TopBound, BottomBound, LeftBound, RightBound, Threshold, CameraID, Name, CooldownTime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (data['TopBound'], data['BottomBound'], data['LeftBound'], data['RightBound'], data['Threshold'], data['CameraID'], data['Name'], data['CooldownTime']))
        conn.commit()
        return "Data uploaded successfully"
    except pyodbc.Error as e:
        print(f"Error inserting data: {e}")
        return "Error uploading data"
    finally:
        conn.close()

async def get_data_from_db():
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Hämta all data från Coordinates-tabellen
        cursor.execute("SELECT ID, TopBound, BottomBound, LeftBound, RightBound, Threshold, CameraID, Name, CooldownTime FROM Coordinates")
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'TopBound': row[1],
                'BottomBound': row[2],
                'LeftBound': row[3],
                'RightBound': row[4],
                'Threshold': row[5],
                'CameraID': row[6],
                'Name': row[7],
                'CooldownTime': row[8]
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()
        

import pyodbc
from src.database_connect import get_db_connection  # Assuming this function provides a pyodbc connection

async def update_data_in_db(id: int, data: dict):
    # Get the database connection
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Update the data in the Coordinates table
        update_query = """
            UPDATE Coordinates
            SET TopBound = ?, BottomBound = ?, LeftBound = ?, RightBound = ?, 
                Threshold = ?, CameraID = ?, Name = ?, CooldownTime = ?
            WHERE ID = ?
        """
        
        # Bind the data to the query
        cursor.execute(update_query, (
            data.get('TopBound', None),
            data.get('BottomBound', None),
            data.get('LeftBound', None),
            data.get('RightBound', None),
            data.get('Threshold', None),
            data.get('CameraID', None),
            data.get('Name', None),
            data.get('CooldownTime', None),
        id
        ))

        # Commit the changes to the database
        conn.commit()

        # Check if any rows were affected
        if cursor.rowcount > 0:
            return True
        else:
            return "Coordinate not found"

    except pyodbc.Error as e:
        print(f"Error updating data: {e}")
        return "Error updating data"
    finally:
        conn.close()
