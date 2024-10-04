from flask import Blueprint, jsonify
from datetime import datetime

# Function to get current date
def get_current_date():
    return datetime.now().strftime('%Y-%m-%d')

# Function to get current time
def get_current_time():
    return datetime.now().strftime('%H:%M:%S')  # Gets the current time in HH:MM:SS format

# Function to get current day of the week
def get_day_of_week():
    return datetime.now().strftime('%A')  # Full name of the day (e.g., 'Monday')

def generate_filename(base_name="data"):
    """
    Generate a filename with the current date and weekday.
    
    :param base_name: The base name of the file (default is 'data').
    :return: Formatted filename string.
    """
    current_date = datetime.now().strftime('%Y-%m-%d')
    day_of_week = datetime.now().strftime('%A')
    return f"{base_name}_{current_date}_{day_of_week}.json"

# Create a Blueprint for date-related routes
date_bp = Blueprint('date_bp', __name__)

@date_bp.route('/current-date', methods=['GET'])
def current_date():
    return jsonify({
        "current_date": get_current_date(),
        "day_of_week": get_day_of_week()  # Adds the day of the week
    })

@date_bp.route('/current-time', methods=['GET'])  # New route for current time
def current_time():
    return jsonify({
        "current_time": get_current_time()  # Returns the current time
    })

@date_bp.route('/current-week', methods=['GET'])  # Route for current week
def current_week():
    week_number = datetime.now().isocalendar()[1]  # Extracts the week number (ISO calendar)
    return jsonify({"current_week": week_number})

@date_bp.route('/send-data', methods=['POST'])
def send_data():
    # Example data to be sent
    data = {
        "key": "value"
    }
    
    # Generate the filename
    filename = generate_filename()  # This will generate something like 'data_2024-10-03_Wednesday.json'

    # You would typically send this data to the backend along with the filename
    response = {
        "filename": filename,
        "data": data
    }
    
    # Here, you can send `response` to your backend as needed (e.g., using requests or similar)
    return jsonify(response)