import pyodbc
from src.database_connect import get_db_connection

def upload_data_to_db(data):
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Lägger till data i CustomerCount-tabellen
        cursor.execute("""
            INSERT INTO CustomerCount (NumberOfCustomers, Timestamp)
            VALUES (?, ?)
        """, (data['NumberOfCustomers'], data['Timestamp']))
        conn.commit()
        return "Data uploaded successfully"
    except pyodbc.Error as e:
        print(f"Error inserting data: {e}")
        return "Error uploading data"
    finally:
        conn.close()

def get_data_from_db():
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Hämta all data från CustomerCount-tabellen
        cursor.execute("SELECT ID, NumberOfCustomers, Timestamp FROM CustomerCount")
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'NumberOfCustomers': row[1],
                'Timestamp': row[2],
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()


def get_number_of_customers(start_timestamp, end_timestamp):
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Hämta alla rader mellan start_timestamp och end_timestamp
        cursor.execute("""
            SELECT NumberOfCustomers 
            FROM CustomerCount 
            WHERE Timestamp >= ? AND Timestamp <= ?
        """, (start_timestamp, end_timestamp))
        
        rows = cursor.fetchall()
        if not rows:
            return "No data found for the given time range"

        # Beräkna genomsnittet
        total_customers = sum(row[0] for row in rows)
        average_customers = total_customers / len(rows)
        
        return int(average_customers)  # Returnera ett heltal
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()



