import pyodbc
from datetime import datetime, timedelta
from src.database_connect import get_db_connection
from datetime import datetime
from typing import List, Dict, Union, Optional

from datetime import datetime
import pyodbc

async def upload_data_to_db(data):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()
    TimeInterval = 10  # Arbitrary TimeInterval value

    try:
        # Fetch the most recent TotalCustomers and Timestamp
        cursor.execute("""
            SELECT TOP 1 TotalCustomers, Timestamp FROM CustomerCount
            ORDER BY Timestamp DESC
        """)
        
        result = cursor.fetchone()  # Fetch the result of the query

        if result:
            # Unpack the query result
            previous_total_customers, previous_timestamp = result
        else:
            # If no previous record, assume 0 customers
            previous_total_customers = 0
            previous_timestamp = None

        # Convert incoming Timestamp from string to datetime
        incoming_datetime = datetime.strptime(data['Timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ")
        formatted_timestamp = incoming_datetime.strftime("%Y-%m-%dT%H:%M:%S")  # Format for SQL Server

        # Extract dates for comparison
        queried_date = previous_timestamp.date() if previous_timestamp else None
        incoming_date = incoming_datetime.date()

        # Calculate TotalCustomers based on the date comparison
        if queried_date != incoming_date or not queried_date:
            TotalCustomers = 0  # Reset TotalCustomers if the dates are different
        else:
            TotalCustomers = previous_total_customers + data['EnteringCustomers'] - data['ExitingCustomers']
                
        # Insert the data into the CustomerCount table
        cursor.execute("""
            INSERT INTO CustomerCount (Timestamp, TotalCustomers, EnteringCustomers, ExitingCustomers, TimeInterval)
            VALUES (?, ?, ?, ?, ?)
        """, (formatted_timestamp, TotalCustomers, data['EnteringCustomers'], data['ExitingCustomers'], TimeInterval))

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



