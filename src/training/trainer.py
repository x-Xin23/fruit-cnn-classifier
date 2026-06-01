"""训练循环、checkpoint、早停、日志。"""

import csv
import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from src.utils.config import Config


class EarlyStopping:
    """验证 loss 不再下降时提前终止训练。"""

    def __init__(self, patience: int = 10, min_delta: float = 0.0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = float("inf")
        self.early_stop = False

    def __call__(self, val_loss: float) -> bool:
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True
        return self.early_stop

    def reset(self) -> None:
        self.counter = 0
        self.best_loss = float("inf")
        self.early_stop = False


def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
) -> Tuple[float, float]:
    """训练一个 epoch，返回 (avg_loss, accuracy%)。"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    avg_loss = running_loss / total
    accuracy = 100.0 * correct / total
    return avg_loss, accuracy


@torch.no_grad()
def validate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, float]:
    """验证，返回 (avg_loss, accuracy%)。"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    avg_loss = running_loss / total
    accuracy = 100.0 * correct / total
    return avg_loss, accuracy


def train_model(
    model: nn.Module,
    train_loader: DataLoader,
    val_loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    scheduler: optim.lr_scheduler.ReduceLROnPlateau,
    config: Config,
    num_epochs: int = 30,
    checkpoint_dir: Union[str, Path] = ".",
    log_path: Union[str, Path] = "training_log.csv",
) -> Dict[str, List[float]]:
    """完整训练循环。

    每 epoch:
    1. 训练一个 epoch
    2. 验证
    3. 调度器 step
    4. 早停检查
    5. 保存最佳 checkpoint
    6. 写入 CSV 日志

    返回训练历史 dict。
    """
    checkpoint_dir = Path(checkpoint_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    log_path = Path(log_path)

    device = next(model.parameters()).device
    early_stopping = EarlyStopping(
        patience=config.early_stopping_patience,
        min_delta=config.early_stopping_delta,
    )

    history: Dict[str, List[float]] = {
        "train_loss": [], "train_acc": [],
        "val_loss": [], "val_acc": [],
        "lr": [],
    }
    best_val_acc = 0.0
    best_epoch = 0

    # CSV 日志头
    with open(log_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["epoch", "train_loss", "train_acc", "val_loss", "val_acc", "lr"])

    for epoch in range(1, num_epochs + 1):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)

        current_lr = optimizer.param_groups[0]["lr"]

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)
        history["lr"].append(current_lr)

        # 打印进度
        print(
            f"Epoch {epoch:2d}/{num_epochs} | "
            f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | "
            f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}% | "
            f"LR: {current_lr:.2e}"
        )

        # 检测 NaN
        if math.isnan(train_loss) or math.isnan(val_loss):
            print("⚠️ 检测到 NaN loss，提前终止训练。")
            break

        # 调度器
        scheduler.step(val_loss)

        # 保存最佳模型
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            checkpoint_path = checkpoint_dir / "fruit_cnn.pth"
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "val_loss": val_loss,
            }, checkpoint_path)

        # 早停
        if early_stopping(val_loss):
            print(f"Early stopping triggered at epoch {epoch}")
            break

        # CSV 日志
        with open(log_path, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([epoch, train_loss, train_acc, val_loss, val_acc, current_lr])

    history["best_epoch"] = best_epoch
    history["best_val_acc"] = best_val_acc
    print(f"\n最佳验证准确率: {best_val_acc:.2f}% (epoch {best_epoch})")
    return history
