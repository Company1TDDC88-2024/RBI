from flask import Blueprint, request, jsonify
from .queue_count_service import upload_data_to_db, get_data_from_db

# Skapa en Blueprint
queue_count_bp = Blueprint('queue_count', __name__)

@queue_count_bp.route('/upload', methods=['POST'])
async def upload_data():
    data = request.json
    
    print(data)  # Print parsed JSON data
   
    if not data:
        return jsonify({'message': 'Invalid JSON format or empty request body'}), 400

    # Check if the data is a list
    if not isinstance(data, list):
        return jsonify({'message': 'Invalid data format, expected a list of objects'}), 400

    # Check that every object in the list contains the required keys
    required_keys = ['track_id', 'timestamp', 'bottom', 'left', 'right', 'top', 'score']
    for item in data:
        if not all(key in item for key in required_keys):
            return jsonify({'message': 'Missing one or more required fields in one or more objects'}), 400

    # Count the number of objects
    # object_count = len(data)

    # Create new JSON object to upload
    

    result = await upload_data_to_db(upload_data)
    return jsonify({'message': result}), 200


@queue_count_bp.route('/get', methods=['GET'])
async def get_data():
    data = await get_data_from_db()
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)