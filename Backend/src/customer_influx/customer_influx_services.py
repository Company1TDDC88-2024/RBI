import pyodbc
from src.database_connect import get_db_connection

# The get
async def get_data_from_db():
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        # Fetch all data from CustomerInflux table
        cursor.execute("SELECT ID, influx_threshold, influx_timeframe FROM CustomerInflux")
        rows = cursor.fetchall()
        data = []
        for row in rows:
            data.append({
                'ID': row[0],
                'influx_threshold': row[1],
                'influx_timeframe': row[2]
            })
        return data
    except pyodbc.Error as e:
        print(f"Error fetching data: {e}")
        return "Error fetching data"
    finally:
        conn.close()

# The put
async def update_data_in_db(id: int, data: dict):
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    try:
        set_clause = ", ".join([f"{key} = ?" for key in data.keys()])
        update_query = f"""
            UPDATE CustomerInflux
            SET {set_clause}
            WHERE ID = ?
        """
        values = list(data.values()) + [id]
        cursor.execute(update_query, values)

        conn.commit()

        # Check if any rows were affected
        if cursor.rowcount > 0:
            return True
        else:
            return "CustomerInflux entry not found"

    except pyodbc.Error as e:
        print(f"Error updating data: {e}")
        return "Error updating data"
    finally:
        conn.close()
