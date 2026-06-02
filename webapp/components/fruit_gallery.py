"""Fruit gallery — displays all 15 supported fruit types in a grid."""

import streamlit as st

# 15 fruits: emoji, Chinese name, English name
FRUITS = [
    ("🍎", "苹果", "Apple"),
    ("🍌", "香蕉", "Banana"),
    ("🍊", "橙子", "Orange"),
    ("🍇", "葡萄", "Grape"),
    ("🍓", "草莓", "Strawberry"),
    ("🥝", "猕猴桃", "Kiwi"),
    ("🍉", "西瓜", "Watermelon"),
    ("🍑", "桃子", "Peach"),
    ("🍐", "梨", "Pear"),
    ("🥭", "芒果", "Mango"),
    ("🍍", "菠萝", "Pineapple"),
    ("🍒", "樱桃", "Cherry"),
    ("🍋", "柠檬", "Lemon"),
    ("🫐", "蓝莓", "Blueberry"),
    ("🫐", "石榴", "Pomegranate"),
]


def render_fruit_gallery():
    """Render the 15-fruit showcase grid with GSAP-animated cards."""
    st.markdown("""
    <div class="fruit-gallery">
        <div class="fruit-gallery-title">支持识别的 15 种水果</div>
        <div class="fruit-grid">
    """, unsafe_allow_html=True)

    for emoji, zh, en in FRUITS:
        st.markdown(f"""
            <div class="fruit-card" role="img" aria-label="{zh} ({en})">
                <span class="fruit-card-emoji" aria-hidden="true">{emoji}</span>
                <span class="fruit-card-zh">{zh}</span>
                <span class="fruit-card-en">{en}</span>
            </div>
        """, unsafe_allow_html=True)

    st.markdown("""
        </div>
    </div>
    """, unsafe_allow_html=True)
