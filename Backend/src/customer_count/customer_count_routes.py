from flask import Blueprint, request, jsonify, session, redirect, url_for
from .customer_count_service import get_daily_data_from_db, upload_data_to_db, get_data_from_db, get_number_of_customers
from datetime import datetime
from functools import wraps


def login_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Redirect to the login page if the user is not logged in
            return redirect(url_for('login.login_route'))  # Adjust 'auth.login' to your actual login endpoint
        return await f(*args, **kwargs)  # Await the wrapped function
    return decorated_function


# Skapa en Blueprint
customer_count_bp = Blueprint('customer_count', __name__)

@customer_count_bp.route('/upload', methods=['POST'])
@login_required
async def upload_data():
    data = request.json
    
    # Kontrollera att nödvändig data finns
    if 'EnteringCustomers' not in data or 'ExitingCustomers' not in data or 'Timestamp' not in data:
        return jsonify({'message': 'Missing EnteringCustomers or ExitingCustomers number of customers or Timestamp'}), 400

    result = await upload_data_to_db(data)
    return jsonify({'message': result}) 

@customer_count_bp.route('/get', methods=['GET'])
@login_required
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
@login_required
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
@login_required
async def get_daily_customers():
    date = request.args.get('date')

    # Convert date to datetime objects
    if date:
        date = datetime.strptime(date, '%Y-%m-%d')

    data = await get_daily_data_from_db(date)
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    
    # Sum up all EnteringCustomers from each entry resulting in daily customers
    total_entering_customers = sum(entry['EnteringCustomers'] for entry in data)
    return jsonify({'totalEnteringCustomers': total_entering_customers})
