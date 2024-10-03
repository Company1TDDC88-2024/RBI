from flask import Blueprint, request, jsonify
from .customer_count_service import upload_data_to_db, get_data_from_db

# Skapa en Blueprint
customer_count_bp = Blueprint('customer_count', __name__)

@customer_count_bp.route('/upload', methods=['POST'])
def upload_data():
    data = request.json
    
    # Kontrollera att nödvändig data finns
    if 'NumberOfCustomers' not in data or 'Timestamp' not in data:
        return jsonify({'message': 'Missing NumberOfCustomers or Timestamp'}), 400

    result = upload_data_to_db(data)
    return jsonify({'message': result})

@customer_count_bp.route('/get', methods=['GET'])
def get_data():
    data = get_data_from_db()
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)