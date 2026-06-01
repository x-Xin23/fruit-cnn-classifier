"""Web app UI components for the Fruit Recognition system."""

from .upload import render_upload_section, render_reset_button
from .result import render_prediction_result
from .nutrition import render_nutrition_info

__all__ = [
    "render_upload_section",
    "render_reset_button",
    "render_prediction_result",
    "render_nutrition_info",
]
