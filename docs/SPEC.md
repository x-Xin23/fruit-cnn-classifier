# 水果识别与营养信息展示系统 — 规格说明书 (SPEC)

## 1. 项目概述

| 项目 | 说明 |
|---|---|
| **项目名称** | 水果识别与营养信息展示系统 |
| **课程** | 《人工智能基础》期末大作业 |
| **方案** | 方案一：深度学习模型训练与界面化应用封装 |
| **方向** | 水果识别 |
| **核心目标** | 训练一个 CNN 深度学习模型，识别 15 种常见水果，并通过 Web 界面展示识别结果及水果营养价值信息 |

## 2. 项目目标

- 基于公开数据集（Fruits 360），训练 CNN 模型实现 ≥85% 的测试准确率
- 开发可交互的 Web 应用：用户上传水果图片 → 模型预测类别 → 展示营养价值
- 产出完整的课程交付物：代码、模型、报告、答辩 PPT

## 3. 技术栈

| 层 | 技术选型 | 版本要求 |
|---|---|---|
| 语言 | Python | >= 3.10 |
| 深度学习框架 | PyTorch + torchvision | >= 2.0 |
| 包管理 | uv | — |
| Web 框架 | Streamlit | >= 1.28 |
| 数据处理 | NumPy, Pandas, Pillow | — |
| 评估指标 | scikit-learn | >= 1.3 |
| 可视化 | matplotlib, seaborn | — |
| 版本控制 | Git | — |

## 4. 功能需求 (Functional Requirements)

### 数据准备
- **FR-01**: 从 Kaggle Fruits 360 数据集下载并筛选 15 种水果类别
- **FR-02**: 按 80:20 比例分层划分训练集和测试集
- **FR-03**: 图像预处理：统一尺寸 128×128、归一化（ImageNet 均值/标准差）
- **FR-04**: 训练集数据增强（随机水平翻转、随机旋转 ±10°）

### 模型训练
- **FR-05**: 构建 4 层 CNN 模型（Conv → BatchNorm → ReLU → MaxPool）
- **FR-06**: 使用 CrossEntropyLoss 损失函数、Adam 优化器
- **FR-07**: 训练 50 个 epoch（早停 patience=10），每 epoch 记录训练/验证的 loss 和 accuracy
- **FR-08**: 支持学习率衰减（ReduceLROnPlateau）和早停（Early Stopping）
- **FR-09**: 自动保存验证集准确率最高的模型 checkpoint

### 模型评估
- **FR-10**: 测试集上计算整体准确率、混淆矩阵
- **FR-11**: 输出每类 Precision、Recall、F1-Score 分类报告
- **FR-12**: 可视化：训练曲线、混淆矩阵热力图、预测样例

### Web 应用
- **FR-13**: 图片上传组件（支持 JPG/PNG 格式）
- **FR-14**: "识别水果"按钮触发模型推理
- **FR-15**: 展示预测结果：水果名称（中文 + 英文）、置信度
- **FR-16**: 展示营养价值信息：热量、维生素 C、膳食纤维、主要功效、食用建议
- **FR-17**: 非法文件上传的错误处理与提示
- **FR-18**: 模型使用 `@st.cache_resource` 缓存加载，避免重复加载

## 5. 非功能性需求 (Non-Functional Requirements)

| 编号 | 要求 | 指标 |
|---|---|---|
| **NFR-01** | CPU 上可完成训练 | 50 epoch ≤ 3 小时（数据量 79,500 张，实际早停可能提前终止） |
| **NFR-02** | Web 推理响应快 | 单张图片 ≤ 3 秒 |
| **NFR-03** | 离线可用 | 无外部 API 依赖 |
| **NFR-04** | 代码注释规范 | 所有公开函数含 docstring |
| **NFR-05** | 代码与文档硬隔离 | `src/` 不含任何文档文件，`docs/` 不含任何代码 |
| **NFR-06** | 可复现 | 固定随机种子，requirements.txt 锁定依赖 |

