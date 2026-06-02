"""Design tokens and CSS injection helper for the Fruit Recognition app."""

import streamlit as st
from pathlib import Path

# ── Color Palette ─────────────────────────────────────────────────────
PRIMARY_DARK = "#1a3a2a"
PRIMARY = "#2d6a4f"
PRIMARY_LIGHT = "#52b788"
PRIMARY_LIGHTER = "#b7e4c7"
ACCENT = "#e76f51"
ACCENT_LIGHT = "#f4a261"
BG = "#faf8f0"
BG_ALT = "#f0ece2"
CARD_BG = "#ffffff"
TEXT = "#1a1a1a"
TEXT_SECONDARY = "#5a5a5a"
ERROR = "#c1292e"
SUCCESS = "#2d6a4f"

# ── Typography ───────────────────────────────────────────────────────
FONT_DISPLAY = "'Playfair Display', 'Noto Serif SC', Georgia, serif"
FONT_BODY = "'DM Sans', 'Noto Sans SC', 'Microsoft YaHei', sans-serif"
FONT_FAMILY = FONT_BODY

# ── Layout ───────────────────────────────────────────────────────────
MAX_WIDTH = "780px"
BORDER_RADIUS = "18px"
BORDER_RADIUS_SM = "10px"
CARD_SHADOW = "0 2px 12px rgba(26,58,42,0.06), 0 8px 32px rgba(26,58,42,0.04)"
CARD_SHADOW_HOVER = "0 4px 16px rgba(26,58,42,0.1), 0 12px 40px rgba(26,58,42,0.08)"
TRANSITION = "0.35s cubic-bezier(0.4, 0, 0.2, 1)"

_STYLE_PATH = Path(__file__).parent / "style.css"


def get_css() -> str:
    """Read the custom CSS file and return its contents."""
    if not _STYLE_PATH.exists():
        return ""
    return _STYLE_PATH.read_text(encoding="utf-8")


def inject_css():
    """Inject custom CSS into the Streamlit app."""
    css = get_css()
    if css:
        st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)
