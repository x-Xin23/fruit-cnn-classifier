"""Model loading, image preprocessing, prediction.

All class labels and nutrition data are imported from ``src.utils.nutrition``
(single source of truth).  No duplicated constants.
"""

import os
import sys
from typing import Tuple, Optional

import numpy as np
import torch
import torchvision.transforms as transforms
from PIL import Image
import streamlit as st

# Ensure project root is on path so ``src.*`` imports work
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

# ── Shared constants (single source of truth) ──────────────────────────
from src.utils.nutrition import (          # noqa: E402
    CLASS_NAMES,
    CLASS_NAMES_ZH,
    INDEX_TO_CLASS,
    get_nutrition_info,
    get_fruit_emoji,
)

# ImageNet normalisation – MUST match training in src/utils/config.py
NORMALIZE_MEAN = (0.485, 0.456, 0.406)
NORMALIZE_STD = (0.229, 0.224, 0.225)

# ── Model Loading ──────────────────────────────────────────────────────

@st.cache_resource
def load_model(model_path: Optional[str] = None) -> "torch.nn.Module":
    """Load the trained FruitCNN with Streamlit caching.

    ``@st.cache_resource`` keeps the model in memory across all sessions.

    Parameters
    ----------
    model_path : str or None
        Path to the checkpoint.  Defaults to ``<project_root>/models/fruit_cnn.pth``.

    Returns
    -------
    torch.nn.Module
        The loaded model in eval mode on CPU.
    """
    from src.models.cnn_model import FruitCNN

    if model_path is None:
        model_path = os.path.join(_project_root, "models", "fruit_cnn.pth")

    device = torch.device("cpu")
    model = FruitCNN(num_classes=len(CLASS_NAMES))

    checkpoint = torch.load(model_path, map_location=device, weights_only=True)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model.to(device)
    model.eval()
    return model


# ── Image Preprocessing ────────────────────────────────────────────────

def preprocess_image(image: Image.Image) -> torch.Tensor:
    """Resize, normalise, and convert a PIL image to a model-ready tensor.

    Parameters
    ----------
    image : PIL.Image.Image
        Input image (RGB or will be converted).

    Returns
    -------
    torch.Tensor
        Normalised tensor with batch dimension ``(1, C, H, W)``.
    """
    if image is None:
        raise ValueError("No image provided for preprocessing")
    if image.mode != "RGB":
        image = image.convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
    ])
    return transform(image).unsqueeze(0)


# ── Prediction ─────────────────────────────────────────────────────────

def predict(
    model: "torch.nn.Module",
    image: Image.Image,
) -> Tuple[str, str, float, np.ndarray]:
    """Run inference and return human-readable results.

    Parameters
    ----------
    model : torch.nn.Module
        Loaded FruitCNN model.
    image : PIL.Image.Image
        Input fruit image.

    Returns
    -------
    (name_en, name_zh, confidence, probabilities) : tuple
        - **name_en** – English class name (e.g. ``"Apple"``)
        - **name_zh** – Chinese class name (e.g. ``"苹果"``)
        - **confidence** – Top-1 softmax probability (0–1)
        - **probabilities** – Full probability vector (shape ``[num_classes]``)
    """
    device = next(model.parameters()).device
    input_tensor = preprocess_image(image).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, dim=1)

    idx = predicted_idx.item()
    return (
        INDEX_TO_CLASS[idx],
        CLASS_NAMES_ZH[idx],
        confidence.item(),
        probabilities.squeeze().cpu().numpy(),
    )