## 6. 模型规格

### 架构设计

```
Input: RGB 128×128×3
  │
  ├─ Block1: Conv2d(3→32, k=3, p=1) → BatchNorm → ReLU → MaxPool(2)  → 64×64×32
  ├─ Block2: Conv2d(32→64, k=3, p=1) → BatchNorm → ReLU → MaxPool(2)  → 32×32×64
  ├─ Block3: Conv2d(64→128, k=3, p=1) → BatchNorm → ReLU → MaxPool(2) → 16×16×128
  ├─ Block4: Conv2d(128→256, k=3, p=1) → BatchNorm → ReLU → MaxPool(2) → 8×8×256
  │
  ├─ AdaptiveAvgPool2d(1) → Flatten → 256
  ├─ Dropout(0.5)
  ├─ Linear(256 → 128) → ReLU
  └─ Linear(128 → 15)  → Output logits
```

### 超参数

| 参数 | 值 |
|---|---|
| 输入尺寸 | 128×128×3 |
| 输出类别数 | 15 |
| 损失函数 | CrossEntropyLoss |
| 优化器 | Adam (lr=0.001) |
| 学习率衰减 | ReduceLROnPlateau (factor=0.1, patience=5) |
| 早停 | patience=10 |
| Batch Size | 32 |
| Epochs | 50（早停 patience=10，实际可能 25-40 轮收敛） |
| 总参数量 | ~424K |

### 性能目标

| 指标 | 目标值 | 实际结果 |
|---|---|---|---|
| 测试集准确率 | ≥ 85% | **99.90%** |
| 验证集最佳准确率 | ≥ 85% | **99.95%** |
| 每类 F1-Score | ≥ 0.75 | **≥ 0.996** (MARCO avg 0.999) |
| 单张推理耗时 (CPU) | ≤ 0.5s | 待测 |

### Checkpoint 格式

训练过程中自动保存的模型 checkpoint 采用以下 dict 格式，兼容 `webapp/utils.py` 的加载逻辑：

```python
checkpoint = {
    "epoch": int,                    # 当前 epoch 编号
    "model_state_dict": OrderedDict, # model.state_dict()
    "optimizer_state_dict": OrderedDict,  # optimizer.state_dict()
    "val_acc": float,                # 保存时的验证准确率
    "val_loss": float,               # 保存时的验证 loss
}
```

保存路径：`models/fruit_cnn.pth`（相对于项目根目录）。仅保存验证准确率最高的那个 checkpoint，不保留中间 epoch 的模型。

## 7. 数据集规格

### 来源

- **数据集**: [Fruits 360](https://www.kaggle.com/datasets/moltean/fruits) by Horea Muresan
- **特点**: 图片已居中在白底上，100×100 像素，质量高、类别平衡
- **总规模**: ~90,000+ 张 / 131-260 类（本工程选用 15 类子集，纳入所有品种变体后约 79,500 张）

### 选用的 15 种水果

| # | 英文 | 中文 | 预计图片数 |
|---|---|---|---|
| 1 | Apple Red Delicious | 苹果 | ~800 |
| 2 | Banana | 香蕉 | ~800 |
| 3 | Orange | 橙子 | ~600 |
| 4 | Grape (White) | 葡萄 | ~500 |
| 5 | Strawberry | 草莓 | ~700 |
| 6 | Kiwi | 猕猴桃 | ~600 |
| 7 | Watermelon | 西瓜 | ~500 |
| 8 | Peach | 桃子 | ~600 |
| 9 | Pear | 梨 | ~700 |
| 10 | Mango | 芒果 | ~600 |
| 11 | Pineapple | 菠萝 | ~500 |
| 12 | Cherry | 樱桃 | ~700 |
| 13 | Lemon | 柠檬 | ~600 |
| 14 | Blueberry | 蓝莓 | ~500 |
| 15 | Pomegranate | 石榴 | ~500 |

### 数据预处理流程

1. 从原始数据集中筛选 15 个目标类别
2. 按 80:20 分层抽样划分为训练集（~63,600 张）和测试集（~15,900 张）
3. 图像 Resize 至 128×128 像素
4. Tensor 化（C×H×W）
5. 归一化：mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
6. 训练集增强：RandomHorizontalFlip(p=0.5), RandomRotation(degrees=10), ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05)

