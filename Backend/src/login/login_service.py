import pyodbc
import hashlib
from src.database_connect import get_db_connection
from datetime import datetime
from typing import Union
from cryptography.fernet import Fernet

key = b'3wqWt9HPKvl0MGA6TL5x18As--2L6mdoZsPRTzSkE3A='
cipher_suite = Fernet(key)

async def create_account(data, token) -> str:
    # Anslut till databasen
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    # Kryptera first_name, last_name och email
    encrypted_first_name = cipher_suite.encrypt(data['first_name'].encode())
    encrypted_last_name = cipher_suite.encrypt(data['last_name'].encode())
    encrypted_email = cipher_suite.encrypt(data['email'].encode())

    # Kontrollera om e-postadressen redan existerar (krypterad sökning)
    cursor.execute("SELECT email FROM \"User\" WHERE email = ?", (encrypted_email,))
    existing_user = cursor.fetchone()
    if existing_user:
        return "Account with this email already exists"  # Returnera meddelande om kontot redan finns

    # Hasha lösenordet för säker lagring
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

    try:
        # Infoga den nya användaren i databasen med krypterade värden
        cursor.execute("""
            INSERT INTO "User_temp" (first_name, last_name, email, is_admin, password_hash, token, verified, wrong_password_count)
            VALUES (?, ?, ?, 0, ?, ?, 0, 0)
        """, (encrypted_first_name, encrypted_last_name, encrypted_email, password_hash, token))
        
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
        # Hämta användare där lösenordet matchar
        cursor.execute("""
            SELECT user_id, email, verified, wrong_password_count FROM "User_temp" 
            WHERE password_hash = ? 
        """, (password_hash,))
        
        users = cursor.fetchall()
        
        # Dekryptera e-post och hitta den rätta användaren
        for user in users:
            decrypted_email = cipher_suite.decrypt(user.email).decode()
            if decrypted_email == data['email']:
                # Kontrollera felräkning och verifiering
                if user.wrong_password_count < 3:
                    if user.verified == 0:
                        return "Account not verified"
                    # Nollställ felräkningen vid lyckad inloggning
                    cursor.execute("""
                        UPDATE "User_temp" SET wrong_password_count = 0 WHERE user_id = ?
                    """, (user.user_id,))
                    conn.commit()
                    return {'user_id': user.user_id}  # Returnera user_id för sessions-ID-skapande
                else:
                    return "Too many failed login attempts"

        # Om vi inte hittar någon matchande användare
        encrypted_email = cipher_suite.encrypt(data['email'].encode())
        cursor.execute("""
            UPDATE "User_temp" SET wrong_password_count = wrong_password_count + 1 WHERE email = ?
        """, (encrypted_email,))
        conn.commit()
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
        cursor.execute("SELECT email FROM \"User_temp\" WHERE token = ?", (token,))
        user = cursor.fetchone()
        
        if user:
            # Decrypt the email
            encrypted_email = user[0]  # Access the email field in the fetched row
            decrypted_email = cipher_suite.decrypt(encrypted_email).decode()
            
            # Uppdatera verified till 1 för användaren
            cursor.execute("UPDATE \"User_temp\" SET verified = 1 WHERE token = ?", (token,))
            conn.commit()  # Bekräfta ändringarna i databasen
            return f"Hello {decrypted_email}. Email verified successfully"
        else:
            return f"Invalid or expired token: {decrypted_email}"
    except pyodbc.Error as e:
        print(f"Error during verification: {e}")
        return "Error during verification process"
    finally:
        conn.close()