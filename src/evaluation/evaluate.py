"""模型评估：准确率、混淆矩阵、分类报告。"""

from pathlib import Path
from typing import Dict, List, Optional, Union

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)

from src.models.cnn_model import FruitCNN
from src.data.fruit_dataset import get_dataloaders, get_test_transform
from src.utils.config import Config, get_device
from src.utils.nutrition import CLASS_NAMES, CLASS_NAMES_ZH


def load_best_model(
    model_path: Union[str, Path],
    num_classes: int = 15,
    device: Optional[torch.device] = None,
    dropout_rate: float = 0.5,
) -> nn.Module:
    """加载最佳 checkpoint，兼容 dict 和裸 state_dict 格式。"""
    if device is None:
        device = get_device()

    model_path = Path(model_path)
    if not model_path.exists():
        raise FileNotFoundError(
            f"模型文件不存在: {model_path}\n"
            f"请先训练模型: python -m src.training.train"
        )

    model = FruitCNN(num_classes=num_classes, dropout_rate=dropout_rate)
    checkpoint = torch.load(model_path, map_location=device, weights_only=True)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
        print(f"加载 checkpoint (epoch {checkpoint.get('epoch', '?')}, "
              f"val_acc={checkpoint.get('val_acc', 0):.2f}%)")
    else:
        model.load_state_dict(checkpoint)
        print("加载裸 state_dict")

    model.to(device)
    model.eval()
    return model


@torch.no_grad()
def evaluate_model(
    model: nn.Module,
    test_loader: DataLoader,
    device: torch.device,
    class_names: List[str],
) -> Dict:
    """在测试集上评估模型，返回所有指标。"""
    model.eval()
    all_preds = []
    all_labels = []

    for images, labels in test_loader:
        images = images.to(device)
        outputs = model(images)
        _, preds = torch.max(outputs, 1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.numpy())

    accuracy = accuracy_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)
    report = classification_report(
        all_labels, all_preds,
        target_names=class_names,
        digits=3,
        zero_division=0,
    )

    return {
        "accuracy": accuracy,
        "confusion_matrix": cm,
        "classification_report": report,
        "predictions": np.array(all_preds),
        "true_labels": np.array(all_labels),
    }


def print_results(results: Dict, class_names: List[str]) -> None:
    """格式化打印评估结果。"""
    print(f"\n{'='*60}")
    print(f"  测试集准确率: {results['accuracy']*100:.2f}%")
    print(f"{'='*60}")
    print("\n分类报告:")
    print(results["classification_report"])


def main() -> None:
    """完整评估流程。"""
    config = Config()
    device = get_device()

    # 加载模型
    model_path = config.models_dir / "fruit_cnn.pth"
    model = load_best_model(model_path, num_classes=config.num_classes, device=device)

    # 加载数据
    _, _, test_loader = get_dataloaders(
        data_dir=config.data_processed_dir,
        batch_size=config.batch_size,
        img_size=config.img_size,
    )

    # 评估
    results = evaluate_model(model, test_loader, device, CLASS_NAMES)
    print_results(results, CLASS_NAMES)


if __name__ == "__main__":
    main()
