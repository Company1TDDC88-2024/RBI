import pyodbc
import json
import argparse

# functions are generated by chatGPT 

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

from decimal import Decimal

def decimal_default(obj):
    """Convert Decimal objects to float for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

def get_data():
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database."

    cursor = conn.cursor()
    result = ""  # Initialize an empty string to store the result

    try:
        # Get all table names
        cursor.execute("""
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        """)
        tables = cursor.fetchall()

        # Fetch data for each table and accumulate it in the result string
        for (table_name,) in tables:
            result += f"\nTable: {table_name}\n"
            cursor.execute(f"SELECT * FROM [{table_name}]")  # Use brackets to avoid issues with reserved keywords
            rows = cursor.fetchall()

            # Get column names
            column_names = [desc[0] for desc in cursor.description]
            result += " | ".join(column_names) + "\n"  # Add column headers to result

            # Add rows to the result
            for row in rows:
                result += " | ".join(str(value) for value in row) + "\n"  # Add each row

            result += "-" * 40 + "\n"  # Separator between tables

        return result  # Return the accumulated result as a string

    except pyodbc.Error as e:
        return f"Error fetching data: {e}"

    finally:
        conn.close()

def save_data():
    """Save data from the database to data.log."""
    data = get_data()
    if data is None:
        return
    try:
        with open("data.log", "w") as file:
            file.write(data)
        print("Data saved to data.log")
    except IOError as e:
        print(f"Error writing to file: {e}")

def get_schema():
    """Retrieve schema information for user-created tables in the database."""
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to database."

    cursor = conn.cursor()
    try:
        # Get schema for all user-created tables, excluding system tables
        cursor.execute("""
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
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

def save_schema():
    schema_info = get_schema()  # Use get_schema to retrieve the schema
    if schema_info == "Failed to connect to database." or schema_info == "Error fetching schema":
        print(schema_info)
        return

    try:
        # Open the file in write mode
        with open("schema.log", "w") as file:
            file.write(schema_info)  # Write the schema info as it is
        print(f"Schema successfully saved to schema.log")

    except Exception as e:
        print(f"Error saving schema to file: {e}")

def delete_user(email):
    """Delete a user from the database by email."""
    conn = get_db_connection()
    if conn is None:
        return "Failed to connect to the database."

    try:
        cursor = conn.cursor()
        query = "DELETE FROM [User] WHERE email = ?" 
        cursor.execute(query, (email,))
        conn.commit()
        conn.close()
        print(f"User with email {email} deleted.")
    except pyodbc.Error as e:
        print(f"Error deleting user: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Process various commands.")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: get data
    subparsers.add_parser("get data", help="Call get_data and print output")

    # Command: save data
    subparsers.add_parser("save data", help="Call get_data and save output to data.log")

    # Command: get schema
    subparsers.add_parser("get schema", help="Call get_schema and print output")

    # Command: save schema
    subparsers.add_parser("save schema", help="Call get_schema and save output to schema.log")

    # Command: del [x]
    del_parser = subparsers.add_parser("del", help="Delete a user by email")
    del_parser.add_argument("user_email", type=str, help="Email of the user to delete")

    # Parse the arguments
    args = parser.parse_args()

    # Handle each command
    if args.command == "get data":
        print(get_data())
    elif args.command == "save data":
        save_data()
    elif args.command == "get schema":
        print(get_schema())
    elif args.command == "save schema":
        save_schema()
    elif args.command == "del":
        delete_user(args.user_email)
    else:
        parser.print_help()

