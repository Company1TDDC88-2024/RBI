from flask import Flask, request, jsonify, Response
import requests
import logging
import json
import os

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def index():
    return "ACAP Proxy Server is Running"

# Route to receive data from the camera
@app.route('/customer_count/upload', methods=['POST'])
def forward_customer_count():

    data = request.json
    target_url = os.environ.get('BACKEND_URL') + '/customer_count/upload'

    try:
        # Forward the data to the target URL
        response = requests.post(target_url, json=data)

        # Check if the request was successful
        if response.status_code == 200:
            return jsonify({'status': 'success', 'message': 'Data forwarded successfully'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Failed to forward data'}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
@app.route('/queue_count/upload', methods=['POST'])
def forward_queue_count():
    
    data = request.json
    target_url = os.environ.get('BACKEND_URL') + '/queue_count/upload'

    try:
        # Forward the data to the target URL
        response = requests.post(target_url, json=data)

        # Check if the request was successful
        if response.status_code == 200:
            return jsonify({'status': 'success', 'message': 'Data forwarded successfully'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Failed to forward data'}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    

@app.route('/camera_feed_1', methods=['GET'])
def get_camera_feed_1():
    target_url = os.environ.get('CAMERA1_URL')
    try:
        response = requests.get(target_url)
        if response.status_code == 200:
            return jsonify({'status': 'success', 'message': 'Data forwarded successfully'}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Failed to forward data'}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/camera_feed_2', methods=['GET'])
def get_camera_feed_2():
    target_url = os.environ.get('CAMERA2_URL')
    username = os.environ.get('CAMERA2_USERNAME')
    password = os.environ.get('CAMERA2_PASSWORD')

    try:
        response = requests.get(target_url, auth=(username, password), stream=True)
        if response.status_code == 200:
            def generate():
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        yield chunk
            return Response(generate(), content_type='multipart/x-mixed-replace; boundary=--myboundary')
        else:
            return jsonify({'status': 'error', 'message': 'Failed to forward data', 'status_code': response.status_code, 'response_text': response.text}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({'status': 'error', 'message': str(e), 'details': e.response.text if e.response else 'No response received'}), 500



if __name__ == '__main__':
    # Set the host to '0.0.0.0' to make the app accessible over the network
    app.run(debug=True, host='0.0.0.0', port=4000)