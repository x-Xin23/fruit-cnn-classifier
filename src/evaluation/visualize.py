"""可视化：训练曲线、混淆矩阵热力图、预测样例。"""

import csv
from pathlib import Path
from typing import List, Optional

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from src.utils.config import Config, get_device
from src.utils.nutrition import CLASS_NAMES, CLASS_NAMES_ZH
from src.evaluation.evaluate import load_best_model, evaluate_model
from src.data.fruit_dataset import get_dataloaders

# 中文字体设置
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False


def plot_training_history(
    csv_path: Path,
    save_dir: Path,
) -> None:
    """读取训练日志，生成 loss + accuracy 双面板曲线图。"""
    save_dir.mkdir(parents=True, exist_ok=True)

    epochs = []
    train_loss, train_acc = [], []
    val_loss, val_acc = [], []

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            epochs.append(int(row["epoch"]))
            train_loss.append(float(row["train_loss"]))
            train_acc.append(float(row["train_acc"]))
            val_loss.append(float(row["val_loss"]))
            val_acc.append(float(row["val_acc"]))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Loss
    ax1.plot(epochs, train_loss, "b-", label="Train Loss", linewidth=1.5)
    ax1.plot(epochs, val_loss, "r-", label="Val Loss", linewidth=1.5)
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Loss")
    ax1.set_title("Training and Validation Loss")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Accuracy
    ax2.plot(epochs, train_acc, "b-", label="Train Acc", linewidth=1.5)
    ax2.plot(epochs, val_acc, "r-", label="Val Acc", linewidth=1.5)
    # 标记最佳 epoch
    best_idx = np.argmax(val_acc)
    ax2.axvline(x=epochs[best_idx], color="green", linestyle="--", alpha=0.5,
                label=f"Best (epoch {epochs[best_idx]})")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy (%)")
    ax2.set_title("Training and Validation Accuracy")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    output = save_dir / "training_history.png"
    fig.savefig(output, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"训练曲线已保存: {output}")


def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: List[str],
    save_dir: Path,
    class_names_zh: Optional[List[str]] = None,
) -> None:
    """混淆矩阵热力图。"""
    save_dir.mkdir(parents=True, exist_ok=True)

    # 归一化（按行）
    cm_norm = cm.astype("float") / cm.sum(axis=1, keepdims=True)
    cm_norm = np.nan_to_num(cm_norm)

    # 标签：中文 + 英文
    if class_names_zh:
        labels = [f"{zh}\n({en})" for zh, en in zip(class_names_zh, class_names)]
    else:
        labels = class_names

    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(
        cm_norm,
        annot=cm,
        fmt="d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
        ax=ax,
        vmin=0,
        vmax=1,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Confusion Matrix")
    plt.xticks(rotation=45, ha="right", fontsize=8)
    plt.yticks(rotation=0, fontsize=8)

    plt.tight_layout()
    output = save_dir / "confusion_matrix.png"
    fig.savefig(output, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"混淆矩阵已保存: {output}")


def denormalize(
    tensor: torch.Tensor,
    mean: tuple = (0.485, 0.456, 0.406),
    std: tuple = (0.229, 0.224, 0.225),
) -> torch.Tensor:
    """将 ImageNet 归一化后的张量反归一化，用于显示。"""
    mean_t = torch.tensor(mean).view(3, 1, 1)
    std_t = torch.tensor(std).view(3, 1, 1)
    return torch.clamp(tensor.cpu() * std_t + mean_t, 0, 1)


def plot_sample_predictions(
    model: nn.Module,
    test_loader: DataLoader,
    class_names: List[str],
    class_names_zh: List[str],
    device: torch.device,
    save_dir: Path,
    num_samples: int = 10,
) -> None:
    """预测样例网格图。正确预测绿色边框，错误红色边框。"""
    save_dir.mkdir(parents=True, exist_ok=True)

    model.eval()
    images_list = []
    true_labels = []
    pred_labels = []
    confidences = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            confs, preds = torch.max(probs, dim=1)

            images_list.extend([img.cpu() for img in images])
            true_labels.extend(labels.numpy())
            pred_labels.extend(preds.cpu().numpy())
            confidences.extend(confs.cpu().numpy())

            if len(images_list) >= num_samples:
                break

    n_cols = 5
    n_rows = (num_samples + n_cols - 1) // n_cols
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, 3 * n_rows))
    axes = axes.flatten()

    for i in range(num_samples):
        ax = axes[i]
        img = denormalize(images_list[i])
        img_np = img.permute(1, 2, 0).numpy()

        true_idx = true_labels[i]
        pred_idx = pred_labels[i]
        correct = true_idx == pred_idx

        ax.imshow(img_np)
        true_name = class_names_zh[true_idx]
        pred_name = class_names_zh[pred_idx]
        ax.set_title(
            f"真实: {true_name}\n预测: {pred_name} ({confidences[i]*100:.1f}%)",
            fontsize=9,
        )

        # 边框颜色
        color = "#2E7D32" if correct else "#D32F2F"
        for spine in ax.spines.values():
            spine.set_edgewidth(3)
            spine.set_color(color)

        ax.set_xticks([])
        ax.set_yticks([])

    # 隐藏多余子图
    for i in range(num_samples, len(axes)):
        axes[i].set_visible(False)

    plt.tight_layout()
    output = save_dir / "sample_predictions.png"
    fig.savefig(output, dpi=150, bbox_inches="tight")
    plt.close(fig)
    print(f"预测样例已保存: {output}")


def main() -> None:
    """完整可视化流程。"""
    config = Config()
    device = get_device()

    # 1. 训练曲线
    log_path = config.models_dir / "training_log.csv"
    if log_path.exists():
        plot_training_history(log_path, config.figures_dir)
    else:
        print(f"训练日志不存在，跳过训练曲线: {log_path}")

    # 2. 加载模型
    model_path = config.models_dir / "fruit_cnn.pth"
    if not model_path.exists():
        print(f"模型文件不存在: {model_path}，跳过后续图表。")
        return
    model = load_best_model(model_path, num_classes=config.num_classes, device=device)

    # 3. 测试集评估
    _, _, test_loader = get_dataloaders(
        data_dir=config.data_processed_dir,
        batch_size=config.batch_size,
        img_size=config.img_size,
    )

    results = evaluate_model(model, test_loader, device, CLASS_NAMES)

    # 4. 混淆矩阵
    plot_confusion_matrix(
        results["confusion_matrix"], CLASS_NAMES,
        config.figures_dir, CLASS_NAMES_ZH,
    )

    # 5. 预测样例
    plot_sample_predictions(
        model, test_loader, CLASS_NAMES, CLASS_NAMES_ZH,
        device, config.figures_dir, num_samples=10,
    )

    print(f"\n所有图表已保存至: {config.figures_dir}")


if __name__ == "__main__":
    main()
