const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 测试模式：用于自动化测试，跳过系统对话框
const TEST_MODE = process.env.TEST_MODE === 'true';

// 测试模式下的文件路径缓存
let testModeOpenFilePath = null;
let testModeSaveFilePath = null;

// 开发环境自动重载（测试模式下禁用）
if (process.env.NODE_ENV !== 'production' && !TEST_MODE) {
    try {
        require('electron-reload')(path.join(__dirname, '..'), {
            // Electron 可执行文件路径
            electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
            // 重载方式: 'reload' - 仅重载渲染进程，更快
            hardResetMethod: 'reload',
            // 启用详细日志输出
            debug: true,
            // 监听渲染进程文件变化
            watchRenderer: true,
            // 等待渲染进程关闭后再重载，避免竞态条件
            awaitRenderAfterClose: true,
            // 使用轮询模式监听文件变化（在某些文件系统上更可靠）
            usePolling: false,
            // 轮询间隔（毫秒），仅当 usePolling: true 时生效
            interval: 1000,
            // 忽略的文件和目录
            ignored: /node_modules|\.git|dist|build|\.vscode|\.DS_Store|Thumbs\.db|.*\.log/i,
            // 需要监听的文件扩展名
            extensions: ['js', 'html', 'css', 'json']
        });
        console.log('✓ electron-reload 已启用 - 监听文件变化自动重载');
    } catch (e) {
        console.log('electron-reload not found');
    }
} else if (TEST_MODE) {
    console.log('✓ 测试模式已启用 - electron-reload 已禁用');
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: '条目分类管理器',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, '../icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC handlers for file operations

// 打开文件对话框
ipcMain.handle('open-file-dialog', async () => {
    let filePath;

    if (TEST_MODE && testModeOpenFilePath) {
        // 测试模式：使用缓存的文件路径
        filePath = testModeOpenFilePath;
        console.log(`[TEST MODE] 使用缓存的打开文件路径: ${filePath}`);
    } else {
        // 正常模式：显示系统对话框
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        filePath = result.filePaths[0];
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return {
            path: filePath,
            name: path.basename(filePath),
            content: content
        };
    } catch (error) {
        throw new Error('读取文件失败: ' + error.message);
    }
});

// 保存文件对话框
ipcMain.handle('save-file-dialog', async (event, defaultName) => {
    let filePath;

    if (TEST_MODE && testModeSaveFilePath) {
        // 测试模式：使用缓存的文件路径
        filePath = testModeSaveFilePath;
        console.log(`[TEST MODE] 使用缓存的保存文件路径: ${filePath}`);
    } else {
        // 正常模式：显示系统对话框
        const result = await dialog.showSaveDialog(mainWindow, {
            defaultPath: defaultName || '未命名.json',
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (result.canceled || !result.filePath) {
            return null;
        }

        filePath = result.filePath;
    }

    return filePath;
});

// 保存文件
ipcMain.handle('save-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 读取文件
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 更新窗口标题
ipcMain.on('update-window-title', (event, title) => {
    if (mainWindow) {
        mainWindow.setTitle(title || '条目分类管理器');
    }
});

// ==================== 测试模式专用 IPC handlers ====================

// 设置测试模式下的打开文件路径
ipcMain.handle('test-set-open-file-path', (event, filePath) => {
    if (!TEST_MODE) {
        throw new Error('此功能仅在测试模式下可用');
    }
    testModeOpenFilePath = filePath;
    console.log(`[TEST MODE] 设置打开文件路径: ${filePath}`);
    return { success: true };
});

// 设置测试模式下的保存文件路径
ipcMain.handle('test-set-save-file-path', (event, filePath) => {
    if (!TEST_MODE) {
        throw new Error('此功能仅在测试模式下可用');
    }
    testModeSaveFilePath = filePath;
    console.log(`[TEST MODE] 设置保存文件路径: ${filePath}`);
    return { success: true };
});

// 清除测试模式下的文件路径
ipcMain.handle('test-clear-file-paths', () => {
    if (!TEST_MODE) {
        throw new Error('此功能仅在测试模式下可用');
    }
    testModeOpenFilePath = null;
    testModeSaveFilePath = null;
    console.log('[TEST MODE] 清除文件路径');
    return { success: true };
});

// 获取测试模式状态
ipcMain.handle('test-get-mode', () => {
    return { testMode: TEST_MODE };
});