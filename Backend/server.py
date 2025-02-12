from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis import Redis
from src.example.examples_routes import example_bp
from src.customer_count.customer_count_routes import customer_count_bp
from src.queue_count.queue_count_routes import queue_count_bp
from src.coordinates.coordinates_routes import coordinates_bp
from src.example.date_routes import date_bp
from src.login.login_routes import login_bp
from src.customer_influx.customer_influx_routes import customer_influx_bp
import secrets
import logging
import os

app = Flask(__name__)
if(os.getenv('DEPLOYMENT') == "True"):
    port = 80
    redis_uri = "redis://redis:6379"
else:
    port = 5555
    redis_uri = "redis://localhost:6379"

app.secret_key = secrets.token_hex(16)

# Redis client, used for storing session data for the limiter
app.config['SESSION_REDIS'] = Redis(host='redis', port=6379)

# Limiter for requests to prevent DDOS attacks
limiter = Limiter(
   key_func=get_remote_address,
   app=app,
   storage_uri=redis_uri,
  default_limits=["1000 per minute"] # Limits: ["x requests per hour, y requests per minute"]
)

# Middleware
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

print("Server is running")

# Register Blueprints
app.register_blueprint(example_bp, url_prefix='/api/example')
app.register_blueprint(customer_count_bp, url_prefix='/api/customer_count')
app.register_blueprint(queue_count_bp, url_prefix='/api/queue_count')
app.register_blueprint(coordinates_bp, url_prefix='/api/coordinates')
app.register_blueprint(date_bp, url_prefix='/api/date')
app.register_blueprint(login_bp, url_prefix='/api/login')
app.register_blueprint(customer_influx_bp, url_prefix='/api/customer_influx')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)