"""训练入口脚本。

Usage: python -m src.training.train

完整训练流程：
1. 加载配置，设置随机种子
2. 创建 DataLoader（train / val / test）
3. 构建 FruitCNN 模型
4. 训练、验证、保存最佳 checkpoint
5. 输出测试集最终准确率
"""

import torch
import torch.nn as nn
import torch.optim as optim

from src.utils.config import Config, set_seed, get_device
from src.data.fruit_dataset import get_dataloaders
from src.models.cnn_model import FruitCNN
from src.training.trainer import train_model, validate


def main() -> None:
    config = Config()
    set_seed(config.random_seed)
    device = get_device()

    print(f"设备: {device}")
    print(f"类别数: {config.num_classes}")
    print(f"批次大小: {config.batch_size} | Epochs: {config.num_epochs}")
    print(f"学习率: {config.learning_rate} | Dropout: {config.dropout_rate}")
    print("-" * 50)

    # 1. 数据加载
    train_loader, val_loader, test_loader = get_dataloaders(
        data_dir=config.data_processed_dir,
        batch_size=config.batch_size,
        img_size=config.img_size,
        val_split=config.val_split_from_train,
        seed=config.random_seed,
    )
    print(f"DataLoader: train={len(train_loader)} batches, "
          f"val={len(val_loader)} batches, "
          f"test={len(test_loader)} batches")

    # 2. 模型
    model = FruitCNN(
        num_classes=config.num_classes,
        dropout_rate=config.dropout_rate,
    ).to(device)
    print(f"模型参数量: {sum(p.numel() for p in model.parameters()):,}")

    # 3. 损失函数、优化器、调度器
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        model.parameters(),
        lr=config.learning_rate,
        weight_decay=config.weight_decay,
    )
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=config.scheduler_factor,
        patience=config.scheduler_patience,
        verbose=True,
    )

    # 4. 训练
    print("\n开始训练...")
    print("-" * 50)
    history = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        optimizer=optimizer,
        scheduler=scheduler,
        config=config,
        num_epochs=config.num_epochs,
        checkpoint_dir=config.models_dir,
        log_path=config.models_dir / "training_log.csv",
    )

    # 5. 测试集最终评估
    print("\n" + "=" * 50)
    test_loss, test_acc = validate(model, test_loader, criterion, device)
    print(f"测试集准确率: {test_acc:.2f}%")
    print(f"最佳验证准确率: {history['best_val_acc']:.2f}% (epoch {history['best_epoch']})")
    print(f"模型已保存至: {config.models_dir / 'fruit_cnn.pth'}")
    print(f"训练日志已保存至: {config.models_dir / 'training_log.csv'}")
    print("=" * 50)


if __name__ == "__main__":
    main()
