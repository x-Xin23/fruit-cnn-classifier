"""PyTorch Dataset 与 DataLoader 工厂函数。"""

from pathlib import Path
from typing import Callable, List, Optional, Tuple, Union

import torch
from torch.utils.data import DataLoader, Dataset, Subset
from PIL import Image
import torchvision.transforms as transforms
from sklearn.model_selection import train_test_split

from src.utils.config import Config


class FruitDataset(Dataset):
    """从类别子目录加载水果图片的 PyTorch Dataset。

    类别按目录名字母序排列，与 CLASS_NAMES 列表顺序一致。
    """

    def __init__(
        self,
        root_dir: Union[str, Path],
        transform: Optional[Callable] = None,
    ):
        root = Path(root_dir)
        if not root.exists():
            raise FileNotFoundError(f"数据集目录不存在: {root}")

        self.classes = sorted(
            [d.name for d in root.iterdir() if d.is_dir()]
        )
        self.class_to_idx = {cls: i for i, cls in enumerate(self.classes)}
        self.samples: List[Tuple[str, int]] = []
        self.transform = transform

        for cls in self.classes:
            cls_dir = root / cls
            for img_path in sorted(cls_dir.iterdir()):
                if img_path.suffix.lower() in (".jpg", ".jpeg", ".png"):
                    self.samples.append((str(img_path), self.class_to_idx[cls]))

        if len(self.samples) == 0:
            raise RuntimeError(f"未在 {root} 中找到任何图片")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]
        image = Image.open(path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


def get_train_transform(
    img_size: Tuple[int, int] = (128, 128),
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406),
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225),
) -> transforms.Compose:
    """训练集数据增强 + 归一化。"""
    return transforms.Compose([
        transforms.Resize(img_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])


def get_test_transform(
    img_size: Tuple[int, int] = (128, 128),
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406),
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225),
) -> transforms.Compose:
    """测试/验证集：仅 Resize + 归一化，不做数据增强。"""
    return transforms.Compose([
        transforms.Resize(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])


def get_dataloaders(
    data_dir: Union[str, Path],
    batch_size: int = 32,
    img_size: Tuple[int, int] = (128, 128),
    val_split: float = 0.125,
    seed: int = 42,
    num_workers: int = 0,
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """创建 train / val / test 三个 DataLoader。

    期望 data_dir 下有 train/ 和 test/ 子目录（由 make_dataset.py 生成）。
    train 内部进一步按 val_split 比例分出验证集（分层抽样）。
    """
    data_dir = Path(data_dir)

    train_root = data_dir / "train"
    test_root = data_dir / "test"

    if not train_root.exists():
        raise FileNotFoundError(
            f"训练集目录不存在: {train_root}\n"
            f"请先运行: python -m src.data.make_dataset"
        )

    # 训练集（含数据增强）
    train_ds = FruitDataset(train_root, transform=get_train_transform(img_size))

    # 从 train 中分出 val（分层抽样）
    all_labels = [label for _, label in train_ds.samples]
    train_indices, val_indices = train_test_split(
        range(len(train_ds)),
        test_size=val_split,
        stratify=all_labels,
        random_state=seed,
    )

    train_subset = Subset(train_ds, train_indices)
    val_ds = FruitDataset(train_root, transform=get_test_transform(img_size))
    val_subset = Subset(val_ds, val_indices)

    # 测试集（无数据增强）
    test_ds = FruitDataset(test_root, transform=get_test_transform(img_size)) if test_root.exists() else None

    train_loader = DataLoader(
        train_subset, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, pin_memory=False,
    )
    val_loader = DataLoader(
        val_subset, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=False,
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=False,
    ) if test_ds else None

    return train_loader, val_loader, test_loader
