const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

test.describe('Electron 应用自动化测试', () => {
  let app;

  test.beforeEach(async () => {
  // 每个测试前启动新的 Electron 应用，并启用测试模式
  app = await electron.launch({
  args: [path.join(__dirname, '..')],
  env: {
  ...process.env,
  TEST_MODE: 'true'
  }
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

  

  

  

    // 创建临时测试文件路径

  

    const tempDir = path.join(__dirname, '..', 'temp');

  

    if (!fs.existsSync(tempDir)) {

  

        fs.mkdirSync(tempDir, { recursive: true });

  

    }

  

    const testFilePath = path.join(tempDir, 'test-save.json');

  

  

  

    // 使用测试模式 API 设置保存文件路径

  

    await window.evaluate(async ({ filePath }) => {

  

        // @ts-ignore - 测试模式 API

  

        return await window.electron.testSetSaveFilePath(filePath);

  

    }, { filePath: testFilePath });

  

  

  

    console.log(`\n📝 测试模式：保存文件到 ${testFilePath}\n`);

  

  

  

    // 检查另存为按钮是否可用

  

    const saveAsButton = window.locator('button:has-text("另存为")');

  

    await expect(saveAsButton).toBeEnabled();

  

  

  

    // 点击另存为按钮（测试模式下不会弹出系统对话框）

  

    await saveAsButton.click();

  

  

  

    // 等待保存完成

  

    await window.waitForTimeout(1000);

  

  

  

    // 验证文件是否已保存

  

    expect(fs.existsSync(testFilePath)).toBe(true);

  

  

  

    // 清理测试文件

  

    if (fs.existsSync(testFilePath)) {

  

        fs.unlinkSync(testFilePath);

  

    }

  

  

  

    console.log('✅ 保存文件测试完成\n');

  

  });

  

  test('11. 打开文件', async () => {

  

    const window = await getWindow();

  

  

  

    // 创建临时测试文件

  

    const tempDir = path.join(__dirname, '..', 'temp');

  

    if (!fs.existsSync(tempDir)) {

  

        fs.mkdirSync(tempDir, { recursive: true });

  

    }

  

    const testFilePath = path.join(tempDir, 'test-open.json');

  

  

  

    // 准备测试数据

  

    const testData = {

  

        items: ['测试条目1', '测试条目2'],

  

        categories: [

  

            {

  

                name: '测试分类',

  

                items: ['分类条目1', '分类条目2']

  

            }

  

        ]

  

    };

  

    fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

  

  

  

    console.log(`\n📖 测试模式：从 ${testFilePath} 打开文件\n`);

  

  

  

    // 使用测试模式 API 设置打开文件路径

  

    await window.evaluate(async ({ filePath }) => {

  

        // @ts-ignore - 测试模式 API

  

        return await window.electron.testSetOpenFilePath(filePath);

  

    }, { filePath: testFilePath });

  

  

  

    // 检查打开按钮是否可用（使用更精确的定位器）

  

    const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

    await expect(openButton).toBeEnabled();

  

  

  

    // 点击打开按钮（测试模式下不会弹出系统对话框）

  

    await openButton.click();

  

  

  

    // 等待文件加载完成

  

    await window.waitForTimeout(1000);

  

  

  

    // 验证数据是否已加载

  

    const itemContainer = window.locator('#itemContainer');

  

    const items = await itemContainer.locator('.draggable-item');

  

    await expect(items).toHaveCount(2); // 测试数据中有2个条目在 items 中

  

  

  

    // 验证分类是否已加载

  

    const categoryContainer = window.locator('#categoryContainer');

  

    const categories = await categoryContainer.locator('.category-box');

  

    await expect(categories).toHaveCount(1);

  

  

  

    // 验证分类中的条目

  

    const firstCategory = categories.first();

  

    const categoryItems = await firstCategory.locator('.draggable-item');

  

    await expect(categoryItems).toHaveCount(2);

  

  

  

    // 清理测试文件

  

    if (fs.existsSync(testFilePath)) {

  

        fs.unlinkSync(testFilePath);

  

    }

  

  

  

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

  

  

  

    // 创建临时测试文件

  

    const tempDir = path.join(__dirname, '..', 'temp');

  

    if (!fs.existsSync(tempDir)) {

  

        fs.mkdirSync(tempDir, { recursive: true });

  

    }

  

    const testFilePath = path.join(tempDir, 'test-import.json');

  

  

  

    // 准备测试数据

  

    const importData = ['导入条目1', '导入条目2', '导入条目3', '导入条目4'];

  

    fs.writeFileSync(testFilePath, JSON.stringify(importData, null, 2), 'utf-8');

  

  

  

    console.log(`\n📥 测试模式：从 ${testFilePath} 批量导入\n`);

  

  

  

    // 检查批量导入按钮是否可用

  

    const importButton = window.locator('button[title="批量导入条目"]');

  

    await expect(importButton).toBeEnabled();

  

  

  

    // 点击批量导入按钮

  

    await importButton.click();

  

  

  

    // 等待导入模态框显示

  

    await window.waitForSelector('#importModal', { state: 'visible' });

  

    await window.waitForTimeout(1000);

  

  

  

    // 切换到文件导入模式（点击 label 元素）

  

    await window.click('label[for="importMethodFile"]');

  

    await window.waitForTimeout(500);

  

  

  

    // 使用 Playwright 的 setInputFiles API 选择文件

  

    const fileInput = window.locator('#importFile');

  

    await fileInput.setInputFiles(testFilePath);

  

  

  

    // 等待文件选择完成

  

    await window.waitForTimeout(500);

  

  

  

    // 点击确认导入按钮（使用更精确的定位器）

  

    const confirmBtn = window.locator('#importModal button[type="button"].btn-primary');

  

    await confirmBtn.click();

  

  

  

    // 等待导入完成和模态框关闭

  

    await window.waitForSelector('#importModal', { state: 'hidden', timeout: 5000 });

  

    await window.waitForTimeout(1000);

  

  

  

    // 验证数据是否已导入

  

    const itemContainer = window.locator('#itemContainer');

  

    const items = await itemContainer.locator('.draggable-item');

  

    await expect(items).toHaveCount(4);

  

  

  

    // 清理测试文件

  

    if (fs.existsSync(testFilePath)) {

  

        fs.unlinkSync(testFilePath);

  

    }

  

  

  

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

  

  

  

  

  

  

  

    // ==================== 文件修改状态相关测试 ====================

  

  

  

  

  

  

  

  test('26. 文件修改状态：新建后添加条目', async () => {

  

  

  

  

  

  

  

      const window = await getWindow();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 创建临时测试文件

  

  

  

  

  

  

  

      const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  

  

  

  

      if (!fs.existsSync(tempDir)) {

  

  

  

  

  

  

  

          fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

      const testFilePath = path.join(tempDir, 'test-new-modify.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 准备测试数据

  

  

  

  

  

  

  

      const testData = {

  

  

  

  

  

  

  

          items: ['测试条目'],

  

  

  

  

  

  

  

          categories: []

  

  

  

  

  

  

  

      };

  

  

  

  

  

  

  

      fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 打开文件

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: testFilePath });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  

  

  

  

      await openButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证文件已加载

  

  

  

  

  

  

  

      const itemContainer = window.locator('#itemContainer');

  

  

  

  

  

  

  

      const items = await itemContainer.locator('.draggable-item');

  

  

  

  

  

  

  

      await expect(items).toHaveCount(1);

  

  

  

  

  

  

  

      await expect(items.first()).toContainText('测试条目');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 添加新条目

  

  

  

  

  

  

  

      await window.fill('#itemInput', '新条目');

  

  

  

  

  

  

  

      await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

      await window.waitForTimeout(500);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证新条目已添加

  

  

  

  

  

  

  

      const itemsAfterModify = await itemContainer.locator('.draggable-item');

  

  

  

  

  

  

  

      await expect(itemsAfterModify).toHaveCount(2);

  

  

  

  

  

  

  

      await expect(itemsAfterModify.nth(1)).toContainText('新条目');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 保存文件

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: testFilePath });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      const saveButton = window.locator('button.toolbar-btn[title*="另存为"]');

  

  

  

  

  

  

  

      await saveButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证文件已保存（包含新条目）

  

  

  

  

  

  

  

      const fileContent = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

  

  

  

  

  

  

  

      expect(fileContent.items).toContain('新条目');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 清理测试文件

  

  

  

  

  

  

  

      if (fs.existsSync(testFilePath)) {

  

  

  

  

  

  

  

          fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      console.log('✅ 文件修改状态：新建后添加条目测试完成\n');

  

  

  

  

  

  

  

    });

  

  

  

  

  

  

  

  test('27. 文件修改状态：打开文件后修改', async () => {

  

  

  

  

  

  

  

      const window = await getWindow();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 创建临时测试文件

  

  

  

  

  

  

  

      const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  

  

  

  

      if (!fs.existsSync(tempDir)) {

  

  

  

  

  

  

  

          fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

      const testFilePath = path.join(tempDir, 'test-modify-status.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 准备测试数据

  

  

  

  

  

  

  

      const testData = {

  

  

  

  

  

  

  

          items: ['原始条目1', '原始条目2'],

  

  

  

  

  

  

  

          categories: []

  

  

  

  

  

  

  

      };

  

  

  

  

  

  

  

      fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 使用测试模式 API 设置打开文件路径

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: testFilePath });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 打开文件

  

  

  

  

  

  

  

      const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  

  

  

  

      await openButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查文件状态元素（应该显示文件名，无修改标记）

  

  

  

  

  

  

  

      const fileStatusAfterOpen = window.locator('#fileStatus');

  

  

  

  

  

  

  

      const statusAfterOpen = await fileStatusAfterOpen.textContent();

  

  

  

  

  

  

  

      console.log('打开后的文件状态:', statusAfterOpen);

  

  

  

  

  

  

  

      expect(statusAfterOpen).toBe('test-modify-status.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 添加新条目

  

  

  

  

  

  

  

      await window.fill('#itemInput', '新条目');

  

  

  

  

  

  

  

      await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

      await window.waitForTimeout(300);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查文件状态元素（应该显示修改标记）

  

  

  

  

  

  

  

      const statusAfterModify = await fileStatusAfterOpen.textContent();

  

  

  

  

  

  

  

      console.log('修改后的文件状态:', statusAfterModify);

  

  

  

  

  

  

  

      expect(statusAfterModify).toContain('●');

  

  

  

  

  

  

  

      expect(statusAfterModify).toContain('test-modify-status.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 清理测试文件

  

  

  

  

  

  

  

      if (fs.existsSync(testFilePath)) {

  

  

  

  

  

  

  

          fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      console.log('✅ 文件修改状态：打开文件后修改测试完成\n');

  

  

  

  

  

  

  

    });

  

  

  

  

  

  

  

  test('28. 文件修改状态：保存后清除修改标记', async () => {

  

  

  

  

  

  

  

      const window = await getWindow();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 创建临时测试文件

  

  

  

  

  

  

  

      const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  

  

  

  

      if (!fs.existsSync(tempDir)) {

  

  

  

  

  

  

  

          fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

      const testFilePath = path.join(tempDir, 'test-save-clear.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 添加条目

  

  

  

  

  

  

  

      await window.fill('#itemInput', '测试条目');

  

  

  

  

  

  

  

      await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

      await window.waitForTimeout(300);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查文件状态（应该是"未命名"）

  

  

  

  

  

  

  

      const fileStatus = window.locator('#fileStatus');

  

  

  

  

  

  

  

      const statusBeforeSave = await fileStatus.textContent();

  

  

  

  

  

  

  

      expect(statusBeforeSave).toBe('未命名');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 使用测试模式 API 设置保存文件路径

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: testFilePath });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 保存文件（另存为）

  

  

  

  

  

  

  

      const saveAsButton = window.locator('button.toolbar-btn[title*="另存为"]');

  

  

  

  

  

  

  

      await saveAsButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(2000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查文件状态（应该显示文件名）

  

  

  

  

  

  

  

      const statusAfterFirstSave = await fileStatus.textContent();

  

  

  

  

  

  

  

      expect(statusAfterFirstSave).toBe('test-save-clear.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证文件是否成功保存

  

  

  

  

  

  

  

      expect(fs.existsSync(testFilePath)).toBe(true);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 添加新条目

  

  

  

  

  

  

  

      await window.fill('#itemInput', '新条目');

  

  

  

  

  

  

  

      await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

      await window.waitForTimeout(300);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查修改标记

  

  

  

  

  

  

  

      const statusBeforeSecondSave = await fileStatus.textContent();

  

  

  

  

  

  

  

      expect(statusBeforeSecondSave).toContain('●');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 再次保存文件（使用另存为，选择相同的文件路径）

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: testFilePath });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      await saveAsButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(2000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证文件是否成功保存

  

  

  

  

  

  

  

      expect(fs.existsSync(testFilePath)).toBe(true);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 读取文件内容，验证数据是否正确

  

  

  

  

  

  

  

      const fileContent = fs.readFileSync(testFilePath, 'utf-8');

  

  

  

  

  

  

  

      const data = JSON.parse(fileContent);

  

  

  

  

  

  

  

      expect(data.items).toContain('测试条目');

  

  

  

  

  

  

  

      expect(data.items).toContain('新条目');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 清理测试文件

  

  

  

  

  

  

  

      if (fs.existsSync(testFilePath)) {

  

  

  

  

  

  

  

          fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      console.log('✅ 文件修改状态：保存后清除修改标记测试完成\n');

  

  

  

  

  

  

  

    });

  

  

  

  

  

  

  

  test('29. 文件修改状态：各种操作的修改检查', async () => {

  

  

  

  

  

  

  

      const window = await getWindow();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 辅助函数：检查文件状态

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                                              const getFileStatus = async () => {

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                                                  const fileStatus = window.locator('#fileStatus');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                                                  return await fileStatus.textContent();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                                              };

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          // 创建临时测试文件

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          if (!fs.existsSync(tempDir)) {

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                              fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          }

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          const testFilePath = path.join(tempDir, 'test-various-ops.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          // 1. 添加条目

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.fill('#itemInput', '条目1');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.waitForTimeout(300);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          // 先保存文件

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                              // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                              return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          }, { filePath: testFilePath });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          const saveButton = window.locator('button.toolbar-btn[title*="另存为"]');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await saveButton.click();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          let status = await getFileStatus();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          expect(status).toBe('test-various-ops.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          // 再添加条目

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.fill('#itemInput', '条目2');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          await window.waitForTimeout(300);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          status = await getFileStatus();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                          expect(status).toContain('●');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 2. 添加分类

  

  

  

  

  

  

  

      await window.fill('#categoryInput', '分类1');

  

  

  

  

  

  

  

      await window.click('button:has-text("添加分类")');

  

  

  

  

  

  

  

      await window.waitForTimeout(300);

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          status = await getFileStatus();

  

  

  

  

  

  

  

                          expect(status).toContain('●');

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          // 3. 拖拽条目到分类

  

  

  

  

  

  

  

      const itemContainer = window.locator('#itemContainer');

  

  

  

  

  

  

  

      const categoryContainer = window.locator('#categoryContainer');

  

  

  

  

  

  

  

      const item = itemContainer.locator('.draggable-item').first();

  

  

  

  

  

  

  

      const category = categoryContainer.locator('.category-box').first();

  

  

  

  

  

  

  

      await item.dragTo(category);

  

  

  

  

  

  

  

      await window.waitForTimeout(500);

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          status = await getFileStatus();

  

  

  

  

  

  

  

                          expect(status).toContain('●');

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          // 4. 编辑条目

  

  

  

  

  

  

  

      const categoryItem = category.locator('.draggable-item').first();

  

  

  

  

  

  

  

      await categoryItem.hover();

  

  

  

  

  

  

  

      await window.waitForTimeout(200);

  

  

  

  

  

  

  

      await categoryItem.locator('.edit-btn').click();

  

  

  

  

  

  

  

      await window.waitForSelector('#editItemModal');

  

  

  

  

  

  

  

      await window.fill('#editItemInput', '已编辑条目');

  

  

  

  

  

  

  

      await window.click('#editItemModal button:has-text("确定")');

  

  

  

  

  

  

  

      await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

  

  

  

  

  

  

                          await window.waitForTimeout(300);

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          status = await getFileStatus();

  

  

  

  

  

  

  

                          expect(status).toContain('●');

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          // 5. 删除分类

  

  

  

  

  

  

  

      await category.locator('.delete-category-btn').click();

  

  

  

  

  

  

  

      await window.waitForSelector('#deleteModal');

  

  

  

  

  

  

  

      await window.click('#confirmDeleteBtn');

  

  

  

  

  

  

  

      await window.waitForTimeout(500);

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          status = await getFileStatus();

  

  

  

  

  

  

  

                          expect(status).toContain('●');

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          // 6. 撤销操作

  

  

  

  

  

  

  

      await window.click('button:has-text("撤销")');

  

  

  

  

  

  

  

      await window.waitForTimeout(300);

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          status = await getFileStatus();

  

  

  

  

  

  

  

                          expect(status).toContain('●');

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          // 7. 重做操作

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                                              await window.click('#redoBtn');

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                                              await window.waitForTimeout(300);

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                          

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                                              status = await getFileStatus();

  

  

  

  

  

  

  

      

  

  

  

  

  

  

  

                                              expect(status).toContain('●');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      console.log('✅ 文件修改状态：各种操作的修改检查测试完成\n');

  

  

  

  

  

  

  

    });

  

  

  

  

  

  

  

  // ==================== 文件切换相关测试 ====================

  

  

  

  

  

  

  

  test('30. 文件切换：修改后打开文件选择保存并打开', async () => {

  

  

  

  

  

  

  

      const window = await getWindow();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 创建两个测试文件

  

  

  

  

  

  

  

      const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  

  

  

  

      if (!fs.existsSync(tempDir)) {

  

  

  

  

  

  

  

          fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  

  

  

  

      }

  

  

  

  

  

  

  

      const file1Path = path.join(tempDir, 'file1.json');

  

  

  

  

  

  

  

      const file2Path = path.join(tempDir, 'file2.json');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 准备测试数据

  

  

  

  

  

  

  

      const file1Data = {

  

  

  

  

  

  

  

          items: ['文件1条目1', '文件1条目2'],

  

  

  

  

  

  

  

          categories: []

  

  

  

  

  

  

  

      };

  

  

  

  

  

  

  

      const file2Data = {

  

  

  

  

  

  

  

          items: ['文件2条目1', '文件2条目2'],

  

  

  

  

  

  

  

          categories: []

  

  

  

  

  

  

  

      };

  

  

  

  

  

  

  

      fs.writeFileSync(file1Path, JSON.stringify(file1Data, null, 2), 'utf-8');

  

  

  

  

  

  

  

      fs.writeFileSync(file2Path, JSON.stringify(file2Data, null, 2), 'utf-8');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 打开第一个文件

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: file1Path });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  

  

  

  

      await openButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 修改第一个文件

  

  

  

  

  

  

  

      await window.fill('#itemInput', '新条目');

  

  

  

  

  

  

  

      await window.click('button:has-text("添加条目")');

  

  

  

  

  

  

  

      await window.waitForTimeout(300);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查修改标记

  

  

  

  

  

  

  

      const titleBeforeSwitch = await window.title();

  

  

  

  

  

  

  

      expect(titleBeforeSwitch).toContain('●');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 准备打开第二个文件

  

  

  

  

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

  

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

  

  

  

  

          return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  

  

  

  

      }, { filePath: file2Path });

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 点击打开按钮（应该显示确认模态框）

  

  

  

  

  

  

  

      await openButton.click();

  

  

  

  

  

  

  

      await window.waitForTimeout(500);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查确认模态框是否显示

  

  

  

  

  

  

  

      const confirmModal = window.locator('#openFileConfirmModal');

  

  

  

  

  

  

  

      await expect(confirmModal).toBeVisible();

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 点击"保存并打开"按钮

  

  

  

  

  

  

  

      await window.click('#saveAndOpenBtn');

  

  

  

  

  

  

  

      await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 检查窗口标题（应该显示第二个文件名，无修改标记）

  

  

  

  

  

  

  

      const titleAfterSwitch = await window.title();

  

  

  

  

  

  

  

      expect(titleAfterSwitch).toBe('file2.json - 条目分类管理器');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证第一个文件已保存

  

  

  

  

  

  

  

      const file1Content = JSON.parse(fs.readFileSync(file1Path, 'utf-8'));

  

  

  

  

  

  

  

      expect(file1Content.items).toContain('新条目');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 验证第二个文件已加载

  

  

  

  

  

  

  

      const itemContainer = window.locator('#itemContainer');

  

  

  

  

  

  

  

      const items = await itemContainer.locator('.draggable-item');

  

  

  

  

  

  

  

      await expect(items).toHaveCount(2);

  

  

  

  

  

  

  

      await expect(items.first()).toContainText('文件2条目1');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      // 清理测试文件

  

  

  

  

  

  

  

      if (fs.existsSync(file1Path)) fs.unlinkSync(file1Path);

  

  

  

  

  

  

  

      if (fs.existsSync(file2Path)) fs.unlinkSync(file2Path);

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

      console.log('✅ 文件切换：修改后打开文件选择保存并打开测试完成\n');

  

  

  

  

  

  

  

    });

  

  

  

  

  

  

  

  test('31. 文件切换：修改后打开文件选择放弃修改', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建两个测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const file1Path = path.join(tempDir, 'file1-discard.json');

  

  

  

  const file2Path = path.join(tempDir, 'file2-discard.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const file1Data = {

  

  

  

      items: ['文件1条目1'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  const file2Data = {

  

  

  

      items: ['文件2条目1'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(file1Path, JSON.stringify(file1Data, null, 2), 'utf-8');

  

  

  

  fs.writeFileSync(file2Path, JSON.stringify(file2Data, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 打开第一个文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: file1Path });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 修改第一个文件

  

  

  

  await window.fill('#itemInput', '新条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 准备打开第二个文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: file2Path });

  

  

  

  

  

  

  

  // 点击打开按钮

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 点击"放弃修改"按钮

  

  

  

  await window.click('#discardAndOpenBtn');

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证第一个文件未保存

  

  

  

  const file1Content = JSON.parse(fs.readFileSync(file1Path, 'utf-8'));

  

  

  

  expect(file1Content.items).not.toContain('新条目');

  

  

  

  

  

  

  

  // 验证第二个文件已加载

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileNameAfterSwitch = await window.title();

  

  

  

  expect(fileNameAfterSwitch).toBe('file2-discard.json');

  

  

  

  

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  await expect(items).toHaveCount(1);

  

  

  

  await expect(items.first()).toContainText('文件2条目1');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(file1Path)) fs.unlinkSync(file1Path);

  

  

  

  if (fs.existsSync(file2Path)) fs.unlinkSync(file2Path);

  

  

  

  

  

  

  

  console.log('✅ 文件切换：修改后打开文件选择放弃修改测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('32. 文件切换：修改后打开文件选择取消', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建两个测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const file1Path = path.join(tempDir, 'file1-cancel.json');

  

  

  

  const file2Path = path.join(tempDir, 'file2-cancel.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const file1Data = {

  

  

  

      items: ['文件1条目1'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  const file2Data = {

  

  

  

      items: ['文件2条目1'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(file1Path, JSON.stringify(file1Data, null, 2), 'utf-8');

  

  

  

  fs.writeFileSync(file2Path, JSON.stringify(file2Data, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 打开第一个文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: file1Path });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 修改第一个文件

  

  

  

  await window.fill('#itemInput', '新条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 记录当前条目数

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const itemCountBefore = await itemContainer.locator('.draggable-item').count();

  

  

  

  

  

  

  

  // 准备打开第二个文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: file2Path });

  

  

  

  

  

  

  

  // 点击打开按钮

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 点击"取消"按钮

  

  

  

  await window.click('#cancelOpenFileBtn');

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 检查确认模态框是否隐藏

  

  

  

  const confirmModal = window.locator('#openFileConfirmModal');

  

  

  

  await expect(confirmModal).not.toBeVisible();

  

  

  

  

  

  

  

  // 验证文件内容未改变（仍然显示第一个文件的内容）

  

  

  

  const itemCountAfter = await itemContainer.locator('.draggable-item').count();

  

  

  

  expect(itemCountAfter).toBe(itemCountBefore);

  

  

  

  

  

  

  

  // 验证文件名显示（仍然显示第一个文件名，有修改标记）

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileNameAfterCancel = await window.title();

  

  

  

  expect(fileNameAfterCancel).toContain('file1-cancel.json');

  

  

  

  expect(fileNameAfterCancel).toContain('●');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(file1Path)) fs.unlinkSync(file1Path);

  

  

  

  if (fs.existsSync(file2Path)) fs.unlinkSync(file2Path);

  

  

  

  

  

  

  

  console.log('✅ 文件切换：修改后打开文件选择取消测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('33. 文件切换：修改后新建文件选择保存并新建', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const file1Path = path.join(tempDir, 'file1-newfile.json');

  

  

  

  const newFilePath = path.join(tempDir, 'newfile.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const file1Data = {

  

  

  

      items: ['文件1条目1'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(file1Path, JSON.stringify(file1Data, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 打开第一个文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: file1Path });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 修改第一个文件

  

  

  

  await window.fill('#itemInput', '新条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 设置新文件路径

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: newFilePath });

  

  

  

  

  

  

  

  // 点击新建按钮

  

  

  

  const newButton = window.locator('button:has-text("新建")');

  

  

  

  await newButton.click();

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 点击"保存并新建"按钮

  

  

  

  await window.click('#saveAndNewFileBtn');

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证第一个文件已保存

  

  

  

  const file1Content = JSON.parse(fs.readFileSync(file1Path, 'utf-8'));

  

  

  

  expect(file1Content.items).toContain('新条目');

  

  

  

  

  

  

  

  // 验证已新建文件（内容为空）

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileNameAfterNew = await window.title();

  

  

  

  expect(fileNameAfterNew).toBe('未命名');

  

  

  

  

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  await expect(items).toHaveCount(0);

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(file1Path)) fs.unlinkSync(file1Path);

  

  

  

  if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);

  

  

  

  

  

  

  

  console.log('✅ 文件切换：修改后新建文件选择保存并新建测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  // ==================== 边界情况测试 ====================

  

  

  

  

  

  

  

  test('34. 边界情况：打开空文件', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建空文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const emptyFilePath = path.join(tempDir, 'empty.json');

  

  

  

  fs.writeFileSync(emptyFilePath, '{}', 'utf-8');

  

  

  

  

  

  

  

  // 使用测试模式 API 设置打开文件路径

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: emptyFilePath });

  

  

  

  

  

  

  

  // 打开空文件

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证文件名显示

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileName = await window.title();

  

  

  

  expect(fileName).toBe('empty.json');

  

  

  

  

  

  

  

  // 验证内容为空

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  await expect(items).toHaveCount(0);

  

  

  

  

  

  

  

  const categoryContainer = window.locator('#categoryContainer');

  

  

  

  const categories = await categoryContainer.locator('.category-box');

  

  

  

  await expect(categories).toHaveCount(0);

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(emptyFilePath)) fs.unlinkSync(emptyFilePath);

  

  

  

  

  

  

  

  console.log('✅ 边界情况：打开空文件测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('35. 边界情况：打开格式错误的文件', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建格式错误的文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const invalidFilePath = path.join(tempDir, 'invalid.json');

  

  

  

  fs.writeFileSync(invalidFilePath, '{ invalid json }', 'utf-8');

  

  

  

  

  

  

  

  // 使用测试模式 API 设置打开文件路径

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: invalidFilePath });

  

  

  

  

  

  

  

  // 打开格式错误的文件

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证是否显示错误提示

  

  

  

  const alert = window.locator('.alert');

  

  

  

  await expect(alert).toBeVisible();

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);

  

  

  

  

  

  

  

  console.log('✅ 边界情况：打开格式错误的文件测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('36. 边界情况：快速连续打开多个文件', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建多个测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const files = [];

  

  

  

  for (let i = 1; i <= 5; i++) {

  

  

  

      const filePath = path.join(tempDir, `quick-file${i}.json`);

  

  

  

      const data = {

  

  

  

          items: [`文件${i}条目1`, `文件${i}条目2`],

  

  

  

          categories: []

  

  

  

      };

  

  

  

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  

  

  

      files.push(filePath);

  

  

  

  }

  

  

  

  

  

  

  

  // 快速连续打开多个文件

  

  

  

  for (let i = 0; i < files.length; i++) {

  

  

  

      await window.evaluate(async ({ filePath }) => {

  

  

  

          // @ts-ignore - 测试模式 API

  

  

  

          return await window.electron.testSetOpenFilePath(filePath);

  

  

  

      }, { filePath: files[i] });

  

  

  

  

  

  

  

      const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

      await openButton.click();

  

  

  

      await window.waitForTimeout(300); // 快速打开

  

  

  

  }

  

  

  

  

  

  

  

  // 等待最后一个文件加载完成

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证最后一个文件已加载

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileName = await window.title();

  

  

  

  expect(fileName).toBe('quick-file5.json');

  

  

  

  

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  await expect(items).toHaveCount(2);

  

  

  

  await expect(items.first()).toContainText('文件5条目1');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  files.forEach(filePath => {

  

  

  

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  

  

  

  });

  

  

  

  

  

  

  

  console.log('✅ 边界情况：快速连续打开多个文件测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  // ==================== 复杂工作流测试 ====================

  

  

  

  

  

  

  

  test('37. 复杂工作流：打开→修改→保存→修改→另存为→修改→保存', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const originalFilePath = path.join(tempDir, 'original.json');

  

  

  

  const saveAsFilePath = path.join(tempDir, 'saveas.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const originalData = {

  

  

  

      items: ['原始条目1', '原始条目2'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(originalFilePath, JSON.stringify(originalData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 1. 打开文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: originalFilePath });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 2. 修改文件

  

  

  

  await window.fill('#itemInput', '第一次修改');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 3. 保存文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: originalFilePath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 4. 再次修改

  

  

  

  await window.fill('#itemInput', '第二次修改');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 5. 另存为

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: saveAsFilePath });

  

  

  

  

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 6. 再次修改

  

  

  

  await window.fill('#itemInput', '第三次修改');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 7. 保存

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: saveAsFilePath });

  

  

  

  

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证原始文件

  

  

  

  const originalContent = JSON.parse(fs.readFileSync(originalFilePath, 'utf-8'));

  

  

  

  expect(originalContent.items).toContain('第一次修改');

  

  

  

  expect(originalContent.items).not.toContain('第二次修改');

  

  

  

  expect(originalContent.items).not.toContain('第三次修改');

  

  

  

  

  

  

  

  // 验证另存为文件

  

  

  

  const saveAsContent = JSON.parse(fs.readFileSync(saveAsFilePath, 'utf-8'));

  

  

  

  expect(saveAsContent.items).toContain('第二次修改');

  

  

  

  expect(saveAsContent.items).toContain('第三次修改');

  

  

  

  

  

  

  

  // 验证当前文件名

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileName = await window.title();

  

  

  

  expect(fileName).toBe('saveas.json');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);

  

  

  

  if (fs.existsSync(saveAsFilePath)) fs.unlinkSync(saveAsFilePath);

  

  

  

  

  

  

  

  console.log('✅ 复杂工作流：打开→修改→保存→修改→另存为→修改→保存测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('38. 复杂工作流：打开→修改→撤销→修改→重做→保存', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const testFilePath = path.join(tempDir, 'undo-redo-save.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const testData = {

  

  

  

      items: ['原始条目'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 1. 打开文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 2. 修改文件

  

  

  

  await window.fill('#itemInput', '第一次修改');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 3. 撤销

  

  

  

  await window.click('button:has-text("撤销")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 4. 再次修改

  

  

  

  await window.fill('#itemInput', '第二次修改');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 5. 重做

  

  

  

  await window.click('button:has-text("重复")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 6. 保存文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 验证文件内容

  

  

  

  const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

  

  

  

  expect(content.items).toContain('第一次修改');

  

  

  

  expect(content.items).toContain('第二次修改');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

  console.log('✅ 复杂工作流：打开→修改→撤销→修改→重做→保存测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('39. 复杂工作流：新建→添加大量数据→保存→打开→验证', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const testFilePath = path.join(tempDir, 'large-data.json');

  

  

  

  

  

  

  

  // 1. 新建文件

  

  

  

  const newButton = window.locator('button:has-text("新建")');

  

  

  

  await newButton.click();

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'visible' });

  

  

  

  await window.click('#confirmNewFileBtn');

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'hidden' });

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 2. 添加大量数据

  

  

  

  const largeItems = [];

  

  

  

  for (let i = 1; i <= 50; i++) {

  

  

  

      const itemName = `条目${i}`;

  

  

  

      largeItems.push(itemName);

  

  

  

      await window.fill('#itemInput', itemName);

  

  

  

      await window.click('button:has-text("添加条目")');

  

  

  

      await window.waitForTimeout(50);

  

  

  

  }

  

  

  

  

  

  

  

  // 添加分类

  

  

  

  for (let i = 1; i <= 10; i++) {

  

  

  

      await window.fill('#categoryInput', `分类${i}`);

  

  

  

      await window.click('button:has-text("添加分类")');

  

  

  

      await window.waitForTimeout(50);

  

  

  

  

  

  

  

      // 拖拽一些条目到分类

  

  

  

      const itemContainer = window.locator('#itemContainer');

  

  

  

      const categoryContainer = window.locator('#categoryContainer');

  

  

  

      const categories = categoryContainer.locator('.category-box');

  

  

  

  

  

  

  

      for (let j = 0; j < 3; j++) {

  

  

  

          const item = itemContainer.locator('.draggable-item').first();

  

  

  

          if (await item.count() > 0) {

  

  

  

              await item.dragTo(categories.nth(i - 1));

  

  

  

              await window.waitForTimeout(100);

  

  

  

          }

  

  

  

      }

  

  

  

  }

  

  

  

  

  

  

  

  // 3. 保存文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 4. 新建文件

  

  

  

  await newButton.click();

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'visible' });

  

  

  

  await window.click('#confirmNewFileBtn');

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'hidden' });

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 5. 打开文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 6. 验证数据

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  const itemCount = await items.count();

  

  

  

  

  

  

  

  const categoryContainer = window.locator('#categoryContainer');

  

  

  

  const categories = await categoryContainer.locator('.category-box');

  

  

  

  const categoryCount = await categories.count();

  

  

  

  

  

  

  

  // 验证总数（50个条目，其中30个在分类中，20个在列表中）

  

  

  

  expect(itemCount + categoryCount).toBeGreaterThan(0);

  

  

  

  

  

  

  

  // 验证文件内容

  

  

  

  const content = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

  

  

  

  expect(content.items.length + content.categories.reduce((sum, cat) => sum + cat.items.length, 0)).toBe(50);

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

  console.log('✅ 复杂工作流：新建→添加大量数据→保存→打开→验证测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('40. 复杂工作流：打开→批量导入→修改→保存→打开→验证', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const mainFilePath = path.join(tempDir, 'main.json');

  

  

  

  const importFilePath = path.join(tempDir, 'import.json');

  

  

  

  

  

  

  

  // 准备主文件数据

  

  

  

  const mainData = {

  

  

  

      items: ['主文件条目1', '主文件条目2'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(mainFilePath, JSON.stringify(mainData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 准备导入数据

  

  

  

  const importData = ['导入条目1', '导入条目2', '导入条目3', '导入条目4', '导入条目5'];

  

  

  

  fs.writeFileSync(importFilePath, JSON.stringify(importData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 1. 打开主文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: mainFilePath });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 2. 批量导入

  

  

  

  const importButton = window.locator('button[title="批量导入条目"]');

  

  

  

  await importButton.click();

  

  

  

  await window.waitForSelector('#importModal', { state: 'visible' });

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  await window.click('label[for="importMethodFile"]');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  const fileInput = window.locator('#importFile');

  

  

  

  await fileInput.setInputFiles(importFilePath);

  

  

  

  

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  const confirmBtn = window.locator('#importModal button[type="button"].btn-primary');

  

  

  

  await confirmBtn.click();

  

  

  

  await window.waitForSelector('#importModal', { state: 'hidden', timeout: 5000 });

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 3. 修改

  

  

  

  await window.fill('#itemInput', '新添加的条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 4. 保存

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: mainFilePath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 5. 新建文件

  

  

  

  const newButton = window.locator('button:has-text("新建")');

  

  

  

  await newButton.click();

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'visible' });

  

  

  

  await window.click('#confirmNewFileBtn');

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'hidden' });

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 6. 再次打开主文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: mainFilePath });

  

  

  

  

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 7. 验证

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  const itemCount = await items.count();

  

  

  

  

  

  

  

  // 应该有 2（原始）+ 5（导入）+ 1（新添加）= 8 个条目

  

  

  

  expect(itemCount).toBe(8);

  

  

  

  

  

  

  

  // 验证文件内容

  

  

  

  const content = JSON.parse(fs.readFileSync(mainFilePath, 'utf-8'));

  

  

  

  expect(content.items).toContain('主文件条目1');

  

  

  

  expect(content.items).toContain('导入条目1');

  

  

  

  expect(content.items).toContain('新添加的条目');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);

  

  

  

  if (fs.existsSync(importFilePath)) fs.unlinkSync(importFilePath);

  

  

  

  

  

  

  

  console.log('✅ 复杂工作流：打开→批量导入→修改→保存→打开→验证测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  // ==================== 文件名显示相关测试 ====================

  

  

  

  

  

  

  

  test('41. 文件名显示：新建文件时的显示', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 检查初始文件名

  

  

  

  // 使用窗口标题代替

  

  

  

  const initialFileName = await window.title();

  

  

  

  expect(initialFileName).toBe('未命名');

  

  

  

  

  

  

  

  // 新建文件

  

  

  

  const newButton = window.locator('button:has-text("新建")');

  

  

  

  await newButton.click();

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'visible' });

  

  

  

  await window.click('#confirmNewFileBtn');

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'hidden' });

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 检查新建后的文件名

  

  

  

  const fileNameAfterNew = await window.title();

  

  

  

  expect(fileNameAfterNew).toBe('未命名');

  

  

  

  

  

  

  

  console.log('✅ 文件名显示：新建文件时的显示测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('42. 文件名显示：打开文件时的显示', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const testFilePath = path.join(tempDir, 'filename-test.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const testData = {

  

  

  

      items: ['测试条目'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 使用测试模式 API 设置打开文件路径

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  // 打开文件

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 检查文件名显示

  

  

  

  // 使用窗口标题代替

  

  

  

  const fileName = await window.title();

  

  

  

  expect(fileName).toBe('filename-test.json');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

  console.log('✅ 文件名显示：打开文件时的显示测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('43. 文件名显示：另存为后文件名更新', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const originalPath = path.join(tempDir, 'original.json');

  

  

  

  const saveAsPath = path.join(tempDir, 'saveas-display.json');

  

  

  

  

  

  

  

  // 添加一些数据

  

  

  

  await window.fill('#itemInput', '测试条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 第一次保存

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: originalPath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 检查文件名

  

  

  

  // 使用窗口标题代替

  

  

  

  let fileName = await window.title();

  

  

  

  expect(fileName).toBe('original.json');

  

  

  

  

  

  

  

  // 修改数据

  

  

  

  await window.fill('#itemInput', '新条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 另存为

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: saveAsPath });

  

  

  

  

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 检查文件名更新

  

  

  

  fileName = await window.title();

  

  

  

  expect(fileName).toBe('saveas-display.json');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);

  

  

  

  if (fs.existsSync(saveAsPath)) fs.unlinkSync(saveAsPath);

  

  

  

  

  

  

  

  console.log('✅ 文件名显示：另存为后文件名更新测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('44. 文件名显示：修改后显示修改标记', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  // 创建测试文件

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const testFilePath = path.join(tempDir, 'modified-mark.json');

  

  

  

  

  

  

  

  // 准备测试数据

  

  

  

  const testData = {

  

  

  

      items: ['原始条目'],

  

  

  

      categories: []

  

  

  

  };

  

  

  

  fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  // 打开文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 检查文件名（无修改标记）

  

  

  

  // 使用窗口标题代替

  

  

  

  let fileName = await window.title();

  

  

  

  expect(fileName).toBe('modified-mark.json');

  

  

  

  

  

  

  

  // 修改数据

  

  

  

  await window.fill('#itemInput', '新条目');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 检查文件名（有修改标记）

  

  

  

  fileName = await window.title();

  

  

  

  expect(fileName).toContain('●');

  

  

  

  expect(fileName).toContain('modified-mark.json');

  

  

  

  

  

  

  

  // 保存文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: testFilePath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 检查文件名（修改标记消失）

  

  

  

  fileName = await window.title();

  

  

  

  expect(fileName).toBe('modified-mark.json');

  

  

  

  expect(fileName).not.toContain('●');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

  

  

  

  

  

  

  

  console.log('✅ 文件名显示：修改后显示修改标记测试完成\n');

  

  

  

  });

  

  

  

  

  

  

  

  test('45. 综合测试：完整的一天工作流程', async () => {

  

  

  

  const window = await getWindow();

  

  

  

  

  

  

  

  const tempDir = path.join(__dirname, '..', 'temp');

  

  

  

  if (!fs.existsSync(tempDir)) {

  

  

  

      fs.mkdirSync(tempDir, { recursive: true });

  

  

  

  }

  

  

  

  const workFilePath = path.join(tempDir, 'my-work.json');

  

  

  

  

  

  

  

  // 场景：开始一天的工作

  

  

  

  console.log('\n📋 场景：开始一天的工作');

  

  

  

  

  

  

  

  // 1. 打开昨天的工作文件

  

  

  

  const yesterdayData = {

  

  

  

      items: ['待办事项1', '待办事项2', '待办事项3'],

  

  

  

      categories: [

  

  

  

          { name: '紧急', items: ['待办事项1'] },

  

  

  

          { name: '普通', items: ['待办事项2'] }

  

  

  

      ]

  

  

  

  };

  

  

  

  fs.writeFileSync(workFilePath, JSON.stringify(yesterdayData, null, 2), 'utf-8');

  

  

  

  

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: workFilePath });

  

  

  

  

  

  

  

  const openButton = window.locator('button.toolbar-btn:has-text("打开")');

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 2. 完成昨天的待办事项（删除）

  

  

  

  const itemContainer = window.locator('#itemContainer');

  

  

  

  const firstItem = itemContainer.locator('.draggable-item').first();

  

  

  

  await firstItem.hover();

  

  

  

  await window.waitForTimeout(200);

  

  

  

  await firstItem.locator('.delete-btn').click();

  

  

  

  await window.waitForSelector('#deleteModal');

  

  

  

  await window.click('#confirmDeleteBtn');

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 3. 添加今天的新待办事项

  

  

  

  await window.fill('#itemInput', '新待办事项1');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  await window.fill('#itemInput', '新待办事项2');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  await window.fill('#itemInput', '新待办事项3');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 4. 创建新的分类

  

  

  

  await window.fill('#categoryInput', '今天');

  

  

  

  await window.click('button:has-text("添加分类")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 5. 整理任务到新分类

  

  

  

  const categoryContainer = window.locator('#categoryContainer');

  

  

  

  const todayCategory = categoryContainer.locator('.category-box').last();

  

  

  

  const items = await itemContainer.locator('.draggable-item');

  

  

  

  for (let i = 0; i < 3; i++) {

  

  

  

      await items.nth(0).dragTo(todayCategory);

  

  

  

      await window.waitForTimeout(300);

  

  

  

  }

  

  

  

  

  

  

  

  // 6. 使用搜索功能查找某个任务

  

  

  

  await window.fill('#searchInput', '新待办');

  

  

  

  await window.waitForTimeout(500);

  

  

  

  const highlights = window.locator('mark.search-highlight');

  

  

  

  await expect(highlights).toHaveCount(3);

  

  

  

  await window.fill('#searchInput', '');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 7. 编辑某个任务

  

  

  

  const categoryItems = todayCategory.locator('.draggable-item');

  

  

  

  await categoryItems.first().hover();

  

  

  

  await window.waitForTimeout(200);

  

  

  

  await categoryItems.first().locator('.edit-btn').click();

  

  

  

  await window.waitForSelector('#editItemModal');

  

  

  

  await window.fill('#editItemInput', '已完成的待办事项1');

  

  

  

  await window.click('#editItemModal button:has-text("确定")');

  

  

  

  await window.waitForSelector('#editItemModal', { state: 'hidden' });

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 8. 撤销编辑

  

  

  

  await window.click('button:has-text("撤销")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 9. 保存工作

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetSaveFilePath(filePath);

  

  

  

  }, { filePath: workFilePath });

  

  

  

  

  

  

  

  const saveButton = window.locator('button:has-text("另存为")');

  

  

  

  await saveButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 10. 验证保存的内容

  

  

  

  const savedContent = JSON.parse(fs.readFileSync(workFilePath, 'utf-8'));

  

  

  

  expect(savedContent.items.length).toBeGreaterThan(0);

  

  

  

  expect(savedContent.categories.length).toBe(3); // 紧急、普通、今天

  

  

  

  

  

  

  

  // 11. 新建文件开始新的工作

  

  

  

  const newButton = window.locator('button:has-text("新建")');

  

  

  

  await newButton.click();

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'visible' });

  

  

  

  await window.click('#confirmNewFileBtn');

  

  

  

  await window.waitForSelector('#newFileModal', { state: 'hidden' });

  

  

  

  await window.waitForTimeout(500);

  

  

  

  

  

  

  

  // 12. 添加新任务

  

  

  

  await window.fill('#itemInput', '下午会议准备');

  

  

  

  await window.click('button:has-text("添加条目")');

  

  

  

  await window.waitForTimeout(300);

  

  

  

  

  

  

  

  // 13. 再次打开工作文件

  

  

  

  await window.evaluate(async ({ filePath }) => {

  

  

  

      // @ts-ignore - 测试模式 API

  

  

  

      return await window.electron.testSetOpenFilePath(filePath);

  

  

  

  }, { filePath: workFilePath });

  

  

  

  

  

  

  

  await openButton.click();

  

  

  

  await window.waitForTimeout(1000);

  

  

  

  

  

  

  

  // 14. 验证工作内容

  

  

  

  const finalFileName = await window.title();

  

  

  

  expect(finalFileName).toBe('my-work.json');

  

  

  

  

  

  

  

  // 清理测试文件

  

  

  

  if (fs.existsSync(workFilePath)) fs.unlinkSync(workFilePath);

  

  

  

  

  

  

  

  console.log('✅ 综合测试：完整的一天工作流程测试完成\n');

  

  

  

  

  

  

  

  

  

  

  

  

  

  

  

                });
});
