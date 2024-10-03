import pyodbc

# Funktion för att ansluta till databasen
def get_db_connection():

    connection_string = (
        "Driver={ODBC Driver 18 for SQL Server};"
        "Server=tcp:tddc88company1.database.windows.net,1433;"
        "Database=company1;" 
        "Uid=company1admin;"  # SQL Server-administratörskontot
        "Pwd=Baljan123;"  # Lösenordet för SQL Server-administratörskontot
        "Encrypt=yes;" 
        "TrustServerCertificate=no;" 
        "Connection Timeout=30;"
    )
    try:
        conn = pyodbc.connect(connection_string)
        return conn
    except pyodbc.Error as e:
        print(f"Error connecting to database: {e}")
        return None


def upload_data_to_db(data):
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Lägger till data i CustomerCount-tabellen
        cursor.execute("""
            INSERT INTO CustomerCount (NumberOfCustomers, Timestamp, Weekday)
            VALUES (?, ?, ?)
        """, (data['NumberOfCustomers'], data['Timestamp'], data['Weekday']))
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
        cursor.execute("SELECT ID, NumberOfCustomers, Timestamp, Weekday FROM CustomerCount")
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'NumberOfCustomers': row[1],
                'Timestamp': row[2],
                'Weekday': row[3]
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()
