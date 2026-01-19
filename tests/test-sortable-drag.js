/**
 * HTML5 Sortable 拖拽功能 DOM 操作测试
 * 测试拖拽后的DOM结构变化：上拖、下拖、拖到中间、拖到第一个、拖到最后一个
 */

const { JSDOM } = require('jsdom');
const assert = require('assert');

// 辅助函数：模拟拖拽操作（直接DOM操作）
function simulateDrag(element, targetContainer, targetIndex) {
    // 获取目标容器中的所有元素
    const items = Array.from(targetContainer.querySelectorAll('.draggable-item, .category-box'));
    
    // 如果目标索引超出范围，添加到末尾
    if (targetIndex >= items.length) {
        targetContainer.appendChild(element);
    } else {
        // 插入到指定位置
        const targetElement = items[targetIndex];
        targetContainer.insertBefore(element, targetElement);
    }
}

// 辅助函数：获取元素顺序
function getOrder(container, selector) {
    return Array.from(container.querySelectorAll(selector)).map(el => el.textContent);
}

console.log('========================================');
console.log('HTML5 Sortable 拖拽功能 DOM 操作测试');
console.log('========================================');
console.log('测试场景：');
console.log('1. 条目上拖（将最后一个拖到第一个位置）');
console.log('2. 条目下拖（将第一个拖到最后一个位置）');
console.log('3. 条目拖到中间位置');
console.log('4. 分类上拖（将最后一个分类拖到第一个位置）');
console.log('5. 分类下拖（将第一个分类拖到最后一个位置）');
console.log('6. 分类内条目上拖（将最后一个条目拖到第一个位置）');
console.log('7. 分类内条目下拖（将第一个条目拖到最后一个位置）');
console.log('8. 跨分类拖拽（将条目从一个分类拖到另一个分类）');
console.log('9. 连续多次拖拽');
console.log('10. 拖拽后验证元素属性保持不变');
console.log('========================================\n');

let passedTests = 0;
let failedTests = 0;

