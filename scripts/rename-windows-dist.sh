#!/bin/bash

# 重命名 Windows 打包目录的脚本

cd "$(dirname "$0")/.."

# 检查是否存在 win-unpacked 目录
if [ -d "dist/win-unpacked" ]; then
    echo "正在重命名 dist/win-unpacked 为 dist/条目分类管理器..."
    mv "dist/win-unpacked" "dist/条目分类管理器"
    echo "重命名完成！"
else
    echo "警告：dist/win-unpacked 目录不存在，跳过重命名"
fi

# 检查是否存在旧的 zip 文件并删除
if [ -f "dist/条目分类管理器-Windows-x64.zip" ]; then
    echo "删除旧的 zip 文件..."
    rm "dist/条目分类管理器-Windows-x64.zip"
fi

# 创建新的 zip 文件
if [ -d "dist/条目分类管理器" ]; then
    echo "正在创建新的 zip 压缩包..."
    cd dist
    zip -r "条目分类管理器-1.0.0-Windows-x64.zip" "条目分类管理器/"
    cd ..
    echo "压缩包创建完成！"
else
    echo "警告：dist/条目分类管理器 目录不存在，跳过压缩"
fi

echo "Windows 打包处理完成！"