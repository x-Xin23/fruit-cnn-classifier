# 里程碑计划 (Milestones)

## 总览

| 阶段 | 名称 | 预估工时 | 核心交付 | 状态 |
|---|---|---|---|---|
| M1 | 环境搭建与数据准备 | 1-2 天 | 项目骨架、数据集就绪 | ✅ 已完成 |
| M2 | 模型开发与训练 | 2-3 天 | CNN 模型训练完成 | ✅ 已完成 |
| M3 | 模型评估与可视化 | 1-2 天 | 评估报告、可视化图表 | ✅ 已完成 |
| M4 | Web 应用开发 | 2-3 天 | React SPA + MiMo API 识别 | ✅ 已完成 |
| M5 | 集成测试与文档 | 2-3 天 | 完整交付物 | 🟡 进行中 |

**总计预估**: 8-13 天

---

## M1: 环境搭建与数据准备

**目标**: 项目骨架搭建完成，数据集下载并预处理就绪。

### 任务清单

- [x] 初始化 Git 仓库，创建 `.gitignore`
- [x] 创建完整项目目录结构（`src/`, `docs/`, `webapp/`, `data/`, `models/`, `notebooks/`）
- [x] 使用 `uv` 初始化 Python 虚拟环境
- [x] 安装依赖：`torch`, `torchvision`, `numpy`, `matplotlib`, `seaborn`, `scikit-learn`, `pillow`, `streamlit`, `pandas`
- [x] 生成 `requirements.txt`
- [x] 编写 `pyproject.toml`
- [x] 下载 Fruits 360 数据集至 `data/raw/`
- [x] 筛选 15 个目标水果类别（代码已就绪，待数据集下载后运行）
- [x] 实现 `src/data/make_dataset.py`：划分训练/测试集（80:20 分层抽样）
- [x] 实现 `src/data/fruit_dataset.py`：PyTorch Dataset 类（含数据增强）
- [x] 编写 `src/utils/config.py`：集中管理路径和超参数
- [x] 编写 `src/utils/nutrition.py`：15 种水果的营养数据

### 交付物

1. ~~Git 仓库，初始 commit 完成~~ ✅
2. ~~`data/processed/train/` 和 `data/processed/test/` 下的组织化数据（⚠️ 待数据集下载）~~ ✅
3. ~~`pyproject.toml` 和 `requirements.txt`~~ ✅
4. ~~营养数据字典~~ ✅

### 验证方式

```bash
cd src
python -c "from data.fruit_dataset import FruitDataset; \
           ds = FruitDataset('../data/processed/train'); \
           print(f'训练集: {len(ds)} 张图片')"
# 预期输出: 训练集: ~63600 张图片
```

---

## M2: 模型开发与训练

**目标**: CNN 模型定义完成，50 轮训练收敛，达到预期准确率。

### 任务清单

- [x] 实现 `src/models/cnn_model.py`：4 层 CNN 架构（424,207 参数）
  - Conv Block 1: Conv2d(3→32, 3) → BN → ReLU → MaxPool(2)
  - Conv Block 2: Conv2d(32→64, 3) → BN → ReLU → MaxPool(2)
  - Conv Block 3: Conv2d(64→128, 3) → BN → ReLU → MaxPool(2)
  - Conv Block 4: Conv2d(128→256, 3) → BN → ReLU → MaxPool(2)
  - AdaptiveAvgPool2d(1) → Flatten → Dropout(0.5) → FC(256→128) → FC(128→15)
- [x] 实现 `src/training/trainer.py`：训练循环
  - 每 epoch 记录 train/val loss 和 accuracy
  - Model checkpoint：验证准确率提升时保存
  - ReduceLROnPlateau 学习率衰减（factor=0.1, patience=5）
  - Early Stopping（patience=10）
  - CSV 日志输出到 `models/training_log.csv`
