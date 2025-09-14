import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import yaml

# Load config
with open("config_view.yaml", "r") as f:
    config = yaml.safe_load(f)

# Load model
model = tf.keras.models.load_model(config['model_save_path'])

# Load validation data
val_ds = tf.keras.utils.image_dataset_from_directory(
    "dataset",
    validation_split=1 - config['train_split'],
    subset="validation",
    seed=42,
    image_size=(config['img_height'], config['img_width']),
    batch_size=config['batch_size'],
    label_mode="int",
    shuffle=False
)

# Preprocess
def preprocess(image, label):
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image, label

val_ds = val_ds.map(preprocess)

# Predict
y_true = np.concatenate([y for x, y in val_ds], axis=0)
y_probs = model.predict(val_ds)
y_pred = np.argmax(y_probs, axis=1)

# Labels
class_names = config['class_names']

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("View Classifier Confusion Matrix")
plt.savefig("view_confusion_matrix.png")  # Save plot
plt.show()

# Classification Report
print(classification_report(y_true, y_pred, target_names=class_names))