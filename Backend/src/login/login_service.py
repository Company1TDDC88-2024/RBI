import pyodbc
import hashlib
from src.database_connect import get_db_connection
from datetime import datetime
from typing import Union

# Funktion för att skapa ett konto
async def create_account(data) -> str:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    # Hasha lösenordet för säker lagring
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

    try:
        # Infoga den nya användaren i databasen
        cursor.execute("""
            INSERT INTO "User" (first_name, last_name, email, is_admin, password_hash)
            VALUES (?, ?, ?, 0, ?)
        """, (data['first_name'], data['last_name'], data['email'], password_hash))
        conn.commit()
        return "Account created successfully"
    except pyodbc.Error as e:
        print(f"Error creating account: {e}")
        return "Error creating account"
    finally:
        conn.close()

# Funktion för att logga in en användare
async def login_user(data) -> Union[str, dict]:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    # Hasha lösenordet för jämförelse
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

    try:
        # Kontrollera om användaren finns och lösenordet stämmer
        cursor.execute("""
            SELECT user_id, email FROM "User" 
            WHERE email = ? AND password_hash = ?
        """, (data['email'], password_hash))
        
        user = cursor.fetchone()
        if user:
            return {'user_id': user[0], 'email': user[1]}  # Returnera user_id för sessions-ID-skapande
        else:
            return "Invalid email or password"
    except pyodbc.Error as e:
        print(f"Error logging in: {e}")
        return "Error logging in"
    finally:
        conn.close()
