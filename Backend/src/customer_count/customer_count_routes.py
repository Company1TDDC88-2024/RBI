from flask import Blueprint, request, jsonify
from .customer_count_service import get_daily_data_from_db, upload_data_to_db, get_data_from_db, get_number_of_customers
from datetime import datetime

# Skapa en Blueprint
customer_count_bp = Blueprint('customer_count', __name__)


@customer_count_bp.route('/upload', methods=['POST'])
async def process_observations():
    data = request.json

    # Validate the required fields in the JSON
    if 'id' not in data or 'observations' not in data:
        return jsonify({'message': 'Missing required fields (id or observations)'}), 400
    
    # Validate the structure of each observation
    try:
        observations = data['observations']
        bounding_boxes = [obs["bounding_box"] for obs in observations]
        last_timestamp = observations[-1]["timestamp"]  # Get the last timestamp
    except KeyError:
        return jsonify({'message': 'Invalid data structure in observations'}), 400

    # Determine whether the customer is entering or exiting based on bounding box positions
    if  bounding_boxes[-1]["left"] < 0.3:
        # Customer is exiting
        result = {
            "EnteringCustomers": 0,
            "ExitingCustomers": 1,
            "Timestamp": last_timestamp
        }
    elif bounding_boxes[-1]["right"] > 0.7:
        # Customer is entering
        result = {
            "EnteringCustomers": 1,
            "ExitingCustomers": 0,
            "Timestamp": last_timestamp
        }
    print(result)
    result = await upload_data_to_db(data)
    return jsonify(result), 200



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

@customer_count_bp.route('/get_daily', methods=['GET'])
async def get_daily_customers():
    date = request.args.get('date')

    # Convert date to datetime objects
    if date:
        date = datetime.strptime(date, '%Y-%m-%d')

    data = await get_daily_data_from_db(date)
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    
    # Calculate total entering and exiting customers for the day
    total_entering_customers = sum(entry.get('EnteringCustomers', 0) or 0 for entry in data)
    total_exiting_customers = sum(entry.get('ExitingCustomers', 0) or 0 for entry in data)
    
    # Get total customers as needed
    total_customers = data[0]['TotalCustomers'] if data else 0
    print(data)
    # Return all totals in one JSON object
    return jsonify({
        'totalEnteringCustomers': total_entering_customers,
        'totalExitingCustomers': total_exiting_customers,
        'totalCustomers': total_customers
    })