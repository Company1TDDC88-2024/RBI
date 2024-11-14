import pyodbc
import hashlib
from src.database_connect import get_db_connection
import smtplib
from datetime import datetime
from typing import Union
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
    is_admin = 1 if data.get('is_admin') else 0  # Sätt is_admin till 1 om det är en admin, annars 0

    try:
        # Infoga den nya användaren i databasen
        cursor.execute("""
            INSERT INTO "User" (first_name, last_name, email, is_admin, password_hash, token, verified, wrong_password_count)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0)
        """, (data['first_name'], data['last_name'], data['email'], is_admin, password_hash, token))
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
        # Retrieve user info including is_admin
        cursor.execute("""
            SELECT user_id, email, verified, wrong_password_count, is_admin FROM "User" 
            WHERE email = ? AND password_hash = ? 
        """, (data['email'], password_hash))
        
        user = cursor.fetchone()
        if user:
            if user.wrong_password_count >= 5:
                return "Too many failed login attempts"
            if user.verified == 0:
                return "Account not verified"
            
            # Reset wrong_password_count on successful login
            cursor.execute("""
                UPDATE "User" SET wrong_password_count = 0 WHERE user_id = ?
            """, (user.user_id,))
            conn.commit()
            # Return both user_id and is_admin
            return {'user_id': user.user_id, 'is_admin': user.is_admin}

        else:
            cursor.execute("""
                UPDATE "User" SET wrong_password_count = wrong_password_count + 1 WHERE email = ?
            """, (data['email'],))
            cursor.execute("""
                SELECT wrong_password_count FROM "User" WHERE email = ?
            """, (data['email'],))
            count = cursor.fetchone()
            if count and count[0] == 5:
                send_blocked_email(data['email'])
            conn.commit()

            if count and count[0] >= 5:
                return "Your account has been blocked due to too many login attempts!"
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