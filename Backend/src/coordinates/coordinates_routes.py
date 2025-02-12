from flask import Blueprint, request, jsonify, session
from .coordinates_service import upload_data_to_db, get_data_from_db, update_data_in_db
from functools import wraps

def login_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Unauthorized access, please log in'}), 401
        return await f(*args, **kwargs)  # Await the wrapped function
    return decorated_function

# Skapa en Blueprint
coordinates_bp = Blueprint('coordinates', __name__)

@coordinates_bp.route('/upload', methods=['POST'])
#@login_required
async def upload_data():
    data = request.json
    print(data)
    # Kontrollera att nödvändig data finns
    if 'TopBound' not in data or 'BottomBound' not in data or 'LeftBound' not in data or 'RightBound' not in data:
        return jsonify({'message': 'Missing TopBound, BottomBound, LeftBound or RightBound'}), 400

    result = await upload_data_to_db(data)
    return jsonify({'message': result})

@coordinates_bp.route('/get', methods=['GET'])
#@login_required
async def get_data():
    data = await get_data_from_db()  
    if isinstance(data, str):
        return jsonify({'message': data}), 500
    return jsonify(data)


@coordinates_bp.route('/upload/<int:id>', methods=['PUT'], endpoint='upload_data_put')
# @login_required  # Enable if you need authentication
async def upload_data(id: int):

    data = request.json

    if data: 
      
        print(f"Received data for updating coordinate ID {id}: {data}")
    
        result = await update_data_in_db(id, data)

        if result:
            return jsonify({'message': f'Coordinate ID {id} updated successfully'}), 200
        else:
            return jsonify({'message': f'Coordinate ID {id} not found'}), 404
