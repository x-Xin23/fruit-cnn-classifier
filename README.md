# 水果识别与营养信息展示系统

《人工智能基础》期末大作业 — 方案一：深度学习模型训练与界面化应用封装

## 项目简介

基于深度学习 CNN 模型的水果识别系统。用户上传水果图片后，系统自动识别水果种类（支持 15 种常见水果），并展示该水果的营养价值信息。模型测试准确率 **99.90%**，验证最佳 **99.95%**（50 epoch，Colab T4 GPU）。

- **数据集**: [Kaggle Fruits 360](https://www.kaggle.com/datasets/moltean/fruits)（15 类子集）
- **模型**: 4 层 CNN，PyTorch 实现
- **应用**: 双前端 — React SPA (Fructus 鲜果志) + Streamlit Web 界面

## 项目结构

```
ending/
├── src/                    # 所有源代码
│   ├── data/               # 数据加载与预处理
│   ├── models/             # CNN 模型定义
│   ├── training/           # 训练脚本
│   ├── evaluation/         # 评估与可视化
│   ├── inference/          # 推理预测
│   └── utils/              # 配置、营养数据
├── frontend/               # React SPA 前端 (Fructus 鲜果志)
│   ├── src/
│   │   ├── App.tsx         # 主入口
│   │   ├── components/     # UI 组件（上传、加载、结果、水果目录）
│   │   ├── types.ts        # TypeScript 类型定义
│   │   └── index.css       # 全局样式（Tailwind + 自定义字体）
│   ├── server.ts           # Express 后端（桥接前端与 FastAPI 推理服务）
│   ├── vite.config.ts
│   └── package.json
├── api/                    # FastAPI 推理后端
│   ├── main.py             # API 入口
│   └── inference.py        # 模型加载与推理
├── webapp/                 # Streamlit Web 应用（备用前端）
│   ├── app.py              # 主入口
│   ├── utils.py            # 模型加载、推理、营养数据
│   ├── assets/             # 样式、主题、GSAP 动画
│   └── components/         # UI 组件（上传、结果、营养）
├── docs/                   # 所有文档（与代码硬隔离）
│   ├── SPEC.md             # 规格说明书
│   ├── MILESTONES.md       # 里程碑计划
│   ├── MVP.md              # MVP 定义
│   ├── report/             # 最终报告
│   └── presentation/       # 答辩 PPT
├── data/                   # 数据集（不纳入版本控制）
├── models/                 # 模型文件（不纳入版本控制）
├── notebooks/              # Jupyter 探索笔记
├── .gitignore
├── pyproject.toml
└── requirements.txt
```

## 快速开始

### 环境要求

- Python >= 3.10
- Node.js >= 18
- [uv](https://github.com/astral-sh/uv)（推荐）或 pip

### 安装

```bash
# 克隆项目
cd D:\Workspace\Works\AI\ending

# 使用 uv 创建虚拟环境
uv venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate   # macOS/Linux

# 安装 Python 依赖
uv pip install -r requirements.txt

# 安装前端依赖
cd frontend
npm install
```

### 训练模型

```bash
cd src
python training/train.py
```

训练完成后，模型保存为 `models/fruit_cnn.pth`。

### 运行 React SPA 前端（推荐）

需要同时启动 FastAPI 后端和 Express 前端：

```bash
# 终端 1：启动 FastAPI 推理后端
cd api
uvicorn main:app --reload --port 8000

# 终端 2：启动 Express + Vite 前端
cd frontend
npm run dev
```

浏览器打开 <http://localhost:3000>，上传水果图片即可识别。

### 运行 Streamlit Web 应用（备用）

```bash
cd webapp
streamlit run app.py
```

浏览器打开 <http://localhost:8501>，上传水果图片即可识别。

## 支持的 15 种水果

| 苹果 | 香蕉 | 橙子 | 葡萄 | 草莓 |
| 猕猴桃 | 西瓜 | 桃子 | 梨 | 芒果 |
| 菠萝 | 樱桃 | 柠檬 | 蓝莓 | 石榴 |

## 文档索引

- [规格说明书](docs/SPEC.md)
- [里程碑计划](docs/MILESTONES.md)
- [MVP 定义](docs/MVP.md)

## 技术栈

- **PyTorch** — 深度学习框架
- **React 19 + TypeScript** — SPA 前端框架
- **Tailwind CSS v4** — 原子化 CSS 框架
- **Motion (Framer Motion)** — React 动画库
- **Express.js** — Node.js 后端（桥接前端与推理服务）
- **FastAPI** — Python 推理 API 服务
- **Streamlit** — 备用 Web 应用框架
- **GSAP** — JavaScript 动画库（Streamlit 版本）
- **scikit-learn** — 评估指标
- **matplotlib / seaborn** — 可视化

## 参考

- Fruits 360 Dataset: <https://www.kaggle.com/datasets/moltean/fruits>
- PyTorch Tutorials: <https://pytorch.org/tutorials/>
- Streamlit Docs: <https://docs.streamlit.io/>
