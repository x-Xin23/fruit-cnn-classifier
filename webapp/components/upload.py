"""Image upload component with validation and preview."""

import streamlit as st
from PIL import Image
from typing import Optional, Tuple
import base64
from io import BytesIO


def render_upload_section() -> Optional[Image.Image]:
    """
    Render the upload zone and file uploader. Returns PIL Image if valid.

    Handles: initial state, file validation, and image preview.
    """
    st.markdown("""
    <div class="upload-zone" role="region" aria-label="图片上传区域">
        <div class="upload-icon" aria-hidden="true">📤</div>
        <div class="upload-text">上传水果图片</div>
        <div class="upload-hint">支持 JPG / PNG 格式，单张图片</div>
    </div>
    """, unsafe_allow_html=True)

    uploaded_file = st.file_uploader(
        label="选择水果图片",
        type=["jpg", "jpeg", "png"],
        key="fruit_image_uploader",
        help="上传一张清晰的水果图片 (JPG 或 PNG 格式)",
        label_visibility="collapsed",
    )

    if uploaded_file is None:
        return None

    # Validate
    is_valid, error_msg = _validate_upload(uploaded_file)
    if not is_valid:
        st.markdown(f"""
        <div class="error-message" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error_msg}</span>
        </div>
        """, unsafe_allow_html=True)
        return None

    # Open and preview
    try:
        image = Image.open(uploaded_file)
        st.session_state["uploaded_image"] = image

        b64 = _image_to_base64(image)
        st.markdown(f"""
        <div class="preview-container">
            <img src="data:image/png;base64,{b64}"
                 class="preview-image"
                 alt="已上传的水果图片预览" />
            <p style="text-align:center; color:var(--text-secondary);
               font-size:0.9rem; margin-top:0.5rem;">
                📷 已上传: {uploaded_file.name} ({(uploaded_file.size / 1024):.1f} KB)
            </p>
        </div>
        """, unsafe_allow_html=True)
        return image

    except Exception as e:
        st.markdown(f"""
        <div class="error-message" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>图片处理失败: {e}，请尝试其他图片</span>
        </div>
        """, unsafe_allow_html=True)
        return None


def render_reset_button():
    """Render a reset button that clears session state and re-runs."""
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🔄 重新上传", key="reset_button", use_container_width=True):
            for key in ("uploaded_image", "prediction_done",
                        "prediction_result", "nutrition_info"):
                st.session_state.pop(key, None)
            st.rerun()


# ── Internal helpers ──────────────────────────────────────────────────

def _validate_upload(uploaded_file) -> Tuple[bool, str]:
    MAX_SIZE_MB = 10
    if uploaded_file.size > MAX_SIZE_MB * 1024 * 1024:
        return False, (
            f"文件过大（{uploaded_file.size / 1024 / 1024:.1f}MB），"
            f"请上传小于 {MAX_SIZE_MB}MB 的图片"
        )
    try:
        image = Image.open(uploaded_file)
        image.verify()
        uploaded_file.seek(0)
    except Exception:
        return False, "文件格式有误或图片已损坏，请检查后重新上传"
    return True, ""


def _image_to_base64(image: Image.Image, max_size=(400, 400)) -> str:
    """Convert PIL Image to base64 PNG string for inline preview."""
    preview = image.copy()
    preview.thumbnail(max_size, Image.LANCZOS)
    buf = BytesIO()
    preview.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
