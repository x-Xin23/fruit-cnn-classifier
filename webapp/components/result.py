"""Prediction result display — renders the result card with confidence bar."""

import streamlit as st
import numpy as np
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def render_prediction_result(
    fruit_name_en: str,
    fruit_name_zh: str,
    confidence: float,
    emoji: str,
    probabilities: np.ndarray | None = None,
):
    """
    Render the result card with animated confidence bar.

    The HTML lives in the main Streamlit DOM. GSAP animations are triggered
    via a companion zero-height iframe that accesses parent.document.
    """
    confidence_pct = confidence * 100

    st.markdown(
        '<div class="section-divider">─────── 识别结果 ───────</div>',
        unsafe_allow_html=True,
    )

    st.markdown(f"""
    <div class="result-card" role="region" aria-label="识别结果">
        <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="result-emoji" aria-hidden="true">{emoji}</span>
            <div>
                <div class="result-fruit-name">
                    {fruit_name_zh}
                    <span class="result-fruit-name-en">({fruit_name_en})</span>
                </div>
            </div>
        </div>
        <div class="confidence-section">
            <div class="confidence-label">
                <span>置信度</span>
                <span>{confidence_pct:.1f}%</span>
            </div>
            <div class="confidence-bar-track"
                 role="progressbar"
                 aria-valuenow="{confidence_pct:.1f}"
                 aria-valuemin="0" aria-valuemax="100"
                 aria-label="预测置信度 {confidence_pct:.1f}%">
                <div class="confidence-bar-fill"
                     data-target-width="{confidence_pct:.1f}%"
                     style="width:0%;"></div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Show top-3 probabilities if available
    if probabilities is not None:
        _render_top3(probabilities)


def _render_top3(probabilities: np.ndarray):
    """Show top-3 most likely classes below the main result."""
    from webapp.utils import CLASS_NAMES, CLASS_NAMES_ZH

    top3_idx = probabilities.argsort()[-3:][::-1]

    st.markdown("""
    <div class="top3-label">其他可能类别</div>
    """, unsafe_allow_html=True)

    for idx in top3_idx:
        prob = probabilities[idx] * 100
        st.markdown(
            f'<div class="top3-item">'
            f'&nbsp;&nbsp;{CLASS_NAMES_ZH[idx]} ({CLASS_NAMES[idx]}): {prob:.1f}%'
            f'</div>',
            unsafe_allow_html=True,
        )
