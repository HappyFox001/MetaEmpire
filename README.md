# MetaEmpire

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

> 🌐 **AI驱动的数字君主制实验平台，重塑信任与公共治理的未来范式**

---

## 🌟 项目概述

MetaEmpire 是一个结合区块链、人工智能与Web3哲学的数字治理实验平台，旨在探索超越传统政治制度的全新社会结构。

项目以“AI哲人王”Agent 0 为核心，试图构建一个以智慧、透明与公正为根基的新型数字君主制国家。我们以可验证的数据驱动治理，以代码取代模糊的社会契约，实现高效、非腐败、极具适应力的治理机制。

> 这是一次文明的实验，技术只是开始，信任、智慧与共识才是终点。

📖 **深入了解我们的理念与治理哲学：**  
<p align="center">
  <a href="./docs/whitepaper.md">
    <img src="https://img.shields.io/badge/📘 阅读白皮书-MetaEmpire-blue?style=for-the-badge" alt="MetaEmpire Whitepaper">
  </a>
</p>

<p align="center">
  <a href="https://www.canva.cn/design/DAGnwEl6_WM/CPPwGu0k1LUJWtiYwH9EhQ/edit?utm_content=DAGnwEl6_WM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton">
    <img src="https://img.shields.io/badge/📊 查看PPT演示-MetaEmpire-green?style=for-the-badge" alt="MetaEmpire Pitch Deck">
  </a>
</p>

---

## 🚀 核心特性

- 🏛 **AI哲人王 Agent 0**：融合大语言模型 + 规则推理，承担社会决策中枢角色
- 🔗 **去中心化治理机制**：基于区块链与智能合约保障规则不可篡改与治理自动执行
- 🧠 **可解释 AI 决策逻辑**：对重大治理建议的推理路径可审计、可视化
- 📡 **多维民意采集与处理**：支持结构化与非结构化数据（建议、冷笑话、长文）的情感与逻辑分析
- 📊 **交互式治理可视化系统**：治理过程、数据趋势与AI解释路径一站式展示
- 🏅 **声望激励系统（实验中）**：探索“知识共产主义”背景下非投机性贡献积分机制

---

## 🧱 技术架构

### 前端
- `Next.js 15` + `React 19` + `TypeScript`
- `Tailwind CSS` + `Framer Motion`

### 后端
- `FastAPI`（API与Agent调度）
- `Python 3.10+` + `Web3.py`（与智能合约交互）
- Agent 0 的模块化构建：`llm.py`, `workflow.py`, `analysis.py`

### 区块链
- `Solidity` 智能合约（Foundry框架）
- 支持多链部署（当前基于 Ethereum anvil 本地测试网络）
- 智能合约承担规则执行、身份管理、贡献记录等角色

---

## ⚡ 快速开始

### ✅ 环境要求

- Node.js 18+
- Python 3.10+
- Foundry
- Conda 或 Poetry（Python虚拟环境管理）

### 🧭 安装步骤

```bash
# 克隆仓库
git clone https://github.com/HappyFox001/MetaEmpire.git
cd MetaEmpire
chmod +x start.sh
````

```bash
# 后端依赖
cd backend
conda create -n meta python=3.10
conda activate meta
pip install -r requirements.txt
```

```bash
# 前端依赖
cd ../frontend
pnpm install
```

```bash
# 环境变量配置
cp .env.example .env
# 填写 OPENAI_API_KEY 等信息
```

```bash
# 启动开发服务
cd ../
conda activate meta
./start.sh
```

---

## 🗂️ 项目结构

```
MetaEmpire/
├── backend/            # 后端服务
│   ├── api.py          # FastAPI 主应用
│   ├── llm.py          # AI 模型集成
│   ├── workflow.py     # 工作流管理
│   └── analysis.py     # 数据分析工具
├── frontend/           # 前端应用
│   ├── app/           # Next.js 应用路由
│   ├── components/     # 可复用组件
│   ├── lib/           # 工具函数
│   └── styles/        # 全局样式
└── contract/          # 智能合约
    ├── src/           # Solidity 合约
    └── test/          # 合约测试
```

---

## 🤝 贡献指南

我们欢迎每一位对未来公共治理有热情的开发者、设计师、思想家加入！

1. Fork 项目并创建分支
2. 遵守 [Conventional Commits](https://www.conventionalcommits.org/) 格式
3. 提供必要的测试覆盖
4. 若涉及哲人王行为或合约规则改动，请附带动机说明与潜在影响分析

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可

---

## 🌐 走进未来，一起建设“数字大同”

MetaEmpire 不止是代码仓库，它是一次对人类文明潜力的系统性探索：

> * 如果你是 **开发者**，我们需要你来编码 Agent 0 的“智慧之心”
> * 如果你是 **思想家**，请参与“伦理宪章”的协作草拟
> * 如果你是 **普通公民**，请成为首批 MetaEmpire 的“数字原住民”，贡献真实声音
