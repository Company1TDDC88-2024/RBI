from flask import Flask
from flask_cors import CORS
from src.example.examples_routes import example_bp

app = Flask(__name__)

#Middleware
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

app.register_blueprint(example_bp, url_prefix='/example')

if __name__ == '__main__':
    app.run(debug=True)