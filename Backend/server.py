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
import os
from dotenv import load_dotenv


app = Flask(__name__)
if(os.getenv('Deployment') == 'True'):
    port = 80
else:
    port = 5555

app.secret_key = secrets.token_hex(16)

# Middleware
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

print("Server is running")
app.register_blueprint(example_bp, url_prefix='/api/example')
app.register_blueprint(customer_count_bp, url_prefix='/api/customer_count')
app.register_blueprint(queue_count_bp, url_prefix='/api/queue_count')
app.register_blueprint(coordinates_bp, url_prefix='/api/coordinates')
app.register_blueprint(date_bp, url_prefix='/api/date')
app.register_blueprint(login_bp, url_prefix='/api/login')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)