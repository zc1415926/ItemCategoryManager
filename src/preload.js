const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    saveFileDialog: (defaultName) => ipcRenderer.invoke('save-file-dialog', defaultName),
    saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    updateWindowTitle: (title) => ipcRenderer.send('update-window-title', title),
    isElectron: true
});

// 测试模式专用 API
contextBridge.exposeInMainWorld('electron', {
    // 设置测试模式下的打开文件路径
    testSetOpenFilePath: (filePath) => ipcRenderer.invoke('test-set-open-file-path', filePath),
    // 设置测试模式下的保存文件路径
    testSetSaveFilePath: (filePath) => ipcRenderer.invoke('test-set-save-file-path', filePath),
    // 清除测试模式下的文件路径
    testClearFilePaths: () => ipcRenderer.invoke('test-clear-file-paths'),
    // 获取测试模式状态
    testGetMode: () => ipcRenderer.invoke('test-get-mode')
});