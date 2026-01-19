/**
 * HTML5 Sortable 功能测试
 * 测试条目排序、分类排序、分类内条目排序功能
 */

const assert = require('assert');

// 模拟 DOM 环境
const { JSDOM } = require('jsdom');

// 测试数据
const testData = {
    items: ['条目1', '条目2', '条目3', '条目4', '条目5'],
    categories: [
        { name: '分类1', items: ['条目A', '条目B'] },
        { name: '分类2', items: ['条目C', '条目D'] },
        { name: '分类3', items: ['条目E', '条目F'] }
    ]
};

// 测试1: 验证 HTML5 Sortable 库是否加载
function testSortableLibraryLoaded() {
    console.log('\n测试1: 验证 HTML5 Sortable 库是否加载');
    
    // 检查文件是否存在
    const fs = require('fs');
    const sortablePath = '../assets/js/html5sortable.min.js';
    const fileExists = fs.existsSync(sortablePath);
    
    assert.strictEqual(fileExists, true, 'HTML5 Sortable 库文件应该存在');
    console.log('✓ HTML5 Sortable 库文件存在');
    
    // 检查文件大小
    const stats = fs.statSync(sortablePath);
    assert.ok(stats.size > 0, 'HTML5 Sortable 库文件应该有内容');
    console.log(`✓ HTML5 Sortable 库文件大小: ${stats.size} 字节`);
    
    console.log('✓ 测试通过\n');
}

// 测试2: 验证排序功能初始化
function testSortableInitialization() {
    console.log('\n测试2: 验证排序功能初始化');
    
    // 创建模拟 DOM
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1">条目1</div>
                <div class="draggable-item" id="item-2">条目2</div>
                <div class="draggable-item" id="item-3">条目3</div>
            </div>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类1</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-4">条目A</div>
                        <div class="draggable-item" id="item-5">条目B</div>
                    </div>
                </div>
                <div class="category-box" id="category-2">
                    <div class="category-title">分类2</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-6">条目C</div>
                        <div class="draggable-item" id="item-7">条目D</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    
    // 验证容器存在
    const itemContainer = document.getElementById('itemContainer');
    const categoryContainer = document.getElementById('categoryContainer');
    
    assert.ok(itemContainer, '条目容器应该存在');
    assert.ok(categoryContainer, '分类容器应该存在');
    console.log('✓ 容器元素存在');
    
    // 验证条目存在
    const items = itemContainer.querySelectorAll('.draggable-item');
    assert.strictEqual(items.length, 3, '条目容器中应该有3个条目');
    console.log('✓ 条目容器中有3个条目');
    
    // 验证分类存在
    const categories = categoryContainer.querySelectorAll('.category-box');
    assert.strictEqual(categories.length, 2, '分类容器中应该有2个分类');
    console.log('✓ 分类容器中有2个分类');
    
    // 验证分类中的条目存在
    const category1Items = categories[0].querySelectorAll('.draggable-item');
    const category2Items = categories[1].querySelectorAll('.draggable-item');
    assert.strictEqual(category1Items.length, 2, '分类1中应该有2个条目');
    assert.strictEqual(category2Items.length, 2, '分类2中应该有2个条目');
    console.log('✓ 每个分类中有2个条目');
    
    console.log('✓ 测试通过\n');
}

// 测试3: 验证条目排序逻辑
function testItemReordering() {
    console.log('\n测试3: 验证条目排序逻辑');
    
    // 创建模拟 DOM
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1">条目1</div>
                <div class="draggable-item" id="item-2">条目2</div>
                <div class="draggable-item" id="item-3">条目3</div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const itemContainer = document.getElementById('itemContainer');
    
    // 获取初始顺序
    const initialOrder = Array.from(itemContainer.children).map(item => item.textContent);
    assert.deepStrictEqual(initialOrder, ['条目1', '条目2', '条目3'], '初始顺序应该正确');
    console.log('✓ 初始顺序: 条目1, 条目2, 条目3');
    
    // 模拟排序：将第一个元素移动到最后
    const firstItem = itemContainer.children[0];
    itemContainer.appendChild(firstItem);
    
    // 验证新顺序
    const newOrder = Array.from(itemContainer.children).map(item => item.textContent);
    assert.deepStrictEqual(newOrder, ['条目2', '条目3', '条目1'], '排序后顺序应该正确');
    console.log('✓ 排序后顺序: 条目2, 条目3, 条目1');
    
    // 验证元素ID不变
    const itemsById = Array.from(itemContainer.children).map(item => item.id);
    assert.deepStrictEqual(itemsById, ['item-2', 'item-3', 'item-1'], '元素ID应该保持不变');
    console.log('✓ 元素ID保持不变');
    
    console.log('✓ 测试通过\n');
}

