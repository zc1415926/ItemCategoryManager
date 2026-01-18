#!/bin/bash

echo "🚀 开始运行 Electron 自动化测试..."
echo ""

# 检查是否安装了 Playwright
if ! npm list @playwright/test > /dev/null 2>&1; then
    echo "❌ Playwright 未安装，正在安装..."
    npm install --save-dev @playwright/test
fi

# 创建临时目录
mkdir -p temp

# 运行测试
echo "📋 运行测试..."
npm test

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 所有测试通过！"
    echo ""
    echo "📊 查看测试报告："
    echo "   npx playwright show-report"
else
    echo ""
    echo "❌ 部分测试失败，请查看上面的错误信息"
    echo ""
    echo "💡 提示："
    echo "   运行 'npm run test:headed' 查看实际执行过程"
    echo "   运行 'npm run test:debug' 进入调试模式"
fi

echo ""
echo "🎉 测试完成！"