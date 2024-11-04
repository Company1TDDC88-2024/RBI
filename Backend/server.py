from flask import Flask
from flask_cors import CORS
from src.example.examples_routes import example_bp
from src.customer_count.customer_count_routes import customer_count_bp
from src.queue_count.queue_count_routes import queue_count_bp
from src.coordinates.coordinates_routes import coordinates_bp
from src.example.date_routes import date_bp
from src.login.login_routes import login_bp
import secrets
import logging

app = Flask(__name__)

app.secret_key = secrets.token_hex(16)

# Middleware
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.register_blueprint(example_bp, url_prefix='/example')
app.register_blueprint(customer_count_bp, url_prefix='/customer_count')
app.register_blueprint(queue_count_bp, url_prefix='/queue_count')
app.register_blueprint(coordinates_bp, url_prefix='/coordinates')
app.register_blueprint(date_bp, url_prefix='/date')
app.register_blueprint(login_bp, url_prefix='/login')

logging.basicConfig(level=logging.INFO)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5555)
