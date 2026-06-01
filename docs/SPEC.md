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
- **FR-07**: 训练 30 个 epoch，每 epoch 记录训练/验证的 loss 和 accuracy
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
| **NFR-01** | CPU 上可完成训练 | 30 epoch ≤ 2 小时 |
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
| Epochs | 30 |
| 总参数量 | ~424K |

### 性能目标

| 指标 | 目标值 |
|---|---|
| 测试集准确率 | ≥ 85% |
| 每类 F1-Score | ≥ 0.75 |
| 单张推理耗时 (CPU) | ≤ 0.5s |

## 7. 数据集规格

### 来源

- **数据集**: [Fruits 360](https://www.kaggle.com/datasets/moltean/fruits) by Horea Muresan
- **特点**: 图片已居中在白底上，100×100 像素，质量高、类别平衡
- **总规模**: ~90,000 张 / 131 类（本工程选用 15 类子集，约 9,500 张）

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
2. 按 80:20 分层抽样划分为训练集（~7,600 张）和测试集（~1,900 张）
3. 图像 Resize 至 128×128 像素
4. Tensor 化（C×H×W）
5. 归一化：mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
6. 训练集增强：RandomHorizontalFlip(p=0.5), RandomRotation(degrees=10)

## 8. Web 应用规格

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
| 成功 | 显示识别结果 + 营养信息 |
| 错误 | 显示错误提示（如非图片文件） |

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
