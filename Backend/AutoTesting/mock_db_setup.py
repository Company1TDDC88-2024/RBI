import aiosqlite
import asyncio

# Function to connect to the SQLite database
async def get_db_connection(database_file=":memory:"):
    try:
        # Asynchronously connect to the SQLite database
        conn = await aiosqlite.connect(database_file)
        
        # Create the QueueCount table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS QueueCount (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            NumberOfCustomers INTEGER NOT NULL,
            Timestamp TEXT NOT NULL,
            ROI INTEGER NOT NULL
        );
        """
        await conn.execute(create_table_query)
        await conn.commit()
        
        return conn
    except aiosqlite.Error as e:
        print(f"Error connecting to SQLite database: {e}")
        return None


if __name__ == "__main__":
    asyncio.run(get_db_connection())

