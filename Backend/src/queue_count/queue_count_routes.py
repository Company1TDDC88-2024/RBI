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

    # Check for the main required root-level key
    if 'timestamp' not in data:
        return jsonify({'message': 'Missing "timestamp" field in the root object'}), 400

    # Check that each observation has 'track_id', 'bounding_box', and that 'bounding_box' contains the required keys
    required_keys = ['track_id', 'bounding_box']
    bounding_box_keys = ['bottom', 'left', 'right', 'top']

    for item in data.get('observations', []):
        # Check for the main required keys in each observation
        if not all(key in item for key in required_keys):
            return jsonify({'message': 'Missing "track_id" or "bounding_box" in one or more observations'}), 400
    
        # Check that 'bounding_box' contains all the necessary keys
        bounding_box = item['bounding_box']
        if not all(key in bounding_box for key in bounding_box_keys):
            return jsonify({'message': 'Missing one or more bounding box fields in one or more observations'}), 400

    

    result = await upload_data_to_db(data)
    return jsonify({'message': result}), 200


@queue_count_bp.route('/get', methods=['GET'])
async def get_data():
    data = await get_data_from_db()
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)