#!/bin/bash

# 设置颜色代码
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否安装了必要的命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}错误: 未找到 $1 命令。请先安装 $1。${NC}"
        exit 1
    fi
}

# 检查必要的命令
check_command node
check_command python3
check_command pnpm
check_command anvil
check_command forge

# 函数：启动服务
start_service() {
    local name=$1
    local command=$2
    local dir=$3
    
    echo -e "${GREEN}启动 $name...${NC}"
    if [ "$dir" != "" ]; then
        (cd "$dir" && $command) &
    else
        ($command) &
    fi
    sleep 2
}

# 1. 启动 Anvil 本地测试节点
echo -e "${GREEN}1. 启动 Anvil 本地测试节点...${NC}"
start_service "Anvil 节点" "anvil" "contract"

# 2. 部署智能合约
echo -e "\n${GREEN}2. 部署智能合约...${NC}"
(cd contract && \
    forge build && \
    forge create src/AIOracle.sol:AIOracle \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --broadcast
) &
sleep 5

# 3. 启动后端服务
echo -e "\n${GREEN}3. 启动后端服务...${NC}"
start_service "后端服务" "uvicorn api:app --reload" "backend"

# 4. 启动前端服务
echo -e "\n${GREEN}4. 启动前端服务...${NC}"
start_service "前端服务" "pnpm dev" "frontend"

echo -e "\n${GREEN}✅ 所有服务已启动！${NC}"
echo -e "\n访问前端: ${YELLOW}http://localhost:3000${NC}"
echo -e "\n按 Ctrl+C 停止所有服务"

# 捕获 Ctrl+C 并清理
cleanup() {
    echo -e "\n${YELLOW}正在停止所有服务...${NC}"
    pkill -P $$
    exit 0
}

trap cleanup SIGINT

# 保持脚本运行
wait
