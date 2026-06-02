"""Model loading and inference for the fruit recognition API."""

import sys
import os
from pathlib import Path
from typing import Tuple

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.models.cnn_model import FruitCNN
from src.utils.nutrition import (
    CLASS_NAMES, CLASS_NAMES_ZH, INDEX_TO_CLASS, NUTRITION_INFO
)

# ImageNet normalization (must match training)
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]

MODEL_PATH = PROJECT_ROOT / "models" / "fruit_cnn.pth"


class FruitRecognizer:
    """Singleton model loader and inference engine."""

    def __init__(self):
        self.model = None
        self.device = torch.device("cpu")
        self._load_model()

    def _load_model(self):
        """Load the trained CNN model."""
        self.model = FruitCNN(num_classes=15)
        checkpoint = torch.load(
            MODEL_PATH, map_location=self.device, weights_only=True
        )
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            self.model.load_state_dict(checkpoint["model_state_dict"])
        else:
            self.model.load_state_dict(checkpoint)
        self.model.to(self.device)
        self.model.eval()

    def preprocess(self, image: Image.Image) -> torch.Tensor:
        """Preprocess PIL image for model input."""
        if image.mode != "RGB":
            image = image.convert("RGB")
        transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
            transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
        ])
        return transform(image).unsqueeze(0)

    def predict(self, image: Image.Image) -> dict:
        """Run inference and return prediction results."""
        input_tensor = self.preprocess(image).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, dim=1)

        idx = predicted_idx.item()
        probs = probabilities.squeeze().cpu().numpy()

        # Get top-3
        top3_idx = probs.argsort()[-3:][::-1]
        top3 = [
            {
                "name_en": INDEX_TO_CLASS[int(i)],
                "name_zh": CLASS_NAMES_ZH[int(i)],
                "confidence": float(probs[i]),
            }
            for i in top3_idx
        ]

        fruit_en = INDEX_TO_CLASS[idx]
        nutrition = NUTRITION_INFO.get(fruit_en, {})

        return {
            "fruit_en": fruit_en,
            "fruit_zh": CLASS_NAMES_ZH[idx],
            "confidence": float(confidence.item()),
            "emoji": nutrition.get("emoji", "🍍"),
            "nutrition": {
                "calories": nutrition.get("calories_per_100g", ""),
                "vitamin_c": nutrition.get("vitamin_c", ""),
                "fiber": nutrition.get("fiber", ""),
                "benefits": nutrition.get("benefits", []),
                "description": nutrition.get("description", ""),
            },
            "top3": top3,
        }


# Global singleton
_recognizer: FruitRecognizer | None = None


def get_recognizer() -> FruitRecognizer:
    """Get or create the singleton recognizer."""
    global _recognizer
    if _recognizer is None:
        _recognizer = FruitRecognizer()
    return _recognizer
