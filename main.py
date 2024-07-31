import cv2
from wizart.vision import ComputerVisionClient as vc
from dotenv import load_dotenv
import os
import numpy as np

# Load environment variables
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WIZART_AI_TOKEN = os.getenv("WIZART_AI_TOKEN")

def detect_segment():
    image_path = os.path.join(BASE_DIR, "image.jpg")
    image = cv2.imread(image_path)

    # Initialize the ComputerVisionClient
    client = vc(token=WIZART_AI_TOKEN)

    # Request the mask for the specified feature
    mask = client.segmentation(resource=image_path, feature=vc.feature.WALL)

    # Ensure the mask is of the same size as the image
    mask = cv2.resize(mask, (image.shape[1], image.shape[0]))

    # Define the new color (in BGR format)
    new_color = [0, 255, 0]  # Green color
    alpha = 0.5  # Transparency factor (0.0 to 1.0)

    # Create a colored mask with the new color
    colored_mask = np.zeros_like(image)
    colored_mask[:] = new_color

    # Convert mask to float for blending
    mask_float = mask.astype(float) / 255.0
    colored_mask_float = colored_mask.astype(float)

    # Apply alpha blending
    blended_image = np.where(mask_float[:, :, np.newaxis] == 1,
                             alpha * colored_mask_float + (1 - alpha) * image.astype(float),
                             image.astype(float))

    # Convert blended image to uint8
    blended_image = np.clip(blended_image, 0, 255).astype(np.uint8)

    # Display the final image
    cv2.imshow("Modified Image", blended_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # Save the modified image (optional)
    cv2.imwrite(os.path.join(BASE_DIR, "modified_image.jpg"), blended_image)

detect_segment()
