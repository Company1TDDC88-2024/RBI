import pyodbc
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Funktion för att ansluta till databasen
async def get_db_connection():
    server = os.getenv('DB_SERVER')
    database = os.getenv('DB_NAME')
    username = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    ssl_cert_path = '../DigiCertGlobalRootCA.crt.pem'

    connection_string = (
        "Driver={ODBC Driver 18 for SQL Server};Server=tcp:tddc88company1.database.windows.net,1433;Database=company1;Uid=company1admin;Pwd=Baljan123;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    )
    try:
        conn = pyodbc.connect(connection_string)
        return conn
    except pyodbc.Error as e:
        print(f"Error connecting to database: {e}")
        return None