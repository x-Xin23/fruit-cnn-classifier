"""Nutrition information display — card grid + benefits list."""

import streamlit as st
from typing import Dict, Optional


def render_nutrition_info(nutrition_data: Optional[Dict]):
    """
    Render nutrition info as a card grid + benefits list.

    GSAP animations are triggered via a hidden iframe that staggers
    the entrance of nutrition cards and benefit list items.
    """
    if nutrition_data is None:
        st.markdown("""
        <div class="description-text">
            ℹ️ 暂无该水果的营养数据
        </div>
        """, unsafe_allow_html=True)
        return

    st.markdown(
        '<div class="section-divider">─────── 营养价值 ───────</div>',
        unsafe_allow_html=True,
    )

    st.markdown(f"""
    <div class="nutrition-title">
        <span aria-hidden="true">📊</span> {nutrition_data['name_zh']} 营养成分 (每 100g)
    </div>
    """, unsafe_allow_html=True)

    # Nutrition card grid (3 columns)
    cards = [
        ("🔥", "热量", nutrition_data["calories_per_100g"]),
        ("🍊", "维生素 C", nutrition_data["vitamin_c"]),
        ("🌾", "膳食纤维", nutrition_data["fiber"]),
    ]

    cols = st.columns(3)
    for i, (emoji, label, value) in enumerate(cards):
        with cols[i]:
            st.markdown(f"""
            <div class="nutrition-card" role="region" aria-label="{label}">
                <div class="nutrition-card-icon" aria-hidden="true">{emoji}</div>
                <div class="nutrition-card-label">{label}</div>
                <div class="nutrition-card-value">{value}</div>
            </div>
            """, unsafe_allow_html=True)

    # Benefits list
    st.markdown("""
    <h4 style="color:var(--primary-dark); margin-top:1.5rem; font-size:1.05rem;
        font-family:var(--font-display); font-weight:600;">
        ✅ 主要功效
    </h4>
    """, unsafe_allow_html=True)

    benefits_html = '<ul class="benefits-list" role="list" aria-label="主要功效">'
    for benefit in nutrition_data.get("benefits", []):
        benefits_html += f'<li role="listitem">{benefit}</li>'
    benefits_html += '</ul>'
    st.markdown(benefits_html, unsafe_allow_html=True)

    # Description
    st.markdown(f"""
    <div class="description-text" role="note">
        <span aria-hidden="true">💡</span> {nutrition_data.get('description', '')}
    </div>
    """, unsafe_allow_html=True)

    # GSAP animations handled by the persistent engine iframe in app.py
