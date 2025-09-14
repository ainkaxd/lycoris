from pathlib import Path
from PIL import Image
import importlib

class _Pred:
    def __init__(self, module_path: str, weights: str | None):
        self.mod = importlib.import_module(module_path)
        self.model = self.mod.load_model(weights) if hasattr(self.mod, "load_model") else None

    def __call__(self, img: Image.Image):
        if not hasattr(self.mod, "infer"):
            raise RuntimeError(f"{self.mod.__name__} has no infer()")
        return self.mod.infer(self.model, img)

class CarConditionService:
    def __init__(self, weights_dir: str | None = None):
        base = Path(__file__).resolve().parent
        wdir = (base / "weights") if weights_dir is None else Path(weights_dir)
        wdir.mkdir(parents=True, exist_ok=True)

        damage_p = (wdir / "damage.keras").resolve()
        soc_p    = (wdir / "soc.keras").resolve()
        if not damage_p.exists():
            raise FileNotFoundError(f"weights not found: {damage_p}")
        if not soc_p.exists():
            raise FileNotFoundError(f"weights not found: {soc_p}")

        self.damage = _Pred("lycoris.ml.damage.predict", str(damage_p))
        self.clean  = _Pred("lycoris.ml.soc.predict",    str(soc_p))

    def predict(self, img: Image.Image) -> dict:
        d_lbl, d_sc = self.damage(img)
        c_lbl, c_sc = self.clean(img)
        return {"damage": {"label": d_lbl, "score": float(d_sc)},
                "cleanliness": {"label": c_lbl, "score": float(c_sc)}}
