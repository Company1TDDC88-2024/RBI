from flask import Flask
from src.example.examples_routes import example_bp

app = Flask(__name__)

app.register_blueprint(example_bp, url_prefix='/example')

if __name__ == '__main__':
    app.run(debug=True)