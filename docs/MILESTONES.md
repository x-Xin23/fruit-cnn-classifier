# 里程碑计划 (Milestones)

## 总览

| 阶段 | 名称 | 预估工时 | 核心交付 |
|---|---|---|---|
| M1 | 环境搭建与数据准备 | 1-2 天 | 项目骨架、数据集就绪 |
| M2 | 模型开发与训练 | 2-3 天 | CNN 模型训练完成 |
| M3 | 模型评估与可视化 | 1-2 天 | 评估报告、可视化图表 |
| M4 | Web 应用开发 | 2-3 天 | 可交互 Streamlit 应用 |
| M5 | 集成测试与文档 | 2-3 天 | 完整交付物 |

**总计预估**: 8-13 天

---

## M1: 环境搭建与数据准备

**目标**: 项目骨架搭建完成，数据集下载并预处理就绪。

### 任务清单

- [ ] 初始化 Git 仓库，创建 `.gitignore`
- [ ] 创建完整项目目录结构（`src/`, `docs/`, `webapp/`, `data/`, `models/`, `notebooks/`）
- [ ] 使用 `uv` 初始化 Python 虚拟环境
- [ ] 安装依赖：`torch`, `torchvision`, `numpy`, `matplotlib`, `seaborn`, `scikit-learn`, `pillow`, `streamlit`, `pandas`
- [ ] 生成 `requirements.txt`
- [ ] 编写 `pyproject.toml`
- [ ] 下载 Fruits 360 数据集至 `data/raw/`
- [ ] 筛选 15 个目标水果类别
- [ ] 实现 `src/data/make_dataset.py`：划分训练/测试集（80:20 分层抽样）
- [ ] 实现 `src/data/fruit_dataset.py`：PyTorch Dataset 类（含数据增强）
- [ ] 编写 `src/utils/config.py`：集中管理路径和超参数
- [ ] 编写 `src/utils/nutrition.py`：15 种水果的营养数据

### 交付物

1. Git 仓库，初始 commit 完成
2. `data/processed/train/` 和 `data/processed/test/` 下的组织化数据
3. `pyproject.toml` 和 `requirements.txt`
4. 营养数据字典

### 验证方式

```bash
cd src
python -c "from data.fruit_dataset import FruitDataset; \
           ds = FruitDataset('../data/processed/train'); \
           print(f'训练集: {len(ds)} 张图片')"
# 预期输出: 训练集: ~7600 张图片
```

---

## M2: 模型开发与训练

**目标**: CNN 模型定义完成，30 轮训练收敛，达到预期准确率。

### 任务清单

- [ ] 实现 `src/models/cnn_model.py`：4 层 CNN 架构
  - Conv Block 1: Conv2d(3→32, 3) → BN → ReLU → MaxPool(2)
  - Conv Block 2: Conv2d(32→64, 3) → BN → ReLU → MaxPool(2)
  - Conv Block 3: Conv2d(64→128, 3) → BN → ReLU → MaxPool(2)
  - Conv Block 4: Conv2d(128→256, 3) → BN → ReLU → MaxPool(2)
  - AdaptiveAvgPool2d(1) → Flatten → Dropout(0.5) → FC(256→128) → FC(128→15)
- [ ] 实现 `src/training/trainer.py`：训练循环
  - 每 epoch 记录 train/val loss 和 accuracy
  - Model checkpoint：验证准确率提升时保存
  - ReduceLROnPlateau 学习率衰减
  - Early Stopping（patience=10）
  - CSV 日志输出到 `models/training_log.csv`
- [ ] 实现 `src/training/train.py`：训练入口脚本
- [ ] 运行训练 30 个 epoch
- [ ] 保存最佳模型为 `models/fruit_cnn.pth`

### 交付物

1. 训练好的模型文件 `models/fruit_cnn.pth`（~5MB）
2. 训练日志 CSV
3. 终端输出：每 epoch 的 loss 和 accuracy

### 验证方式

```bash
cd src
python training/train.py
# 预期最后几轮输出:
# Epoch 28/30 | Train Loss: 0.152 | Train Acc: 94.2% | Val Loss: 0.218 | Val Acc: 92.1%
# Epoch 29/30 | Train Loss: 0.145 | Train Acc: 94.5% | Val Loss: 0.215 | Val Acc: 92.3%
# Epoch 30/30 | Train Loss: 0.138 | Train Acc: 94.8% | Val Loss: 0.212 | Val Acc: 92.5%
```

---

## M3: 模型评估与可视化

**目标**: 系统性评估模型性能，生成报告中需要的所有图表。

