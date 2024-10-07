from flask import Blueprint, request, jsonify
from .queue_count_service import upload_data_to_db, get_data_from_db

# Skapa en Blueprint
queue_count_bp = Blueprint('queue_count', __name__)

@queue_count_bp.route('/upload', methods=['POST'])
async def upload_data():
    data = request.json
    
    # Kontrollera att nödvändig data finns
    if 'NumberOfCustomers' not in data or 'Timestamp' not in data or 'ROI' not in data:
        return jsonify({'message': 'Missing NumberOfCustomers, Timestamp or ROI'}), 400

    result = await upload_data_to_db(data)
    return jsonify({'message': result})

@queue_count_bp.route('/get', methods=['GET'])
async def get_data():
    data = await get_data_from_db()
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)