## 8. Web 应用规格

### 文件结构

```
webapp/
├── app.py                    # 主入口（页面配置、session state、流程编排）
├── utils.py                  # 模型缓存加载、图像预处理、推理、营养数据
├── assets/
│   ├── style.css             # 自定义 CSS（绿色主题、响应式、无障碍）
│   ├── theme.py              # 设计 token + CSS 注入函数
│   └── animations.js         # GSAP 动画定义（MutationObserver）
├── components/
│   ├── __init__.py           # 组件导出
│   ├── upload.py             # 图片上传 + 验证 + 预览
│   ├── result.py             # 识别结果卡片 + 置信度进度条
│   └── nutrition.py          # 营养价值卡片网格 + 功效列表
└── requirements.txt          # Web 精简依赖
```

### 页面布局

```
┌──────────────────────────────────────────┐
│  🍎 水果识别与营养信息展示系统              │
│  Powered by Deep Learning (CNN)           │
├──────────────────────────────────────────┤
│                                           │
│  [上传水果图片]  (拖拽或点击选择)           │
│                                           │
│  [已上传图片预览]                          │
│                                           │
│  [ 🔍 识别水果 ]  按钮                     │
│                                           │
│  ─────── 识别结果 ───────                  │
│  🍎 苹果 (Apple)                          │
│  置信度: ████████████ 95.2%               │
│                                           │
│  ─────── 营养价值 ───────                  │
│  | 项目      | 含量            |          │
│  | 热量      | 52 kcal/100g   |          │
│  | 维生素C   | 4.6 mg/100g    |          │
│  | 膳食纤维  | 2.4 g/100g     |          │
│  | 主要功效  | 促进消化、降胆固醇 |        │
│  ─────────────────────────────           │
│                                           │
│  [重新上传]                               │
└──────────────────────────────────────────┘
```

### 用户流程

1. 用户在浏览器打开 Web 应用
2. 用户上传一张水果图片（JPG/PNG）
3. 用户点击"识别水果"按钮
4. 系统调用 CNN 模型进行推理
5. 系统展示预测结果（水果名称 + 置信度）
6. 系统展示该水果的营养价值信息
7. 用户可上传新图片重复操作

### 交互状态

| 状态 | 界面表现 |
|---|---|
| 初始 | 显示标题和上传组件，无识别结果 |
| 加载中 | 显示 Spinner 加载动画 |
| 成功 | 显示识别结果 + 营养信息（GSAP 动画入场） |
| 错误 | 显示错误提示（如非图片文件） |

### 设计系统

#### 色彩方案（绿色水果主题）

| Token | 色值 | 用途 |
|---|---|---|
| `--primary-dark` | `#1B5E20` | 标题文字、深色强调 |
| `--primary` | `#2E7D32` | 主按钮、边框 |
| `--primary-light` | `#4CAF50` | 悬停态、浅色强调 |
| `--accent` | `#FF6F00` | 交互高亮 |
| `--accent-light` | `#FFB300` | focus 轮廓 |
| `--bg` | `#F1F8E9` | 页面背景 |
| `--card-bg` | `#FFFFFF` | 卡片背景 |
| `--text` | `#1B1B1B` | 正文 |
| `--text-secondary` | `#616161` | 次要文字 |
| `--error` | `#D32F2F` | 错误提示 |
| `--success` | `#388E3C` | 成功勾选 |

#### 排版

- 字体：`'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif`
- 标题：2.2rem / 700 weight
- 副标题：1rem / 400 weight
- 正文：0.95-1.05rem

### 动画规格（GSAP）