### 任务清单

- [ ] 实现 `src/evaluation/evaluate.py`：
  - 加载最佳模型权重
  - 在测试集上计算整体准确率
  - 生成混淆矩阵
  - 生成分类报告（每类 Precision / Recall / F1）
  - 输出 10 个预测样例（图片 + 真实标签 + 预测标签）
- [ ] 实现 `src/evaluation/visualize.py`：
  - 训练/验证 loss 曲线图
  - 训练/验证 accuracy 曲线图
  - 混淆矩阵热力图
  - 预测样例网格图
- [ ] 将所有图表保存至 `docs/report/figures/`
- [ ] 记录评估结果，为报告准备素材

### 交付物

1. 测试集准确率（控制台输出）
2. 混淆矩阵 PNG
3. 训练曲线 PNG（loss + accuracy）
4. 预测样例 PNG
5. 分类报告（控制台输出）

### 验证方式

```bash
cd src
python evaluation/evaluate.py
# 预期输出:
# Test Accuracy: 92.3%
# Confusion matrix saved to: docs/report/figures/confusion_matrix.png
# Per-class F1 scores all >= 0.75
```

---

## M4: Web 应用开发

**目标**: 开发完整的 Streamlit Web 应用，实现图片上传 → 预测 → 营养展示。

### 任务清单

- [ ] 实现 `webapp/app.py`：
  - `st.set_page_config` 页面配置
  - `st.file_uploader` 图片上传组件
  - `st.button("识别水果")` 预测触发
  - 加载模型并推理
  - 展示：上传图片、预测结果（名称 + 置信度进度条）
  - 展示：营养价值信息表格
  - 错误处理：非法文件类型提示
  - Spinner 加载状态
- [ ] 实现 `webapp/utils.py`：
  - `@st.cache_resource` 模型加载
  - 图片预处理函数
  - 预测函数封装
- [ ] 添加 CSS 样式美化（`webapp/assets/style.css`）
- [ ] 端到端测试：上传图片 → 预测 → 营养展示
- [ ] 编写 `webapp/requirements.txt`（精简版，仅部署所需）

### 交付物

1. 可运行的 Streamlit Web 应用
2. 完成的推理流程（上传 → 预测 → 展示）
3. 错误处理和加载状态

### 验证方式

```bash
cd webapp
streamlit run app.py
# 浏览器打开 http://localhost:8501
# 上传水果图片 → 点击"识别水果" → 查看预测结果和营养信息
```

---

## M5: 集成测试与文档

**目标**: 端到端验证完整流程，撰写最终报告和答辩材料。

### 任务清单

- [ ] 端到端流程测试：数据加载 → 训练 → 评估 → Web 推理
- [ ] 多种水果图片测试（含非训练集图片，验证鲁棒性）
- [ ] 完善 `README.md`：项目介绍、环境配置、运行指南、目录说明
- [ ] 定稿 `docs/SPEC.md`
- [ ] 定稿 `docs/MILESTONES.md`
- [ ] 定稿 `docs/MVP.md`
- [ ] 撰写项目报告（`.docx`）：
  - 封面：题目、学号、姓名、日期
  - 第一章：项目背景与任务简介
  - 第二章：数据集介绍
  - 第三章：方法与模型介绍
  - 第四章：实验过程
  - 第五章：实验结果与分析
  - 第六章：总结与反思
  - 参考资料
- [ ] 制作答辩 PPT（`.pptx`）：8-10 页
  - 项目目标、数据集、模型架构、训练过程、实验结果、Web 演示截图、总结
- [ ] 最终 Git commit，确保仓库整洁

### 交付物

1. 完整的 `README.md`
2. 项目报告 `.docx`
3. 答辩 PPT `.pptx`
4. 所有评估图表
5. 干净的 Git 提交历史

### 验证方式

- 报告包含所有必需章节和图表
- PPT 可独立展示项目全貌
- 另一台机器可按 README 步骤复现整个项目

---

## 风险管理

| 风险 | 应对措施 |
|---|---|
| 数据集下载失败 | 备用 Kaggle 镜像或 Google Drive 链接 |
| CPU 训练太慢 | 减少至 15 epoch，减半通道数，或使用 Colab 免费 GPU |
| 模型准确率 < 80% | 增加数据增强、增大模型容量、或减少类别至 10 种 |
| Streamlit 依赖冲突 | `requirements.txt` 锁定版本 |
| 时间不足 | 优先保证 M1→M2→M4（核心训练 + Web 应用），M3 和 M5 可压缩 |
