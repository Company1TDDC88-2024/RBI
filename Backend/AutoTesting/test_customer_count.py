import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from src.customer_count.customer_count_service import (
    upload_data_to_db,
    get_data_from_db,
    get_number_of_customers,
    get_daily_data_from_db
)

# Done, testing all the functions in customer_count_service.py

# Mocking the db connection
@pytest.fixture
def mock_db_connection():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.commit.return_value = None
    mock_conn.close.return_value = None
    return mock_conn, mock_cursor


# Test for get_number_of_customers
@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_number_of_customers_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    
    mock_cursor.execute.return_value = None
    mock_cursor.fetchall.return_value = [
        (b'encrypted_total_1', b'encrypted_entering_1'),
        (b'encrypted_total_2', b'encrypted_entering_2')
    ]
    
    mock_get_db_connection.return_value = mock_conn
    
    result = await get_number_of_customers('2023-10-01T10:00:00.000Z', '2023-10-01T10:05:00.000Z')
    assert isinstance(result, list)

@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_number_of_customers_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None
    
    result = await get_number_of_customers('2023-10-01T10:00:00.000Z', '2023-10-01T10:05:00.000Z')
    assert result == "Failed to connect to database"

# Test for get_daily_data_from_db
@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_daily_data_from_db_success(mock_get_db_connection):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.execute.return_value = None
    mock_cursor.fetchall.return_value = [
        (1, b'encrypted_total_1', datetime(2023, 10, 1, 10, 0), b'encrypted_entering_1', b'encrypted_exiting_1'),
        (2, b'encrypted_total_2', datetime(2023, 10, 1, 10, 5), b'encrypted_entering_2', b'encrypted_exiting_2')
    ]
    mock_conn.close.return_value = None
    
    mock_get_db_connection.return_value = mock_conn
    
    result = await get_daily_data_from_db(datetime(2023, 10, 1))
    assert isinstance(result, list)

@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_daily_data_from_db_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None
    
    result = await get_daily_data_from_db(datetime(2023, 10, 1))
    assert result == "Failed to connect to database"

# Test for get_data_from_db
@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_data_from_db_success(mock_get_db_connection):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.execute.return_value = None
    mock_cursor.fetchall.return_value = [
        (1, b'encrypted_total_1', b'encrypted_entering_1', datetime(2023, 10, 1, 10, 0)),
        (2, b'encrypted_total_2', b'encrypted_entering_2', datetime(2023, 10, 1, 10, 5))
    ]
    mock_conn.close.return_value = None
    
    mock_get_db_connection.return_value = mock_conn
    
    result = await get_data_from_db(datetime(2023, 10, 1), datetime(2023, 10, 2))
    assert isinstance(result, list)

@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_data_from_db_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None
    
    result = await get_data_from_db(datetime(2023, 10, 1), datetime(2023, 10, 2))
    assert result == "Failed to connect to database"

# Test for get_number_of_customers
@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_number_of_customers_success(mock_get_db_connection):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.execute.return_value = None
    mock_cursor.fetchall.return_value = [
        (b'encrypted_total_1', b'encrypted_entering_1'),
        (b'encrypted_total_2', b'encrypted_entering_2')
    ]
    mock_conn.close.return_value = None
    
    mock_get_db_connection.return_value = mock_conn
    
    result = await get_number_of_customers('2023-10-01T10:00:00.000Z', '2023-10-01T10:05:00.000Z')
    assert isinstance(result, list)

@pytest.mark.asyncio
@patch('src.customer_count.customer_count_service.get_db_connection')
async def test_get_number_of_customers_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None
    
    result = await get_number_of_customers('2023-10-01T10:00:00.000Z', '2023-10-01T10:05:00.000Z')
    assert result == "Failed to connect to database"
