# MetaEmpire

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

> AI驱动的数字君主制，通过可验证信息和智能合约实现理性公共治理

## 🌟 项目概述

MetaEmpire 是一个创新的去中心化治理平台，结合了区块链技术、人工智能和Web3.0理念，旨在构建一个透明、高效、理性的数字治理生态。项目采用智能合约确保治理过程的公正性，利用AI技术进行信息分析和决策支持。

## 🚀 核心特性

- **去中心化治理**：基于区块链的透明治理机制
- **AI辅助决策**：利用大语言模型进行信息分析和建议
- **多主题讨论**：支持经济、AI、Web3、元宇宙等多样化议题
- **智能合约自动化**：自动执行治理决策和奖励分配
- **交互式数据可视化**：直观展示治理数据和趋势

## 🏗️ 技术栈

### 前端
- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- Web3Modal + Wagmi + Viem
- Framer Motion 动画效果

### 后端
- FastAPI
- Python 3.10+
- Web3.py
- 智能合约交互

### 区块链
- Solidity 智能合约
- Foundry 开发框架
- 支持多链部署

## 🛠️ 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- Foundry (for smart contract development)
- Git

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/your-username/MetaEmpire.git
cd MetaEmpire
chmod +x start.sh
```

2. 安装后端依赖
```bash
cd backend
conda create -n test python=3.10
conda activate test
pip install -r requirements.txt
```

3. 安装前端依赖
```bash
cd ../frontend
pnpm install
```

4. 配置环境变量
创建 `.env` 文件并配置 OPENAI_API_KEY

5. 启动开发服务器
```bash
conda activate test
./start.sh
```

## 📚 项目结构

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

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request。请确保：

1. Fork 项目并创建特性分支
2. 提交信息遵循 Conventional Commits 规范
3. 编写适当的测试用例
4. 更新相关文档

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证

> 🌐 探索 MetaEmpire，共同构建去中心化的未来治理模式！
