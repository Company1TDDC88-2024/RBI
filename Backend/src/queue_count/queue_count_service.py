import pyodbc
from src.database_connect import get_db_connection

async def upload_data_to_db(data):
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
        """, (data['NumberOfCustomers'], data['Timestamp'], data['ROI']))
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
