<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>搜索功能自动化测试</title>
    <style>
        body {
            font-family: 'Noto Sans SC', sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .test-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .test-section h3 {
            margin-top: 0;
            color: #667eea;
        }
        .test-result {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
        .test-result.pass {
            background: #d4edda;
            color: #155724;
        }
        .test-result.fail {
            background: #f8d7da;
            color: #721c24;
        }
        .test-result.info {
            background: #d1ecf1;
            color: #0c5460;
        }
        .test-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .stat-item {
            flex: 1;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
        }
        .stat-label {
            color: #666;
        }
        button {
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #5568d3;
        }
        .test-data {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <h1>🔍 搜索功能自动化测试</h1>
        
        <div class="test-stats">
            <div class="stat-item">
                <div class="stat-value" id="totalTests">0</div>
                <div class="stat-label">总测试数</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="passedTests" style="color: #28a745;">0</div>
                <div class="stat-label">通过</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="failedTests" style="color: #dc3545;">0</div>
                <div class="stat-label">失败</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="passRate">0%</div>
                <div class="stat-label">通过率</div>
            </div>
        </div>
        
        <button onclick="runAllTests()">🚀 运行所有测试</button>
        
        <div id="testResults"></div>
    </div>

    <script src="main.js"></script>
    <script>
        // 测试结果统计
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;

        // 测试辅助函数
        function assert(condition, testName, details = '') {
            totalTests++;
            const resultDiv = document.createElement('div');
            resultDiv.className = `test-result ${condition ? 'pass' : 'fail'}`;
            resultDiv.innerHTML = `<strong>${condition ? '✓' : '✗'} ${testName}</strong>${details ? `<br><small>${details}</small>` : ''}`;
            document.getElementById('testResults').appendChild(resultDiv);
            
            if (condition) {
                passedTests++;
            } else {
                failedTests++;
            }
            updateStats();
        }

        function updateStats() {
            document.getElementById('totalTests').textContent = totalTests;
            document.getElementById('passedTests').textContent = passedTests;
            document.getElementById('failedTests').textContent = failedTests;
            document.getElementById('passRate').textContent = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%';
        }

        function log(message) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'test-result info';
            resultDiv.innerHTML = message;
            document.getElementById('testResults').appendChild(resultDiv);
        }

        // 测试数据生成器
        function generateTestData() {
            return {
                version: '1.0',
                createdAt: '2026-01-16T04:03:45.920Z',
                items: [
                    '1123'
                ],
                categories: [
                    {
                        name: '222',
                        items: ['111']
                    },
                    {
                        name: '333',
                        items: ['222']
                    }
                ]
            };
        }

        // 加载测试数据
        function loadTestData() {
            const data = generateTestData();
            
            // 清空现有数据
            const itemContainer = document.getElementById('itemContainer');
            const categoryContainer = document.getElementById('categoryContainer');
            
            itemContainer.innerHTML = '';
            categoryContainer.innerHTML = '';
            
            // 加载条目
            data.items.forEach((itemText, index) => {
                const itemId = 'test-item-' + index;
                const item = createItemElement(itemText, itemId, itemContainer);
                itemContainer.appendChild(item);
            });
            
            // 加载分类
            data.categories.forEach((categoryData, index) => {
                const categoryId = 'test-category-' + index;
                const category = createCategoryElement(categoryData.name, categoryId, categoryContainer);
                categoryContainer.appendChild(category);
                
                // 加载分类中的条目
                if (categoryData.items && categoryData.items.length > 0) {
                    const categoryItems = category.querySelector('.category-items');
                    categoryData.items.forEach((itemText, itemIndex) => {
                        const itemId = 'test-cat-item-' + index + '-' + itemIndex;
                        const item = createItemElement(itemText, itemId, categoryItems);
                        categoryItems.appendChild(item);
                    });
                    updateCategoryItemCount(category);
                }
            });
            
            checkEmpty();
            checkCategoryEmpty();
            
            log('✅ 测试数据加载完成');
        }

        // 测试1: 单字符搜索
        function testSingleCharSearch() {
            log('📝 测试1: 单字符搜索"1"');
            
            // 清除之前的搜索
            clearSearch();
            
            // 搜索"1"
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '1';
            handleSearch('1');
            
            // 检查高亮数量
            const highlights = document.querySelectorAll('mark.search-highlight');
            const expectedMatches = 3; // 1123中有3个"1"，111中有3个"1"
            
            assert(highlights.length === expectedMatches, 
                   `单字符搜索"1"应找到${expectedMatches}个匹配`,
                   `实际找到: ${highlights.length}个`);
            
            // 清除搜索
            clearSearch();
        }

        // 测试2: 多字符搜索
        function testMultiCharSearch() {
            log('📝 测试2: 多字符搜索"22"');
            
            clearSearch();
            
            handleSearch('22');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const expectedMatches = 3; // 222中有2个"22"，222条目中有1个"22"
            
            assert(highlights.length === expectedMatches,
                   `多字符搜索"22"应找到${expectedMatches}个匹配`,
                   `实际找到: ${highlights.length}个`);
            
            clearSearch();
        }

        // 测试3: 搜索条目列表
        function testSearchItems() {
            log('📝 测试3: 搜索条目列表"1123"');
            
            clearSearch();
            
            handleSearch('1123');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const expectedMatches = 1;
            
            assert(highlights.length === expectedMatches,
                   `搜索条目列表应找到${expectedMatches}个匹配`,
                   `实际找到: ${highlights.length}个`);
            
            // 检查高亮是否在条目列表中
            const itemContainer = document.getElementById('itemContainer');
            const itemHighlights = itemContainer.querySelectorAll('mark.search-highlight');
            
            assert(itemHighlights.length === 1,
                   '高亮应在条目列表中',
                   `条目列表中高亮数: ${itemHighlights.length}`);
            
            clearSearch();
        }

        // 测试4: 搜索分类标题
        function testSearchCategoryTitles() {
            log('📝 测试4: 搜索分类标题"333"');
            
            clearSearch();
            
            handleSearch('333');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const categoryContainer = document.getElementById('categoryContainer');
            const categoryHighlights = categoryContainer.querySelectorAll('mark.search-highlight');
            
            assert(categoryHighlights.length > 0,
                   '高亮应在分类标题中',
                   `分类标题中高亮数: ${categoryHighlights.length}`);
            
            clearSearch();
        }

        // 测试5: 搜索分类中的条目
        function testSearchCategoryItems() {
            log('📝 测试5: 搜索分类中的条目"111"');
            
            clearSearch();
            
            handleSearch('111');
            
            const categoryContainer = document.getElementById('categoryContainer');
            const categoryItemHighlights = categoryContainer.querySelectorAll('.category-items mark.search-highlight');
            
            assert(categoryItemHighlights.length > 0,
                   '高亮应在分类条目中',
                   `分类条目中高亮数: ${categoryItemHighlights.length}`);
            
            clearSearch();
        }

        // 测试6: 搜索不存在的文本
        function testSearchNonExistent() {
            log('📝 测试6: 搜索不存在的文本"不存在"');
            
            clearSearch();
            
            handleSearch('不存在');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const counter = document.getElementById('searchCounter');
            
            assert(highlights.length === 0,
                   '搜索不存在的文本应无高亮',
                   `实际高亮数: ${highlights.length}`);
            
            assert(counter.textContent === '',
                   '搜索无结果时计数器应为空',
                   `计数器内容: "${counter.textContent}"`);
            
            clearSearch();
        }

        // 测试7: 搜索空字符串
        function testSearchEmptyString() {
            log('📝 测试7: 搜索空字符串');
            
            // 先搜索一个存在的词
            handleSearch('1');
            assert(document.querySelectorAll('mark.search-highlight').length > 0,
                   '搜索"1"应有高亮');
            
            // 然后搜索空字符串
            handleSearch('');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            
            assert(highlights.length === 0,
                   '搜索空字符串应清除所有高亮',
                   `实际高亮数: ${highlights.length}`);
        }

        // 测试8: 多个匹配在同一元素
        function testMultipleMatchesInSameElement() {
            log('📝 测试8: 多个匹配在同一元素（搜索"1"在"111"中）');
            
            // 创建一个包含重复字符的条目
            const itemContainer = document.getElementById('itemContainer');
            const testItem = createItemElement('111', 'test-duplicate', itemContainer);
            itemContainer.appendChild(testItem);
            
            clearSearch();
            handleSearch('1');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const testItemHighlights = testItem.querySelectorAll('mark.search-highlight');
            
            assert(testItemHighlights.length === 3,
                   '同一元素中的多个字符应分别高亮',
                   `实际高亮数: ${testItemHighlights.length}`);
            
            // 清理测试条目
            testItem.remove();
            clearSearch();
        }

        // 测试9: 搜索导航功能
        function testSearchNavigation() {
            log('📝 测试9: 搜索导航功能');
            
            clearSearch();
            
            // 搜索"1"，应该有多个匹配
            handleSearch('1');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            
            if (highlights.length > 0) {
                // 测试下一个按钮
                const initialCurrent = document.querySelector('.search-highlight.current');
                assert(initialCurrent !== null,
                       '应该有初始当前高亮');
                
                // 点击下一个
                navigateSearch(1);
                const newCurrent = document.querySelector('.search-highlight.current');
                assert(newCurrent !== null,
                       '点击下一个后应有新的当前高亮');
                
                // 测试上一个按钮
                navigateSearch(-1);
                const backCurrent = document.querySelector('.search-highlight.current');
                assert(backCurrent !== null,
                       '点击上一个后应有新的当前高亮');
            } else {
                assert(false, '搜索"1"应有匹配结果');
            }
            
            clearSearch();
        }

        // 测试10: 搜索后清除
        function testSearchClear() {
            log('📝 测试10: 搜索后清除');
            
            clearSearch();
            
            // 搜索并验证有高亮
            handleSearch('1');
            assert(document.querySelectorAll('mark.search-highlight').length > 0,
                   '搜索后应有高亮');
            
            // 清除搜索
            clearSearch();
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const counter = document.getElementById('searchCounter');
            
            assert(highlights.length === 0,
                   '清除后应无高亮',
                   `实际高亮数: ${highlights.length}`);
            
            assert(counter.textContent === '',
                   '清除后计数器应为空',
                   `计数器内容: "${counter.textContent}"`);
        }

        // 测试11: 连续搜索
        function testConsecutiveSearch() {
            log('📝 测试11: 连续搜索（先搜"1"再搜"12"）');
            
            clearSearch();
            
            // 先搜索"1"
            handleSearch('1');
            const firstHighlights = document.querySelectorAll('mark.search-highlight');
            
            // 再搜索"12"
            handleSearch('12');
            const secondHighlights = document.querySelectorAll('mark.search-highlight');
            
            // 检查第一次搜索的高亮是否被清除
            assert(document.querySelectorAll('mark.search-highlight').length === secondHighlights.length,
                   '第二次搜索应清除第一次的高亮',
                   `第一次高亮数: ${firstHighlights.length}, 第二次高亮数: ${secondHighlights.length}`);
            
            clearSearch();
        }

        // 测试12: 搜索计数器
        function testSearchCounter() {
            log('📝 测试12: 搜索计数器');
            
            clearSearch();
            
            handleSearch('1');
            
            const highlights = document.querySelectorAll('mark.search-highlight');
            const counter = document.getElementById('searchCounter');
            
            assert(counter.textContent !== '',
                   '有结果时计数器应显示',
                   `计数器内容: "${counter.textContent}"`);
            
            // 验证计数器格式
            const counterMatch = counter.textContent.match(/^(\d+)\/(\d+)$/);
            assert(counterMatch !== null,
                   '计数器格式应为"当前/总数"',
                   `实际格式: "${counter.textContent}"`);
            
            clearSearch();
        }

        // 测试13: 大小写不敏感
        function testCaseInsensitiveSearch() {
            log('📝 测试13: 大小写不敏感搜索');
            
            clearSearch();
            
            // 搜索小写
            handleSearch('222');
            const lowerCaseHighlights = document.querySelectorAll('mark.search-highlight');
            
            clearSearch();
            
            // 搜索大写
            handleSearch('222'.toUpperCase());
            const upperCaseHighlights = document.querySelectorAll('mark.search-highlight');
            
            assert(lowerCaseHighlights.length === upperCaseHighlights.length,
                   '大小写搜索结果数量应相同',
                   `小写: ${lowerCaseHighlights.length}, 大写: ${upperCaseHighlights.length}`);
            
            clearSearch();
        }

        // 测试14: 搜索特殊字符
        function testSpecialCharSearch() {
            log('📝 测试14: 搜索包含数字的文本');
            
            clearSearch();
            
            // 创建包含数字的测试条目
            const itemContainer = document.getElementById('itemContainer');
            const testItem = createItemElement('测试-数字_123', 'test-special', itemContainer);
            itemContainer.appendChild(testItem);
            
            handleSearch('123');
            const highlights = document.querySelectorAll('mark.search-highlight');
            
            assert(highlights.length > 0,
                   '应能搜索到包含数字的文本',
                   `实际高亮数: ${highlights.length}`);
            
            // 清理
            testItem.remove();
            clearSearch();
        }

        // 运行所有测试
        function runAllTests() {
            log('🚀 开始运行所有测试...\n');
            
            // 清空测试结果
            document.getElementById('testResults').innerHTML = '';
            totalTests = 0;
            passedTests = 0;
            failedTests = 0;
            updateStats();
            
            // 加载测试数据
            loadTestData();
            
            // 等待DOM更新
            setTimeout(() => {
                // 运行所有测试
                testSingleCharSearch();
                testMultiCharSearch();
                testSearchItems();
                testSearchCategoryTitles();
                testSearchCategoryItems();
                testSearchNonExistent();
                testSearchEmptyString();
                testMultipleMatchesInSameElement();
                testSearchNavigation();
                testSearchClear();
                testConsecutiveSearch();
                testSearchCounter();
                testCaseInsensitiveSearch();
                testSpecialCharSearch();
                
                log('\n✅ 所有测试完成！');
                log(`📊 总计: ${totalTests}个测试, ${passedTests}个通过, ${failedTests}个失败`);
                log(`📈 通过率: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%`);
            }, 100);
        }

        // 页面加载时显示说明
        window.addEventListener('load', () => {
            log('📋 点击"运行所有测试"按钮开始测试');
            log('💡 测试将自动加载测试数据并执行各种搜索场景');
        });
    </script>
</body>
</html>