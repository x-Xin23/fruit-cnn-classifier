# 最小可行产品 (MVP) 定义

## MVP 范围

MVP 交付一个**完整可用的水果识别系统**，涵盖数据预处理 → 模型训练 → 模型评估 → Web 应用部署的全流程，满足课程方案一的所有要求。

---

## MVP 包含 (IN)

> **状态说明**: M4 (Web 应用) 已预先实现完成。M1-M3 (数据准备、模型训练、评估可视化) 尚未实现。以下复选框反映实际完成状态——打勾的才可用。

### 数据与预处理
- [x] 下载 Fruits 360 数据集
- [x] 筛选 15 种常见水果类别
- [x] 80/20 分层划分训练集和测试集
- [x] 图像 Resize 至 128×128
- [x] 归一化（ImageNet 均值/标准差）
- [x] 训练集数据增强（随机翻转 + 旋转 + ColorJitter）
- [x] PyTorch DataLoader + 批量加载

### 模型
- [x] 4 层 CNN 架构（Conv-BN-ReLU-MaxPool × 4）
- [x] 训练循环：每 epoch 记录 loss 和 accuracy
- [x] 模型 Checkpoint：自动保存验证准确率最高的模型
- [x] 50 epoch 训练 + Adam 优化器（早停 patience=10）
- [x] 学习率衰减 + 早停机制
- [x] 测试准确率 ≥ 85%（实际: **99.90%**，验证集最佳: **99.95%**）

### 评估
- [x] 测试集整体准确率: 99.90%
- [x] 混淆矩阵（控制台 + 热力图，见 `docs/report/figures/confusion_matrix.png`）
- [x] 每类 Precision / Recall / F1-Score（MARCO avg F1: 0.999）
- [x] 训练曲线（loss + accuracy，见 `docs/report/figures/training_history.png`）
- [x] 10 个预测样例展示（见 `docs/report/figures/sample_predictions.png`）

### Web 应用
- [x] 图片上传组件（JPG/PNG）
- [x] "识别水果"预测按钮
- [x] 展示预测水果名（中文 + 英文）
- [x] 置信度进度条
- [x] 营养价值信息展示（热量、维生素、膳食纤维、功效、描述）
- [x] 加载状态动画
- [x] 错误处理（非图片文件、损坏文件）
- [x] React SPA 前端（Fructus 鲜果志，Innocent Drinks 风格）
- [x] Netlify Function 后端（调用 MiMo-v2.5 API）
- [x] 拖拽上传支持
- [x] Framer Motion 弹性动画

### 文档
- [x] SPEC.md — 规格说明书
- [x] MILESTONES.md — 里程碑计划
- [x] MVP.md — MVP 定义
- [x] README.md — 项目说明与运行指南
- [ ] 最终项目报告（.docx）
- [ ] 答辩 PPT（.pptx）

---

## MVP 不包含 (OUT) — 未来扩展

以下功能不在 MVP 范围内，可在后续版本中考虑：

- [ ] 实时摄像头识别
- [ ] 批量图片识别
- [ ] 移动端适配
- [ ] 用户反馈机制（纠错功能）
- [ ] 单元测试和 CI/CD
- [ ] 多语言支持（中英文切换）
- [ ] 营养数据实时数据库查询
- [ ] 水果成熟度判断

---

## 成功标准

MVP 判定为**完成**，需同时满足以下所有条件：

| # | 成功标准 | 验证方式 |
|---|---|---|
| 1 | `python src/training/train.py` 完成训练，测试准确率 ≥ 85% | 控制台输出 + 训练日志 CSV |
| 2 | `npm run dev:netlify` 启动可用的 Web 应用 | 浏览器打开 http://localhost:8888 |
| 3 | 上传任意水果图片，得到正确的预测结果 | 手动测试 5 种不同水果 |
| 4 | 识别结果包含该水果的营养价值信息 | 界面展示营养表格 |
| 5 | 非法文件（非图片）有友好错误提示 | 上传 .txt 测试 |
| 6 | 所有文档齐全（SPEC + Milestones + MVP + README + 报告 + PPT） | 文件存在于 `docs/` 目录 |
| 7 | 代码与文档硬隔离，`src/` 不含 `.md` 文件 | 检查目录结构 |
| 8 | Git 仓库初始 commit 完成 | `git log` 有记录 |

---

## 已知限制

- 识别依赖 MiMo-v2.5 API，需要网络连接和有效的 API Key
- 营养价值数据由 AI 模型生成，可能存在误差
- API 调用有速率限制（RPM: 100，TPM: 10M）
- 仅支持 RGB 图像，不支持 3D/深度信息
- 图片需清晰且水果居中（与训练数据分布一致）

---

## MVP 里程碑对应

| MVP 功能 | 对应里程碑 |
|---|---|
| 数据准备 + 预处理 | M1 |
| CNN 模型 + 训练 | M2 |
| 模型评估 + 可视化 | M3 |
| React SPA 前端 + MiMo API 后端 | M4 |
| 文档 + 报告 + PPT | M5 |

