const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

test.describe('Electron 应用自动化测试', () => {
  let app;

  test.beforeEach(async () => {
    // 每个测试前启动新的 Electron 应用
    app = await electron.launch({
      args: [path.join(__dirname, '..')],
    });
  });

  test.afterEach(async () => {
    // 每个测试后关闭应用
    await app.close();
  });

  // 辅助函数：获取窗口
  async function getWindow() {
    const window = await app.firstWindow();
    await expect(window).toHaveTitle(/条目分类管理器/);
    return window;
  }

  test('1. 新建文件按钮', async () => {

      const window = await getWindow();

      

      // 点击新建按钮

      await window.click('button:has-text("新建")');

      

      // 等待确认模态框出现

      await window.waitForSelector('#newFileModal', { state: 'visible' });

      

      // 点击确认按钮

      await window.click('#confirmNewFileBtn');

      

      // 等待模态框消失

      await window.waitForSelector('#newFileModal', { state: 'hidden' });

      

      // 等待一下

      await window.waitForTimeout(500);

      

      // 检查条目容器是否清空

      const itemContainer = window.locator('#itemContainer');

      const itemCount = await itemContainer.locator('.draggable-item').count();

      expect(itemCount).toBe(0);

    });

  

    test('2. 添加条目', async () => {

      const window = await getWindow();

      

      // 输入条目内容

      await window.fill('#itemInput', '测试条目1');

      

      // 点击添加按钮

      await window.click('button:has-text("添加条目")');

      

      // 等待添加完成

      await window.waitForTimeout(300);

      

      // 检查条目是否添加成功

      const itemContainer = window.locator('#itemContainer');

      const items = await itemContainer.locator('.draggable-item');

      await expect(items).toHaveCount(1);

      

      // 检查条目内容

      const firstItem = items.first();

      await expect(firstItem).toContainText('测试条目1');

    });

  

    test('3. 添加多个条目', async () => {

      const window = await getWindow();

      

      const testItems = ['条目2', '条目3', '条目4'];

      

      for (const itemText of testItems) {

        await window.fill('#itemInput', itemText);

        await window.click('button:has-text("添加条目")');

        await window.waitForTimeout(200);

      }

      

      // 检查总条目数

      const itemContainer = window.locator('#itemContainer');

      const items = await itemContainer.locator('.draggable-item');

      await expect(items).toHaveCount(3);

    });

  

    test('4. 创建分类', async () => {

      const window = await getWindow();

      

      // 输入分类名称

      await window.fill('#categoryInput', '测试分类');

      

      // 点击添加分类按钮

      await window.click('button:has-text("添加分类")');

      

      // 等待分类创建完成

      await window.waitForTimeout(300);

      

      // 检查分类是否创建成功

      const categoryContainer = window.locator('#categoryContainer');

      const categories = await categoryContainer.locator('.category-box');

      await expect(categories).toHaveCount(1);

      

      // 检查分类名称

      const firstCategory = categories.first();

      await expect(firstCategory).toContainText('测试分类');

    });

  

    test('5. 拖放条目到分类', async () => {

      const window = await getWindow();

      

      // 前置条件：添加一个条目

      await window.fill('#itemInput', '拖拽测试条目');

      await window.click('button:has-text("添加条目")');

      await window.waitForTimeout(200);

      

      // 前置条件：创建一个分类

      await window.fill('#categoryInput', '拖拽测试分类');

      await window.click('button:has-text("添加分类")');

      await window.waitForTimeout(200);

      

      const itemContainer = window.locator('#itemContainer');

      const categoryContainer = window.locator('#categoryContainer');

      

      // 获取第一个条目

      const firstItem = itemContainer.locator('.draggable-item').first();

      

      // 获取第一个分类

      const firstCategory = categoryContainer.locator('.category-box').first();

      

      // 执行拖放操作

      await firstItem.dragTo(firstCategory);

      

      // 等待拖放完成

      await window.waitForTimeout(500);

      

      // 检查条目是否移动到分类中

      const categoryItems = firstCategory.locator('.draggable-item');

      await expect(categoryItems).toHaveCount(1);

    });

  

    test('6. 搜索功能', async () => {

      const window = await getWindow();

      

      // 前置条件：添加包含"123"的测试条目

      await window.fill('#itemInput', '搜索测试123');

      await window.click('button:has-text("添加条目")');

      await window.waitForTimeout(200);

      

      // 输入搜索词

      await window.fill('#searchInput', '123');

      

      // 等待搜索结果

      await window.waitForTimeout(300);

      

      // 检查是否找到搜索高亮

      const highlights = window.locator('mark.search-highlight');

      await expect(highlights).toHaveCount(1);

    });

  

    test('7. 清除搜索', async () => {

      const window = await getWindow();

      

      // 前置条件：添加测试数据并搜索

      await window.fill('#itemInput', '清除搜索123');

      await window.click('button:has-text("添加条目")');

      await window.waitForTimeout(200);

      

      await window.fill('#searchInput', '123');

      await window.waitForTimeout(300);

      

      // 清空搜索框

      await window.fill('#searchInput', '');

      

      // 等待清除完成

      await window.waitForTimeout(300);

      

      // 检查高亮是否清除

      const highlights = window.locator('mark.search-highlight');

      await expect(highlights).toHaveCount(0);

    });

  

    test('8. 编辑条目', async () => {

  

        const window = await getWindow();

  

        

  

        // 前置条件：添加一个条目

  

        await window.fill('#itemInput', '待编辑条目');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        // 点击第一个条目的编辑按钮

  

        const itemContainer = window.locator('#itemContainer');

  

        const firstItem = itemContainer.locator('.draggable-item').first();

  

        

  

        // 先hover到条目上以显示编辑按钮

  

        await firstItem.hover();

  

        await window.waitForTimeout(200);

  

        

  

        // 点击编辑按钮

  

        await firstItem.locator('.edit-btn').click();

  

        

  

        // 等待编辑模态框显示

  

        await window.waitForSelector('#editItemModal');

  

        

  

        // 修改条目内容

  

        await window.fill('#editItemInput', '已编辑的条目');

  

        

  

        // 点击确认按钮

  

        await window.click('#editItemModal button:has-text("确定")');

  

        

  

        // 等待模态框消失

  

        await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

        

  

        // 等待编辑完成

  

        await window.waitForTimeout(300);

  

        

  

        // 检查条目是否已更新

  

        await expect(firstItem).toContainText('已编辑的条目');

  

      });

  

    test('9. 删除条目', async () => {

  

        const window = await getWindow();

  

        

  

        // 前置条件：添加两个条目

  

        await window.fill('#itemInput', '待删除条目');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#itemInput', '保留条目');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        const itemCountBefore = await itemContainer.locator('.draggable-item').count();

  

        

  

        // 获取第一个条目并hover以显示删除按钮

  

        const firstItem = itemContainer.locator('.draggable-item').first();

  

        await firstItem.hover();

  

        await window.waitForTimeout(200);

  

        

  

        // 点击删除按钮

  

        await firstItem.locator('.delete-btn').click();

  

        

  

        // 等待删除确认模态框显示

  

        await window.waitForSelector('#deleteModal');

  

        

  

        // 点击确认删除按钮

  

        await window.click('#confirmDeleteBtn');

  

        

  

        // 等待删除完成

  

        await window.waitForTimeout(500);

  

        

  

        // 检查条目是否已删除

  

        const itemCountAfter = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCountAfter).toBe(itemCountBefore - 1);

  

      });

  

    test('10. 保存文件', async () => {

  

        const window = await getWindow();

  

        

  

        // 前置条件：添加一些测试数据

  

        await window.fill('#itemInput', '保存测试');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        // 提示用户

  

        console.log('\n⚠️  请手动操作：');

  

        console.log('   1. 测试将点击"另存为"按钮');

  

        console.log('   2. 系统会弹出保存对话框');

  

        console.log('   3. 请选择保存位置并点击"保存"\n');

  

        

  

        // 检查另存为按钮是否可用

  

        const saveAsButton = window.locator('button:has-text("另存为")');

  

        await expect(saveAsButton).toBeEnabled();

  

        

  

        // 点击另存为按钮

  

        await saveAsButton.click();

  

        

  

        // 等待用户操作（30秒）

  

        console.log('⏳ 等待您操作保存对话框（30秒）...\n');

  

        await window.waitForTimeout(30000);

  

        

  

        console.log('✅ 保存文件测试完成\n');

  

      });

  

    test('11. 打开文件', async () => {

  

        const window = await getWindow();

  

        

  

        // 提示用户

  

        console.log('\n⚠️  请手动操作：');

  

        console.log('   1. 测试将点击"打开"按钮');

  

        console.log('   2. 系统会弹出打开对话框');

  

        console.log('   3. 请选择一个JSON文件并点击"打开"\n');

  

        

  

        // 检查打开按钮是否可用

  

        const openButton = window.locator('button:has-text("打开")');

  

        await expect(openButton).toBeEnabled();

  

        

  

        // 点击打开按钮

  

        await openButton.click();

  

        

  

        // 等待用户操作（30秒）

  

        console.log('⏳ 等待您操作打开对话框（30秒）...\n');

  

        await window.waitForTimeout(30000);

  

        

  

        console.log('✅ 打开文件测试完成\n');

  

      });

  

    test('12. 撤销操作', async () => {

      const window = await getWindow();

      

      const itemContainer = window.locator('#itemContainer');

      const itemCountBefore = await itemContainer.locator('.draggable-item').count();

      

      // 添加一个新条目

      await window.fill('#itemInput', '撤销测试条目');

      await window.click('button:has-text("添加条目")');

      await window.waitForTimeout(300);

      

      // 检查条目是否添加

      const itemCountAfterAdd = await itemContainer.locator('.draggable-item').count();

      expect(itemCountAfterAdd).toBe(itemCountBefore + 1);

      

      // 点击撤销按钮

      await window.click('button:has-text("撤销")');

      await window.waitForTimeout(300);

      

      // 检查是否撤销成功

      const itemCountAfterUndo = await itemContainer.locator('.draggable-item').count();

      expect(itemCountAfterUndo).toBe(itemCountBefore);

    });

  

    test('13. 重做操作', async () => {

  

        const window = await getWindow();

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        const itemCountBefore = await itemContainer.locator('.draggable-item').count();

  

        

  

        // 添加一个新条目

  

        await window.fill('#itemInput', '重做测试条目');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(500);

  

        

  

        // 检查条目是否添加

  

        const itemCountAfterAdd = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCountAfterAdd).toBe(itemCountBefore + 1);

  

        

  

        // 撤销

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(500);

  

        

  

        // 重做

  

        await window.click('button:has-text("重复")');

  

        await window.waitForTimeout(500);

  

        

  

        // 检查是否重做成功

  

        const itemCountAfterRedo = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCountAfterRedo).toBe(itemCountBefore + 1);

  

      });

  

    test('14. 搜索导航', async () => {

  

        const window = await getWindow();

  

        

  

        // 前置条件：添加包含多个匹配的测试数据

  

        await window.fill('#itemInput', 'test123test');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(500);

  

        

  

        // 搜索 "test"

  

        await window.fill('#searchInput', 'test');

  

        await window.waitForTimeout(500);

  

        

  

        // 检查搜索结果

  

        const highlights = window.locator('mark.search-highlight');

  

        const highlightCount = await highlights.count();

  

        expect(highlightCount).toBeGreaterThan(0);

  

        

  

        // 点击下一个按钮

  

        await window.click('button:has-text("下一个")');

  

        await window.waitForTimeout(500);

  

        

  

        // 检查当前高亮

  

        const currentHighlight = window.locator('mark.search-highlight.current');

  

        await expect(currentHighlight).toHaveCount(1);

  

      });

  

    test('15. 批量导入', async () => {

  

        const window = await getWindow();

  

        

  

        // 提示用户

  

        console.log('\n⚠️  请手动操作：');

  

        console.log('   1. 测试将点击"批量导入"按钮');

  

        console.log('   2. 系统会弹出打开对话框');

  

        console.log('   3. 请选择一个JSON文件并点击"打开"\n');

  

        

  

        // 检查批量导入按钮是否可用

  

        const importButton = window.locator('button[title="批量导入条目"]');

  

        await expect(importButton).toBeEnabled();

  

        

  

        // 点击批量导入按钮

  

        await importButton.click();

  

        

  

        // 等待用户操作（30秒）

  

        console.log('⏳ 等待您操作打开对话框（30秒）...\n');

  

        await window.waitForTimeout(30000);

  

        

  

        console.log('✅ 批量导入测试完成\n');

  

      });

  

    

  

      test('16. 复杂操作顺序：添加→编辑→删除→撤销', async () => {

  

        const window = await getWindow();

  

        

  

        // 步骤1：添加多个条目

  

        const items = ['条目A', '条目B', '条目C', '条目D'];

  

        for (const item of items) {

  

          await window.fill('#itemInput', item);

  

          await window.click('button:has-text("添加条目")');

  

          await window.waitForTimeout(200);

  

        }

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        let itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(4);

  

        

  

        // 步骤2：编辑第2个条目

  

        const secondItem = itemContainer.locator('.draggable-item').nth(1);

  

        await secondItem.hover();

  

        await window.waitForTimeout(200);

  

        await secondItem.locator('.edit-btn').click();

  

        await window.waitForSelector('#editItemModal');

  

        await window.fill('#editItemInput', '已编辑的条目B');

  

        await window.click('#editItemModal button:has-text("确定")');

  

        await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

        await window.waitForTimeout(300);

  

        

  

        // 步骤3：删除第3个条目

  

        const thirdItem = itemContainer.locator('.draggable-item').nth(2);

  

        await thirdItem.hover();

  

        await window.waitForTimeout(200);

  

        await thirdItem.locator('.delete-btn').click();

  

        await window.waitForSelector('#deleteModal');

  

        await window.click('#confirmDeleteBtn');

  

        await window.waitForTimeout(500);

  

        

  

        itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(3);

  

        

  

        // 步骤4：撤销删除

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(4);

  

        

  

        // 步骤5：撤销编辑

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        const editedItem = itemContainer.locator('.draggable-item').nth(1);

  

        await expect(editedItem).toContainText('条目B');

  

      });

  

    

  

      test('17. 多次拖拽：条目→分类A→分类B', async () => {

  

        const window = await getWindow();

  

        

  

        // 准备：添加条目和两个分类

  

        await window.fill('#itemInput', '拖拽测试条目');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '分类A');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '分类B');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        const categoryContainer = window.locator('#categoryContainer');

  

        const item = itemContainer.locator('.draggable-item').first();

  

        const categories = categoryContainer.locator('.category-box');

  

        

  

        // 第一次拖拽：条目→分类A

  

        await item.dragTo(categories.nth(0));

  

        await window.waitForTimeout(500);

  

        

  

        let categoryAItems = categories.nth(0).locator('.draggable-item');

  

        await expect(categoryAItems).toHaveCount(1);

  

        

  

        // 第二次拖拽：分类A→分类B

  

        const itemInCategoryA = categoryAItems.first();

  

        await itemInCategoryA.dragTo(categories.nth(1));

  

        await window.waitForTimeout(500);

  

        

  

        let categoryBItems = categories.nth(1).locator('.draggable-item');

  

        await expect(categoryBItems).toHaveCount(1);

  

        

  

        // 第三次拖拽：分类B→条目列表

  

        const itemInCategoryB = categoryBItems.first();

  

        await itemInCategoryB.dragTo(itemContainer);

  

        await window.waitForTimeout(500);

  

        

  

        itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(1);

  

      });

  

    

  

      test('18. 混合操作：添加→分类→拖拽→编辑→搜索', async () => {

  

        const window = await getWindow();

  

        

  

        // 步骤1：添加多个条目

  

        const items = ['苹果', '香蕉', '橙子', '葡萄'];

  

        for (const item of items) {

  

          await window.fill('#itemInput', item);

  

          await window.click('button:has-text("添加条目")');

  

          await window.waitForTimeout(200);

  

        }

  

        

  

        // 步骤2：创建分类

  

        await window.fill('#categoryInput', '水果');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        // 步骤3：拖拽部分条目到分类

  

        const itemContainer = window.locator('#itemContainer');

  

        const categoryContainer = window.locator('#categoryContainer');

  

        const category = categoryContainer.locator('.category-box').first();

  

        

  

        await itemContainer.locator('.draggable-item').nth(0).dragTo(category);

  

        await window.waitForTimeout(300);

  

        

  

        await itemContainer.locator('.draggable-item').nth(0).dragTo(category);

  

        await window.waitForTimeout(300);

  

        

  

        // 步骤4：编辑分类中的条目

  

        const categoryItems = category.locator('.draggable-item');

  

        await categoryItems.first().hover();

  

        await window.waitForTimeout(200);

  

        await categoryItems.first().locator('.edit-btn').click();

  

        await window.waitForSelector('#editItemModal');

  

        await window.fill('#editItemInput', '大红苹果');

  

        await window.click('#editItemModal button:has-text("确定")');

  

        await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

        await window.waitForTimeout(300);

  

        

  

        // 步骤5：搜索"果"

  

        await window.fill('#searchInput', '果');

  

        await window.waitForTimeout(500);

  

        

  

        const highlights = window.locator('mark.search-highlight');

  

        const highlightCount = await highlights.count();

  

        expect(highlightCount).toBeGreaterThan(0);

  

        

  

        // 步骤6：清除搜索

  

        await window.fill('#searchInput', '');

  

        await window.waitForTimeout(300);

  

        

  

        const highlightsAfter = window.locator('mark.search-highlight');

  

        await expect(highlightsAfter).toHaveCount(0);

  

      });

  

    

  

      test('19. 多次撤销和重做', async () => {

  

        const window = await getWindow();

  

        

  

        // 执行一系列操作

  

        await window.fill('#itemInput', '操作1');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#itemInput', '操作2');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '分类1');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        const categoryContainer = window.locator('#categoryContainer');

  

        

  

        // 拖拽

  

        await itemContainer.locator('.draggable-item').first().dragTo(

  

          categoryContainer.locator('.category-box').first()

  

        );

  

        await window.waitForTimeout(500);

  

        

  

        // 多次撤销

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        

  

        // 检查状态

  

        let itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(1);

  

        

  

        // 多次重做

  

        await window.click('button:has-text("重复")');

  

        await window.waitForTimeout(300);

  

        

  

        await window.click('button:has-text("重复")');

  

        await window.waitForTimeout(300);

  

        

  

        await window.click('button:has-text("重复")');

  

        await window.waitForTimeout(300);

  

        

  

        // 检查恢复状态

  

        const categoryItems = categoryContainer.locator('.category-box').first().locator('.draggable-item');

  

        await expect(categoryItems).toHaveCount(1);

  

      });

  

    

  

      test('20. 边界情况：大量操作', async () => {

  

        const window = await getWindow();

  

        

  

        // 添加大量条目

  

        const largeItems = [];

  

        for (let i = 1; i <= 20; i++) {

  

          const itemName = `条目${i}`;

  

          largeItems.push(itemName);

  

          await window.fill('#itemInput', itemName);

  

          await window.click('button:has-text("添加条目")');

  

          await window.waitForTimeout(100);

  

        }

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        let itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(20);

  

        

  

        // 创建多个分类

  

        for (let i = 1; i <= 5; i++) {

  

          await window.fill('#categoryInput', `分类${i}`);

  

          await window.click('button:has-text("添加分类")');

  

          await window.waitForTimeout(150);

  

        }

  

        

  

        const categoryContainer = window.locator('#categoryContainer');

  

        let categoryCount = await categoryContainer.locator('.category-box').count();

  

        expect(categoryCount).toBe(5);

  

        

  

        // 搜索测试

  

        await window.fill('#searchInput', '条目1');

  

        await window.waitForTimeout(500);

  

        

  

        const highlights = window.locator('mark.search-highlight');

  

        await expect(highlights).toHaveCount(1);

  

        

  

        // 清除搜索

  

        await window.fill('#searchInput', '');

  

        await window.waitForTimeout(300);

  

        

  

        // 撤销所有操作

  

        for (let i = 0; i < 25; i++) {

  

          await window.click('button:has-text("撤销")');

  

          await window.waitForTimeout(100);

  

        }

  

        

  

        itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(0);

  

        

  

        categoryCount = await categoryContainer.locator('.category-box').count();

  

        expect(categoryCount).toBe(0);

  

      });

  

    

  

      test('21. 交替操作：添加→删除→添加→编辑→撤销', async () => {

  

        const window = await getWindow();

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        

  

        // 添加

  

        await window.fill('#itemInput', '测试1');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        // 删除

  

        const firstItem = itemContainer.locator('.draggable-item').first();

  

        await firstItem.hover();

  

        await window.waitForTimeout(200);

  

        await firstItem.locator('.delete-btn').click();

  

        await window.waitForSelector('#deleteModal');

  

        await window.click('#confirmDeleteBtn');

  

        await window.waitForTimeout(500);

  

        

  

        // 添加

  

        await window.fill('#itemInput', '测试2');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        // 编辑

  

        const secondItem = itemContainer.locator('.draggable-item').first();

  

        await secondItem.hover();

  

        await window.waitForTimeout(200);

  

        await secondItem.locator('.edit-btn').click();

  

        await window.waitForSelector('#editItemModal');

  

        await window.fill('#editItemInput', '已编辑的测试2');

  

        await window.click('#editItemModal button:has-text("确定")');

  

        await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

        await window.waitForTimeout(300);

  

        

  

        // 撤销编辑

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        

  

        await expect(secondItem).toContainText('测试2');

  

        

  

        // 撤销添加

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        

  

        let itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(0);

  

        

  

        // 重做添加

  

        await window.click('button:has-text("重复")');

  

        await window.waitForTimeout(300);

  

        

  

        itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(1);

  

      });

  

    

  

      test('22. 分类嵌套和多层拖拽', async () => {

  

        const window = await getWindow();

  

        

  

        // 准备数据

  

        await window.fill('#itemInput', '条目X');

  

        await window.click('button:has-text("添加条目")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '分类X');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '分类Y');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '分类Z');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        const categoryContainer = window.locator('#categoryContainer');

  

        const categories = categoryContainer.locator('.category-box');

  

        const item = itemContainer.locator('.draggable-item').first();

  

        

  

        // 拖拽：条目→分类X

  

        await item.dragTo(categories.nth(0));

  

        await window.waitForTimeout(500);

  

        

  

        // 拖拽：分类X中的条目→分类Y

  

        const itemInCategoryX = categories.nth(0).locator('.draggable-item').first();

  

        await itemInCategoryX.dragTo(categories.nth(1));

  

        await window.waitForTimeout(500);

  

        

  

        // 拖拽：分类Y中的条目→分类Z

  

        const itemInCategoryY = categories.nth(1).locator('.draggable-item').first();

  

        await itemInCategoryY.dragTo(categories.nth(2));

  

        await window.waitForTimeout(500);

  

        

  

        // 验证最终位置

  

        const zCategoryItems = categories.nth(2).locator('.draggable-item');

  

        await expect(zCategoryItems).toHaveCount(1);

  

        

  

        // 拖拽回条目列表

  

        const itemInCategoryZ = zCategoryItems.first();

  

        await itemInCategoryZ.dragTo(itemContainer);

  

        await window.waitForTimeout(500);

  

        

  

        const finalItemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(finalItemCount).toBe(1);

  

      });

  

    

  

      test('23. 搜索和编辑组合', async () => {

  

        const window = await getWindow();

  

        

  

        // 添加包含相同关键词的条目

  

        const items = ['测试123', '测试456', '测试789', '其他123'];

  

        for (const item of items) {

  

          await window.fill('#itemInput', item);

  

          await window.click('button:has-text("添加条目")');

  

          await window.waitForTimeout(200);

  

        }

  

        

  

        // 搜索"测试"

  

        await window.fill('#searchInput', '测试');

  

        await window.waitForTimeout(500);

  

        

  

        const highlights = window.locator('mark.search-highlight');

  

        await expect(highlights).toHaveCount(3);

  

        

  

        // 清除搜索

  

        await window.fill('#searchInput', '');

  

        await window.waitForTimeout(300);

  

        

  

        // 搜索"123"

  

        await window.fill('#searchInput', '123');

  

        await window.waitForTimeout(500);

  

        

  

        const highlights2 = window.locator('mark.search-highlight');

  

        await expect(highlights2).toHaveCount(2);

  

        

  

        // 清除搜索

  

        await window.fill('#searchInput', '');

  

        await window.waitForTimeout(300);

  

        

  

        // 编辑第一个包含"123"的条目

  

        const itemContainer = window.locator('#itemContainer');

  

        const firstItem = itemContainer.locator('.draggable-item').first();

  

        await firstItem.hover();

  

        await window.waitForTimeout(200);

  

        await firstItem.locator('.edit-btn').click();

  

        await window.waitForSelector('#editItemModal');

  

        await window.fill('#editItemInput', '已编辑的测试123');

  

        await window.click('#editItemModal button:has-text("确定")');

  

        await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

        await window.waitForTimeout(300);

  

        

  

        await expect(firstItem).toContainText('已编辑的测试123');

  

      });

  

    

  

      test('24. 快速连续操作', async () => {

  

        const window = await getWindow();

  

        

  

        // 快速添加多个条目

  

        for (let i = 1; i <= 10; i++) {

  

          await window.fill('#itemInput', `快速条目${i}`);

  

          await window.click('button:has-text("添加条目")');

  

          await window.waitForTimeout(50); // 快速操作

  

        }

  

        

  

        const itemContainer = window.locator('#itemContainer');

  

        let itemCount = await itemContainer.locator('.draggable-item').count();

  

        expect(itemCount).toBe(10);

  

        

  

        // 快速创建分类

  

        for (let i = 1; i <= 3; i++) {

  

          await window.fill('#categoryInput', `快速分类${i}`);

  

          await window.click('button:has-text("添加分类")');

  

          await window.waitForTimeout(50);

  

        }

  

        

  

        const categoryContainer = window.locator('#categoryContainer');

  

        let categoryCount = await categoryContainer.locator('.category-box').count();

  

        expect(categoryCount).toBe(3);

  

        

  

        // 快速搜索

  

        await window.fill('#searchInput', '快速');

  

        await window.waitForTimeout(500);

  

        

  

        const highlights = window.locator('mark.search-highlight');

  

        await expect(highlights.count().resolves()).toBeGreaterThan(10);

  

        

  

        // 快速清除

  

        await window.fill('#searchInput', '');

  

        await window.waitForTimeout(300);

  

      });

  

    

  

      test('25. 完整工作流程', async () => {

  

        const window = await getWindow();

  

        

  

        // 1. 初始化数据

  

        const items = ['待办事项1', '待办事项2', '待办事项3'];

  

        for (const item of items) {

  

          await window.fill('#itemInput', item);

  

          await window.click('button:has-text("添加条目")');

  

          await window.waitForTimeout(200);

  

        }

  

        

  

        // 2. 创建分类

  

        await window.fill('#categoryInput', '工作');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        await window.fill('#categoryInput', '个人');

  

        await window.click('button:has-text("添加分类")');

  

        await window.waitForTimeout(200);

  

        

  

        // 3. 分类整理

  

        const itemContainer = window.locator('#itemContainer');

  

        const categoryContainer = window.locator('#categoryContainer');

  

        const categories = categoryContainer.locator('.category-box');

  

        

  

        // 拖拽前两个到"工作"

  

        await itemContainer.locator('.draggable-item').nth(0).dragTo(categories.nth(0));

  

        await window.waitForTimeout(300);

  

        

  

        await itemContainer.locator('.draggable-item').nth(0).dragTo(categories.nth(0));

  

        await window.waitForTimeout(300);

  

        

  

        // 拖拽最后一个到"个人"

  

        await itemContainer.locator('.draggable-item').first().dragTo(categories.nth(1));

  

        await window.waitForTimeout(300);

  

        

  

        // 4. 编辑工作分类中的条目

  

        const workItems = categories.nth(0).locator('.draggable-item');

  

        await workItems.first().hover();

  

        await window.waitForTimeout(200);

  

        await workItems.first().locator('.edit-btn').click();

  

        await window.waitForSelector('#editItemModal');

  

        await window.fill('#editItemInput', '紧急：待办事项1');

  

        await window.click('#editItemModal button:has-text("确定")');

  

        await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

        await window.waitForTimeout(300);

  

        

  

        // 5. 搜索"紧急"

  

        await window.fill('#searchInput', '紧急');

  

        await window.waitForTimeout(500);

  

        

  

        const highlights = window.locator('mark.search-highlight');

  

        await expect(highlights).toHaveCount(1);

  

        

  

        // 6. 清除搜索

  

        await window.fill('#searchInput', '');

  

        await window.waitForTimeout(300);

  

        

  

        // 7. 验证分类状态

  

        const workCategoryItems = categories.nth(0).locator('.draggable-item');

  

        await expect(workCategoryItems).toHaveCount(2);

  

        

  

        const personalCategoryItems = categories.nth(1).locator('.draggable-item');

  

        await expect(personalCategoryItems).toHaveCount(1);

  

        

  

        // 8. 撤销编辑

  

        await window.click('button:has-text("撤销")');

  

        await window.waitForTimeout(300);

  

        

  

        const editedItem = workItems.first();

  

        await expect(editedItem).toContainText('待办事项1');

  

      });
});