# 水果识别与营养信息展示系统

《人工智能基础》期末大作业 — 方案一：深度学习模型训练与界面化应用封装

## 项目简介

基于小米 MiMo-v2.5 多模态大模型的水果识别系统。用户上传水果图片后，系统通过 AI 视觉理解自动识别水果种类，并展示该水果的营养价值信息。

- **AI 模型**: 小米 MiMo-v2.5（多模态大模型，支持图像理解）
- **应用**: React SPA 前端 (Fructus 鲜果志) + Netlify Functions 后端
- **部署**: Netlify 全栈部署（前端 + Serverless Functions）

## 项目结构

```
ending/
├── frontend/               # React SPA 前端 (Fructus 鲜果志)
│   ├── src/
│   │   ├── App.tsx         # 主入口
│   │   ├── components/     # UI 组件（上传、加载、结果、水果目录）
│   │   ├── types.ts        # TypeScript 类型定义
│   │   └── index.css       # 全局样式（Tailwind + 自定义字体）
│   ├── netlify/
│   │   └── functions/      # Netlify Serverless Functions
│   │       └── identify.mts # 水果识别 API（调用 MiMo-v2.5）
│   ├── server.ts           # Express 后端（本地开发备用）
│   ├── netlify.toml        # Netlify 部署配置
│   ├── vite.config.ts
│   └── package.json
├── src/                    # 源代码（CNN 模型训练，仅供参考）
├── models/                 # 模型文件（不纳入版本控制）
├── notebooks/              # Jupyter 探索笔记
├── docs/                   # 文档
├── .gitignore
└── pyproject.toml
```

## 快速开始

### 环境要求

- Node.js >= 18
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)（本地开发需要）

### 安装

```bash
# 克隆项目
cd D:\Workspace\Works\AI\ending

# 安装前端依赖
cd frontend
npm install
```

### 配置 API Key

1. 前往 [小米 MiMo 开放平台](https://platform.xiaomimimo.com) 注册并获取 API Key
2. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```
3. 在 `.env` 中填入你的 API Key：
   ```
   MIMO_API_KEY="your_actual_api_key"
   ```

### 本地开发

```bash
cd frontend

# 方式一：使用 Netlify Dev（推荐，自动代理 API 请求）
npm run dev:netlify

# 方式二：仅启动前端（需配合部署后的 API）
npm run dev:frontend
```

浏览器打开 <http://localhost:8888>（Netlify Dev 默认端口），上传水果图片即可识别。

### 构建

```bash
cd frontend
npm run build
```

## 部署到 Netlify

### 方式一：Git 集成（推荐）

1. 将代码推送到 GitHub
2. 在 [Netlify](https://app.netlify.com) 中导入项目
3. 配置：
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. 在 Netlify 的 **Environment variables** 中添加：
   - `MIMO_API_KEY` = 你的 MiMo API Key
5. 部署完成！

### 方式二：Netlify CLI

```bash
cd frontend

# 登录 Netlify
netlify login

# 初始化项目
netlify init

# 部署
netlify deploy --prod
```

## 技术栈

- **React 19 + TypeScript** — SPA 前端框架
- **Tailwind CSS v4** — 原子化 CSS 框架
- **Motion (Framer Motion)** — React 动画库
- **Netlify Functions** — Serverless 后端
- **小米 MiMo-v2.5** — 多模态 AI 大模型（图像理解）

## 文档索引

- [MiMo API 文档](docs/mimo-openai-api.md)
- [MiMo 模型列表](docs/mimo-models.md)
- [MiMo 图像理解](docs/mimo-image.md)

## 参考

- 小米 MiMo 开放平台: <https://platform.xiaomimimo.com>
- Fruits 360 Dataset: <https://www.kaggle.com/datasets/moltean/fruits>
- Netlify Functions: <https://docs.netlify.com/functions/overview/>
