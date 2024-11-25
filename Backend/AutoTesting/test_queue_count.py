import sys
import os
import unittest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

# Add ../src to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from src.queue_count.queue_count_service import upload_function
from mock_db_setup import get_db_connection as local_get_db_connection
from src.database_connect import get_db_connection

class TestUploadFunction(unittest.TestCase):

    def setUp(self):
        # Set up the mock for play_sound
        self.play_sound_mock = AsyncMock()
        
        global get_db_connection
        # Replace the actual get_db_connection with the mock
        self.original_get_db_connection = get_db_connection
        get_db_connection = local_get_db_connection

    def tearDown(self):
        # Restore the original get_db_connection function
        get_db_connection = self.original_get_db_connection

    @unittest.mock.patch('your_module.play_sound', new_callable=AsyncMock)
    async def test_upload_function_data_uploaded(self, play_sound_mock):
        # Mock input data
        counts = [10]
        incoming_datetime = datetime.now()
        ROIs = [(1, 0, 0, 0, 0, 0, 1, 'ROI1', 10)]  # Example ROI data
        i = 0

        # Call the function
        result = await upload_function(i, counts, incoming_datetime, ROIs)

        # Verify play_sound was called
        play_sound_mock.assert_called_once_with(counts[i], ROIs[i])

        # Check the result of the upload function
        self.assertEqual(result, "Data uploaded successfully")

    @unittest.mock.patch('your_module.play_sound', new_callable=AsyncMock)
    async def test_upload_function_data_not_uploaded(self, play_sound_mock):
        # Mock input data where the queue count does not change
        counts = [5]
        incoming_datetime = datetime.now()
        ROIs = [(1, 0, 0, 0, 0, 0, 1, 'ROI1', 10)]  # Example ROI data
        i = 0

        # Call the function
        result = await upload_function(i, counts, incoming_datetime, ROIs)

        # Verify play_sound was called
        play_sound_mock.assert_called_once_with(counts[i], ROIs[i])

        # Check the result of the upload function when data is not uploaded
        self.assertEqual(result, "Data not uploaded, queue is too small")

    @unittest.mock.patch('your_module.play_sound', new_callable=AsyncMock)
    async def test_upload_function_failed_connection(self, play_sound_mock):
        # Simulate a failed connection by mocking the get_db_connection to return None
        async def failed_get_db_connection():
            return None

        # Replace get_db_connection with the failed version for this test
        original_get_db_connection = get_db_connection
        get_db_connection = failed_get_db_connection

        counts = [10]
        incoming_datetime = datetime.now()
        ROIs = [(1, 0, 0, 0, 0, 0, 1, 'ROI1', 10)]  # Example ROI data
        i = 0

        # Call the function and assert failure
        result = await upload_function(i, counts, incoming_datetime, ROIs)
        self.assertEqual(result, "Failed to connect to database")

        # Restore original get_db_connection
        get_db_connection = original_get_db_connection

if __name__ == '__main__':
    unittest.main()