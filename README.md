# inDrive • lycoris — Проверка состояния авто по фото

Демо для хакатона: фронтенд (Next.js) + ML-бэкенд (FastAPI + TensorFlow).  
По 1 фото определяет **чистоту** (`clean/dirty`) и **целостность** (`undamaged/damaged`).  
Фронт показывает результат **на русском** (чистый/грязный, целый/повреждённый) и решает «можно ли выполнять поездки».

## Стек
- **Backend:** FastAPI, TensorFlow/Keras, Pillow, python-multipart
- **Frontend:** Next.js (App Router), TypeScript, Tailwind

## Структура
lycoris/
ml/ # Бэкенд (FastAPI)
app.py
service.py
damage/ predict.py # инференс модели целостности
soc/ predict.py # инференс модели чистоты
weights/
damage.keras
soc.keras
requirements.txt
web/ # Фронтенд (Next.js)
app/, components/, public/
.env.local
package.json
README.md

## Быстрый старт


## [1) Фронтенд](#)
```powershell
  cd lycoris\web
# создаём файл .env.local:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm install
npm run dev

Открой http://localhost:3000
```
 ## [2) Бекенд](#)

```powershell
cd lycoris
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r ml/requirements.txt
python -m uvicorn lycoris.ml.app:app --host 127.0.0.1 --port 8000

Веса кладём в ml/weights/ под именами damage.keras и soc.keras.


API
GET /health
Проверка состояния
