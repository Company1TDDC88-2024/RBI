import pyodbc
from datetime import datetime, timedelta
from src.database_connect import get_db_connection
from datetime import datetime
from typing import List, Dict, Union, Optional
from cryptography.fernet import Fernet

key = b'3wqWt9HPKvl0MGA6TL5x18As--2L6mdoZsPRTzSkE3A=' 
cipher_suite = Fernet(key)

async def upload_data_to_db(data):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()
    TimeInterval = 10

    try:
        # Fetch the most recent TotalCustomers_temp and Timestamp for calculations
        cursor.execute("""
            SELECT TOP 1 TotalCustomers_temp, Timestamp FROM CustomerCount
            ORDER BY Timestamp DESC
        """)
        
        result = cursor.fetchone()

        # If a previous record exists, decrypt TotalCustomers_temp; otherwise, set to 0
        if result and result[0] is not None:
            encrypted_previous_total_customers, previous_timestamp = result
            previous_total_customers = int(cipher_suite.decrypt(encrypted_previous_total_customers).decode())
        else:
            previous_total_customers = 0
            previous_timestamp = None

        # Date handling and formatting
        queried_date = previous_timestamp.date() if previous_timestamp else None
        incoming_datetime = datetime.strptime(data['Timestamp'], "%Y-%m-%dT%H:%M:%S.%f")
        incoming_date = incoming_datetime.date()
        formatted_timestamp = incoming_datetime.strftime("%Y-%m-%dT%H:%M:%S")  # Format for SQL Server

        # Calculate TotalCustomers based on dates
        if queried_date != incoming_date or not queried_date:
            TotalCustomers = 0
        else:
            # Assuming data['EnteringCustomers'] and data['ExitingCustomers'] are integers
            TotalCustomers = previous_total_customers + data['EnteringCustomers'] - data['ExitingCustomers']

        # Encrypt the new TotalCustomers, EnteringCustomers, and ExitingCustomers
        encrypted_total_customers = cipher_suite.encrypt(str(TotalCustomers).encode())
        encrypted_entering_customers = cipher_suite.encrypt(str(data['EnteringCustomers']).encode())
        encrypted_exiting_customers = cipher_suite.encrypt(str(data['ExitingCustomers']).encode())

        # Insert encrypted values into CustomerCount table
        cursor.execute("""
            INSERT INTO CustomerCount (Timestamp, TotalCustomers_temp, EnteringCustomers_temp, ExitingCustomers_temp, TimeInterval)
            VALUES (?, ?, ?, ?, ?)
        """, (formatted_timestamp, encrypted_total_customers, encrypted_entering_customers, encrypted_exiting_customers, TimeInterval))
        
        conn.commit()
        return "Data uploaded successfully"
    except pyodbc.Error as e:
        print(f"Error inserting data: {e}")
        return "Error uploading data"
    finally:
        conn.close()

        
async def get_data_from_db(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Union[str, List[Dict[str, Union[int, str]]]]:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fecth all data from CustomerCount table, if no start_date or end_date is provided
        query = ("SELECT ID, TotalCustomers, Timestamp FROM CustomerCount")
        params = []

        if start_date and end_date:
            # If start_date and end_date are the same or only one day apart, adjust end_date to the end of the day
            if start_date.date() == end_date.date() or (end_date - start_date).days == 1:
                end_date = end_date + timedelta(days=1) - timedelta(microseconds=1)
            query += " WHERE Timestamp BETWEEN ? AND ?"
            params.extend([start_date, end_date])
        elif start_date:
            query += " WHERE Timestamp >= ?"
            params.append(start_date)
        elif end_date:
            query += " WHERE Timestamp <= ?"
            params.append(end_date)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'TotalCustomers': row[1],
                'Timestamp': row[2],
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()


async def get_number_of_customers(start_timestamp, end_timestamp):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Hämta alla rader mellan start_timestamp och end_timestamp
        cursor.execute("""
            SELECT TotalCustomers 
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

async def get_daily_data_from_db(date: datetime) -> Union[str, List[Dict[str, Union[int, str]]]]:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fetch all data from CustomerCount table where the date matches the provided date
        query = ("SELECT ID, TotalCustomers, Timestamp, EnteringCustomers, ExitingCustomers FROM CustomerCount WHERE CAST(Timestamp AS DATE) = ?")
        cursor.execute(query, (date,))
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'TotalCustomers': row[1],
                'Timestamp': row[2],
                'EnteringCustomers': row[3],
                'ExitingCustomers': row[4],
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()



