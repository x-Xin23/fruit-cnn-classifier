"""FastAPI backend for fruit recognition."""

import os
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from api.inference import get_recognizer

app = FastAPI(title="Fruit Recognition API")

# CORS: allow origins from env var (comma-separated) or use defaults for local dev
DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:3000,http://localhost:8501"
allowed_origins = os.environ.get("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    """Predict fruit type from uploaded image."""
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(400, "只支持 JPG / PNG 格式的图片哦")

    # Read image
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(400, "这张图片好像坏了，换一张试试？")

    # Run inference
    try:
        recognizer = get_recognizer()
        result = recognizer.predict(image)
        return result
    except Exception as e:
        raise HTTPException(500, f"识别过程出了点小状况: {e}")
