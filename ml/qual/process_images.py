import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import sys
import os

## 1. Configuration & Model Loading
# --- Paths to your three trained models ---
IQA_MODEL_PATH = "models/iqa_model.h5"
VIEW_MODEL_PATH = "models/view_model.h5"
DAMAGE_MODEL_PATH = "models/best_model.h5"

# --- Threshold for the IQA model ---
# You will need to experiment to find a good value (e.g., 0.6 for a 0-1 score)
QUALITY_THRESHOLD = 0.6 

# --- Class names for interpretation ---
VIEW_CLASS_NAMES = ['front', 'left', 'right', 'back']
DAMAGE_CLASS_NAMES = ['no_damage', 'small_damage', 'large_damage', 'useless']

# --- Load all models into memory once ---
print("Loading models, please wait...")
try:
    iqa_model = tf.keras.models.load_model(IQA_MODEL_PATH)
    view_model = tf.keras.models.load_model(VIEW_MODEL_PATH)
    damage_model = tf.keras.models.load_model(DAMAGE_MODEL_PATH)
    print("All models loaded successfully!")
except IOError as e:
    print(f"Error loading models: {e}")
    print("Please ensure all model files are in the 'models/' directory.")
    sys.exit(1)


## 2. Helper Functions
def preprocess_image(img_path, target_size=(224, 224)):
    """Loads and preprocesses an image for model prediction."""
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

## 3. Main Processing Logic
def run_pipeline(image_paths):
    """
    Processes a list of images through the full 3-stage pipeline.
    """
    for img_path in image_paths:
        print(f"\n--- Processing: {os.path.basename(img_path)} ---")

        if not os.path.exists(img_path):
            print(f"Result: ❌ File not found. Skipping.")
            continue

        # Prepare the image
        img_array = preprocess_image(img_path)

        # --- Stage 1: Image Quality Assessment ---
        quality_score = iqa_model.predict(img_array)[0][0] # Assuming model returns [[score]]

        if quality_score < QUALITY_THRESHOLD:
            print(f"Result: ❌ REJECTED (Low Quality)")
            print(f"   (Reason: Quality score {quality_score:.2f} is below threshold of {QUALITY_THRESHOLD})")
            continue
        
        print(f"Result: ✅ PASSED Quality Check (Score: {quality_score:.2f})")

        # --- Stage 2: View Classification ---
        view_prediction_probs = view_model.predict(img_array)
        predicted_view_index = np.argmax(view_prediction_probs)
        predicted_view = VIEW_CLASS_NAMES[predicted_view_index]
        print(f"   - Predicted View: '{predicted_view}'")

        # --- Stage 3: Damage Assessment ---
        damage_prediction_probs = damage_model.predict(img_array)
        predicted_damage_index = np.argmax(damage_prediction_probs)
        predicted_damage = DAMAGE_CLASS_NAMES[predicted_damage_index]
        print(f"   - Predicted Damage: '{predicted_damage}'")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_images.py <path_to_image1> <path_to_image2> ...")
        sys.exit(1)
        
    image_paths_from_user = sys.argv[1:]
    run_pipeline(image_paths_from_user)
    