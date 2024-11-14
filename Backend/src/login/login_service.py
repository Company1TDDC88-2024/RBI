import pyodbc
import hashlib
from src.database_connect import get_db_connection
import smtplib
from datetime import datetime
from typing import Union
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from cryptography.fernet import Fernet

def send_blocked_email(email_receiver):
    # Email configuration
    email_sender = "company1.customer@gmail.com"
    email_password = "rpmu qrel qczc jmhd"

    # Create the email content
    subject = "Your account has been blocked!"
    body = f"Your account has been blocked due to too many login attempts. Contact admin to receive a new account."

    # Create a multipart email
    msg = MIMEMultipart()
    msg['From'] = email_sender
    msg['To'] = email_receiver
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()  # Secure the connection
            server.login(email_sender, email_password)
            server.send_message(msg)
            print("Email sent successfully!")
    except Exception as e:
        print(f"Error occurred: {e}")


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
    is_admin = 1 if data.get('is_admin') else 0  # Sätt is_admin till 1 om det är en admin, annars 0

    try:
        # Infoga den nya användaren i databasen med krypterade värden
        cursor.execute("""
            INSERT INTO "User_temp" (first_name, last_name, email, is_admin, password_hash, token, verified, wrong_password_count)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0)
        """, (encrypted_first_name, encrypted_last_name, encrypted_email, is_admin, password_hash, token))
        
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
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

    try:
        # Fetch all users matching the password hash
        cursor.execute("""
            SELECT user_id, email, verified, wrong_password_count, is_admin FROM "User_temp" 
            WHERE password_hash = ? 
        """, (password_hash,))
        
        users = cursor.fetchall()
        
        for user in users:
            decrypted_email = cipher_suite.decrypt(user.email).decode()
            if decrypted_email == data['email']:
                # Check if the account is blocked or unverified
                if user.wrong_password_count >= 5:
                    return "Too many failed login attempts"
                if user.verified == 0:
                    return "Account not verified"

                # Reset wrong_password_count on successful login
                cursor.execute("""
                    UPDATE "User_temp" SET wrong_password_count = 0 WHERE user_id = ?
                """, (user.user_id,))
                conn.commit()

                # Return both user_id and is_admin
                return {'user_id': user.user_id, 'is_admin': user.is_admin}

        # Handle invalid login attempt
        encrypted_email = cipher_suite.encrypt(data['email'].encode())
        cursor.execute("""
            UPDATE "User_temp" SET wrong_password_count = wrong_password_count + 1 WHERE email = ?
        """, (encrypted_email,))
        
        # Check wrong password count
        cursor.execute("""
            SELECT wrong_password_count FROM "User_temp" WHERE email = ?
        """, (encrypted_email,))
        count = cursor.fetchone()
        
        if count and count[0] >= 5:
            await send_blocked_email(data['email'])  # Ensure async call compatibility
            conn.commit()
            return "Your account has been blocked due to too many failed login attempts!"

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

async def delete_account(email: str) -> str:
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    try:
        cursor = conn.cursor()

        # Check if the user exists
        cursor.execute("SELECT user_id FROM \"User\" WHERE email = ?", (email,))
        user = cursor.fetchone()

        if user:
            # Delete the user from the database
            cursor.execute("DELETE FROM \"User\" WHERE user_id = ?", (user.user_id,))
            conn.commit()
            return f"Account with email {email} deleted successfully"
        else:
            return "Account not found"
    except pyodbc.Error as e:
        print(f"Error deleting account: {e}")
        return "Error deleting account"
    finally:
        conn.close()