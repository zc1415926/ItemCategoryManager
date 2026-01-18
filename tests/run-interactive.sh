#!/bin/bash

echo "🧪 运行需要用户交互的测试..."
echo ""
echo "⚠️  注意：以下测试需要您手动操作系统对话框"
echo "   - 测试10: 保存文件（需要选择保存位置）"
echo "   - 测试11: 打开文件（需要选择文件）"
echo "   - 测试15: 批量导入（需要选择文件）"
echo ""
echo "请准备好，测试将在5秒后开始..."
sleep 5
echo ""

# 创建临时目录
mkdir -p temp

# 运行有界面模式的测试
echo "📋 运行测试（有界面模式）..."
npx playwright test --headed --timeout=120000

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 所有测试通过！"
else
    echo ""
    echo "❌ 部分测试失败，请查看上面的错误信息"
fi

echo ""
echo "🎉 测试完成！"