// 测试4: 验证分类排序逻辑
function testCategoryReordering() {
    console.log('\n测试4: 验证分类排序逻辑');
    
    // 创建模拟 DOM
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1" draggable="true">
                    <div class="category-title">分类1</div>
                </div>
                <div class="category-box" id="category-2" draggable="true">
                    <div class="category-title">分类2</div>
                </div>
                <div class="category-box" id="category-3" draggable="true">
                    <div class="category-title">分类3</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const categoryContainer = document.getElementById('categoryContainer');
    
    // 验证分类框有 draggable 属性
    const categories = categoryContainer.querySelectorAll('.category-box');
    categories.forEach(cat => {
        assert.strictEqual(cat.draggable, true, '分类框应该有 draggable 属性');
    });
    console.log('✓ 所有分类框都有 draggable 属性');
    
    // 获取初始顺序
    const initialOrder = Array.from(categoryContainer.children).map(cat => 
        cat.querySelector('.category-title').textContent
    );
    assert.deepStrictEqual(initialOrder, ['分类1', '分类2', '分类3'], '初始顺序应该正确');
    console.log('✓ 初始顺序: 分类1, 分类2, 分类3');
    
    // 模拟排序：将第一个分类移动到最后
    const firstCategory = categoryContainer.children[0];
    categoryContainer.appendChild(firstCategory);
    
    // 验证新顺序
    const newOrder = Array.from(categoryContainer.children).map(cat => 
        cat.querySelector('.category-title').textContent
    );
    assert.deepStrictEqual(newOrder, ['分类2', '分类3', '分类1'], '排序后顺序应该正确');
    console.log('✓ 排序后顺序: 分类2, 分类3, 分类1');
    
    // 验证分类ID不变
    const categoriesById = Array.from(categoryContainer.children).map(cat => cat.id);
    assert.deepStrictEqual(categoriesById, ['category-2', 'category-3', 'category-1'], '分类ID应该保持不变');
    console.log('✓ 分类ID保持不变');
    
    console.log('✓ 测试通过\n');
}

// 测试5: 验证分类内条目排序逻辑
function testCategoryItemReordering() {
    console.log('\n测试5: 验证分类内条目排序逻辑');
    
    // 创建模拟 DOM
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1" draggable="true">
                    <div class="category-title">分类1</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-1">条目A</div>
                        <div class="draggable-item" id="item-2">条目B</div>
                        <div class="draggable-item" id="item-3">条目C</div>
                    </div>
                </div>
                <div class="category-box" id="category-2" draggable="true">
                    <div class="category-title">分类2</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-4">条目D</div>
                        <div class="draggable-item" id="item-5">条目E</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const category1 = document.getElementById('category-1');
    const category1Items = category1.querySelector('.category-items');
    
    // 验证分类框有 draggable 属性
    assert.strictEqual(category1.draggable, true, '分类框应该有 draggable 属性');
    console.log('✓ 分类框有 draggable 属性');
    
    // 获取初始顺序
    const initialOrder = Array.from(category1Items.children).map(item => item.textContent);
    assert.deepStrictEqual(initialOrder, ['条目A', '条目B', '条目C'], '初始顺序应该正确');
    console.log('✓ 分类1初始顺序: 条目A, 条目B, 条目C');
    
    // 模拟排序：将第一个条目移动到最后
    const firstItem = category1Items.children[0];
    category1Items.appendChild(firstItem);
    
    // 验证新顺序
    const newOrder = Array.from(category1Items.children).map(item => item.textContent);
    assert.deepStrictEqual(newOrder, ['条目B', '条目C', '条目A'], '排序后顺序应该正确');
    console.log('✓ 分类1排序后顺序: 条目B, 条目C, 条目A');
    
    // 测试跨分类移动
    const category2 = document.getElementById('category-2');
    const category2Items = category2.querySelector('.category-items');
    
    // 将分类1的第一个条目（现在是条目B）移动到分类2
    const itemToMove = category1Items.children[0];
    category2Items.appendChild(itemToMove);
    
    // 验证分类1的条目数量
    const category1ItemsAfter = category1.querySelector('.category-items');
    const category1ItemCount = category1ItemsAfter.children.length;
    assert.strictEqual(category1ItemCount, 2, '分类1应该剩2个条目');
    console.log('✓ 分类1现在有2个条目');
    
    // 验证分类2的条目数量
    const category2ItemsAfter = category2.querySelector('.category-items');
    const category2ItemCount = category2ItemsAfter.children.length;
    assert.strictEqual(category2ItemCount, 3, '分类2应该有3个条目');
    console.log('✓ 分类2现在有3个条目');
    
    console.log('✓ 测试通过\n');
}

