import json
from flask import Flask, request, jsonify
import cloudinary
import cloudinary.uploader
import numpy as np
import os
from util import read_image_from_url
from dotenv import load_dotenv
from vision import color_wall

load_dotenv()
# Configuration       
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

JSON_FILE = 'user_urls.json'


def check_resource_exists(public_id):
    try:
        read_image_from_url()
        return True  # Resource exists
    except Exception as e:
        return False  # Resource does not exist

def delete_file(public_id):
    if check_resource_exists(public_id):
        try:
            # Call the Cloudinary API to destroy the resource
            response = cloudinary.api.delete_resources([public_id])
            return response
        except Exception as e:
            return {"error": str(e)}
    else:
        return {"error": "Resource does not exist"}

def load_user_urls():
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r') as file:
            return json.load(file)
    return {}

def save_user_urls(data):
    with open(JSON_FILE, 'w') as file:
        json.dump(data, file, indent=4)

app = Flask(__name__)

# Define a route for the root URL (/)
@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if 'user_id' not in request.form:
        return jsonify({"error": "Missing user_id field"}), 400

    user_id = request.form['user_id']

    delete_file(user_id)

    try:
        upload_result = cloudinary.uploader.upload(file,
            public_id=user_id,
            format='jpg', 
            transformation=[{'fetch_format': 'jpg'}] )
        
        secure_url = upload_result["secure_url"]
        user_urls = load_user_urls()
        user_urls[user_id] = secure_url
        save_user_urls(user_urls)
        return jsonify({"secure_url": upload_result["secure_url"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/change_wall_color', methods=['POST'])
def change_wall_color():    
    if 'user_id' not in request.form:
        return jsonify({"error": "Missing user_id field"}), 400
    if 'color' not in request.form:
        return jsonify({"error": "Missing color field"}), 400

    user_id = request.form['user_id']
    color = request.form['color']

    user_urls = load_user_urls()
    cloudinary_url = user_urls.get(user_id)
    if not cloudinary_url:
        return jsonify({"error": "User ID not found"}), 404
    
    color_wall(cloudinary_url, color)
    return jsonify({"message": "Wall color changed successfully"}), 200

# Run the app if this file is executed
if __name__ == '__main__':
    app.run(debug=True)

