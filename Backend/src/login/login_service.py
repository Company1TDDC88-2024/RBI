import pyodbc
import hashlib
from src.database_connect import get_db_connection
from datetime import datetime
from typing import Union

async def create_account(data, token) -> str:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()


    # Kontrollera om e-postadressen redan existerar
    cursor.execute("SELECT email FROM \"User\" WHERE email = ?", (data['email'],))
    existing_user = cursor.fetchone()
    if existing_user:
        return "Account with this email already exists"  # Returnera meddelande om kontot redan finns

    # Hasha lösenordet för säker lagring
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

    try:
        # Infoga den nya användaren i databasen
        cursor.execute("""
            INSERT INTO "User" (first_name, last_name, email, is_admin, password_hash, token, verified)
            VALUES (?, ?, ?, 0, ?, ?, 0)
        """, (data['first_name'], data['last_name'], data['email'], password_hash, token))
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
            WHERE email = ? AND password_hash = ? AND verified = 1
        """, (data['email'], password_hash))
        
        user = cursor.fetchone()
        if user:
            return {'user_id': user.user_id} # Returnera user_id för sessions-ID-skapande
        else:
            return "Invalid email or password"
    except pyodbc.Error as e:
        print(f"Error logging in: {e}")
        return "Error logging in"
    finally:
        conn.close()

async def verify_user(token: str) -> str:

    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    try:
        cursor = conn.cursor()
        
        # Kontrollera om token existerar och hämta användaren
        cursor.execute("SELECT email FROM \"User\" WHERE token = ?", (token,))
        user = cursor.fetchone()
        
        if user:
            # Uppdatera verified till 1 för användaren
            cursor.execute("UPDATE \"User\" SET verified = 1 WHERE token = ?", (token,))
            conn.commit()  # Bekräfta ändringarna i databasen
            return f"Hello {user.email}. Email verified successfully"
        else:
            return "Invalid or expired token"
    except pyodbc.Error as e:
        print(f"Error during verification: {e}")
        return "Error during verification process"
    finally:
        conn.close()