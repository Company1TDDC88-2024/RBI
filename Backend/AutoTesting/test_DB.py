import unittest
from . import db_functions as db
import json

class TestDBOperations(unittest.TestCase):
    

    @classmethod
    def setUpClass(cls):
        cls.json_data = db.get_all_tables_schema()
        print(cls.json_data)
        
    def setUp(self): 
        self.data = json.loads(self.json_data)

    def check_field_exists_and_type(self, section, expected_fields):
        """
        Helper method to check if the expected fields exist, have the expected data type, 
        and ensure no additional unexpected fields exist.
        """
        section_data = self.data.get(section, [])
        actual_fields = {item["COLUMN_NAME"]: item["DATA_TYPE"] for item in section_data}

        # Check for unexpected fields
        for field in actual_fields:
            self.assertIn(field, expected_fields, f"Unexpected field '{field}' in section '{section}'.")

        # Check if all expected fields exist and have the correct data type
        for expected_field, expected_type in expected_fields.items():
            self.assertIn(expected_field, actual_fields, f"Expected field '{expected_field}' is missing in section '{section}'.")
            self.assertEqual(actual_fields[expected_field], expected_type,
                             f"Field '{expected_field}' in section '{section}' should be '{expected_type}' but found '{actual_fields[expected_field]}'.")

    # COORDINATES TESTS
    def test_coordinates_fields(self):
        
        expected_fields = {
            "ID": "int",
            "TopBound": "decimal",
            "BottomBound": "decimal",
            "LeftBound": "decimal",
            "RightBound": "decimal"
        }
        self.check_field_exists_and_type("Coordinates", expected_fields)

    # CUSTOMER COUNT TESTS
    def test_customer_count_fields(self):
        
        expected_fields = {
            "ID": "int",
            "Timestamp": "datetime",
            "TotalCustomers": "int",
            "EnteringCustomers": "int",
            "ExitingCustomers": "int",
            "TimeInterval": "int"
        }
        self.check_field_exists_and_type("CustomerCount", expected_fields)

    # QUEUE COUNT TESTS
    def test_queue_count_fields(self):
       
        expected_fields = {
            "ID": "int",
            "NumberOfCustomers": "int",
            "Timestamp": "datetime",
            "ROI": "int"
        }
        self.check_field_exists_and_type("QueueCount", expected_fields)
    
