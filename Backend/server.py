from flask import Flask
from test import test_bp

app = Flask(__name__)
app.register_blueprint(test_bp, url_prefix='/test')

if __name__ == '__main__':
    app.run()