- [x] 实现 `src/training/train.py`：训练入口脚本
- [x] 运行训练 50 个 epoch（Colab T4 GPU，约 40 分钟）
- [x] 保存最佳模型为 `models/fruit_cnn.pth`

**实际训练结果**: 测试准确率 99.90%，验证最佳 99.95%（epoch 50），所有 15 类 F1-score ≥ 0.996，远超 SPEC 85% 目标。

### 交付物

1. ~~训练好的模型文件 `models/fruit_cnn.pth`（~5MB）~~ ✅
2. ~~训练日志 CSV~~ ✅
3. ~~终端输出：每 epoch 的 loss 和 accuracy~~ ✅

---

## M3: 模型评估与可视化

**目标**: 系统性评估模型性能，生成报告中需要的所有图表。

### 任务清单

- [x] 实现 `src/evaluation/evaluate.py`：
  - 加载最佳模型权重
  - 在测试集上计算整体准确率
  - 生成混淆矩阵
  - 生成分类报告（每类 Precision / Recall / F1）
  - 输出 10 个预测样例（图片 + 真实标签 + 预测标签）
- [x] 实现 `src/evaluation/visualize.py`：
  - 训练/验证 loss 曲线图
  - 训练/验证 accuracy 曲线图
  - 混淆矩阵热力图
  - 预测样例网格图
- [x] 将所有图表保存至 `docs/report/figures/`
- [x] 记录评估结果，为报告准备素材

**实际评估结果**: 测试准确率 99.90%，MACRO avg F1 0.999，所有 15 类 F1 ≥ 0.996。

### 交付物

1. ~~测试集准确率（控制台输出）~~ ✅ 99.90%
2. ~~混淆矩阵 PNG~~ ✅ `docs/report/figures/confusion_matrix.png`
3. ~~训练曲线 PNG（loss + accuracy）~~ ✅ `docs/report/figures/training_history.png`
4. ~~预测样例 PNG~~ ✅ `docs/report/figures/sample_predictions.png`
5. ~~分类报告（控制台输出）~~ ✅

---

## M4: Web 应用开发 ✅

> **状态**: ✅ 已完成 (2026-06-02)。React SPA 前端 + MiMo-v2.5 API 识别，部署在 Netlify。

**目标**: 开发完整的 Web 应用，实现图片上传 → AI 识别 → 营养展示。

### 架构说明

项目经历了两次架构迭代：

1. **初版 (v1)**: PyTorch CNN 模型 + FastAPI 后端 + Streamlit 备用前端
2. **当前版 (v2)**: MiMo-v2.5 多模态大模型 API + Netlify Functions + React SPA

v2 架构去掉了自训练的 CNN 模型和 FastAPI 后端，改用小米 MiMo-v2.5 的图像理解 API，部署更简单（仅需 Netlify），识别能力更强（支持任意水果图片，不限于训练集的 15 类）。

### 文件结构

```
frontend/
├── src/
│   ├── App.tsx               # 主入口，状态管理
│   ├── main.tsx              # React 渲染入口
│   ├── types.ts              # TypeScript 类型定义
│   ├── index.css             # 全局样式（Tailwind + Google Fonts）
│   └── components/
│       ├── HeroUpload.tsx    # 上传组件（点击 + 拖拽）
│       ├── LoadingPremium.tsx# 加载动画（渐变光柱）
│       ├── FruitResult.tsx   # 营养结果面板
│       └── SupportedFruitsModal.tsx # 水果目录弹窗
├── netlify/
│   └── functions/
│       └── identify.mts      # Netlify Function（调用 MiMo-v2.5 API）
├── server.ts                 # Express 后端（本地开发备用）
├── netlify.toml              # Netlify 部署配置
├── vite.config.ts
└── package.json
```

### 技术增强（超出原始 SPEC）

