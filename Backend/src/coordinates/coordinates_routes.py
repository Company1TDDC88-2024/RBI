from flask import Blueprint, request, jsonify
from .coordinates_service import upload_data_to_db, get_data_from_db

# Skapa en Blueprint
coordinates_bp = Blueprint('coordinates', __name__)

@coordinates_bp.route('/upload', methods=['POST'])
def upload_data():
    data = request.json
    
    # Kontrollera att nödvändig data finns
    if 'TopBound' not in data or 'BottomBound' not in data or 'LeftBound' not in data or 'RightBound' not in data:
        return jsonify({'message': 'Missing TopBound, BottomBound, LeftBound or RightBound'}), 400

    result = upload_data_to_db(data)
    return jsonify({'message': result})

@coordinates_bp.route('/get', methods=['GET'])
def get_data():
    data = get_data_from_db()
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)