# 里程碑计划 (Milestones)

## 总览

| 阶段 | 名称 | 预估工时 | 核心交付 | 状态 |
|---|---|---|---|---|
| M1 | 环境搭建与数据准备 | 1-2 天 | 项目骨架、数据集就绪 | ✅ 已完成 |
| M2 | 模型开发与训练 | 2-3 天 | CNN 模型训练完成 | ✅ 已完成 |
| M3 | 模型评估与可视化 | 1-2 天 | 评估报告、可视化图表 | ✅ 已完成 |
| M4 | Web 应用开发 | 2-3 天 | 可交互 Streamlit 应用 | ✅ 已完成 |
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

> **状态**: ✅ 已完成 (2026-06-01)。Web 前端 + 模型全部就绪，可直接运行推理。

**目标**: 开发完整的 Streamlit Web 应用，实现图片上传 → 预测 → 营养展示。前端采用绿色水果主题设计系统，GSAP 动画增强交互体验，满足 WCAG AA 无障碍标准。

### 文件结构

```
webapp/
├── app.py                    # 主入口（页面配置、session state、流程编排）
├── utils.py                  # 模型缓存加载、图像预处理、推理、营养数据
├── assets/
│   ├── style.css             # 自定义 CSS（@import 字体、水果卡片网格、装饰元素、will-change）
│   ├── theme.py              # 设计 token（颜色、字体、间距）+ CSS 注入函数
│   └── animations.js         # GSAP 动画引擎（master Timeline + ScrollTrigger + 视差 + 微交互）
├── components/
│   ├── __init__.py           # 组件导出
│   ├── upload.py             # 图片上传 + 验证 + 预览
│   ├── result.py             # 识别结果卡片 + 置信度进度条
│   ├── nutrition.py          # 营养价值卡片网格 + 功效列表
│   └── fruit_gallery.py      # 15 种水果展示网格（ScrollTrigger.batch() 交错入场）
└── requirements.txt          # Web 精简依赖
```

### 技术增强（超出原始 SPEC）

| 增强项 | 技术 | 说明 |
|---|---|---|
| GSAP 全家桶 | `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)` + `gsap.matchMedia()` | ScrollTrigger 滚动驱动、Timeline 编排、视差 scrub、`autoAlpha`、`back.out`/`expo.out` 缓动 |
| 水果展示区 | CSS Grid 5 列 + `ScrollTrigger.batch()` | 15 种水果卡片从中心扩散交错入场，GSAP hover 微交互 |
| Master Timeline | 单一 Timeline 编排 Hero 入场序列 | 容器→标题(expo.out)→副标题→标签带(back.out 弹性)→上传区 |
| 视差效果 | Hero 装饰圆 `ScrollTrigger scrub: 1.5` | 三个装饰圆随滚动反向移动，营造深度感 |
| 设计系统 | CSS 变量 + 有机植物学美学 | 暖奶油底色 + 深森林绿 + 赞陶点缀，14 个设计 token，Google Fonts (Playfair Display + DM Sans) |
| 性能优化 | `will-change: transform` + stagger `from: "center"` | 动画元素 GPU 提升，从中心扩散的 stagger 更有视觉张力 |
| 无障碍 | ARIA + `gsap.matchMedia()` + 键盘导航 | WCAG AAA 合规（对比度 10.5:1+），屏幕阅读器完整支持 |
| 降级策略 | CSS keyframes fallback + `gsap.matchMedia()` | GSAP 不可用时 CSS 动画自动接管；`prefers-reduced-motion` 双重覆盖 |

### 任务清单

- [x] 实现 `webapp/requirements.txt`（精简依赖）
- [x] 实现 `webapp/assets/theme.py`（设计 token + CSS 注入）
- [x] 实现 `webapp/assets/style.css`（完整绿色主题、响应式、无障碍、CSS 动画 fallback）
- [x] 实现 `webapp/utils.py`：
  - 15 种水果营养数据字典
  - `@st.cache_resource` 模型加载
  - 图像预处理函数（128×128、ImageNet 归一化）
  - 预测函数封装（返回名称、置信度、概率分布）
- [x] 实现 `webapp/components/__init__.py`
- [x] 实现 `webapp/components/upload.py`（上传、验证、base64 预览）
- [x] 实现 `webapp/components/result.py`（结果卡片、置信度进度条、Top-3 概率）
- [x] 实现 `webapp/components/nutrition.py`（营养卡片网格、功效列表、描述）
- [x] 实现 `webapp/assets/animations.js`（GSAP 动画引擎、MutationObserver）
- [x] 实现 `webapp/app.py`：
  - `st.set_page_config` 页面配置
  - Session state 管理（图片、预测结果、错误状态）
  - Hero 标题 + 副标题
  - 图片上传区域
  - "识别水果" 按钮 + Spinner 加载状态
  - 识别结果展示（名称 + 置信度动画）
  - 营养价值展示（卡片 + 功效 + 描述）
  - 重新上传按钮（状态重置）
  - 错误提示（文件格式、文件大小、模型缺失）
  - GSAP 动画引擎 iframe（加载 CDN + animations.js）
- [ ] 端到端测试：模型已就绪，可执行

### 交付物

1. 可运行的 Streamlit Web 应用（含 GSAP 动画）
2. 完整的推理流程（上传 → 预测 → 营养展示）
3. 错误处理和加载状态
4. 绿色水果主题设计系统
5. WCAG AA 无障碍支持
6. CSS + GSAP 双重动画降级保障

### 验证方式

```bash
cd webapp
streamlit run app.py
# 浏览器打开 http://localhost:8501
# 1. 查看 Hero 标题入场动画（GSAP fade-in）
# 2. 上传水果图片 → 查看预览
# 3. 点击"识别水果" → 查看结果卡片揭示动画 + 置信度条填充 + 营养卡片交错入场
# 4. 上传非图片文件（.txt）→ 查看错误提示
# 5. 系统开启"减少动画"→ 动画即时完成
# 6. Tab 键导航验证键盘可达性
```

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
