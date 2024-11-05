import pyodbc
from datetime import datetime, timedelta
from src.database_connect import get_db_connection
from datetime import datetime
from typing import List, Dict, Union, Optional
from cryptography.fernet import Fernet

key = b'3wqWt9HPKvl0MGA6TL5x18As--2L6mdoZsPRTzSkE3A=' 
cipher_suite = Fernet(key)

# ENCRYPTION DONE
async def upload_data_to_db(data):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()
    TimeInterval = 10

    try:
        # Fetch the most recent TotalCustomers_temp and Timestamp for calculations
        cursor.execute("""
            SELECT TOP 1 TotalCustomers_temp, Timestamp FROM CustomerCount_temp
            ORDER BY Timestamp DESC
        """)
        
        result = cursor.fetchone()

        # Check if there's a previous record. If not, initialize to handle the empty table.
        if result is None:
            # No previous records in the table
            previous_total_customers = 0
            previous_timestamp = None
        elif result[0] is not None:
            # If a previous record exists, decrypt TotalCustomers_temp
            encrypted_previous_total_customers, previous_timestamp = result
            try:
                # Attempt to decrypt the previous total customers
                previous_total_customers = int(cipher_suite.decrypt(encrypted_previous_total_customers).decode())
            except Exception as e:
                print(f"Error decrypting previous total customers: {e}")
                previous_total_customers = 0
                previous_timestamp = None
        else:
            # If the record exists but TotalCustomers_temp is NULL
            previous_total_customers = 0
            previous_timestamp = None

        # Date handling and formatting
        queried_date = previous_timestamp.date() if previous_timestamp else None
        incoming_datetime = datetime.strptime(data['Timestamp'], "%Y-%m-%dT%H:%M:%S.%f")
        incoming_date = incoming_datetime.date()
        formatted_timestamp = incoming_datetime.strftime("%Y-%m-%dT%H:%M:%S")  # Format for SQL Server

        # Calculate TotalCustomers based on dates
        if queried_date != incoming_date or not queried_date:
            TotalCustomers = data['EnteringCustomers'] - data['ExitingCustomers']
        else:
            # Assuming data['EnteringCustomers'] and data['ExitingCustomers'] are integers
            TotalCustomers = previous_total_customers + data['EnteringCustomers'] - data['ExitingCustomers']

        # Encrypt the new TotalCustomers, EnteringCustomers, and ExitingCustomers
        encrypted_total_customers = cipher_suite.encrypt(str(TotalCustomers).encode())
        encrypted_entering_customers = cipher_suite.encrypt(str(data['EnteringCustomers']).encode())
        encrypted_exiting_customers = cipher_suite.encrypt(str(data['ExitingCustomers']).encode())

        # Insert encrypted values into CustomerCount table
        cursor.execute("""
            INSERT INTO CustomerCount_temp (Timestamp, TotalCustomers_temp, EnteringCustomers_temp, ExitingCustomers_temp, TimeInterval_temp)
            VALUES (?, ?, ?, ?, ?)
        """, (formatted_timestamp, encrypted_total_customers, encrypted_entering_customers, encrypted_exiting_customers, TimeInterval))
        
        conn.commit()
        return "Data uploaded successfully"
    except pyodbc.Error as e:
        print(f"Error inserting data: {e}")
        return "Error uploading data"
    finally:
        conn.close()

# ENCRYPTION DONE
async def get_data_from_db(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Union[str, List[Dict[str, Union[int, str]]]]:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fetch all data from CustomerCount_temp table, if no start_date or end_date is provided
        query = "SELECT ID, TotalCustomers_temp, Timestamp FROM CustomerCount_temp"
        params = []

        if start_date and end_date:
            # If start_date and end_date are the same or only one day apart, adjust end_date to the end of the day
            end_date = end_date + timedelta(days=1) - timedelta(microseconds=1)
            query += " WHERE Timestamp BETWEEN ? AND ?"
            params.extend([start_date, end_date])
        elif start_date:
            query += " WHERE Timestamp >= ?"
            params.append(start_date)
        elif end_date:
            end_date = end_date + timedelta(days=1) - timedelta(microseconds=1)
            query += " WHERE Timestamp <= ?"
            params.append(end_date)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        data = []
        
        for row in rows:
            # Decrypt TotalCustomers_temp for each row
            try:
                decrypted_total_customers = int(cipher_suite.decrypt(row[1]).decode()) if row[1] is not None else None
            except Exception as e:
                print(f"Decryption error for TotalCustomers_temp in row ID {row[0]}: {e}")
                decrypted_total_customers = None  # Set to None if decryption fails

            data.append({
                'ID': row[0],
                'TotalCustomers': decrypted_total_customers,
                'Timestamp': row[2],
            })
        
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()

#ENCRYPTION DONE
async def get_number_of_customers(start_timestamp, end_timestamp):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fetch all rows between start_timestamp and end_timestamp
        cursor.execute("""
            SELECT TotalCustomers_temp 
            FROM CustomerCount_temp
            WHERE Timestamp >= ? AND Timestamp <= ?
        """, (start_timestamp, end_timestamp))
        
        rows = cursor.fetchall()
        if not rows:
            return "No data found for the given time range"

        # Decrypt and calculate the total number of customers
        total_customers = 0
        for row in rows:
            encrypted_total = row[0]
            try:
                # Decrypt each TotalCustomers_temp value if it's not None
                decrypted_total = int(cipher_suite.decrypt(encrypted_total).decode()) if encrypted_total else 0
                total_customers += decrypted_total
            except Exception as e:
                print(f"Decryption error for TotalCustomers_temp: {e}")
                continue  # Skip rows with decryption errors
        
        # Calculate the average number of customers
        average_customers = total_customers / len(rows) if rows else 0
        return int(average_customers)  # Return as an integer
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()

#ENCRYPTION DONE
async def get_daily_data_from_db(date: datetime) -> Union[str, List[Dict[str, Union[int, str]]]]:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fetch all data from CustomerCount table where the date matches the provided date
        query = ("SELECT ID, TotalCustomers_temp, Timestamp, EnteringCustomers_temp, ExitingCustomers_temp FROM CustomerCount_temp WHERE CAST(Timestamp AS DATE) = ?")
        cursor.execute(query, (date,))
        rows = cursor.fetchall()
        data = []
        
        for row in rows:
            # Decrypt each encrypted value, if not null
            try:
                decrypted_total_customers = int(cipher_suite.decrypt(row[1]).decode()) if row[1] is not None else None
                decrypted_entering_customers = int(cipher_suite.decrypt(row[3]).decode()) if row[3] is not None else None
                decrypted_exiting_customers = int(cipher_suite.decrypt(row[4]).decode()) if row[4] is not None else None
            except Exception as e:
                print(f"Decryption error for row ID {row[0]}: {e}")
                decrypted_total_customers = None
                decrypted_entering_customers = None
                decrypted_exiting_customers = None
            
            data.append({
                'ID': row[0],
                'TotalCustomers': decrypted_total_customers,
                'Timestamp': row[2],
                'EnteringCustomers': decrypted_entering_customers,
                'ExitingCustomers': decrypted_exiting_customers,
            })
            
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()



