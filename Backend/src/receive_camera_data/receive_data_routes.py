from flask import Blueprint, request, jsonify
from datetime import datetime
from .receive_data_service import upload_data_to_db

# Skapa en Blueprint
receive_data_bp = Blueprint('receive_data', __name__)

@receive_data_bp.route('/data_transfer', methods=['POST'])
def data_transfer():
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
