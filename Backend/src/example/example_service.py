from src.database_connect import get_db_connection

class ExampleService:
    def example_get(self):
        return {"firstWord": "Hello", "secondWord": "World"}
    
    async def connect(self):
        conn = await get_db_connection()
        print(conn)
        if conn is None:
            return "Failed to connect to database"
        return "Connected to database"

    
ExampleService = ExampleService()