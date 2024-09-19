from flask import Blueprint
from .test_service import TestService
from . import test_bp

@test_bp.route('/test-get', methods=['GET'])
def test():
    return TestService.test_get()