// 测试1：条目上拖（将最后一个拖到第一个位置）
try {
    console.log('\n测试1：条目上拖（将最后一个拖到第一个位置）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1">条目1</div>
                <div class="draggable-item" id="item-2">条目2</div>
                <div class="draggable-item" id="item-3">条目3</div>
                <div class="draggable-item" id="item-4">条目4</div>
                <div class="draggable-item" id="item-5">条目5</div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const itemContainer = document.getElementById('itemContainer');
    
    // 获取初始顺序
    const initialOrder = getOrder(itemContainer, '.draggable-item');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['条目1', '条目2', '条目3', '条目4', '条目5']);
    
    // 模拟拖拽：将最后一个拖到第一个位置
    const lastItem = itemContainer.querySelector('.draggable-item:last-child');
    simulateDrag(lastItem, itemContainer, 0);
    
    // 验证新顺序
    const newOrder = getOrder(itemContainer, '.draggable-item');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['条目5', '条目1', '条目2', '条目3', '条目4']);
    
    // 验证元素ID保持不变
    const itemsById = Array.from(itemContainer.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsById, ['item-5', 'item-1', 'item-2', 'item-3', 'item-4']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试2：条目下拖（将第一个拖到最后一个位置）
try {
    console.log('\n测试2：条目下拖（将第一个拖到最后一个位置）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1">条目1</div>
                <div class="draggable-item" id="item-2">条目2</div>
                <div class="draggable-item" id="item-3">条目3</div>
                <div class="draggable-item" id="item-4">条目4</div>
                <div class="draggable-item" id="item-5">条目5</div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const itemContainer = document.getElementById('itemContainer');
    
    // 获取初始顺序
    const initialOrder = getOrder(itemContainer, '.draggable-item');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['条目1', '条目2', '条目3', '条目4', '条目5']);
    
    // 模拟拖拽：将第一个拖到最后一个位置
    const firstItem = itemContainer.querySelector('.draggable-item:first-child');
    simulateDrag(firstItem, itemContainer, 5); // 超出索引，会添加到末尾
    
    // 验证新顺序
    const newOrder = getOrder(itemContainer, '.draggable-item');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['条目2', '条目3', '条目4', '条目5', '条目1']);
    
    // 验证元素ID保持不变
    const itemsById = Array.from(itemContainer.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsById, ['item-2', 'item-3', 'item-4', 'item-5', 'item-1']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试3：条目拖到中间位置
try {
    console.log('\n测试3：条目拖到中间位置');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1">条目1</div>
                <div class="draggable-item" id="item-2">条目2</div>
                <div class="draggable-item" id="item-3">条目3</div>
                <div class="draggable-item" id="item-4">条目4</div>
                <div class="draggable-item" id="item-5">条目5</div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const itemContainer = document.getElementById('itemContainer');
    
    // 获取初始顺序
    const initialOrder = getOrder(itemContainer, '.draggable-item');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['条目1', '条目2', '条目3', '条目4', '条目5']);
    
    // 模拟拖拽：将第一个拖到中间位置（索引2，即第三个位置）
    const firstItem = itemContainer.querySelector('.draggable-item:first-child');
    simulateDrag(firstItem, itemContainer, 2);
    
    // 验证新顺序
    const newOrder = getOrder(itemContainer, '.draggable-item');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['条目2', '条目3', '条目1', '条目4', '条目5']);
    
    // 验证元素ID保持不变
    const itemsById = Array.from(itemContainer.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsById, ['item-2', 'item-3', 'item-1', 'item-4', 'item-5']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试4：分类上拖（将最后一个分类拖到第一个位置）
try {
    console.log('\n测试4：分类上拖（将最后一个分类拖到第一个位置）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类1</div>
                </div>
                <div class="category-box" id="category-2">
                    <div class="category-title">分类2</div>
                </div>
                <div class="category-box" id="category-3">
                    <div class="category-title">分类3</div>
                </div>
                <div class="category-box" id="category-4">
                    <div class="category-title">分类4</div>
                </div>
                <div class="category-box" id="category-5">
                    <div class="category-title">分类5</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const categoryContainer = document.getElementById('categoryContainer');
    
    // 获取初始顺序
    const initialOrder = getOrder(categoryContainer, '.category-box');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['分类1', '分类2', '分类3', '分类4', '分类5']);
    
    // 模拟拖拽：将最后一个拖到第一个位置
    const lastCategory = categoryContainer.querySelector('.category-box:last-child');
    simulateDrag(lastCategory, categoryContainer, 0);
    
    // 验证新顺序
    const newOrder = getOrder(categoryContainer, '.category-box');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['分类5', '分类1', '分类2', '分类3', '分类4']);
    
    // 验证元素ID保持不变
    const categoriesById = Array.from(categoryContainer.querySelectorAll('.category-box')).map(el => el.id);
    assert.deepStrictEqual(categoriesById, ['category-5', 'category-1', 'category-2', 'category-3', 'category-4']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试5：分类下拖（将第一个分类拖到最后一个位置）
try {
    console.log('\n测试5：分类下拖（将第一个分类拖到最后一个位置）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类1</div>
                </div>
                <div class="category-box" id="category-2">
                    <div class="category-title">分类2</div>
                </div>
                <div class="category-box" id="category-3">
                    <div class="category-title">分类3</div>
                </div>
                <div class="category-box" id="category-4">
                    <div class="category-title">分类4</div>
                </div>
                <div class="category-box" id="category-5">
                    <div class="category-title">分类5</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const categoryContainer = document.getElementById('categoryContainer');
    
    // 获取初始顺序
    const initialOrder = getOrder(categoryContainer, '.category-box');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['分类1', '分类2', '分类3', '分类4', '分类5']);
    
    // 模拟拖拽：将第一个拖到最后一个位置
    const firstCategory = categoryContainer.querySelector('.category-box:first-child');
    simulateDrag(firstCategory, categoryContainer, 5); // 超出索引，会添加到末尾
    
    // 验证新顺序
    const newOrder = getOrder(categoryContainer, '.category-box');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['分类2', '分类3', '分类4', '分类5', '分类1']);
    
    // 验证元素ID保持不变
    const categoriesById = Array.from(categoryContainer.querySelectorAll('.category-box')).map(el => el.id);
    assert.deepStrictEqual(categoriesById, ['category-2', 'category-3', 'category-4', 'category-5', 'category-1']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试6：分类内条目上拖（将最后一个条目拖到第一个位置）
try {
    console.log('\n测试6：分类内条目上拖（将最后一个条目拖到第一个位置）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类1</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-1">条目1</div>
                        <div class="draggable-item" id="item-2">条目2</div>
                        <div class="draggable-item" id="item-3">条目3</div>
                        <div class="draggable-item" id="item-4">条目4</div>
                        <div class="draggable-item" id="item-5">条目5</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const category1 = document.getElementById('category-1');
    const category1Items = category1.querySelector('.category-items');
    
    // 获取初始顺序
    const initialOrder = getOrder(category1Items, '.draggable-item');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['条目1', '条目2', '条目3', '条目4', '条目5']);
    
    // 模拟拖拽：将最后一个拖到第一个位置
    const lastItem = category1Items.querySelector('.draggable-item:last-child');
    simulateDrag(lastItem, category1Items, 0);
    
    // 验证新顺序
    const newOrder = getOrder(category1Items, '.draggable-item');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['条目5', '条目1', '条目2', '条目3', '条目4']);
    
    // 验证元素ID保持不变
    const itemsById = Array.from(category1Items.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsById, ['item-5', 'item-1', 'item-2', 'item-3', 'item-4']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试7：分类内条目下拖（将第一个条目拖到最后一个位置）
try {
    console.log('\n测试7：分类内条目下拖（将第一个条目拖到最后一个位置）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类1</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-1">条目1</div>
                        <div class="draggable-item" id="item-2">条目2</div>
                        <div class="draggable-item" id="item-3">条目3</div>
                        <div class="draggable-item" id="item-4">条目4</div>
                        <div class="draggable-item" id="item-5">条目5</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const category1 = document.getElementById('category-1');
    const category1Items = category1.querySelector('.category-items');
    
    // 获取初始顺序
    const initialOrder = getOrder(category1Items, '.draggable-item');
    console.log('初始顺序:', initialOrder);
    assert.deepStrictEqual(initialOrder, ['条目1', '条目2', '条目3', '条目4', '条目5']);
    
    // 模拟拖拽：将第一个拖到最后一个位置
    const firstItem = category1Items.querySelector('.draggable-item:first-child');
    simulateDrag(firstItem, category1Items, 5); // 超出索引，会添加到末尾
    
    // 验证新顺序
    const newOrder = getOrder(category1Items, '.draggable-item');
    console.log('拖拽后顺序:', newOrder);
    assert.deepStrictEqual(newOrder, ['条目2', '条目3', '条目4', '条目5', '条目1']);
    
    // 验证元素ID保持不变
    const itemsById = Array.from(category1Items.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsById, ['item-2', 'item-3', 'item-4', 'item-5', 'item-1']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试8：跨分类拖拽（将条目从一个分类拖到另一个分类）
try {
    console.log('\n测试8：跨分类拖拽（将条目从一个分类拖到另一个分类）');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="categoryContainer">
                <div class="category-box" id="category-1">
                    <div class="category-title">分类A</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-1">条目A1</div>
                        <div class="draggable-item" id="item-2">条目A2</div>
                        <div class="draggable-item" id="item-3">条目A3</div>
                    </div>
                </div>
                <div class="category-box" id="category-2">
                    <div class="category-title">分类B</div>
                    <div class="category-items">
                        <div class="draggable-item" id="item-4">条目B1</div>
                        <div class="draggable-item" id="item-5">条目B2</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const category1 = document.getElementById('category-1');
    const category2 = document.getElementById('category-2');
    const category1Items = category1.querySelector('.category-items');
    const category2Items = category2.querySelector('.category-items');
    
    // 获取初始状态
    const initialOrderA = getOrder(category1Items, '.draggable-item');
    const initialOrderB = getOrder(category2Items, '.draggable-item');
    console.log('分类A初始条目:', initialOrderA);
    console.log('分类B初始条目:', initialOrderB);
    assert.deepStrictEqual(initialOrderA, ['条目A1', '条目A2', '条目A3']);
    assert.deepStrictEqual(initialOrderB, ['条目B1', '条目B2']);
    
    // 模拟拖拽：将分类A的第一个条目拖到分类B
    const itemToMove = category1Items.querySelector('.draggable-item:first-child');
    simulateDrag(itemToMove, category2Items, 2); // 添加到末尾
    
    // 验证新状态
    const newOrderA = getOrder(category1Items, '.draggable-item');
    const newOrderB = getOrder(category2Items, '.draggable-item');
    console.log('分类A拖拽后条目:', newOrderA);
    console.log('分类B拖拽后条目:', newOrderB);
    assert.deepStrictEqual(newOrderA, ['条目A2', '条目A3']);
    assert.deepStrictEqual(newOrderB, ['条目B1', '条目B2', '条目A1']);
    
    // 验证元素ID保持不变
    const itemsByIdA = Array.from(category1Items.querySelectorAll('.draggable-item')).map(el => el.id);
    const itemsByIdB = Array.from(category2Items.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsByIdA, ['item-2', 'item-3']);
    assert.deepStrictEqual(itemsByIdB, ['item-4', 'item-5', 'item-1']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试9：连续多次拖拽
try {
    console.log('\n测试9：连续多次拖拽');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1">条目1</div>
                <div class="draggable-item" id="item-2">条目2</div>
                <div class="draggable-item" id="item-3">条目3</div>
                <div class="draggable-item" id="item-4">条目4</div>
                <div class="draggable-item" id="item-5">条目5</div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const itemContainer = document.getElementById('itemContainer');
    
    // 获取初始顺序
    let order = getOrder(itemContainer, '.draggable-item');
    console.log('初始顺序:', order);
    assert.deepStrictEqual(order, ['条目1', '条目2', '条目3', '条目4', '条目5']);
    
    // 第一次拖拽：将条目1拖到末尾
    const item1 = itemContainer.querySelector('.draggable-item:first-child');
    simulateDrag(item1, itemContainer, 5);
    
    order = getOrder(itemContainer, '.draggable-item');
    console.log('第一次拖拽后顺序:', order);
    assert.deepStrictEqual(order, ['条目2', '条目3', '条目4', '条目5', '条目1']);
    
    // 第二次拖拽：将条目5拖到开头
    const item5 = itemContainer.querySelector('.draggable-item:nth-child(4)');
    simulateDrag(item5, itemContainer, 0);
    
    order = getOrder(itemContainer, '.draggable-item');
    console.log('第二次拖拽后顺序:', order);
    assert.deepStrictEqual(order, ['条目5', '条目2', '条目3', '条目4', '条目1']);
    
    // 第三次拖拽：将条目3拖到中间
    const item3 = itemContainer.querySelector('.draggable-item:nth-child(3)');
    simulateDrag(item3, itemContainer, 3);
    
    order = getOrder(itemContainer, '.draggable-item');
    console.log('第三次拖拽后顺序:', order);
    assert.deepStrictEqual(order, ['条目5', '条目2', '条目4', '条目3', '条目1']);
    
    // 验证元素ID保持不变
    const itemsById = Array.from(itemContainer.querySelectorAll('.draggable-item')).map(el => el.id);
    assert.deepStrictEqual(itemsById, ['item-5', 'item-2', 'item-4', 'item-3', 'item-1']);
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 测试10：拖拽后验证元素属性保持不变
try {
    console.log('\n测试10：拖拽后验证元素属性保持不变');
    
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="itemContainer">
                <div class="draggable-item" id="item-1" data-test="test1">条目1</div>
                <div class="draggable-item" id="item-2" data-test="test2">条目2</div>
                <div class="draggable-item" id="item-3" data-test="test3">条目3</div>
            </div>
        </body>
        </html>
    `);
    
    const document = dom.window.document;
    const itemContainer = document.getElementById('itemContainer');
    
    // 获取初始属性
    const item1 = itemContainer.querySelector('#item-1');
    const initialId = item1.id;
    const initialTestClass = item1.getAttribute('data-test');
    const initialClass = item1.className;
    const initialText = item1.textContent;
    
    console.log('初始属性:', {
        id: initialId,
        'data-test': initialTestClass,
        class: initialClass,
        text: initialText
    });
    
    // 模拟拖拽
    simulateDrag(item1, itemContainer, 2);
    
    // 验证属性保持不变
    const newId = item1.id;
    const newTestClass = item1.getAttribute('data-test');
    const newClass = item1.className;
    const newText = item1.textContent;
    
    console.log('拖拽后属性:', {
        id: newId,
        'data-test': newTestClass,
        class: newClass,
        text: newText
    });
    
    assert.strictEqual(newId, initialId, 'ID应该保持不变');
    assert.strictEqual(newTestClass, initialTestClass, 'data-test属性应该保持不变');
    assert.strictEqual(newClass, initialClass, 'class应该保持不变');
    assert.strictEqual(newText, initialText, '文本内容应该保持不变');
    
    console.log('✓ 测试通过\n');
    passedTests++;
} catch (error) {
    console.log('✗ 测试失败:', error.message);
    console.log(error.stack);
    failedTests++;
}

// 输出测试结果
console.log('========================================');
console.log('测试结果总结');
console.log('========================================');
console.log(`通过: ${passedTests}`);
console.log(`失败: ${failedTests}`);
console.log(`总计: ${passedTests + failedTests}`);
console.log('========================================');

if (failedTests === 0) {
    console.log('✓ 所有测试通过！');
    process.exit(0);
} else {
    console.log('✗ 有测试失败！');
    process.exit(1);
}