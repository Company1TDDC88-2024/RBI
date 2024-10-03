from flask import Blueprint, request, jsonify
from .customer_count_service import upload_data_to_db, get_data_from_db, get_number_of_customers


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
