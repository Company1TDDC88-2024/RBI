import pyodbc
import hashlib
import os
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
    # Connect to the database
    conn = await get_db_connection()
    if conn is None:
        return "Failed to connect to database"

    cursor = conn.cursor()

    # Encrypt first_name, last_name, and email
    encrypted_first_name = cipher_suite.encrypt(data['first_name'].encode())
    encrypted_last_name = cipher_suite.encrypt(data['last_name'].encode())
    encrypted_email = cipher_suite.encrypt(data['email'].encode())

    hashed_email = hashlib.sha256(data['email'].encode()).hexdigest()
    
    # Check if the email already exists
    cursor.execute("SELECT email FROM \"User\" WHERE email = ?", (hashed_email,))
    existing_user = cursor.fetchone()
    if existing_user:
        return "Account with this email already exists"

    # Generate salt
    salt = os.urandom(16)  # 16 bytes of random salt
    salt_hex = salt.hex()  # Convert to hex for storage

    # Hash password with the salt
    password = data['password'].encode()
    hashed_password = hashlib.pbkdf2_hmac("sha256", password, salt, 100000).hex()

    # Combine salt and hashed password for storage
    stored_password = f"{salt_hex}${hashed_password}"

    is_admin = 1 if data.get('is_admin') else 0  # Set is_admin to 1 if it's an admin, otherwise 0

    try:
        # Insert the new user into the database
        cursor.execute("""
            INSERT INTO "User" (first_name, last_name, email, is_admin, password_hash, token, verified, wrong_password_count, email_encrypted)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
        """, (encrypted_first_name, encrypted_last_name, hashed_email, is_admin, stored_password, token, encrypted_email,))

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
    email_hash = hashlib.sha256(data['email'].encode()).hexdigest()

    try:
        # Fetch user details
        cursor.execute("""
            SELECT verified, wrong_password_count, password_hash, user_id, is_admin FROM "User" 
            WHERE email = ? 
        """, (email_hash,))
        user = cursor.fetchone()

        # Unpack user details
        verified, wrong_password_count, stored_password, user_id, is_admin = user

        if not user:
            if wrong_password_count >= 5:
                return "Too many failed login attempts"
            else:
                return "Invalid email or password"

        # Extract salt and hashed password from the stored_password
        salt_hex, stored_hash = stored_password.split('$')
        salt = bytes.fromhex(salt_hex)

        # Hash the incoming password with the stored salt
        user_input_password = data['password'].encode()
        hashed_input_password = hashlib.pbkdf2_hmac("sha256", user_input_password, salt, 100000).hex()

        # Compare the hashed input password with the stored hash
        if hashed_input_password == stored_hash:
            # Check if the account is blocked or unverified
            if wrong_password_count >= 5:
                return "Too many failed login attempts"
            if verified == 0:
                return "Account not verified"

            # Reset wrong_password_count on successful login
            cursor.execute("""
                UPDATE "User" SET wrong_password_count = 0 WHERE user_id = ?
            """, (user_id,))
            conn.commit()

            # Return both user_id and is_admin
            return {'user_id': user_id, 'is_admin': is_admin}

        # Handle invalid login attempt
        cursor.execute("""
            UPDATE "User" SET wrong_password_count = wrong_password_count + 1 WHERE email = ?
        """, (email_hash,))

        # Check wrong password count
        cursor.execute("""
            SELECT wrong_password_count FROM "User" WHERE email = ?
        """, (email_hash,))
        count = cursor.fetchone()

        if count and count[0] == 5:
            send_blocked_email(data['email'])  # Ensure async call compatibility
            conn.commit()
            return "Your account has been blocked due to too many failed login attempts!"

        conn.commit()
        if wrong_password_count >= 5:
            return "Too many failed login attempts. Check your email for further assistance."
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
            return f"Hello. Email verified successfully."
        else:
            return f"Invalid or expired token!"
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
        hashed_email = hashlib.sha256(email.encode()).hexdigest()

        # Check if the user exists
        cursor.execute("SELECT user_id FROM \"User\" WHERE email = ?", (hashed_email,))
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

async def is_logged_in_service(user_id: int) -> dict:
    conn = await get_db_connection()
    if conn is None:
        return {'logged_in': False, 'is_admin': False}  # Return false if connection fails

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT is_admin FROM \"User\" WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()
        if user:
            is_admin = user.is_admin
            return {'logged_in': True, 'is_admin': is_admin}
        else:
            return {'logged_in': True, 'is_admin': False}  # Return false if user not found
    except pyodbc.Error as e:
        print(f"Error fetching admin status: {e}")
        return {'logged_in': True, 'is_admin': False}  # Return false on error
    finally:
        conn.close()

async def get_user_email(user_id: int) -> dict:

    conn = await get_db_connection()
    if conn is None:
        print("Failed to connect to database")
        return None

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT email_encrypted FROM \"User\" WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()
        
    except pyodbc.Error as e:
        print(f"Error fetching email: {e}")
        return None
        
    if user:
        try:
            email = str(cipher_suite.decrypt(user.email_encrypted).decode())
            return email
        except Exception as e:
            print(f"Error decrypting email: {e}")
            return None
    else:
        print("User not found")
        return None

