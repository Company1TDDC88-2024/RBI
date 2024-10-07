from flask import Blueprint, request, jsonify
from .customer_count_service import upload_data_to_db, get_data_from_db, get_number_of_customers
from datetime import datetime

# Skapa en Blueprint
customer_count_bp = Blueprint('customer_count', __name__)

@customer_count_bp.route('/upload', methods=['POST'])
async def upload_data():
    data = request.json
    
    # Kontrollera att nödvändig data finns
    if 'NumberOfCustomers' not in data or 'Timestamp' not in data:
        return jsonify({'message': 'Missing NumberOfCustomers or Timestamp'}), 400

    result = await upload_data_to_db(data)
    return jsonify({'message': result})

@customer_count_bp.route('/get', methods=['GET'])
async def get_data():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')

    # Convert start_date and end_date to datetime objects if they are provided
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d')

    data = await get_data_from_db(start_date, end_date)
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)

# Route för att hämta genomsnittligt antal kunder mellan två tidsstämplar
@customer_count_bp.route('/get_customers', methods=['POST'])
async def get_customers():
    data = request.json
    start_timestamp = data.get('start_timestamp')
    end_timestamp = data.get('end_timestamp')
    
    if not start_timestamp or not end_timestamp:
        return jsonify({'message': 'Missing start_timestamp or end_timestamp'}), 400

    result = await get_number_of_customers(start_timestamp, end_timestamp)
    if isinstance(result, str):  # Hantera felmeddelande från servicefunktionen
        return jsonify({'message': result}), 500
    
    return jsonify({'average_customers': result}), 200
