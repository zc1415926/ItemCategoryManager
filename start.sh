#!/bin/bash

# 条目分类管理器启动脚本

echo "正在启动条目分类管理器..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 启动应用
npm start