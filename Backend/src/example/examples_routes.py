from flask import Blueprint
import asyncio
from .example_service import ExampleService

example_bp = Blueprint('example', __name__)

@example_bp.route('/test', methods=['GET'])
def getExample():
    return ExampleService.example_get()

@example_bp.route('/connect', methods=['GET'])
def connect():
    return asyncio.run(ExampleService.connect())

