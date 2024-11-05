
from flask import Blueprint, request, jsonify, session
from .login_service import create_account, login_user
from functools import wraps

def login_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Unauthorized access, please log in'}), 401
        return await f(*args, **kwargs)  # Await the wrapped function
    return decorated_function


# Skapa en Blueprint för login
login_bp = Blueprint('login', __name__)

# Route för att skapa ett konto
@login_bp.route('/create_account', methods=['POST'])
async def create_account_route():
    data = request.json

    # Kontrollera att nödvändig data finns
    if not all(key in data for key in ('first_name', 'last_name', 'email', 'password')):
        return jsonify({'message': 'Missing first_name, last_name, email, or password'}), 400
    
    # Kontrollera att e-postadressen slutar med @student.liu.se, @axis.com eller @liu.se
    if not (data['email'].endswith('@student.liu.se') or 
            data['email'].endswith('@axis.com') or 
            data['email'].endswith('@liu.se')):
        return jsonify({'message': 'Email must end with @student.liu.se, @axis.com, or @liu.se'}), 400

    # Skapa konto
    result = await create_account(data)
    if result == "Account with this email already exists":
        # Returnera ett 400-svar om kontot redan finns
        return jsonify({'message': result}), 400

    # Returnera framgångsmeddelande
    return jsonify({'message': result}), 200

# Route för att logga in
import logging

@login_bp.route('/login', methods=['GET', 'POST'])
async def login_route():
    if request.method == 'POST':
        data = request.json

        # Check if email and password are provided
        if not all(key in data for key in ('email', 'password')):
            return jsonify({'message': 'Missing email or password'}), 400

        result = await login_user(data)

        if isinstance(result, dict):
            session['user_id'] = result['user_id']
            return jsonify({'message': 'Login successful', 'session_id': session['user_id']})

        return jsonify({'message': result}), 401  # Return error message if login failed
    
    # Handle GET request
    return jsonify({'message': 'GET request received. Show Login Page.'}), 200



# Route för att logga ut
@login_bp.route('/logout', methods=['POST'])
@login_required
async def logout_route():
    # Logga sessionens innehåll innan den återställs
    logging.info(f"Session before logout: {session}")

    # Ta bort user_id från sessionen
    session.pop('user_id', None)

    # Logga sessionens innehåll efter att den återställts
    logging.info(f"Session after logout: {session}")

    return jsonify({'message': 'Logout successful'})

# Kontrollera inloggning
@login_bp.route('/is_logged_in', methods=['GET'])
def is_logged_in():
    if 'user_id' in session:
        return jsonify({'logged_in': True})
    else:
        return jsonify({'logged_in': False})

