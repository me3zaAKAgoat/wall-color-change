import cv2
import numpy as np
import requests

def read_image_from_url(url):
    # Step 1: Download the image
    response = requests.get(url)
    if response.status_code == 200:
        # Convert the image bytes to a NumPy array
        image_array = np.frombuffer(response.content, np.uint8)
        # Step 2: Decode the image into an OpenCV format
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
    else:
        raise Exception(f"Failed to download image. Status code: {response.status_code}")

