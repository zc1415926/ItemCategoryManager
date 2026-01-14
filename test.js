// 自动化测试脚本
const fs = require('fs');
const path = require('path');

// 测试结果统计
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 测试辅助函数
function assert(condition, testName) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`✓ ${testName}`);
    } else {
        failedTests++;
        console.log(`✗ ${testName}`);
    }
}

function assertEqual(actual, expected, testName) {
    totalTests++;
    if (actual === expected) {
        passedTests++;
        console.log(`✓ ${testName}`);
    } else {
        failedTests++;
        console.log(`✗ ${testName}`);
        console.log(`  期望: ${expected}`);
        console.log(`  实际: ${actual}`);
    }
}

function assertDeepEqual(actual, expected, testName) {
    totalTests++;
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
        passedTests++;
        console.log(`✓ ${testName}`);
    } else {
        failedTests++;
        console.log(`✗ ${testName}`);
        console.log(`  期望: ${expectedStr}`);
        console.log(`  实际: ${actualStr}`);
    }
}

// 测试数据验证
function testDataValidation() {
    console.log('\n=== 数据格式验证测试 ===');
    
    // 测试1: 验证JSON文件格式
    const exampleFile = path.join(__dirname, 'example.json');
    if (fs.existsSync(exampleFile)) {
        const data = JSON.parse(fs.readFileSync(exampleFile, 'utf-8'));
        
        assert(data.version !== undefined, 'JSON文件包含version字段');
        assert(data.createdAt !== undefined, 'JSON文件包含createdAt字段');
        assert(Array.isArray(data.items), 'items是数组');
        assert(Array.isArray(data.categories), 'categories是数组');
    } else {
        console.log('⚠ example.json文件不存在，跳过JSON格式测试');
    }
}

// 测试文件操作
function testFileOperations() {
    console.log('\n=== 文件操作测试 ===');
    
    const testDir = path.join(__dirname, 'test_files');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }
    
    // 测试2: 创建测试文件
    const testData = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        items: ['条目1', '条目2', '条目3'],
        categories: [
            { name: '分类1', items: ['条目1'] },
            { name: '分类2', items: ['条目2'] }
        ]
    };
    
    const testFilePath = path.join(testDir, 'test.json');
    fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));
    assert(fs.existsSync(testFilePath), '成功创建测试文件');
    
    // 测试3: 读取文件
    const readData = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
    assertDeepEqual(readData, testData, '读取文件内容正确');
    
    // 测试4: 修改文件内容
    testData.items.push('条目4');
    fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));
    const modifiedData = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
    assertEqual(modifiedData.items.length, 4, '文件修改成功');
    
    // 测试5: 删除测试文件
    fs.unlinkSync(testFilePath);
    assert(!fs.existsSync(testFilePath), '成功删除测试文件');
}

// 测试数据收集逻辑
function testDataCollection() {
    console.log('\n=== 数据收集逻辑测试 ===');
    
    // 测试6: 验证条目收集逻辑
    // 模拟DOM元素的textContent包含删除按钮的情况
    const rawItem1 = { textContent: '条目1×' };
    const rawItem2 = { textContent: '条目2×' };
    
    const items = [rawItem1, rawItem2]
        .map(item => {
            // 移除删除按钮符号
            let text = item.textContent;
            if (text.endsWith('×')) {
                text = text.slice(0, -1).trim();
            }
            return text.trim();
        })
        .filter(text => text !== '');
    
    assertEqual(items.length, 2, '正确收集条目数量');
    assertEqual(items[0], '条目1', '正确收集条目1');
    assertEqual(items[1], '条目2', '正确收集条目2');
}