GSAP 通过 `st.components.v1.html()` 创建隐藏 iframe，利用 `window.parent.document` 访问主文档 DOM。MutationObserver 监听 Streamlit 重渲染后的新 DOM 节点，自动触发匹配的入场动画。

| 动画 | 触发时机 | 技术 | 时长 | 缓动 |
|---|---|---|---|---|
| Hero 标题入场 | 页面加载 | GSAP `from()` | 0.8s | `power3.out` |
| Hero 副标题入场 | 页面加载 | GSAP `from()` | 0.6s | `power3.out` |
| 上传区入场 | 页面加载 | GSAP `from()` | 0.5s | `power2.out` |
| 上传区悬停 | 用户 hover | CSS `:hover` | 0.3s | ease |
| 结果卡片揭示 | 预测完成 | GSAP `from()` | 0.6s | `power3.out` |
| 置信度条填充 | 预测完成 | GSAP `to()` | 1.2s | `power2.out` |
| 滚动至结果 | 预测完成 | GSAP `scrollTo` | 0.8s | `power2.inOut` |
| 营养卡片入场 | 预测完成 | GSAP `from()` stagger 0.1s | 0.5s | `power2.out` |
| 功效列表入场 | 预测完成 | GSAP `from()` stagger 0.08s | 0.4s | `power2.out` |
| 按钮悬停/按压 | 用户交互 | CSS `:hover`/`:active` | 0.3s | ease |

### 降级策略

| 场景 | 降级行为 |
|---|---|
| GSAP CDN 不可达 | CSS `@keyframes` 动画自动接管 |
| iframe 加载失败 | 纯 Streamlit HTML + CSS 样式，功能完全可用 |
| 用户开启 `prefers-reduced-motion` | 所有动画时长降至 0.01s（GSAP + CSS 双重覆盖） |
| 模型文件未训练 | 捕获 `FileNotFoundError`，展示友好错误提示 |

### 无障碍

- **颜色对比度**: 标题 7.2:1 / 正文 16.7:1（WCAG AA 合规）
- **焦点可见**: `:focus-visible` 橙色 3px 轮廓
- **屏幕阅读器**: `aria-label` 在上传区、进度条、结果卡片；`role="alert"` 在错误消息；`role="progressbar"` 在置信度条
- **减少动画**: `@media (prefers-reduced-motion: reduce)` + GSAP 检测
- **图片 alt**: 所有图片含描述性 `alt` 文本
- **键盘导航**: 完整 Tab 序列支持

## 9. 营养数据规格

### 数据来源

营养数据手工整理自公开营养数据库，以 Python 字典形式存储在 `src/utils/nutrition.py`。

### 数据结构

```python
NUTRITION_INFO = {
    "Apple": {
        "name_zh": "苹果",
        "calories_per_100g": "52 kcal",
        "vitamin_c": "4.6 mg",
        "fiber": "2.4 g",
        "benefits": [
            "促进消化，富含膳食纤维",
            "降低胆固醇，保护心血管健康",
            "增强免疫力"
        ],
        "description": "苹果富含膳食纤维和维生素C，常食有助于消化健康..."
    },
    # ... 其余 14 种水果
}
```

### 覆盖字段

| 字段 | 说明 |
|---|---|
| `name_zh` | 中文名称 |
| `calories_per_100g` | 每 100g 热量 (kcal) |
| `vitamin_c` | 维生素 C 含量 |
| `fiber` | 膳食纤维含量 |
| `benefits` | 主要健康功效列表 |
| `description` | 综合营养描述 |

## 10. 交付物清单

| # | 交付物 | 位置 | 格式 |
|---|---|---|---|
| 1 | 完整源代码 | `src/` + `webapp/` | Python |
| 2 | 训练后模型 | `models/fruit_cnn.pth` | PyTorch |
| 3 | 项目规格说明 | `docs/SPEC.md` | Markdown |
| 4 | 里程碑计划 | `docs/MILESTONES.md` | Markdown |
| 5 | MVP 定义 | `docs/MVP.md` | Markdown |
| 6 | 项目说明 | `README.md` | Markdown |
| 7 | 项目报告 | `docs/report/学号_姓名_大作业报告.docx` | Word |
| 8 | 答辩 PPT | `docs/presentation/学号_姓名_答辩PPT.pptx` | PowerPoint |

