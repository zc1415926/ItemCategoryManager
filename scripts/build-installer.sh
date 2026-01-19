#!/bin/bash

# Windows 安装包构建脚本
# 使用 electron-builder 生成 NSIS 安装程序

cd "$(dirname "$0")/.."

echo "======================================"
echo "开始构建 Windows 安装包..."
echo "======================================"

# 清理旧的构建文件
echo "清理旧的构建文件..."
rm -rf dist/*.exe dist/*.nsis.7z dist/win-ia32-unpacked dist/win-unpacked dist/条目分类管理器
echo "清理完成"
echo ""

# 设置环境变量
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/

# 构建 Windows 安装包
echo "开始构建..."
npx electron-builder --win --x64 --publish never

# 检查构建结果
if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "构建成功！"
    echo "======================================"
    echo ""
    echo "生成的文件："
    ls -lh dist/*.exe 2>/dev/null || echo "  未找到 .exe 文件"
    echo ""
    echo "安装包特性："
    echo "  ✓ 自动创建桌面快捷方式"
    echo "  ✓ 自动创建开始菜单快捷方式"
    echo "  ✓ 支持自定义安装目录"
    echo "  ✓ 支持中文界面"
    echo "  ✓ 自动关联 .json 文件"
    echo ""
else
    echo ""
    echo "======================================"
    echo "构建失败！"
    echo "======================================"
    echo ""
    echo "可能的原因："
    echo "  1. 网络连接问题（无法下载 Electron）"
    echo "  2. 磁盘空间不足"
    echo "  3. Node.js 或 npm 版本问题"
    echo ""
    echo "建议："
    echo "  - 检查网络连接"
    echo "  - 清理磁盘空间"
    echo "  - 查看 build-log.txt 了解详细错误"
    echo ""
    exit 1
fi