#!/bin/bash

# Windows 打包优化脚本
# 功能：删除不需要的语言包和库，减小打包体积

cd "$(dirname "$0")/.."

echo "======================================"
echo "开始优化 Windows 打包..."
echo "======================================"

# 检查打包目录是否存在
DIST_DIR="dist/条目分类管理器"

if [ ! -d "$DIST_DIR" ]; then
    echo "错误：打包目录 $DIST_DIR 不存在！"
    exit 1
fi

echo "当前打包目录: $DIST_DIR"
echo ""

# 1. 优化语言包（只保留英文和中文）
echo "======================================"
echo "1. 优化语言包..."
echo "======================================"

LOCALES_DIR="$DIST_DIR/locales"
if [ -d "$LOCALES_DIR" ]; then
    BEFORE_SIZE=$(du -sh "$LOCALES_DIR" | cut -f1)
    echo "优化前语言包大小: $BEFORE_SIZE"
    
    # 只保留英文和中文语言包
    keep_files=("en-US.pak" "zh-CN.pak")
    for file in "$LOCALES_DIR"/*; do
        filename=$(basename "$file")
        if [[ ! " ${keep_files[@]} " =~ " ${filename} " ]]; then
            rm -f "$file"
            echo "  删除: $filename"
        fi
    done
    
    AFTER_SIZE=$(du -sh "$LOCALES_DIR" | cut -f1)
    echo "优化后语言包大小: $AFTER_SIZE"
    echo "  保留: en-US.pak, zh-CN.pak"
else
    echo "警告：语言包目录不存在"
fi

echo ""

# 2. 删除 FFmpeg（如果不需要音视频功能）
echo "======================================"
echo "2. 删除 FFmpeg 库..."
echo "======================================"

FFMPEG_FILE="$DIST_DIR/ffmpeg.dll"
if [ -f "$FFMPEG_FILE" ]; then
    FFMPEG_SIZE=$(du -h "$FFMPEG_FILE" | cut -f1)
    rm -f "$FFMPEG_FILE"
    echo "  已删除: ffmpeg.dll ($FFMPEG_SIZE)"
    echo "  注意：删除后将无法使用音视频功能"
else
    echo "  FFmpeg 文件不存在，跳过"
fi

echo ""

# 3. 删除不需要的图形库（可选）
echo "======================================"
echo "3. 删除 Vulkan 相关文件..."
echo "======================================"

VULKAN_FILES=(
    "$DIST_DIR/vk_swiftshader.dll"
    "$DIST_DIR/vk_swiftshader_icd.json"
    "$DIST_DIR/vulkan-1.dll"
)

for file in "${VULKAN_FILES[@]}"; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(du -h "$file" | cut -f1)
        rm -f "$file"
        echo "  已删除: $(basename $file) ($FILE_SIZE)"
    fi
done

echo "  注意：删除后可能影响某些图形渲染功能"

echo ""

# 4. 删除调试文件
echo "======================================"
echo "4. 删除调试文件..."
echo "======================================"

DEBUG_FILES=(
    "$DIST_DIR/LICENSES.chromium.html"
    "$DIST_DIR/LICENSE.electron.txt"
)

for file in "${DEBUG_FILES[@]}"; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(du -h "$file" | cut -f1)
        rm -f "$file"
        echo "  已删除: $(basename $file) ($FILE_SIZE)"
    fi
done

echo ""

# 5. 显示优化结果
echo "======================================"
echo "优化完成！"
echo "======================================"

FINAL_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
echo "最终打包大小: $FINAL_SIZE"
echo ""

echo "优化内容："
echo "  ✓ 删除了不需要的语言包（仅保留英文和中文）"
echo "  ✓ 删除了 FFmpeg 库（音视频功能）"
echo "  ✓ 删除了 Vulkan 相关文件（图形渲染）"
echo "  ✓ 删除了调试文件"
echo ""

echo "注意事项："
echo "  • 删除的文件将无法恢复"
echo "  • 如需完整功能，请重新打包"
echo "  • 建议在测试环境验证功能正常后再发布"
echo ""

# 6. 重新创建压缩包
echo "======================================"
echo "6. 重新创建压缩包..."
echo "======================================"

cd dist

# 删除旧的压缩包
if [ -f "条目分类管理器-1.0.0-Windows-x64.zip" ]; then
    rm -f "条目分类管理器-1.0.0-Windows-x64.zip"
    echo "  已删除旧的压缩包"
fi

# 创建新的压缩包
echo "  正在创建新的压缩包..."
zip -r "条目分类管理器-1.0.0-Windows-x64-Optimized.zip" "条目分类管理器/" > /dev/null

if [ -f "条目分类管理器-1.0.0-Windows-x64-Optimized.zip" ]; then
    ZIP_SIZE=$(du -h "条目分类管理器-1.0.0-Windows-x64-Optimized.zip" | cut -f1)
    echo "  压缩包创建完成: $ZIP_SIZE"
else
    echo "  错误：压缩包创建失败"
fi

cd ..

echo ""
echo "======================================"
echo "优化脚本执行完毕！"
echo "======================================"
echo ""
echo "文件位置："
echo "  打包目录: dist/条目分类管理器/"
echo "  压缩包: dist/条目分类管理器-1.0.0-Windows-x64-Optimized.zip"
echo ""