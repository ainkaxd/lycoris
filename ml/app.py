# lycoris/ml/app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import io
from lycoris.ml.service import CarConditionService

app = FastAPI(title="Car Condition API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

svc = CarConditionService()

class Out(BaseModel):
    cleanliness_label: str
    cleanliness_score: float
    damage_label: str
    damage_score: float

@app.get("/health")
def health(): return {"status": "ok"}

@app.post("/predict", response_model=Out)
async def predict(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    y = svc.predict(img)
    return Out(
        cleanliness_label=y["cleanliness"]["label"],
        cleanliness_score=y["cleanliness"]["score"],
        damage_label=y["damage"]["label"],
        damage_score=y["damage"]["score"],
    )
# --- /predict4: принимаем 4 фото и агрегируем ---
from typing import List
from fastapi import HTTPException

@app.post("/predict4", response_model=Out)
async def predict4(files: List[UploadFile] = File(...)):
    if len(files) != 4:
        raise HTTPException(status_code=400, detail="need exactly 4 images")

    imgs = []
    for f in files:
        data = await f.read()
        imgs.append(Image.open(io.BytesIO(data)).convert("RGB"))

    # предсказания по каждому фото
    ys = [svc.predict(im) for im in imgs]

    # агрегируем
    clean_votes = sum(1 for y in ys if y["cleanliness"]["label"] == "clean")
    damage_any = any(y["damage"]["label"] == "damaged" for y in ys)

    cleanliness_label = "clean" if clean_votes >= 3 else "dirty"
    # усредняем уверенность в выбранной метке
    cleanliness_score = sum(
        (y["cleanliness"]["score"] if y["cleanliness"]["label"] == "clean" else 1 - y["cleanliness"]["score"])
        for y in ys
    ) / 4.0

    damage_label = "damaged" if damage_any else "undamaged"
    damage_score = sum(
        (y["damage"]["score"] if y["damage"]["label"] == "damaged" else 1 - y["damage"]["score"])
        for y in ys
    ) / 4.0

    return Out(
        cleanliness_label=cleanliness_label,
        cleanliness_score=float(cleanliness_score),
        damage_label=damage_label,
        damage_score=float(damage_score),
    )
