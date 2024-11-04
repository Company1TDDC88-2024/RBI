
from flask import Blueprint, request, jsonify, session
from .login_service import create_account, login_user

# Skapa en Blueprint för login
login_bp = Blueprint('login', __name__)

# Route för att skapa ett konto
@login_bp.route('/create_account', methods=['POST'])
async def create_account_route():
    data = request.json

    # Kontrollera att nödvändig data finns
    if not all(key in data for key in ('first_name', 'last_name', 'email', 'password')):
        return jsonify({'message': 'Missing first_name, last_name, email, or password'}), 400

    result = await create_account(data)
    return jsonify({'message': result})

# Route för att logga in
@login_bp.route('/login', methods=['POST'])
async def login_route():
    data = request.json

    # Kontrollera att e-post och lösenord finns i datan
    if not all(key in data for key in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400

    result = await login_user(data)
    
    if isinstance(result, dict):  # Om inloggningen lyckades och sessions-ID skapas
        session['user_id'] = result['user_id']  # Spara sessions-ID i sessionen
        return jsonify({'message': 'Login successful', 'session_id': session['user_id']})
    
    return jsonify({'message': result}), 401  # Returnera felmeddelande om inloggning misslyckades


