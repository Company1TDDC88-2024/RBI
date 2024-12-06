import pytest
import hashlib
import os
import pyodbc
from cryptography.fernet import Fernet
from unittest.mock import patch, MagicMock

# Do not test delete_account, get_user_email, get_user_data, is_logged_in_service

# Mocking the cipher suite
key = b'3wqWt9HPKvl0MGA6TL5x18As--2L6mdoZsPRTzSkE3A='
cipher_suite = Fernet(key)

from src.login.login_service import (
    send_blocked_email,
    create_account,
    login_user,
    verify_user
)

# Mocking the db connection
@pytest.fixture
def mock_db_connection():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.commit.return_value = None
    mock_conn.close.return_value = None
    return mock_conn, mock_cursor

# Test for send_blocked_email
@patch('smtplib.SMTP')
def test_send_blocked_email(mock_smtp):
    mock_server = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_server

    send_blocked_email("test@example.com")

    mock_server.starttls.assert_called_once()
    mock_server.login.assert_called_once_with("company1.customer@gmail.com", "rpmu qrel qczc jmhd")
    mock_server.send_message.assert_called_once()

# Test for create_account
@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_create_account_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    mock_cursor.fetchone.return_value = None
    mock_get_db_connection.return_value = mock_conn
    
    data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john.doe@example.com',
        'password': 'password123',
        'is_admin': False
    }
    
    result = await create_account(data, 'token123')
    assert result == "Account created successfully"

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_create_account_same_email(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    mock_cursor.fetchone.side_effect = [None, (b'encrypted_email',)]
    mock_get_db_connection.return_value = mock_conn
    
    data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john.doe@example.com',
        'password': 'password123',
        'is_admin': False
    }
    
    result = await create_account(data, 'token123')
    assert result == "Account created successfully"

    result = await create_account(data, 'token123')
    assert result == "Account with this email already exists"

# Test for login_user
@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_login_user_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    # Mock user details
    salt = os.urandom(16)
    salt_hex = salt.hex()
    password = 'password123'.encode()
    hashed_password = hashlib.pbkdf2_hmac("sha256", password, salt, 100000).hex()
    stored_password = f"{salt_hex}${hashed_password}"
    
    mock_cursor.fetchone.side_effect = [
        (1, 0, stored_password, 1, 0),  # User details
        (0,)  # Wrong password count
    ]
    mock_get_db_connection.return_value = mock_conn
    
    data = {
        'email': 'john.doe@example.com',
        'password': 'password123'
    }
    
    result = await login_user(data)
    assert result == {'user_id': 1, 'is_admin': 0}

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_login_user_invalid_password(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    # Mock user details
    salt = os.urandom(16)
    salt_hex = salt.hex()
    password = 'password123'.encode()
    hashed_password = hashlib.pbkdf2_hmac("sha256", password, salt, 100000).hex()
    stored_password = f"{salt_hex}${hashed_password}"
    
    mock_cursor.fetchone.side_effect = [
        (1, 0, stored_password, 1, 0),  # User details
        (1,)  # Wrong password count
    ]
    mock_get_db_connection.return_value = mock_conn
    
    data = {
        'email': 'john.doe@example.com',
        'password': 'wrongpassword'
    }
    
    result = await login_user(data)
    assert result == "Invalid email or password"

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_login_user_account_blocked(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    # Mock user details
    salt = os.urandom(16)
    salt_hex = salt.hex()
    password = 'password123'.encode()
    hashed_password = hashlib.pbkdf2_hmac("sha256", password, salt, 100000).hex()
    stored_password = f"{salt_hex}${hashed_password}"
    
    mock_cursor.fetchone.side_effect = [
        (1, 5, stored_password, 1, 0),  # User details
        (5,)  # Wrong password count
    ]
    mock_get_db_connection.return_value = mock_conn
    
    data = {
        'email': 'john.doe@example.com',
        'password': 'wrongpassword'
    }
    
    result = await login_user(data)
    assert result == "Your account has been blocked due to too many failed login attempts!"

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_login_user_account_not_verified(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    # Mock user details
    salt = os.urandom(16)
    salt_hex = salt.hex()
    password = 'password123'.encode()
    hashed_password = hashlib.pbkdf2_hmac("sha256", password, salt, 100000).hex()
    stored_password = f"{salt_hex}${hashed_password}"
    
    mock_cursor.fetchone.side_effect = [
        (0, 0, stored_password, 1, 0),  # User details
        (0,)  # Wrong password count
    ]
    mock_get_db_connection.return_value = mock_conn
    
    data = {
        'email': 'john.doe@example.com',
        'password': 'password123'
    }
    
    result = await login_user(data)
    assert result == "Account not verified"

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_login_user_db_connection_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None
    
    data = {
        'email': 'john.doe@example.com',
        'password': 'password123'
    }
    
    result = await login_user(data)
    assert result == "Failed to connect to database"

# Test for verify_user
@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_verify_user_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    mock_cursor.fetchone.return_value = ('john.doe@example.com',)
    mock_get_db_connection.return_value = mock_conn
    
    result = await verify_user('valid_token')
    assert result == "Hello. Email verified successfully."

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_verify_user_invalid_token(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    mock_cursor.fetchone.return_value = None
    mock_get_db_connection.return_value = mock_conn
    
    result = await verify_user('invalid_token')
    assert result == "Invalid or expired token!"

@pytest.mark.asyncio
@patch('src.login.login_service.get_db_connection')
async def test_verify_user_db_error(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    mock_cursor.execute.side_effect = pyodbc.Error('Database error')
    mock_get_db_connection.return_value = mock_conn
    
    result = await verify_user('valid_token')
    assert result == "Error during verification process"