## 11. 参考资源

- Fruits 360 Dataset: <https://www.kaggle.com/datasets/moltean/fruits>
- PyTorch 官方教程: <https://pytorch.org/tutorials/>
- Streamlit 文档: <https://docs.streamlit.io/>
- 免费 GPU 平台: Google Colab, Kaggle Notebook, 飞桨 AI Studio

## 12. 模块接口规格

本节定义 `src/` 下每个后端模块的公开接口，作为实现的契约。

### 12.1 `src/utils/config.py` — 配置管理

```python
@dataclass
class Config:
    # 项目路径
    project_root: Path
    data_raw_dir: Path
    data_processed_dir: Path
    models_dir: Path
    figures_dir: Path

    # 数据集
    target_classes: List[str]       # 15 个目标类别 (英文名)
    img_size: Tuple[int, int]       # (128, 128)
    train_split: float              # 0.8
    val_split_from_train: float     # 0.125 (train 中分出 12.5% 做 val)
    random_seed: int                # 42

    # 训练超参数
    batch_size: int                 # 32
    num_epochs: int                 # 50
    num_classes: int                # 15
    learning_rate: float            # 0.001
    weight_decay: float             # 1e-4
    dropout_rate: float             # 0.5

    # 调度器
    scheduler_factor: float          # 0.1
    scheduler_patience: int          # 5

    # 早停
    early_stopping_patience: int     # 10
    early_stopping_delta: float      # 0.0

    # 归一化参数
    normalize_mean: Tuple[float, float, float]
    normalize_std: Tuple[float, float, float]

    # 设备
    device: str                     # "cuda" if available else "cpu"

def set_seed(seed: int) -> None:
    """固定 random, numpy, torch 随机种子，设置 cudnn deterministic。"""

def get_device() -> torch.device:
    """返回 torch.device(config.device)。"""
```

### 12.2 `src/utils/nutrition.py` — 营养数据

```python
# 常量
NUTRITION_INFO: Dict[str, dict]    # 15 种水果的营养信息，key 为英文类名
CLASS_NAMES: List[str]             # 15 个英文类名（字母序）
CLASS_NAMES_ZH: List[str]          # 对应的 15 个中文类名
FRUIT360_TO_STANDARD: Dict[str, str]  # Fruits 360 目录名 → 标准类名映射
INDEX_TO_CLASS: Dict[int, str]     # {索引: 英文名}
CLASS_TO_INDEX: Dict[str, int]     # {英文名: 索引}

# 函数
def get_nutrition_info(class_name: str) -> Optional[dict]:
    """根据英文类名查找营养数据，未找到返回 None。"""
```

> **注意**: `FRUIT360_TO_STANDARD` 映射处理 Kaggle 数据集中的具体文件夹名（如 `"Apple Red Delicious"` → `"Apple"`），是 `make_dataset.py` 筛选类别的关键依赖。

### 12.3 `src/data/make_dataset.py` — 数据集准备

```python
def main(config: Config) -> None:
    """
    完整数据准备流程：
    1. 下载/解压 Fruits 360 数据集到 data/raw/
    2. 根据 FRUIT360_TO_STANDARD 筛选 15 个目标类别
    3. 按 80:20 分层划分 train/test
    4. 将图片复制到 data/processed/train/{class}/ 和 data/processed/test/{class}/
    5. 打印统计摘要
    """
```

### 12.4 `src/data/fruit_dataset.py` — PyTorch Dataset

