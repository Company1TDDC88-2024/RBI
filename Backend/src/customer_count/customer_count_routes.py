from flask import Blueprint, request, jsonify
from .customer_count_service import upload_data_to_db, get_data_from_db, get_number_of_customers
from datetime import datetime

# Skapa en Blueprint
customer_count_bp = Blueprint('customer_count', __name__)

@customer_count_bp.route('/upload', methods=['POST'])
def upload_data():
    data = request.json
    
    # Kontrollera att data är en lista
    if not isinstance(data, list):
        return jsonify({'message': 'Invalid data format, expected a list of objects'}), 400

    # Kontrollera att nödvändig data finns
    required_keys = ['track_id', 'timestamp', 'bottom', 'left', 'right', 'top', 'score']
    if not all(key in data for key in required_keys):
        return jsonify({'message': 'Missing one or more required fields: track_id, timestamp, bottom, left, right, top, score'}), 400

    # Count the number of objects
    object_count = len(data)

    # Create new JSON object to upload
    upload_data = {
        "NumberOfCustomers": object_count,
        "Timestamp": data[0]['timestamp']  # Use the timestamp from the first object
    }

    result = upload_data_to_db(upload_data)
    return jsonify({'message': result})

@customer_count_bp.route('/get', methods=['GET'])
def get_data():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')

    # Convert start_date and end_date to datetime objects if they are provided
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d')

    data = get_data_from_db(start_date, end_date)
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)

# Route för att hämta genomsnittligt antal kunder mellan två tidsstämplar
@customer_count_bp.route('/get_customers', methods=['POST'])
def get_customers():
    data = request.json
    start_timestamp = data.get('start_timestamp')
    end_timestamp = data.get('end_timestamp')
    
    if not start_timestamp or not end_timestamp:
        return jsonify({'message': 'Missing start_timestamp or end_timestamp'}), 400

    result = get_number_of_customers(start_timestamp, end_timestamp)
    if isinstance(result, str):  # Hantera felmeddelande från servicefunktionen
        return jsonify({'message': result}), 500
    
    return jsonify({'average_customers': result}), 200
