import pyodbc
import os
import asyncio

# Funktion för att ansluta till databasen
async def get_db_connection():
    server = os.getenv('DB_SERVER')
    database = os.getenv('DB_NAME')
    username = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')

# SSL for secure connection
    connection_string = (
        f"Driver={{ODBC Driver 18 for SQL Server}};"
        f"Server={server};"
        f"Database={database};"
        f"Uid={username};"
        f"Pwd={password};"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )
    try:
        conn = await asyncio.to_thread(pyodbc.connect, connection_string)
        return conn
    except pyodbc.Error as e:
        print(f"Error connecting to database: {e}")
        return None