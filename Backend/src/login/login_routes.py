from flask import Blueprint, request, jsonify, session
from .login_service import create_account, login_user, verify_user, delete_account, is_logged_in_service
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets  # For generating unique tokens
from functools import wraps
import logging
from flask import Flask, redirect, request
import os

def login_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Unauthorized access, please log in'}), 401
        return await f(*args, **kwargs)  # Await the wrapped function
    return decorated_function

def send_verification(email_receiver, token):
    # Email configuration
    email_sender = "company1.customer@gmail.com"
    email_password = "rpmu qrel qczc jmhd"
    url = os.getenv('BACKEND_URL')


    # Create the verification link
    verification_link = f"{url}/login/verify/{token}"

    # Create the email content
    subject = "Email Verification"
    body = f"Please click the following link to verify your email: {verification_link}"

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
            print("Verification email sent successfully!")
    except Exception as e:
        print(f"Error occurred: {e}")

# Blueprint for login
login_bp = Blueprint('login', __name__)

# Route to create an account
@login_bp.route('/create_account', methods=['POST'])
@login_required
async def create_account_route():
    data = request.json

    # Ensure required data is present
    if not all(key in data for key in ('first_name', 'last_name', 'email', 'password', 'is_admin')):
        return jsonify({'message': 'Missing first_name, last_name, email, password, or is_admin'}), 400

    # Generate a unique verification token
    token = secrets.token_urlsafe(16)
    print(token)
    
    # Skapa konto
    result = await create_account(data, token)
    if result == "Account with this email already exists":
        # Returnera ett 400-svar om kontot redan finns
        return jsonify({'message': result}), 400

    send_verification(data.get('email'), token)

    # Returnera framgångsmeddelande
    return jsonify({'message': result}), 200


# Route for email verification
@login_bp.route('/verify/<token>', methods=['GET'])
async def verify_email(token):
    result = await verify_user(token)
    
    # Returnera resultatet från verify_user-funktionen
    if "successfully" in result:
        return jsonify({'message': result}), 200
    else:
        return jsonify({'message': result}), 400

# Route for logging in
@login_bp.route('/login', methods=['GET', 'POST'])
async def login_route():
    if request.method == 'POST':
        data = request.json
 
        # Check if email and password are provided
        if not all(key in data for key in ('email', 'password')):
            return jsonify({'message': 'Missing email or password'}), 400

        result = await login_user(data)

        if isinstance(result, dict):
            session['user_id'] = result['user_id']
            session['is_admin'] = result['is_admin']

            print("Admin status in session:", session.get('is_admin'))
            return jsonify({'message': 'Login successful', 'session_id': session['user_id']})
 
        return jsonify({'message': result}), 401  # Return error message if login failed
    
    # Handle GET request
    return jsonify({'message': 'GET request received. Show Login Page.'}), 200

@login_bp.route('/delete', methods=['POST'])
async def delete_route():
    data = request.json

    # Ensure 'email' key exists in data
    if 'email' not in data:
        return jsonify({'message': 'Email is required'}), 400

    email = data['email']
    result = await delete_account(email)

    if result == f"Account with email {email} deleted successfully":
        return jsonify({'message': result}), 200  # Success
    elif result == "Account not found":
        return jsonify({'message': result}), 404  # Not found
    elif result == "Failed to connect to database" or result == "Error deleting account":
        return jsonify({'message': result}), 500  # Internal server error

    return jsonify({'message': 'Unexpected error'}), 500  # Fallback error

# Route för att logga ut
@login_bp.route('/logout', methods=['POST'])
@login_required
async def logout_route():
    # Log session contents before resetting
    logging.info(f"Session before logout: {session}")

    # Remove 'user_id' from session
    session.pop('user_id', None)

    # Log session contents after reset
    logging.info(f"Session after logout: {session}")

    # Expire the session cookie
    response = jsonify({'message': 'Logout successful'})
    response.set_cookie('session', '', expires=0, path='/')

    return response

# Kontrollera inloggning
@login_bp.route('/is_logged_in', methods=['GET'])
async def is_logged_in():
    if 'user_id' in session:
        user_id = session['user_id']
        result = await is_logged_in_service(user_id)
        return jsonify(result)
    else:
        return jsonify({'logged_in': False, 'is_admin': False})