```python
class FruitDataset(torch.utils.data.Dataset):
    def __init__(self, root_dir: Union[str, Path], transform=None):
        """
        扫描 root_dir 下的类别子目录，构建样本列表。
        类别按目录名字母序排列，与 CLASS_NAMES 顺序一致。
        """
    def __len__(self) -> int: ...
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]: ...

def get_train_transform(img_size=(128, 128)) -> transforms.Compose:
    """训练集变换: Resize → RandomHorizontalFlip → RandomRotation → ToTensor → Normalize"""

def get_test_transform(img_size=(128, 128)) -> transforms.Compose:
    """测试集变换: Resize → ToTensor → Normalize"""

def get_dataloaders(
    data_dir, batch_size=32, img_size=(128,128),
    val_split=0.125, seed=42
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """
    返回 (train_loader, val_loader, test_loader)。
    train 内部按 val_split 比例进一步分出验证集（分层抽样）。
    """
```

### 12.5 `src/models/cnn_model.py` — 模型定义

```python
class FruitCNN(nn.Module):
    def __init__(self, num_classes: int = 15, dropout_rate: float = 0.5):
        """
        4-block CNN，架构详见 §6。
        - 4 个 Conv-BN-ReLU-MaxPool 块
        - AdaptiveAvgPool2d(1) → Flatten
        - Dropout → FC(256→128) → ReLU → FC(128→num_classes)
        """
    def forward(self, x: torch.Tensor) -> torch.Tensor: ...
```

> **约束**: 此类必须可通过 `from src.models.cnn_model import FruitCNN` 导入。构造函数必须接受 `num_classes` 关键字参数。

### 12.6 `src/training/trainer.py` — 训练逻辑

```python
class EarlyStopping:
    """验证 loss 不再下降时提前终止训练。"""
    def __init__(self, patience: int = 10, min_delta: float = 0.0): ...
    def __call__(self, val_loss: float) -> bool: ...
    def reset(self) -> None: ...

def train_epoch(model, loader, criterion, optimizer, device) -> Tuple[float, float]:
    """训练一个 epoch，返回 (avg_loss, accuracy)。"""

def validate(model, loader, criterion, device) -> Tuple[float, float]:
    """验证，返回 (avg_loss, accuracy)。无梯度计算。"""

def train_model(
    model, train_loader, val_loader, criterion, optimizer,
    scheduler, config, num_epochs, checkpoint_dir, log_path
) -> Dict:
    """
    完整训练循环，返回训练历史 dict。
    - 每 epoch 打印: "Epoch N/N | Train Loss: X | Train Acc: Y% | Val Loss: Z | Val Acc: W%"
    - ReduceLROnPlateau 调度，patience=5
    - EarlyStopping，patience=10
    - 验证准确率提升时保存 checkpoint (格式见 §6.2)
    - CSV 日志输出 (epoch, train_loss, train_acc, val_loss, val_acc, lr)
    """
```

### 12.7 `src/training/train.py` — 训练入口

```python
def main() -> None:
    """
    1. 加载 Config，设置随机种子
    2. 创建 DataLoader
    3. 构建 FruitCNN 模型
    4. 配置 Adam 优化器 + CrossEntropyLoss
    5. 运行 train_model()
    6. 输出测试集最终准确率
    """
```

### 12.8 `src/evaluation/evaluate.py` — 模型评估

```python
def load_best_model(model_path, num_classes, device) -> nn.Module:
    """加载 checkpoint，兼容 dict 和裸 state_dict 两种格式。"""

def evaluate_model(model, test_loader, device, class_names) -> Dict:
    """
    返回 {
        "accuracy": float,
        "confusion_matrix": np.ndarray,
        "classification_report": str,
        "predictions": np.ndarray,
        "true_labels": np.ndarray,
    }
    """
```

### 12.9 `src/evaluation/visualize.py` — 可视化

```python
def plot_training_history(csv_path, save_dir) -> None:
    """读取训练日志 CSV，生成 loss + accuracy 双面板曲线图。"""

def plot_confusion_matrix(cm, class_names, save_dir, class_names_zh=None) -> None:
    """混淆矩阵热力图 (seaborn heatmap)，保存至 save_dir。"""

def plot_sample_predictions(model, test_loader, class_names, class_names_zh, device, save_dir, num_samples=10) -> None:
    """2×5 预测样例网格。正确预测绿色边框，错误红色边框。"""

def main() -> None:
    """运行完整可视化流程，输出 3 张图表到 docs/report/figures/。"""
```