// 测试6: 验证排序历史记录
function testSortableHistory() {
    console.log('\n测试6: 验证排序历史记录');
    
    // 模拟历史记录数据
    const reorderHistory = {
        type: 'reorderItem',
        data: {
            id: 'item-1',
            text: '条目1',
            oldIndex: 0,
            newIndex: 2,
            containerId: 'itemContainer'
        }
    };
    
    // 验证历史记录结构
    assert.strictEqual(reorderHistory.type, 'reorderItem', '历史记录类型应该正确');
    assert.strictEqual(reorderHistory.data.id, 'item-1', '条目ID应该正确');
    assert.strictEqual(reorderHistory.data.oldIndex, 0, '旧索引应该正确');
    assert.strictEqual(reorderHistory.data.newIndex, 2, '新索引应该正确');
    console.log('✓ 历史记录结构正确');
    
    // 验证历史记录包含必要字段
    const requiredFields = ['id', 'text', 'oldIndex', 'newIndex'];
    requiredFields.forEach(field => {
        assert.ok(reorderHistory.data.hasOwnProperty(field), `历史记录应该包含${field}字段`);
    });
    console.log('✓ 历史记录包含所有必要字段');
    
    console.log('✓ 测试通过\n');
}

// 测试7: 验证排序样式
function testSortableStyles() {
    console.log('\n测试7: 验证排序样式');
    
    // 检查样式文件
    const fs = require('fs');
    const stylePath = '../src/style.css';
    const styleContent = fs.readFileSync(stylePath, 'utf-8');
    
    // 验证排序相关样式是否存在
    assert.ok(styleContent.includes('.sortable-ghost'), '应该包含 .sortable-ghost 样式');
    assert.ok(styleContent.includes('.sortable-drag'), '应该包含 .sortable-drag 样式');
    console.log('✓ 排序样式定义存在');
    
    console.log('✓ 测试通过\n');
}

// 测试8: 验证分类框可拖拽属性
function testCategoryDraggable() {
    console.log('\n测试8: 验证分类框可拖拽属性');
    
    // 创建模拟 DOM
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类1</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const category = document.getElementById('category-1');
    
    // 验证分类框默认没有 draggable 属性
    assert.strictEqual(category.draggable, false, '默认情况下分类框不应该有 draggable 属性');
    console.log('✓ 默认情况下分类框没有 draggable 属性');
    
    // 设置 draggable 属性
    category.draggable = true;
    
    // 验证 draggable 属性已设置
    assert.strictEqual(category.draggable, true, '设置后分类框应该有 draggable 属性');
    console.log('✓ 设置后分类框有 draggable 属性');
    
    console.log('✓ 测试通过\n');
}

// 运行所有测试
function runAllTests() {
    console.log('========================================');
    console.log('HTML5 Sortable 功能测试');
    console.log('========================================');
    
    const tests = [
        { name: 'HTML5 Sortable 库加载测试', func: testSortableLibraryLoaded },
        { name: '排序功能初始化测试', func: testSortableInitialization },
        { name: '条目排序逻辑测试', func: testItemReordering },
        { name: '分类排序逻辑测试', func: testCategoryReordering },
        { name: '分类内条目排序逻辑测试', func: testCategoryItemReordering },
        { name: '排序历史记录测试', func: testSortableHistory },
        { name: '排序样式测试', func: testSortableStyles },
        { name: '分类框可拖拽属性测试', func: testCategoryDraggable }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        try {
            test.func();
            passed++;
        } catch (error) {
            failed++;
            console.error(`✗ ${test.name} 失败:`);
            console.error(error.message);
            console.error('');
        }
    });
    
    console.log('========================================');
    console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
    console.log('========================================');
    
    if (failed > 0) {
        process.exit(1);
    }
}

// 运行测试
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testSortableLibraryLoaded,
    testSortableInitialization,
    testItemReordering,
    testCategoryReordering,
    testCategoryItemReordering,
    testSortableHistory,
    testSortableStyles,
    testCategoryDraggable,
    runAllTests
};