/**
 * HTML5 Sortable 拖拽功能 Playwright 测试
 * 测试真实的拖拽操作：上拖、下拖、拖到中间、拖到第一个、拖到最后一个
 */

const { test, expect, Page } = require('@playwright/test');

// 辅助函数：获取条目位置
async function getItemPositions(page) {
    const items = await page.locator('#itemContainer .draggable-item').all();
    const positions = [];
    for (const item of items) {
        const box = await item.boundingBox();
        positions.push({
            id: await item.getAttribute('id'),
            text: await item.textContent(),
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            top: box.y,
            bottom: box.y + box.height
        });
    }
    return positions;
}

// 辅助函数：获取分类位置
async function getCategoryPositions(page) {
    const categories = await page.locator('#categoryContainer .category-box').all();
    const positions = [];
    for (const category of categories) {
        const box = await category.boundingBox();
        positions.push({
            id: await category.getAttribute('id'),
            text: await category.locator('.category-title').textContent(),
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            top: box.y,
            bottom: box.y + box.height
        });
    }
    return positions;
}

// 辅助函数：获取分类内条目位置
async function getCategoryItemPositions(page, categoryId) {
    const items = await page.locator(`#${categoryId} .category-items .draggable-item`).all();
    const positions = [];
    for (const item of items) {
        const box = await item.boundingBox();
        positions.push({
            id: await item.getAttribute('id'),
            text: await item.textContent(),
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            top: box.y,
            bottom: box.y + box.height
        });
    }
    return positions;
}

// 辅助函数：执行拖拽操作
async function dragItem(page, fromItem, toPosition) {
    const fromBox = await fromItem.boundingBox();
    const startX = fromBox.x + fromBox.width / 2;
    const startY = fromBox.y + fromBox.height / 2;
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    
    // 模拟拖拽动画
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
        const x = startX + (toPosition.x - startX) * (i / steps);
        const y = startY + (toPosition.y - startY) * (i / steps);
        await page.mouse.move(x, y);
        await page.waitForTimeout(20); // 模拟真实拖拽速度
    }
    
    await page.mouse.up();
    await page.waitForTimeout(200); // 等待拖拽完成
}

