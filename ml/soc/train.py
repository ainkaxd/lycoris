import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models, callbacks, optimizers
import yaml
import os
import numpy as np

# Load config
with open("config_view.yaml", "r") as f:
    config = yaml.safe_load(f)

# Set random seed for reproducibility
tf.random.set_seed(42)
np.random.seed(42)

# Create model save path if not exist
os.makedirs(os.path.dirname(config['model_save_path']), exist_ok=True)

# Load datasets with augmentation for train only
train_ds = tf.keras.utils.image_dataset_from_directory(
    "dataset",
    validation_split=1 - config['train_split'],
    subset="training",
    seed=42,
    image_size=(config['img_height'], config['img_width']),
    batch_size=config['batch_size'],
    label_mode="int"
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    "dataset",
    validation_split=1 - config['train_split'],
    subset="validation",
    seed=42,
    image_size=(config['img_height'], config['img_width']),
    batch_size=config['batch_size'],
    label_mode="int"
)

# Preprocess datasets
def preprocess(image, label):
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image, label

train_ds = train_ds.map(preprocess).prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.map(preprocess).prefetch(tf.data.AUTOTUNE)

# Augmentation layer for train (automotive-specific)
augmentation = tf.keras.Sequential([
    layers.RandomRotation(0.1),  # ~15 degrees
    layers.RandomZoom(0.1),
    layers.RandomFlip("horizontal"),
    layers.RandomBrightness(0.2),  # For lighting variations
    layers.RandomContrast(0.2)     # For outdoor conditions
])
train_ds = train_ds.map(lambda x, y: (augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)

# Compute class weights for imbalance
train_labels = np.concatenate([y for x, y in train_ds], axis=0)
class_weights = dict(enumerate(tf.keras.utils.compute_class_weight(
    'balanced', classes=np.unique(train_labels), y=train_labels
)))

# Load base model
base_model = MobileNetV2(
    include_top=False,
    weights='imagenet',
    input_shape=(config['img_height'], config['img_width'], 3)
)
base_model.trainable = False

# Build model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu', kernel_initializer='he_normal'),
    layers.Dropout(config['dropout_rate']),
    layers.Dense(config['num_classes'], activation='softmax')
])

# Compile and train initial phase (frozen base)
optimizer = optimizers.Adam(learning_rate=config['learning_rate'])
model.compile(optimizer=optimizer,
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Callbacks
early_stop = callbacks.EarlyStopping(patience=5, restore_best_weights=True)
lr_schedule = callbacks.ReduceLROnPlateau(factor=0.2, patience=3, verbose=1)
model_ckpt = callbacks.ModelCheckpoint(
    config['model_save_path'],
    save_best_only=True,
    monitor='val_accuracy',
    mode='max'
)

# Initial training
print("Initial training phase (frozen base)...")
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=config['epochs'],
    callbacks=[early_stop, lr_schedule, model_ckpt],
    class_weight=class_weights
)

# Fine-tuning phase
print("Fine-tuning phase...")
base_model.trainable = True
fine_tune_at = len(base_model.layers) - 50  # Unfreeze last 50 layers
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

# Recompile with lower LR
optimizer = optimizers.Adam(learning_rate=1e-5)
model.compile(optimizer=optimizer,
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Fine-tune
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=config['epochs'] // 2,  # Shorter for fine-tune
    callbacks=[early_stop, lr_schedule, model_ckpt],
    class_weight=class_weights
)

print("Training completed!")