## 13. 数据流向

以下描述从原始数据到 Web 推理的完整数据流。

### 流程图

```
Kaggle 数据下载 (data/raw/fruits-360/)
         │
         │  make_dataset.py: 筛选 15 类 + 80/20 分层分割
         ▼
data/processed/
  ├── train/  (15 个类别目录, ~70% 总量)
  └── test/   (15 个类别目录, ~20% 总量)
         │
         │  fruit_dataset.py: FruitDataset + DataLoader
         │  train 内部再分 12.5% → val
         ▼
train_loader (70%)   val_loader (10%)   test_loader (20%)
         │                  │                  │
         │   trainer.py     │                  │
         │   train_epoch()  validate()         │
         │                  │                  │
         ▼                  ▼                  │
  models/fruit_cnn.pth  ← 最佳 checkpoint      │
  models/training_log.csv  ← 训练日志          │
                                               │
         ┌─────────────────────────────────────┘
         ▼
  evaluate.py: evaluate_model()
    → accuracy, confusion_matrix, classification_report
         │
         ▼
  visualize.py:
    → training_history.png
    → confusion_matrix.png
    → sample_predictions.png
         │
         ▼
  docs/report/figures/  (报告用图表)
         │
         ▼
  webapp/app.py: 加载 fruit_cnn.pth → 用户上传图片 → 推理 → 展示结果
```

### 数据划分比例

| 集合 | 比例 | 用途 |
|---|---|---|
| 训练集 (train) | ~70% | 模型参数更新 |
| 验证集 (val) | ~10% | 超参数调度 + 早停 + 选最佳 checkpoint |
| 测试集 (test) | ~20% | 最终模型评估（仅一次） |

划分方式：先 80/20 分层分割 train/test，再从 train 中取 12.5% (= 总量的 10%) 作为 val。所有分割均使用 `sklearn.model_selection.train_test_split(stratify=labels)` 保证类别分布一致。

### 类别顺序约束

`FruitDataset` 使用 `sorted()` 对类别目录名排序，因此 `data/processed/train/` 下的目录名必须与 `CLASS_NAMES` 列表的字母序严格一致：

```
Apple → Banana → Blueberry → Cherry → Grape → Kiwi → Lemon →
Mango → Orange → Peach → Pear → Pineapple → Pomegranate → Strawberry → Watermelon
```

此顺序与 `webapp/utils.py` 中的 `CLASS_NAMES` 完全对应，是实现时需确保的最高优先级约束。

## 14. 配置管理

### 设计原则

- **单一数据源**: 所有超参数和路径从 `Config` dataclass 的单一实例获取
- **可复现**: 通过 `set_seed()` 固定 random / numpy / torch 的随机种子
- **零外部依赖**: 不依赖 YAML/JSON 配置文件或环境变量，纯 Python 定义

### Config 使用方式

```python
from src.utils.config import Config, set_seed

config = Config()                    # 使用默认值
config.num_epochs = 50               # 按需覆盖
config.batch_size = 64
set_seed(config.random_seed)         # 训练前调用
```

### 可复现性策略

| 层面 | 措施 |
|---|---|
| Python random | `random.seed(seed)` |
| NumPy | `np.random.seed(seed)` |
| PyTorch | `torch.manual_seed(seed)`, `torch.cuda.manual_seed_all(seed)` |
| cuDNN | `torch.backends.cudnn.deterministic = True` |
| DataLoader | 每个 worker 使用 `torch.Generator().manual_seed(seed)` |

### 设备选择

- 优先使用 CUDA GPU（若可用）
- 推理（Web 应用）固定使用 CPU（`webapp/utils.py` 已硬编码 `torch.device("cpu")`）
- 训练时 `Config.device` 自动检测，`train.py` 据此将模型和数据移至正确设备
