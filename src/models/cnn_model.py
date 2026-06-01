"""FruitCNN: 4-block CNN for 15-class fruit classification.

Architecture exactly matches SPEC.md §6:
  Input: RGB 128x128x3
    Block1: Conv2d(3→32, k=3) → BN → ReLU → MaxPool(2) → 64x64x32
    Block2: Conv2d(32→64, k=3) → BN → ReLU → MaxPool(2) → 32x32x64
    Block3: Conv2d(64→128, k=3) → BN → ReLU → MaxPool(2) → 16x16x128
    Block4: Conv2d(128→256, k=3) → BN → ReLU → MaxPool(2) → 8x8x256
    AdaptiveAvgPool2d(1) → Flatten → Dropout → FC(256→128) → ReLU → FC(128→15)
"""

import torch
import torch.nn as nn


class FruitCNN(nn.Module):
    """4-block CNN for fruit recognition. ~424K parameters."""

    def __init__(self, num_classes: int = 15, dropout_rate: float = 0.5):
        super().__init__()

        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.block4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )

        self.pool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(dropout_rate)
        self.fc1 = nn.Linear(256, 128)
        self.fc2 = nn.Linear(128, num_classes)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        x = self.pool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x
