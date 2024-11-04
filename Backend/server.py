from flask import Flask
from flask_cors import CORS
from src.example.examples_routes import example_bp
from src.customer_count.customer_count_routes import customer_count_bp
from src.queue_count.queue_count_routes import queue_count_bp
from src.coordinates.coordinates_routes import coordinates_bp
from src.example.date_routes import date_bp

app = Flask(__name__)

# Middleware
<<<<<<< HEAD
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
print("Server is running")
=======
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

>>>>>>> 9fd02f05ae4c7192cd12db8777de42e04dcef841
app.register_blueprint(example_bp, url_prefix='/example')
app.register_blueprint(customer_count_bp, url_prefix='/customer_count')
app.register_blueprint(queue_count_bp, url_prefix='/queue_count')
app.register_blueprint(coordinates_bp, url_prefix='/coordinates')
app.register_blueprint(date_bp, url_prefix='/date')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5555)
