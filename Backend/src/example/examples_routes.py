from flask import Blueprint
from .example_service import ExampleService

example_bp = Blueprint('example', __name__)

@example_bp.route('/adda', methods=['GET'])
def getExample():
    return ExampleService.example_get()

