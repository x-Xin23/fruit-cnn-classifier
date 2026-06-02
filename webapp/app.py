"""
Streamlit Web App: 水果识别与营养信息展示系统

Entry point for the fruit recognition web application.
Full user flow: upload → predict → display results + nutrition.

Usage:
    streamlit run webapp/app.py
"""

import streamlit as st
import streamlit.components.v1 as components
import time
import random
import sys
import os
from pathlib import Path

import numpy as np

# Ensure project root is on path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# ── Page Config (must be first Streamlit command) ─────────────────────
st.set_page_config(
    page_title="水果识别与营养信息展示系统",
    page_icon="🍎",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ── Session State ─────────────────────────────────────────────────────
DEFAULTS = {
    "uploaded_image": None,
    "prediction_done": False,
    "prediction_result": None,
    "nutrition_info": None,
    "error_message": None,
}
for key, val in DEFAULTS.items():
    if key not in st.session_state:
        st.session_state[key] = val


# ── Helper: Demo Prediction ────────────────────────────────────────────
def _run_demo_prediction():
    """Simulate a prediction with random fruit + confidence (no model)."""
    from src.utils.nutrition import CLASS_NAMES, CLASS_NAMES_ZH, INDEX_TO_CLASS

    time.sleep(0.8)  # Simulate inference latency

    idx = random.randint(0, len(CLASS_NAMES) - 1)
    fruit_en = CLASS_NAMES[idx]
    fruit_zh = CLASS_NAMES_ZH[idx]
    confidence = round(random.uniform(0.82, 0.98), 4)

    # Generate plausible top-3 probabilities
    remaining = 1.0 - confidence
    p2 = round(remaining * random.uniform(0.4, 0.7), 4)
    p3 = round(remaining - p2, 4)
    probs = np.zeros(len(CLASS_NAMES))
    probs[idx] = confidence
    others = [i for i in range(len(CLASS_NAMES)) if i != idx]
    random.shuffle(others)
    probs[others[0]] = p2
    probs[others[1]] = p3

    nutrition = get_nutrition_info(fruit_en)
    emoji = get_fruit_emoji(fruit_en)

    st.session_state["prediction_done"] = True
    st.session_state["prediction_result"] = {
        "fruit_en": fruit_en,
        "fruit_zh": fruit_zh,
        "confidence": confidence,
        "probabilities": probs,
        "emoji": emoji,
        "inference_time": 0.80,
    }
    st.session_state["nutrition_info"] = nutrition
    st.session_state["error_message"] = None
    st.rerun()


def _run_real_prediction(image):
    """Run actual model inference."""
    start = time.time()
    model = load_model()
    fruit_en, fruit_zh, confidence, probs = predict(model, image)
    elapsed = time.time() - start

    nutrition = get_nutrition_info(fruit_en)
    emoji = get_fruit_emoji(fruit_en)

    st.session_state["prediction_done"] = True
    st.session_state["prediction_result"] = {
        "fruit_en": fruit_en,
        "fruit_zh": fruit_zh,
        "confidence": confidence,
        "probabilities": probs,
        "emoji": emoji,
        "inference_time": elapsed,
    }
    st.session_state["nutrition_info"] = nutrition
    st.session_state["error_message"] = None
    st.rerun()

# ── Inject Custom CSS ─────────────────────────────────────────────────
from webapp.assets.theme import inject_css
inject_css()

# ── Import App Modules ────────────────────────────────────────────────
from webapp.utils import load_model, predict, get_nutrition_info, get_fruit_emoji
from webapp.components import (
    render_upload_section,
    render_prediction_result,
    render_nutrition_info,
    render_reset_button,
)
from webapp.components.fruit_gallery import render_fruit_gallery

# ── Hero Section ──────────────────────────────────────────────────────
st.markdown("""
<div class="hero-section">
    <div class="hero-decor hero-decor-1"></div>
    <div class="hero-decor hero-decor-2"></div>
    <div class="hero-decor hero-decor-3"></div>
    <h1 class="hero-title">🍎 水果识别与营养信息展示系统</h1>
    <p class="hero-subtitle">上传水果图片，即刻识别种类并查看营养价值</p>
    <span class="hero-tag">CNN 深度学习 · 15 种水果 · 99.9% 准确率</span>
</div>
""", unsafe_allow_html=True)

# ── Fruit Gallery ─────────────────────────────────────────────────────
render_fruit_gallery()

# ── Demo Mode Toggle ───────────────────────────────────────────────────
DEMO_MODE = st.toggle(
    "🎮 演示模式",
    value=False,
    help="开启后无需模型即可预览完整界面效果",
)

# ── Upload Section ────────────────────────────────────────────────────
image = render_upload_section()

# ── Prediction Logic ──────────────────────────────────────────────────
if image is not None:
    if st.button("🔍 识别水果", key="predict_button", use_container_width=True):
        with st.spinner("🔄 正在识别中，请稍候..."):
            try:
                if DEMO_MODE:
                    _run_demo_prediction()
                else:
                    _run_real_prediction(image)
            except FileNotFoundError:
                st.session_state["error_message"] = (
                    "模型文件未找到，请先训练模型（运行 src/training/train.py）"
                )
                st.session_state["prediction_done"] = False
            except Exception as e:
                st.session_state["error_message"] = f"识别过程出错: {e}"
                st.session_state["prediction_done"] = False

# ── Display Results ───────────────────────────────────────────────────
if st.session_state.get("prediction_done") and st.session_state.get("prediction_result"):
    result = st.session_state["prediction_result"]

    st.caption(f"推理耗时: {result['inference_time']:.2f} 秒")

    render_prediction_result(
        fruit_name_en=result["fruit_en"],
        fruit_name_zh=result["fruit_zh"],
        confidence=result["confidence"],
        emoji=result["emoji"],
        probabilities=result["probabilities"],
    )

    render_nutrition_info(st.session_state["nutrition_info"])

    st.markdown("<div style='margin-top: 2rem;'>", unsafe_allow_html=True)
    render_reset_button()
    st.markdown("</div>", unsafe_allow_html=True)

# ── Display Error ─────────────────────────────────────────────────────
elif st.session_state.get("error_message"):
    st.markdown(f"""
    <div class="error-message" role="alert">
        <span aria-hidden="true">⚠️</span>
        <span>{st.session_state['error_message']}</span>
    </div>
    """, unsafe_allow_html=True)
    render_reset_button()

# ── Footer ────────────────────────────────────────────────────────────
st.markdown("""
<div class="app-footer">
    <p>《人工智能基础》期末大作业 · 水果识别与营养信息展示系统</p>
    <p>4 层 CNN · Fruits 360 数据集 · 15 种水果</p>
</div>
""", unsafe_allow_html=True)

# ── Persistent GSAP Animation Engine ──────────────────────────────────
# Single hidden iframe at the bottom loads GSAP + animations.js.
# MutationObserver detects new DOM elements (Streamlit re-renders) and
# runs matching entrance animations automatically.
_ANIMATIONS_JS = (Path(__file__).parent / "assets" / "animations.js").read_text(encoding="utf-8")

components.html(
    f"""
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js"></script>
    <script>
    {_ANIMATIONS_JS}
    </script>
    """,
    height=0,
    width=0,
)
