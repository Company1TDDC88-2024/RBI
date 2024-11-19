import pyodbc
import json

def print_schema(schema_info):
    print(json.dumps(schema_info, indent=4))

def get_db_connection():

    connection_string = (
        "Driver={ODBC Driver 18 for SQL Server};"
        "Server=tcp:tddc88company1.database.windows.net,1433;"
        "Database=company1;" 
        "Uid=company1admin;"  
        "Pwd=Baljan123;"  
        "Encrypt=yes;" 
        "TrustServerCertificate=no;" 
        "Connection Timeout=120;"
        "Login Timeout=120;"
    )
    try:
        conn = pyodbc.connect(connection_string, timeout=120)
        return conn
    except pyodbc.Error as e:
        print(f"Error connecting to database: {e}")
        return None
    
def get_all_tables_schema():
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Get schema for all tables
        cursor.execute("""
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            ORDER BY TABLE_NAME
        """)
        
        schema = cursor.fetchall()
        schema_info = {}

        for table_name, column_name, data_type, max_length in schema:
            if table_name not in schema_info:
                schema_info[table_name] = []
            schema_info[table_name].append({
                'COLUMN_NAME': column_name,
                'DATA_TYPE': data_type,
                'CHARACTER_MAXIMUM_LENGTH': max_length
            })

        return json.dumps(schema_info, indent=4)

    except pyodbc.Error as e:
        print(f"Error fetching schema: {e}")
        return "Error fetching schema"
    
    finally:
        conn.close()

def print_all_table_data():
    conn = get_db_connection()
    if conn is None:
        print("Failed to connect to database")
        return

    cursor = conn.cursor()

    try:
        # Get all table names
        cursor.execute("""
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        """)
        tables = cursor.fetchall()

        # Fetch and print all rows for each table
        for (table_name,) in tables:
            print(f"\nTable: {table_name}")
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            # Get column names
            column_names = [desc[0] for desc in cursor.description]
            print(" | ".join(column_names))  # Print column headers
            
            for row in rows:
                print(" | ".join(str(value) for value in row))  # Print each row of data
            
            print("-" * 40)  # Separator between tables

    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
    
    finally:
        conn.close()


import pyodbc

def delete_user_by_name(user_name):
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Correct the SQL query by enclosing "User" in square brackets
        delete_query = """
            DELETE FROM [User]
            WHERE first_name = ? OR last_name = ?
        """
        
        # Execute the query with the user_name
        cursor.execute(delete_query, (user_name, user_name))
        
        # Commit the changes
        conn.commit()

        # Check if any row was deleted
        if cursor.rowcount > 0:
            return f"User(s) with name '{user_name}' deleted successfully."
        else:
            return f"No user found with the name '{user_name}'."

    except pyodbc.Error as e:
        print(f"Error deleting user: {e}")
        return "Error deleting user"
    
    finally:
        conn.close()





def save_all_table_data_to_file(filename="database_data.txt"):
    conn = get_db_connection()
    if conn is None:
        print("Failed to connect to database")
        return

    cursor = conn.cursor()

    try:
        # Open the file in write mode
        with open(filename, "w") as file:
            # Get all table names
            cursor.execute("""
                SELECT TABLE_NAME
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            """)
            tables = cursor.fetchall()

            # Fetch and write all rows for each table
            for (table_name,) in tables:
                file.write(f"\nTable: {table_name}\n")
                
                # Use brackets around table name to avoid syntax issues with keywords
                cursor.execute(f"SELECT * FROM [{table_name}]")
                rows = cursor.fetchall()

                # Get column names
                column_names = [desc[0] for desc in cursor.description]
                file.write(" | ".join(column_names) + "\n")  # Write column headers

                # Write each row of data
                for row in rows:
                    file.write(" | ".join(str(value) for value in row) + "\n")
                
                file.write("-" * 40 + "\n")  # Separator between tables

            print(f"Data successfully saved to {filename}")

    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
    
    finally:
        conn.close()






if __name__ == '__main__':

    all_schemas = get_all_tables_schema()
    print(all_schemas)
    #print_all_table_data()
    save_all_table_data_to_file()
    # Usage example:
    #result = delete_user_by_name('William')
    #print(result)

