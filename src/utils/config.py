"""集中配置管理：路径、超参数、随机种子。"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple
import random
import numpy as np
import torch


@dataclass
class Config:
    # ── 项目路径 ──
    project_root: Path = Path(__file__).resolve().parent.parent.parent
    data_raw_dir: Path = field(default=None)
    data_processed_dir: Path = field(default=None)
    models_dir: Path = field(default=None)
    figures_dir: Path = field(default=None)

    def __post_init__(self):
        if self.data_raw_dir is None:
            self.data_raw_dir = self.project_root / "data" / "raw"
        if self.data_processed_dir is None:
            self.data_processed_dir = self.project_root / "data" / "processed"
        if self.models_dir is None:
            self.models_dir = self.project_root / "models"
        if self.figures_dir is None:
            self.figures_dir = self.project_root / "docs" / "report" / "figures"

    # ── 数据集 ──
    target_classes: List[str] = field(default_factory=lambda: [
        "Apple", "Banana", "Blueberry", "Cherry", "Grape",
        "Kiwi", "Lemon", "Mango", "Orange", "Peach",
        "Pear", "Pineapple", "Pomegranate", "Strawberry", "Watermelon",
    ])
    img_size: Tuple[int, int] = (128, 128)
    train_split: float = 0.8
    val_split_from_train: float = 0.125
    random_seed: int = 42

    # ── 训练超参数 ──
    batch_size: int = 32
    num_epochs: int = 50
    num_classes: int = 15
    learning_rate: float = 0.001
    weight_decay: float = 1e-4
    dropout_rate: float = 0.5

    # ── 调度器 ──
    scheduler_factor: float = 0.1
    scheduler_patience: int = 5

    # ── 早停 ──
    early_stopping_patience: int = 10
    early_stopping_delta: float = 0.0

    # ── ImageNet 归一化参数 ──
    normalize_mean: Tuple[float, float, float] = (0.485, 0.456, 0.406)
    normalize_std: Tuple[float, float, float] = (0.229, 0.224, 0.225)

    # ── 设备 ──
    device: str = "cuda" if torch.cuda.is_available() else "cpu"


def set_seed(seed: int = 42) -> None:
    """固定 random, numpy, torch 的随机种子，确保可复现。"""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def get_device() -> torch.device:
    """返回可用的计算设备（优先 CUDA）。"""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")