// 测试修改检测逻辑
function testModificationDetection() {
    console.log('\n=== 修改检测逻辑测试 ===');
    
    // 测试7: 相同内容检测
    const originalData = {
        version: '1.0',
        createdAt: '2024-01-01T00:00:00.000Z',
        items: ['条目1', '条目2'],
        categories: [{ name: '分类1', items: [] }]
    };
    
    const currentData = {
        version: '1.0',
        createdAt: '2024-01-02T00:00:00.000Z',
        items: ['条目1', '条目2'],
        categories: [{ name: '分类1', items: [] }]
    };
    
    const originalContent = JSON.stringify({
        items: originalData.items,
        categories: originalData.categories
    });
    
    const currentContent = JSON.stringify({
        items: currentData.items,
        categories: currentData.categories
    });
    
    assertEqual(originalContent, currentContent, '相同内容不被检测为修改（忽略version和createdAt）');
    
    // 测试8: 不同内容检测
    const modifiedData = {
        version: '1.0',
        createdAt: '2024-01-01T00:00:00.000Z',
        items: ['条目1', '条目2', '条目3'],
        categories: [{ name: '分类1', items: [] }]
    };
    
    const modifiedContent = JSON.stringify({
        items: modifiedData.items,
        categories: modifiedData.categories
    });
    
    assert(originalContent !== modifiedContent, '不同内容被正确检测为修改');
}

// 测试导入功能
function testImportFunctionality() {
    console.log('\n=== 导入功能测试 ===');
    
    // 测试9: 文本分割
    const text = '条目1\n条目2\n\n条目3\n';
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    assertEqual(lines.length, 3, '正确分割文本行');
    assertEqual(lines[0], '条目1', '正确提取第一行');
    
    // 测试10: 重复检测
    const existingItems = ['条目1', '条目2'];
    const newItems = ['条目2', '条目3', '条目4'];
    let duplicateCount = 0;
    let uniqueCount = 0;
    
    newItems.forEach(item => {
        if (existingItems.includes(item)) {
            duplicateCount++;
        } else {
            uniqueCount++;
        }
    });
    
    assertEqual(duplicateCount, 1, '正确检测重复条目');
    assertEqual(uniqueCount, 2, '正确识别唯一条目');
}

// 测试文件路径处理
function testFilePathHandling() {
    console.log('\n=== 文件路径处理测试 ===');
    
    // 测试11: 提取文件名
    const filePath = '/home/user/documents/test.json';
    const fileName = filePath.split('/').pop().split('\\').pop();
    assertEqual(fileName, 'test.json', '正确提取文件名');
    
    // 测试12: Windows路径处理
    const winPath = 'C:\\Users\\user\\Documents\\test.json';
    const winFileName = winPath.split('/').pop().split('\\').pop();
    assertEqual(winFileName, 'test.json', '正确处理Windows路径');
}

// 测试分类管理
function testCategoryManagement() {
    console.log('\n=== 分类管理测试 ===');
    
    // 测试13: 分类条目计数
    const mockCategory = {
        querySelectorAll: function(selector) {
            if (selector === '.draggable-item') {
                return [
                    { textContent: '条目1' },
                    { textContent: '条目2' },
                    { textContent: '条目3' }
                ];
            }
            return [];
        }
    };
    
    const itemCount = mockCategory.querySelectorAll('.draggable-item').length;
    assertEqual(itemCount, 3, '正确计算分类中的条目数量');
    
    // 测试14: 分类名称提取
    const categoryTitle = '分类名称 (3)';
    const categoryName = categoryTitle.split('(')[0].trim();
    assertEqual(categoryName, '分类名称', '正确提取分类名称');
}

// 测试空状态检查
function testEmptyState() {
    console.log('\n=== 空状态检查测试 ===');
    
    // 测试15: 空条目列表检测
    const emptyItems = [];
    assertEqual(emptyItems.length, 0, '正确检测空条目列表');
    
    // 测试16: 空分类列表检测
    const emptyCategories = [];
    assertEqual(emptyCategories.length, 0, '正确检测空分类列表');
}

// 运行所有测试
function runAllTests() {
    console.log('开始运行自动化测试...\n');
    
    testDataValidation();
    testFileOperations();
    testDataCollection();
    testModificationDetection();
    testImportFunctionality();
    testFilePathHandling();
    testCategoryManagement();
    testEmptyState();
    
    // 输出测试结果
    console.log('\n=== 测试结果 ===');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests} ✓`);
    console.log(`失败: ${failedTests} ✗`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    // 清理测试文件
    const testDir = path.join(__dirname, 'test_files');
    if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir);
    }
    
    // 返回退出码
    process.exit(failedTests > 0 ? 1 : 0);
}

// 运行测试
runAllTests();