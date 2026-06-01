"""Design tokens and CSS injection helper for the Fruit Recognition app."""

import streamlit as st
from pathlib import Path

# ── Color Palette (fresh fruit / green theme) ────────────────────────
PRIMARY_DARK = "#1B5E20"
PRIMARY = "#2E7D32"
PRIMARY_LIGHT = "#4CAF50"
ACCENT = "#FF6F00"
ACCENT_LIGHT = "#FFB300"
BG = "#F1F8E9"
CARD_BG = "#FFFFFF"
TEXT = "#1B1B1B"
TEXT_SECONDARY = "#616161"
ERROR = "#D32F2F"
SUCCESS = "#388E3C"

# ── Typography ───────────────────────────────────────────────────────
FONT_FAMILY = "'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif"

# ── Layout ───────────────────────────────────────────────────────────
MAX_WIDTH = "800px"
BORDER_RADIUS = "16px"
BORDER_RADIUS_SM = "8px"
CARD_SHADOW = "0 4px 20px rgba(0,0,0,0.08)"
TRANSITION = "0.3s ease"

_STYLE_PATH = Path(__file__).parent / "style.css"


def get_css() -> str:
    """Read the custom CSS file and return its contents."""
    if not _STYLE_PATH.exists():
        return ""
    return _STYLE_PATH.read_text(encoding="utf-8")


def inject_css():
    """Inject custom CSS into the Streamlit app via st.markdown."""
    css = get_css()
    if css:
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)