test.describe('HTML5 Sortable 拖拽功能测试', () => {
    test.beforeEach(async ({ page }) => {
        // 启动应用
        await page.goto('file://' + __dirname + '/../src/index.html');
        await page.waitForLoadState('networkidle');
        
        // 清空现有内容
        await page.evaluate(() => {
            const itemContainer = document.getElementById('itemContainer');
            const categoryContainer = document.getElementById('categoryContainer');
            if (itemContainer) itemContainer.innerHTML = '';
            if (categoryContainer) categoryContainer.innerHTML = '';
        });
    });

    test('测试1：条目上拖（将最后一个拖到第一个位置）', async ({ page }) => {
        console.log('\n测试1：条目上拖（将最后一个拖到第一个位置）');
        
        // 添加5个条目
        for (let i = 1; i <= 5; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
        }
        
        // 获取初始顺序
        let items = await page.locator('#itemContainer .draggable-item').all();
        const initialOrder = [];
        for (const item of items) {
            initialOrder.push(await item.textContent());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['条目1', '条目2', '条目3', '条目4', '条目5']);
        
        // 获取最后一个条目和第一个条目的位置
        const positions = await getItemPositions(page);
        const lastItem = await page.locator('#itemContainer .draggable-item').nth(4);
        const firstPosition = positions[0];
        
        // 执行拖拽：将最后一个拖到第一个位置
        await dragItem(page, lastItem, firstPosition);
        
        // 验证新顺序
        items = await page.locator('#itemContainer .draggable-item').all();
        const newOrder = [];
        for (const item of items) {
            newOrder.push(await item.textContent());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['条目5', '条目1', '条目2', '条目3', '条目4']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试2：条目下拖（将第一个拖到最后一个位置）', async ({ page }) => {
        console.log('\n测试2：条目下拖（将第一个拖到最后一个位置）');
        
        // 添加5个条目
        for (let i = 1; i <= 5; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
        }
        
        // 获取初始顺序
        let items = await page.locator('#itemContainer .draggable-item').all();
        const initialOrder = [];
        for (const item of items) {
            initialOrder.push(await item.textContent());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['条目1', '条目2', '条目3', '条目4', '条目5']);
        
        // 获取第一个条目和最后一个条目的位置
        const positions = await getItemPositions(page);
        const firstItem = await page.locator('#itemContainer .draggable-item').nth(0);
        const lastPosition = positions[4];
        
        // 执行拖拽：将第一个拖到最后一个位置
        await dragItem(page, firstItem, lastPosition);
        
        // 验证新顺序
        items = await page.locator('#itemContainer .draggable-item').all();
        const newOrder = [];
        for (const item of items) {
            newOrder.push(await item.textContent());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['条目2', '条目3', '条目4', '条目5', '条目1']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试3：条目拖到中间位置', async ({ page }) => {
        console.log('\n测试3：条目拖到中间位置');
        
        // 添加5个条目
        for (let i = 1; i <= 5; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
        }
        
        // 获取初始顺序
        let items = await page.locator('#itemContainer .draggable-item').all();
        const initialOrder = [];
        for (const item of items) {
            initialOrder.push(await item.textContent());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['条目1', '条目2', '条目3', '条目4', '条目5']);
        
        // 获取第一个条目和第三个条目的位置（中间）
        const positions = await getItemPositions(page);
        const firstItem = await page.locator('#itemContainer .draggable-item').nth(0);
        const middlePosition = positions[2]; // 第三个条目的位置
        
        // 执行拖拽：将第一个拖到中间位置
        await dragItem(page, firstItem, middlePosition);
        
        // 验证新顺序
        items = await page.locator('#itemContainer .draggable-item').all();
        const newOrder = [];
        for (const item of items) {
            newOrder.push(await item.textContent());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['条目2', '条目3', '条目1', '条目4', '条目5']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试4：分类上拖（将最后一个分类拖到第一个位置）', async ({ page }) => {
        console.log('\n测试4：分类上拖（将最后一个分类拖到第一个位置）');
        
        // 添加5个分类
        for (let i = 1; i <= 5; i++) {
            await page.fill('#categoryInput', `分类${i}`);
            await page.click('.btn-category');
            await page.waitForTimeout(100);
        }
        
        // 获取初始顺序
        let categories = await page.locator('#categoryContainer .category-box').all();
        const initialOrder = [];
        for (const category of categories) {
            const title = await category.locator('.category-title').textContent();
            initialOrder.push(title.split('(')[0].trim());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['分类1', '分类2', '分类3', '分类4', '分类5']);
        
        // 获取最后一个分类和第一个分类的位置
        const positions = await getCategoryPositions(page);
        const lastCategory = await page.locator('#categoryContainer .category-box').nth(4);
        const firstPosition = positions[0];
        
        // 执行拖拽：将最后一个拖到第一个位置
        await dragItem(page, lastCategory, firstPosition);
        
        // 验证新顺序
        categories = await page.locator('#categoryContainer .category-box').all();
        const newOrder = [];
        for (const category of categories) {
            const title = await category.locator('.category-title').textContent();
            newOrder.push(title.split('(')[0].trim());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['分类5', '分类1', '分类2', '分类3', '分类4']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试5：分类下拖（将第一个分类拖到最后一个位置）', async ({ page }) => {
        console.log('\n测试5：分类下拖（将第一个分类拖到最后一个位置）');
        
        // 添加5个分类
        for (let i = 1; i <= 5; i++) {
            await page.fill('#categoryInput', `分类${i}`);
            await page.click('.btn-category');
            await page.waitForTimeout(100);
        }
        
        // 获取初始顺序
        let categories = await page.locator('#categoryContainer .category-box').all();
        const initialOrder = [];
        for (const category of categories) {
            const title = await category.locator('.category-title').textContent();
            initialOrder.push(title.split('(')[0].trim());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['分类1', '分类2', '分类3', '分类4', '分类5']);
        
        // 获取第一个分类和最后一个分类的位置
        const positions = await getCategoryPositions(page);
        const firstCategory = await page.locator('#categoryContainer .category-box').nth(0);
        const lastPosition = positions[4];
        
        // 执行拖拽：将第一个拖到最后一个位置
        await dragItem(page, firstCategory, lastPosition);
        
        // 验证新顺序
        categories = await page.locator('#categoryContainer .category-box').all();
        const newOrder = [];
        for (const category of categories) {
            const title = await category.locator('.category-title').textContent();
            newOrder.push(title.split('(')[0].trim());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['分类2', '分类3', '分类4', '分类5', '分类1']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试6：分类内条目上拖（将最后一个条目拖到第一个位置）', async ({ page }) => {
        console.log('\n测试6：分类内条目上拖（将最后一个条目拖到第一个位置）');
        
        // 添加1个分类
        await page.fill('#categoryInput', '测试分类');
        await page.click('.btn-category');
        await page.waitForTimeout(100);
        
        // 添加5个条目到分类中
        const categoryId = await page.locator('#categoryContainer .category-box').first().getAttribute('id');
        for (let i = 1; i <= 5; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
            
            // 将条目拖到分类中
            const item = await page.locator('#itemContainer .draggable-item').last();
            const category = await page.locator(`#${categoryId} .category-items`);
            await dragItem(page, item, await category.boundingBox());
        }
        
        // 获取初始顺序
        let items = await page.locator(`#${categoryId} .category-items .draggable-item`).all();
        const initialOrder = [];
        for (const item of items) {
            initialOrder.push(await item.textContent());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['条目1', '条目2', '条目3', '条目4', '条目5']);
        
        // 获取最后一个条目和第一个条目的位置
        const positions = await getCategoryItemPositions(page, categoryId);
        const lastItem = await page.locator(`#${categoryId} .category-items .draggable-item`).nth(4);
        const firstPosition = positions[0];
        
        // 执行拖拽：将最后一个拖到第一个位置
        await dragItem(page, lastItem, firstPosition);
        
        // 验证新顺序
        items = await page.locator(`#${categoryId} .category-items .draggable-item`).all();
        const newOrder = [];
        for (const item of items) {
            newOrder.push(await item.textContent());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['条目5', '条目1', '条目2', '条目3', '条目4']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试7：分类内条目下拖（将第一个条目拖到最后一个位置）', async ({ page }) => {
        console.log('\n测试7：分类内条目下拖（将第一个条目拖到最后一个位置）');
        
        // 添加1个分类
        await page.fill('#categoryInput', '测试分类');
        await page.click('.btn-category');
        await page.waitForTimeout(100);
        
        // 添加5个条目到分类中
        const categoryId = await page.locator('#categoryContainer .category-box').first().getAttribute('id');
        for (let i = 1; i <= 5; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
            
            // 将条目拖到分类中
            const item = await page.locator('#itemContainer .draggable-item').last();
            const category = await page.locator(`#${categoryId} .category-items`);
            await dragItem(page, item, await category.boundingBox());
        }
        
        // 获取初始顺序
        let items = await page.locator(`#${categoryId} .category-items .draggable-item`).all();
        const initialOrder = [];
        for (const item of items) {
            initialOrder.push(await item.textContent());
        }
        console.log('初始顺序:', initialOrder);
        expect(initialOrder).toEqual(['条目1', '条目2', '条目3', '条目4', '条目5']);
        
        // 获取第一个条目和最后一个条目的位置
        const positions = await getCategoryItemPositions(page, categoryId);
        const firstItem = await page.locator(`#${categoryId} .category-items .draggable-item`).nth(0);
        const lastPosition = positions[4];
        
        // 执行拖拽：将第一个拖到最后一个位置
        await dragItem(page, firstItem, lastPosition);
        
        // 验证新顺序
        items = await page.locator(`#${categoryId} .category-items .draggable-item`).all();
        const newOrder = [];
        for (const item of items) {
            newOrder.push(await item.textContent());
        }
        console.log('拖拽后顺序:', newOrder);
        expect(newOrder).toEqual(['条目2', '条目3', '条目4', '条目5', '条目1']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试8：跨分类拖拽（将条目从一个分类拖到另一个分类）', async ({ page }) => {
        console.log('\n测试8：跨分类拖拽（将条目从一个分类拖到另一个分类）');
        
        // 添加2个分类
        await page.fill('#categoryInput', '分类A');
        await page.click('.btn-category');
        await page.waitForTimeout(100);
        await page.fill('#categoryInput', '分类B');
        await page.click('.btn-category');
        await page.waitForTimeout(100);
        
        // 添加3个条目到分类A
        const categoryIdA = await page.locator('#categoryContainer .category-box').nth(0).getAttribute('id');
        for (let i = 1; i <= 3; i++) {
            await page.fill('#itemInput', `条目A${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
            
            const item = await page.locator('#itemContainer .draggable-item').last();
            const categoryA = await page.locator(`#${categoryIdA} .category-items`);
            await dragItem(page, item, await categoryA.boundingBox());
        }
        
        // 添加2个条目到分类B
        const categoryIdB = await page.locator('#categoryContainer .category-box').nth(1).getAttribute('id');
        for (let i = 1; i <= 2; i++) {
            await page.fill('#itemInput', `条目B${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
            
            const item = await page.locator('#itemContainer .draggable-item').last();
            const categoryB = await page.locator(`#${categoryIdB} .category-items`);
            await dragItem(page, item, await categoryB.boundingBox());
        }
        
        // 获取初始状态
        let itemsA = await page.locator(`#${categoryIdA} .category-items .draggable-item`).all();
        let itemsB = await page.locator(`#${categoryIdB} .category-items .draggable-item`).all();
        const initialOrderA = [];
        const initialOrderB = [];
        for (const item of itemsA) {
            initialOrderA.push(await item.textContent());
        }
        for (const item of itemsB) {
            initialOrderB.push(await item.textContent());
        }
        console.log('分类A初始条目:', initialOrderA);
        console.log('分类B初始条目:', initialOrderB);
        expect(initialOrderA).toEqual(['条目A1', '条目A2', '条目A3']);
        expect(initialOrderB).toEqual(['条目B1', '条目B2']);
        
        // 将分类A的第一个条目拖到分类B
        const itemToMove = await page.locator(`#${categoryIdA} .category-items .draggable-item`).nth(0);
        const categoryBBox = await page.locator(`#${categoryIdB} .category-items`).boundingBox();
        await dragItem(page, itemToMove, categoryBBox);
        
        // 验证新状态
        itemsA = await page.locator(`#${categoryIdA} .category-items .draggable-item`).all();
        itemsB = await page.locator(`#${categoryIdB} .category-items .draggable-item`).all();
        const newOrderA = [];
        const newOrderB = [];
        for (const item of itemsA) {
            newOrderA.push(await item.textContent());
        }
        for (const item of itemsB) {
            newOrderB.push(await item.textContent());
        }
        console.log('分类A拖拽后条目:', newOrderA);
        console.log('分类B拖拽后条目:', newOrderB);
        expect(newOrderA).toEqual(['条目A2', '条目A3']);
        expect(newOrderB).toEqual(['条目B1', '条目B2', '条目A1']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试9：连续多次拖拽', async ({ page }) => {
        console.log('\n测试9：连续多次拖拽');
        
        // 添加5个条目
        for (let i = 1; i <= 5; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
        }
        
        // 获取初始顺序
        let items = await page.locator('#itemContainer .draggable-item').all();
        let order = [];
        for (const item of items) {
            order.push(await item.textContent());
        }
        console.log('初始顺序:', order);
        expect(order).toEqual(['条目1', '条目2', '条目3', '条目4', '条目5']);
        
        // 第一次拖拽：将条目1拖到末尾
        const positions = await getItemPositions(page);
        const item1 = await page.locator('#itemContainer .draggable-item').nth(0);
        await dragItem(page, item1, positions[4]);
        
        items = await page.locator('#itemContainer .draggable-item').all();
        order = [];
        for (const item of items) {
            order.push(await item.textContent());
        }
        console.log('第一次拖拽后顺序:', order);
        expect(order).toEqual(['条目2', '条目3', '条目4', '条目5', '条目1']);
        
        // 第二次拖拽：将条目5拖到开头
        const newPositions = await getItemPositions(page);
        const item5 = await page.locator('#itemContainer .draggable-item').nth(3);
        await dragItem(page, item5, newPositions[0]);
        
        items = await page.locator('#itemContainer .draggable-item').all();
        order = [];
        for (const item of items) {
            order.push(await item.textContent());
        }
        console.log('第二次拖拽后顺序:', order);
        expect(order).toEqual(['条目5', '条目2', '条目3', '条目4', '条目1']);
        
        // 第三次拖拽：将条目3拖到中间
        const finalPositions = await getItemPositions(page);
        const item3 = await page.locator('#itemContainer .draggable-item').nth(2);
        await dragItem(page, item3, finalPositions[3]);
        
        items = await page.locator('#itemContainer .draggable-item').all();
        order = [];
        for (const item of items) {
            order.push(await item.textContent());
        }
        console.log('第三次拖拽后顺序:', order);
        expect(order).toEqual(['条目5', '条目2', '条目4', '条目3', '条目1']);
        
        console.log('✓ 测试通过\n');
    });

    test('测试10：拖拽后验证历史记录', async ({ page }) => {
        console.log('\n测试10：拖拽后验证历史记录');
        
        // 添加3个条目
        for (let i = 1; i <= 3; i++) {
            await page.fill('#itemInput', `条目${i}`);
            await page.click('.btn-custom');
            await page.waitForTimeout(100);
        }
        
        // 执行拖拽
        const positions = await getItemPositions(page);
        const item1 = await page.locator('#itemContainer .draggable-item').nth(0);
        await dragItem(page, item1, positions[2]);
        
        // 验证撤销按钮是否启用
        const undoBtn = page.locator('#undoBtn');
        await expect(undoBtn).not.toBeDisabled();
        console.log('✓ 撤销按钮已启用');
        
        // 点击撤销
        await undoBtn.click();
        await page.waitForTimeout(200);
        
        // 验证顺序是否恢复
        let items = await page.locator('#itemContainer .draggable-item').all();
        const order = [];
        for (const item of items) {
            order.push(await item.textContent());
        }
        console.log('撤销后顺序:', order);
        expect(order).toEqual(['条目1', '条目2', '条目3']);
        
        // 验证重做按钮是否启用
        const redoBtn = page.locator('#redoBtn');
        await expect(redoBtn).not.toBeDisabled();
        console.log('✓ 重做按钮已启用');
        
        // 点击重做
        await redoBtn.click();
        await page.waitForTimeout(200);
        
        // 验证顺序是否恢复到拖拽后的状态
        items = await page.locator('#itemContainer .draggable-item').all();
        const redoOrder = [];
        for (const item of items) {
            redoOrder.push(await item.textContent());
        }
        console.log('重做后顺序:', redoOrder);
        expect(redoOrder).toEqual(['条目2', '条目3', '条目1']);
        
        console.log('✓ 测试通过\n');
    });
});

console.log('========================================');
console.log('HTML5 Sortable 拖拽功能 Playwright 测试');
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
console.log('10. 拖拽后验证历史记录');
console.log('========================================\n');