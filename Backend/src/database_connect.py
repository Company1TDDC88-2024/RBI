import pyodbc
import asyncio

# Function to connect to the database
async def get_db_connection():
    connection_string = (
        "Driver={ODBC Driver 18 for SQL Server};"
        "Server=tcp:tddc88company1.database.windows.net,1433;"
        "Database=company1;" 
        "Uid=company1admin;"  # SQL Server admin account
        "Pwd=Baljan123;"  # Password for the SQL Server admin account
        "Encrypt=yes;" 
        "TrustServerCertificate=no;" 
        "Connection Timeout=30;"
    )
    try:
        # Run the pyodbc.connect call in a separate thread using asyncio.to_thread()
        conn = await asyncio.to_thread(pyodbc.connect, connection_string)
        return conn
    except pyodbc.Error as e:
        print(f"Error connecting to database: {e}")
        return None