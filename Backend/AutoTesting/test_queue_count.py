import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from src.queue_count.queue_count_service import (
    upload_function_fast, 
    get_queues_from_db, 
    upload_queue_alert,
    play_sound, 
    count_points_in_zones,
    point_in_zone,
    to_coord
)
# In this file tests for db functions upload_function_fast, get_queues_from_db, and upload_queue_alert are written
# Done, maybe include play_sound, nice logic to test
# get_data_from_db() and upload_data_to_db() is skipped since it is more relevant to test the queue specifc db functions
# This file also includes tests for the logic behind the functions to calculate the number of customers in a queue and to get coordinates

# Mocking the db connection
@pytest.fixture
def mock_db_connection():
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.commit.return_value = None
    mock_conn.close.return_value = None
    return mock_conn, mock_cursor

# Include these?
def test_point_in_zone_inside():
    assert point_in_zone(5, 5, 0, 0, 10, 10) == True

def test_point_in_zone_on_edge():
    assert point_in_zone(0, 0, 0, 0, 10, 10) == True
    assert point_in_zone(10, 10, 0, 0, 10, 10) == True

def test_point_in_zone_outside():
    assert point_in_zone(-1, 5, 0, 0, 10, 10) == False
    assert point_in_zone(5, -1, 0, 0, 10, 10) == False
    assert point_in_zone(11, 5, 0, 0, 10, 10) == False
    assert point_in_zone(5, 11, 0, 0, 10, 10) == False

def test_count_points_in_zones_single_zone():
    points = [(5, 5), (15, 15)]
    zones = [(1, 10, 0, 0, 10, 0, 0, 0, 0, 0)]
    assert count_points_in_zones(points, zones) == [1]

def test_count_points_in_zones_multiple_zones():
    points = [(5, 5), (15, 15), (25, 25)]
    zones = [
        (1, 10, 0, 0, 10, 0, 0, 0, 0, 0),
        (2, 20, 10, 10, 20, 0, 0, 0, 0, 0),
        (3, 30, 20, 20, 30, 0, 0, 0, 0, 0)
    ]
    assert count_points_in_zones(points, zones) == [1, 1, 1]

def test_count_points_in_zones_no_points():
    points = []
    zones = [(1, 10, 0, 0, 10, 0, 0, 0, 0, 0)]
    assert count_points_in_zones(points, zones) == [0]

def test_count_points_in_zones_no_zones():
    points = [(5, 5), (15, 15)]
    zones = []
    assert count_points_in_zones(points, zones) == []

def test_to_coord():
    assert to_coord(0.5, 0.0, 1.0) == [0.5, 0.5]
    assert to_coord(0.0, 0.0, 0.0) == [0.0, 1.0]
    assert to_coord(1.0, 1.0, 1.0) == [1.0, 0.0]

# Test upload_queue_alert
@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_upload_queue_alert_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    mock_cursor.execute.return_value = None
    mock_get_db_connection.return_value = mock_conn

    result = await upload_queue_alert(1, 10, '2023-10-01 10:00:00')
    assert result == "Data uploaded successfully"

@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_upload_queue_alert_failure(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    mock_cursor.execute.side_effect = Exception('Error inserting data')
    mock_get_db_connection.return_value = mock_conn

    try:
        result = await upload_queue_alert(1, 10, '2023-10-01 10:00:00')
    except Exception as e:
        result = str(e)
    
    assert result == "Error inserting data"

# Test upload_function_fast
@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_upload_function_fast_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    mock_get_db_connection.return_value = mock_conn

    ROIs = [(1, 0, 0, 0, 0, 10, 1, 'ROI1', 10, 5)]
    counts = [10]
    timestamp = datetime.now().isoformat()

    result = await upload_function_fast(0, ROIs, counts, timestamp)
    assert result is None  # The function does not return a success message

    mock_cursor.execute.assert_called_once_with("UPDATE Coordinates SET CurrentCount = ? WHERE id = ? ", (10, 1))
    mock_conn.commit.assert_called_once()

@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_upload_function_fast_no_change(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    mock_get_db_connection.return_value = mock_conn

    ROIs = [(1, 0, 0, 0, 0, 10, 1, 'ROI1', 10, 10)]
    counts = [10]
    timestamp = datetime.now().isoformat()

    result = await upload_function_fast(0, ROIs, counts, timestamp)
    assert result is None  # The function does not return a success message

    mock_cursor.execute.assert_not_called()
    mock_conn.commit.assert_not_called()

@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_upload_function_fast_db_connection_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None

    ROIs = [(1, 0, 0, 0, 0, 10, 1, 'ROI1', 10, 5)]
    counts = [10]
    timestamp = datetime.now().isoformat()

    result = await upload_function_fast(0, ROIs, counts, timestamp)
    assert result == "Failed to connect to database"

# Test get_queues_from_db
@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_get_queues_from_db_success(mock_get_db_connection, mock_db_connection):
    mock_conn, mock_cursor = mock_db_connection
    mock_cursor.execute.return_value = None
    mock_cursor.fetchall.return_value = [
        (1, '2023-10-01 10:00:00', 0, 0, 0, 0, 0, 0, 0, 10),
    ]
    mock_get_db_connection.return_value = mock_conn

    result = await get_queues_from_db()
    assert result == [
        {"ROI": 1, "NumberOfCustomers": 10, "Timestamp": '2023-10-01 10:00:00'},
    ]

@pytest.mark.asyncio
@patch('src.queue_count.queue_count_service.get_db_connection')
async def test_get_queues_from_db_failure(mock_get_db_connection):
    mock_get_db_connection.return_value = None

    result = await get_queues_from_db()
    assert result == "Failed to connect to database"