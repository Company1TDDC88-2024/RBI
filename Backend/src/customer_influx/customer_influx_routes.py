from flask import Blueprint, request, jsonify
from .customer_influx_services import get_data_from_db, update_data_in_db

# Create a Blueprint
customer_influx_bp = Blueprint('customer_influx', __name__)

# GET route to retrieve data
@customer_influx_bp.route('/CustomerInflux', methods=['GET'])
async def get_customer_influx():
    data = await get_data_from_db()
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data), 200

# PUT route to update data
@customer_influx_bp.route('/CustomerInflux/<int:id>', methods=['PUT'])
async def put_customer_influx(id: int):
    data = request.json

    # Validate the required fields in the JSON
    if not data:
        return jsonify({'message': 'Missing data'}), 400

    # Ensure only influx_threshold or influx_timeframe is provided
    if 'influx_threshold' not in data and 'influx_timeframe' not in data:
        return jsonify({'message': 'Missing required fields (influx_threshold or influx_timeframe)'}), 400

    # Update the data
    result = await update_data_in_db(id, data)

    if result is True:
        return jsonify({'message': f'CustomerInflux entry ID {id} updated successfully'}), 200
    else:
        return jsonify({'message': result}), 404
