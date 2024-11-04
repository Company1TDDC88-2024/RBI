import pyodbc
from src.database_connect import get_db_connection
from datetime import datetime
from typing import List, Dict, Union, Optional

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

    