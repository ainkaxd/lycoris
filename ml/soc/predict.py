# soc/predict.py
from pathlib import Path
from PIL import Image
import numpy as np
import tensorflow as tf
import yaml

_DIR = Path(__file__).resolve().parent
_CFG = None
_NAMES = None

def _load_cfg():
    global _CFG, _NAMES
    if _CFG is None:
        # сначала пробуем config_view.yaml, иначе config.yaml
        p1 = _DIR / "config_view.yaml"
        p2 = _DIR / "config.yaml"
        cfg_path = p1 if p1.exists() else p2
        with open(cfg_path, "r", encoding="utf-8") as f:
            _CFG = yaml.safe_load(f)
        _NAMES = _CFG["class_names"]
    return _CFG, _NAMES

def load_model(weights_path: str | None):
    cfg, _ = _load_cfg()
    path = Path(weights_path) if weights_path else Path(cfg["model_save_path"])
    model = tf.keras.models.load_model(str(path))
    return {"model": model, "cfg": cfg}

def infer(state, img: Image.Image):
    model = state["model"]
    cfg = state["cfg"]
    names = cfg["class_names"]
    h, w = cfg.get("img_height", 224), cfg.get("img_width", 224)

    img = img.convert("RGB").resize((w, h))
    x = tf.keras.preprocessing.image.img_to_array(img)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = np.expand_dims(x, axis=0)

    logits = model.predict(x, verbose=0)
    i = int(np.argmax(logits, axis=-1)[0])
    conf = float(np.max(logits))
    label = names[i]
    return label, conf
