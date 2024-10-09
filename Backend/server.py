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

app = Flask(__name__)

# Redis client
redis_client = Redis(host='localhost', port=6379)

# Limiter for requests to prevent DDOS attacks
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="redis://localhost:6379",
    default_limits=["5000 per hour"]
)

# Middleware
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Register Blueprints
app.register_blueprint(example_bp, url_prefix='/example')
app.register_blueprint(customer_count_bp, url_prefix='/customer_count')
app.register_blueprint(queue_count_bp, url_prefix='/queue_count')
app.register_blueprint(coordinates_bp, url_prefix='/coordinates')
app.register_blueprint(date_bp, url_prefix='/date')

if __name__ == '__main__':
    app.run(debug=True)