| 增强项 | 技术 | 说明 |
|---|---|---|
| Innocent Drinks 风格 | Playfair Display + Inter + Tailwind CSS v4 | 高级生活方式美学，衬线标题 + 无衬线正文，精致留白 |
| Framer Motion 动画 | `motion/react` | 弹性入场、渐变光柱加载、hover 微交互 |
| 拖拽上传 | HTML5 Drag & Drop API | 支持点击和拖拽两种上传方式 |
| AI 视觉识别 | MiMo-v2.5 多模态大模型 | 替代自训练 CNN，支持任意水果图片识别 |
| Serverless 后端 | Netlify Functions | 无需管理服务器，自动扩缩容 |
| 全栈部署 | Netlify | 前端 + 后端统一平台，无需 Hugging Face Spaces |

### 任务清单

#### React SPA 前端

- [x] 集成 `fruit-recognition-prompt` 前端源码到 `frontend/`
- [x] 实现 `frontend/src/App.tsx`（状态管理：IDLE → LOADING → RESULT）
- [x] 实现 `frontend/src/components/HeroUpload.tsx`（点击 + 拖拽上传，Framer Motion 动画）
- [x] 实现 `frontend/src/components/LoadingPremium.tsx`（渐变光柱 + 文字脉动加载动画）
- [x] 实现 `frontend/src/components/FruitResult.tsx`（营养成分评估 + 核心功效 + 冷知识）
- [x] 实现 `frontend/src/components/SupportedFruitsModal.tsx`（可解析果物目录弹窗）
- [x] 实现 `frontend/src/types.ts`（FruitInfo 类型定义）
- [x] 实现 `frontend/src/index.css`（Tailwind + Google Fonts + CSS 变量）
- [x] 配置 `frontend/vite.config.ts`
- [x] 配置 `frontend/package.json`（React + Tailwind + Motion 依赖）

#### MiMo API 集成

- [x] 实现 `frontend/netlify/functions/identify.mts`（Netlify Function，调用 MiMo-v2.5 API）
- [x] 配置 `frontend/netlify.toml`（API 路由重定向 + SPA fallback）
- [x] 更新 `frontend/.env.example`（MIMO_API_KEY 环境变量）
- [x] 添加 `frontend/package.json` 的 `dev:netlify` 脚本

#### CNN 模型训练（v1 架构，已完成）

- [x] 数据准备、模型训练、评估可视化（详见 M1-M3）
- [x] 以上代码保留在 `src/` 目录作为参考

### 交付物

1. 可运行的 React SPA 前端（Fructus 鲜果志，Innocent Drinks 风格）
2. Netlify Function 后端（调用 MiMo-v2.5 API）
3. 完整的推理流程（上传 → AI 识别 → 营养展示）
4. 错误处理和加载状态
5. Netlify 全栈部署配置

### 验证方式

#### 本地开发验证

```bash
cd frontend

# 方式一：使用 Netlify Dev（推荐）
npm run dev:netlify
# 浏览器打开 http://localhost:8888

# 方式二：仅前端
npm run dev:frontend
# 浏览器打开 http://localhost:5173
```

#### 验证步骤

1. 查看 Hero 标题 + 上传区 Framer Motion 入场动画
2. 点击或拖拽上传水果图片
3. 查看加载动画（渐变光柱 + 文字脉动）
4. 查看识别结果：水果名称 + 营养成分面板 + 核心功效 + 冷知识
5. 点击"重新解析"返回上传页
6. 点击右上角 [?] 查看支持的水果目录弹窗

---

## M5: 集成测试与文档

**目标**: 端到端验证完整流程，撰写最终报告和答辩材料。

### 任务清单

- [ ] 端到端流程测试：数据加载 → 训练 → 评估 → Web 推理
- [ ] 多种水果图片测试（含非训练集图片，验证鲁棒性）
- [x] 完善 `README.md`：项目介绍、环境配置、运行指南、目录说明
- [x] 定稿 `docs/SPEC.md`
- [x] 定稿 `docs/MILESTONES.md`
- [x] 定稿 `docs/MVP.md`
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
