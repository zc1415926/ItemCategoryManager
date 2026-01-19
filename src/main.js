let itemIdCounter = 0;
let categoryIdCounter = 0;
let elementToDelete = null; // 存储要删除的元素
let deleteType = null; // 存储删除类型：'item' 或 'category'
let currentFilePath = null; // 当前关联的文件路径
let currentFileName = null; // 当前文件名
let fileHandleInstance = null; // 文件系统API的文件句柄（用于原生文件系统访问）
let originalFileContent = null; // 原始文件内容（用于检查是否已修改）
let pendingFileToOpen = null; // 待打开的文件（用于确认后打开）

// 存储当前正在编辑的条目
let editingItem = null;
// 存储当前正在编辑的分类
let editingCategory = null;

// 搜索相关变量
let searchResults = []; // 存储搜索结果
let currentSearchIndex = -1; // 当前搜索结果的索引
let searchQuery = ''; // 当前搜索关键词

// 创建条目元素的辅助函数
function createItemElement(text, id, container) {
    const item = document.createElement('div');
    item.className = 'draggable-item';
    item.id = id;
    item.draggable = true;
    item.textContent = text;
    
    // 添加编辑按钮
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '✎';
    editBtn.onclick = function(e) {
        e.stopPropagation();
        openEditItemModal(item);
    };
    item.appendChild(editBtn);
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        elementToDelete = item;
        deleteType = 'item';
        document.getElementById('deleteModalLabel').textContent = '确认删除条目';
        document.getElementById('deleteModalContent').innerHTML = `
<p>确定要删除以下条目吗？</p>
<div class="alert alert-warning">
<strong>${text}</strong>
</div>
`;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    };
    item.appendChild(deleteBtn);
    
    // 拖拽事件
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);
    
    return item;
}

// 打开编辑条目模态框
function openEditItemModal(item) {
    editingItem = item;
    // 只获取第一个文本节点的内容，不包括按钮
    const currentText = item.firstChild ? item.firstChild.textContent.trim() : '';
    document.getElementById('editItemInput').value = currentText;
    const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
    modal.show();
}

// 确认编辑条目
function confirmEditItem() {
    if (!editingItem) return;
    
    const newText = document.getElementById('editItemInput').value.trim();
    if (newText === '') {
        showAlert('请输入条目内容！');
        return;
    }
    
    // 只获取第一个文本节点的内容，不包括按钮
    const oldText = editingItem.firstChild ? editingItem.firstChild.textContent.trim() : '';
    const itemId = editingItem.id;
    const containerId = editingItem.parentNode.id;
    
    // 只更新第一个文本节点，保留按钮
    if (editingItem.firstChild) {
        editingItem.firstChild.textContent = newText;
    }
    
    // 记录历史
    historyManager.push({
        type: 'editItem',
        data: {
            id: itemId,
            oldText: oldText,
            newText: newText,
            containerId: containerId
        }
    });
    
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('editItemModal'));
    modal.hide();
    
    // 清空编辑状态
    editingItem = null;
    
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}

// 打开编辑分类模态框
function openEditCategoryModal(category) {
    editingCategory = category;
    const categoryName = category.querySelector('.category-title').textContent.split('(')[0].trim();
    document.getElementById('editCategoryInput').value = categoryName;
    const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    modal.show();
}

// 确认编辑分类
function confirmEditCategory() {
    if (!editingCategory) return;
    
    const newName = document.getElementById('editCategoryInput').value.trim();
    if (newName === '') {
        showAlert('请输入分类名称！');
        return;
    }
    
    // 获取分类ID和旧名称
    const categoryId = editingCategory.id;
    const titleElement = editingCategory.querySelector('.category-title');
    const oldName = titleElement.firstChild.textContent.split('(')[0].trim();
    
    // 更新分类名称（保留计数部分）
    const countSpan = titleElement.querySelector('.item-count');
    const countText = countSpan ? countSpan.textContent : '(0)';
    titleElement.firstChild.textContent = newName + countText;
    
    // 记录历史
    historyManager.push({
        type: 'editCategory',
        data: {
            id: categoryId,
            oldName: oldName,
            newName: newName
        }
    });
    
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
    modal.hide();
    
    // 清空编辑状态
    editingCategory = null;
    
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}

// 检测是否在Electron环境中
const isElectron = typeof window !== 'undefined' && window.electronAPI && window.electronAPI.isElectron;

// 撤销操作
function undo() {
    const operation = historyManager.undo();
    if (!operation) return;
    
    executeUndo(operation);
}

// 重做操作
function redo() {
    const operation = historyManager.redo();
    if (!operation) return;
    
    executeRedo(operation);
}

// 执行撤销
function executeUndo(operation) {
    switch (operation.type) {
        case 'addItem':
            undoAddItem(operation.data);
            break;
        case 'addCategory':
            undoAddCategory(operation.data);
            break;
        case 'deleteItem':
            undoDeleteItem(operation.data);
            break;
        case 'deleteCategory':
            undoDeleteCategory(operation.data);
            break;
        case 'moveItem':
            undoMoveItem(operation.data);
            break;
        case 'editItem':
            undoEditItem(operation.data);
            break;
        case 'editCategory':
            undoEditCategory(operation.data);
            break;
        default:
            console.warn('未知的操作类型:', operation.type);
    }
}

// 执行重做
function executeRedo(operation) {
    switch (operation.type) {
        case 'addItem':
            redoAddItem(operation.data);
            break;
        case 'addCategory':
            redoAddCategory(operation.data);
            break;
        case 'deleteItem':
            redoDeleteItem(operation.data);
            break;
        case 'deleteCategory':
            redoDeleteCategory(operation.data);
            break;
        case 'moveItem':
            redoMoveItem(operation.data);
            break;
        case 'editItem':
            redoEditItem(operation.data);
            break;
        case 'editCategory':
            redoEditCategory(operation.data);
            break;
        default:
            console.warn('未知的操作类型:', operation.type);
    }
}

// 撤销添加条目
function undoAddItem(data) {
    const item = document.getElementById(data.id);
    if (item) {
        item.remove();
        checkEmpty();
        updateFileNameDisplay();
    }
}

// 重做添加条目
function redoAddItem(data) {
    const container = document.getElementById(data.containerId);
    if (!container) return;
    
    const emptyMessage = document.getElementById('itemEmptyMessage');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const item = document.createElement('div');
    item.className = 'draggable-item';
    item.id = data.id;
    item.draggable = true;
    item.textContent = data.text;
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        elementToDelete = item;
        deleteType = 'item';
        document.getElementById('deleteModalLabel').textContent = '确认删除条目';
        document.getElementById('deleteModalContent').innerHTML = `
<p>确定要删除以下条目吗？</p>
<div class="alert alert-warning">
<strong>${data.text}</strong>
</div>
`;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    };
    item.appendChild(deleteBtn);
    
    // 拖拽事件
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);
    
    container.appendChild(item);
    checkEmpty();
    updateFileNameDisplay();
}

// 撤销添加分类
function undoAddCategory(data) {
    const category = document.getElementById(data.id);
    if (category) {
        category.remove();
        checkCategoryEmpty();
        updateFileNameDisplay();
    }
}

// 重做添加分类
function redoAddCategory(data) {
    const container = document.getElementById('categoryContainer');
    const emptyMessage = document.getElementById('categoryEmptyMessage');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const category = createCategoryElement(data.name, data.id, container);
    container.appendChild(category);
    checkCategoryEmpty();
    updateFileNameDisplay();
}

// 撤销删除条目
function undoDeleteItem(data) {
    const container = document.getElementById(data.containerId);
    if (!container) return;
    
    const emptyMessage = document.getElementById('itemEmptyMessage');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const item = document.createElement('div');
    item.className = 'draggable-item';
    item.id = data.id;
    item.draggable = true;
    item.textContent = data.text;
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        elementToDelete = item;
        deleteType = 'item';
        document.getElementById('deleteModalLabel').textContent = '确认删除条目';
        document.getElementById('deleteModalContent').innerHTML = `
<p>确定要删除以下条目吗？</p>
<div class="alert alert-warning">
<strong>${data.text}</strong>
</div>
`;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    };
    item.appendChild(deleteBtn);
    
    // 拖拽事件
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);
    
    container.appendChild(item);
    checkEmpty();
    updateFileNameDisplay();
}

// 重做删除条目
function redoDeleteItem(data) {
    const item = document.getElementById(data.id);
    if (item) {
        item.remove();
        checkEmpty();
        updateFileNameDisplay();
    }
}

// 撤销删除分类
function undoDeleteCategory(data) {
    const container = document.getElementById('categoryContainer');
    const emptyMessage = document.getElementById('categoryEmptyMessage');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const category = createCategoryElement(data.name, data.id, container);
    container.appendChild(category);
    
    // 恢复分类中的条目
    if (data.items && data.items.length > 0) {
        const categoryItems = category.querySelector('.category-items');
        data.items.forEach(itemData => {
            const item = document.createElement('div');
            item.className = 'draggable-item';
            item.id = itemData.id;
            item.draggable = true;
            item.textContent = itemData.text;
            
            // 添加删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                elementToDelete = item;
                deleteType = 'item';
                document.getElementById('deleteModalLabel').textContent = '确认删除条目';
                document.getElementById('deleteModalContent').innerHTML = `
<p>确定要删除以下条目吗？</p>
<div class="alert alert-warning">
<strong>${itemData.text}</strong>
</div>
`;
                const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
                modal.show();
            };
            item.appendChild(deleteBtn);
            
            // 拖拽事件
            item.addEventListener('dragstart', dragStart);
            item.addEventListener('dragend', dragEnd);
            
            categoryItems.appendChild(item);
        });
        
        updateCategoryItemCount(category);
    }
    
    checkCategoryEmpty();
    updateFileNameDisplay();
}

// 重做删除分类
function redoDeleteCategory(data) {
    const category = document.getElementById(data.id);
    if (category) {
        category.remove();
        checkCategoryEmpty();
        updateFileNameDisplay();
    }
}

// 撤销移动条目
function undoMoveItem(data) {
    const item = document.getElementById(data.itemId);
    if (!item) return;
    
    const targetContainer = data.fromContainerId === 'itemContainer' 
        ? document.getElementById('itemContainer')
        : document.getElementById(data.fromContainerId)?.querySelector('.category-items');
    
    if (targetContainer) {
        targetContainer.appendChild(item);
        
        // 更新分类计数
        const fromCategory = document.getElementById(data.fromContainerId)?.closest('.category-box');
        const toCategory = document.getElementById(data.toContainerId)?.closest('.category-box');
        
        if (fromCategory) updateCategoryItemCount(fromCategory);
        if (toCategory) updateCategoryItemCount(toCategory);
        
        checkEmpty();
        updateFileNameDisplay();
    }
}

// 重做移动条目
function redoMoveItem(data) {
    const item = document.getElementById(data.itemId);
    if (!item) return;
    
    const targetContainer = data.toContainerId === 'itemContainer'
        ? document.getElementById('itemContainer')
        : document.getElementById(data.toContainerId)?.querySelector('.category-items');
    
    if (targetContainer) {
        targetContainer.appendChild(item);
        
        // 更新分类计数
        const fromCategory = document.getElementById(data.fromContainerId)?.closest('.category-box');
        const toCategory = document.getElementById(data.toContainerId)?.closest('.category-box');
        
        if (fromCategory) updateCategoryItemCount(fromCategory);
        if (toCategory) updateCategoryItemCount(toCategory);
        
        checkEmpty();
        updateFileNameDisplay();
    }
}

// 撤销编辑条目
function undoEditItem(data) {
    const item = document.getElementById(data.id);
    if (item) {
        // 恢复旧文本
        item.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = data.oldText;
            }
        });
        updateFileNameDisplay();
    }
}

// 重做编辑条目
function redoEditItem(data) {
    const item = document.getElementById(data.id);
    if (item) {
        // 应用新文本
        if (item.firstChild) {
            item.firstChild.textContent = data.newText;
        }
        updateFileNameDisplay();
    }
}

// 撤销编辑分类
function undoEditCategory(data) {
    const category = document.getElementById(data.id);
    if (category) {
        const titleElement = category.querySelector('.category-title');
        const countSpan = titleElement.querySelector('.item-count');
        const countText = countSpan ? countSpan.textContent : '(0)';
        titleElement.firstChild.textContent = data.oldName + countText;
        updateFileNameDisplay();
    }
}

// 重做编辑分类
function redoEditCategory(data) {
    const category = document.getElementById(data.id);
    if (category) {
        const titleElement = category.querySelector('.category-title');
        const countSpan = titleElement.querySelector('.item-count');
        const countText = countSpan ? countSpan.textContent : '(0)';
        titleElement.firstChild.textContent = data.newName + countText;
        updateFileNameDisplay();
    }
}

// 更新撤销/重做按钮状态
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = !historyManager.canUndo();
    }
    if (redoBtn) {
        redoBtn.disabled = !historyManager.canRedo();
    }
}

// Electron文件操作API封装
const electronFileAPI = {
    // 打开文件对话框
    openFileDialog: async () => {
        if (!isElectron) return null;
        try {
            const result = await window.electronAPI.openFileDialog();
            return result;
        } catch (error) {
            console.error('Electron打开文件失败:', error);
            return null;
        }
    },
    
    // 保存文件对话框
    saveFileDialog: async (defaultName) => {
        if (!isElectron) return null;
        try {
            const result = await window.electronAPI.saveFileDialog(defaultName);
            return result;
        } catch (error) {
            console.error('Electron保存文件对话框失败:', error);
            return null;
        }
    },
    
    // 保存文件
    saveFile: async (filePath, content) => {
        if (!isElectron) return { success: false };
        try {
            const result = await window.electronAPI.saveFile(filePath, content);
            return result;
        } catch (error) {
            console.error('Electron保存文件失败:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 读取文件
    readFile: async (filePath) => {
        if (!isElectron) return { success: false };
        try {
            const result = await window.electronAPI.readFile(filePath);
            return result;
        } catch (error) {
            console.error('Electron读取文件失败:', error);
            return { success: false, error: error.message };
        }
    }
};

// 显示Alerts提示消息
function showAlertToast(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const icon = type === 'success' ? '✓' : '✗';
    
    const alertHtml = `
        <div id="${alertId}" class="alert ${alertClass} alert-dismissible fade show" role="alert" style="margin-bottom: 10px; animation: slideIn 0.3s ease-out;">
            <strong>${icon}</strong> ${message}
            <button type="button" class="btn-close" onclick="removeAlert('${alertId}')"></button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', alertHtml);
    
    // 3秒后自动消失
    setTimeout(() => {
        removeAlert(alertId);
    }, 3000);
}

// 移除Alerts提示
function removeAlert(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
        }, 150);
    }
}

// 添加条目
function addItem() {
    const input = document.getElementById('itemInput');
    const text = input.value.trim();
    if (text === '') {
        showAlert('请输入条目内容！');
        return;
    }
    const container = document.getElementById('itemContainer');
    const emptyMessage = document.getElementById('itemEmptyMessage');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const itemId = 'item-' + itemIdCounter++;
    const item = createItemElement(text, itemId, container);
    
    container.appendChild(item);
    input.value = '';
    
    // 记录历史
    historyManager.push({
        type: 'addItem',
        data: {
            id: itemId,
            text: text,
            containerId: 'itemContainer'
        }
    });
    
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}
// 添加分类
// 创建分类元素的辅助函数
function createCategoryElement(name, id, container) {
    const category = document.createElement('div');
    category.className = 'category-box';
    category.id = id;
    
    // 创建分类标题和按钮容器
    const header = document.createElement('div');
    header.className = 'category-header';
    
    // 创建标题部分
    const titleSpan = document.createElement('span');
    titleSpan.className = 'category-title';
    titleSpan.textContent = name + '(0)';
    
    // 创建按钮容器
    const buttonContainer = document.createElement('span');
    buttonContainer.className = 'category-buttons';
    
    // 添加编辑按钮
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-category-btn';
    editBtn.innerHTML = '✎';
    editBtn.onclick = function(e) {
        e.stopPropagation();
        openEditCategoryModal(category);
    };
    buttonContainer.appendChild(editBtn);
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-category-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        deleteCategory(category.id);
    };
    buttonContainer.appendChild(deleteBtn);
    
    header.appendChild(titleSpan);
    header.appendChild(buttonContainer);
    
    // 创建条目容器
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'category-items';
    
    category.appendChild(header);
    category.appendChild(itemsContainer);
    
    // 在整个category-box上绑定拖拽事件
    category.ondrop = drop;
    category.ondragover = allowDrop;
    category.ondragleave = dragLeave;
    
    return category;
}

function addCategory() {
    const input = document.getElementById('categoryInput');
    const name = input.value.trim();
    if (name === '') {
        showAlert('请输入分类名称！');
        return;
    }
    const container = document.getElementById('categoryContainer');
    const emptyMessage = document.getElementById('categoryEmptyMessage');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const categoryId = 'category-' + categoryIdCounter++;
    const category = createCategoryElement(name, categoryId, container);
    container.appendChild(category);
    input.value = '';
    
    // 记录历史
    historyManager.push({
        type: 'addCategory',
        data: {
            id: categoryId,
            name: name
        }
    });
    
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}
// 删除分类
function deleteCategory(categoryId) {
    const category = document.getElementById(categoryId);
    if (category) {
        elementToDelete = category;
        deleteType = 'category';
        const categoryName = category.querySelector('.category-title').textContent.split('(')[0].trim();
        const items = category.querySelectorAll('.draggable-item');
        const itemContents = Array.from(items).map(item => {
            // 克隆节点以避免修改原始DOM
            const clone = item.cloneNode(true);
            // 移除编辑按钮和删除按钮
            const editBtn = clone.querySelector('.edit-btn');
            const deleteBtn = clone.querySelector('.delete-btn');
            if (editBtn) {
                editBtn.remove();
            }
            if (deleteBtn) {
                deleteBtn.remove();
            }
            return clone.textContent.trim();
        }).join('、');
        let contentHtml = `
<p>确定要删除以下分类吗？</p>
<div class="alert alert-danger">
<strong>分类名称：${categoryName}</strong>
</div>
`;
        if (items.length > 0) {
            contentHtml += `
<div class="alert alert-warning">
<strong>该分类中包含 ${items.length} 个条目：</strong><br>
${itemContents}
</div>
<p class="text-muted small">删除后，这些条目将移回左侧列表。</p>
`;
        }
        document.getElementById('deleteModalLabel').textContent = '确认删除分类';
        document.getElementById('deleteModalContent').innerHTML = contentHtml;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }
}
// 确认删除
function confirmDelete() {
    if (!elementToDelete) return;
    
    if (deleteType === 'item') {
        // 保存删除前的信息
        const itemId = elementToDelete.id;
        const itemText = elementToDelete.textContent.trim();
        const containerId = elementToDelete.parentNode.id;
        
        elementToDelete.remove();
        checkEmpty();
        
        // 记录历史
        historyManager.push({
            type: 'deleteItem',
            data: {
                id: itemId,
                text: itemText,
                containerId: containerId
            }
        });
    } else if (deleteType === 'category') {
        const category = elementToDelete;
        
        // 保存删除前的信息
        const categoryId = category.id;
        const categoryName = category.querySelector('.category-title').textContent.split('(')[0].trim();
        const items = category.querySelectorAll('.draggable-item');
        const itemsData = Array.from(items).map(item => ({
            id: item.id,
            text: item.textContent.trim()
        }));
        
        // 将分类中的所有条目移回左侧
        const itemContainer = document.getElementById('itemContainer');
        items.forEach(item => {
            itemContainer.appendChild(item);
        });
        category.remove();
        checkCategoryEmpty();
        checkEmpty();
        
        // 记录历史
        historyManager.push({
            type: 'deleteCategory',
            data: {
                id: categoryId,
                name: categoryName,
                items: itemsData
            }
        });
    }
    
    elementToDelete = null;
    deleteType = null;
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    modal.hide();
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}
// 绑定确认删除按钮事件
document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
// 显示提示模态框
function showAlert(message) {
    document.getElementById('alertModalContent').innerHTML = `
<div class="alert alert-warning">
<strong>${message}</strong>
</div>
`;
    const modal = new bootstrap.Modal(document.getElementById('alertModal'));
    modal.show();
}
// 导入类型
let currentImportType = null;
// 显示导入模态框
function showImportModal(type) {
    currentImportType = type;
    const modalLabel = document.getElementById('importModalLabel');
    const formatInfo = document.getElementById('importFormatInfo');
    const textFormatInfo = document.getElementById('textImportFormatInfo');
    const fileInput = document.getElementById('importFile');
    const textInput = document.getElementById('importText');
    // 清空文件选择和文本输入
    fileInput.value = '';
    textInput.value = '';
    // 重置为文本粘贴导入
    document.getElementById('importMethodText').checked = true;
    toggleImportMethod();
    if (type === 'item') {
        modalLabel.textContent = '批量导入条目';
        formatInfo.innerHTML = `
<p>请选择一个 <strong>.json</strong> 文件，文件内容格式如下：</p>
<pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px;">[
"条目1",
"条目2",
"条目3"
]</pre>
<p class="text-muted small">注意：重复的条目将被自动跳过。</p>
`;
        textFormatInfo.innerHTML = `
<p>请将条目文本粘贴到下方文本框中，每行一个条目：</p>
<pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px;">条目1
条目2
条目3</pre>
<p class="text-muted small">注意：空行和重复的条目将被自动跳过。</p>
`;
    } else if (type === 'category') {
        modalLabel.textContent = '批量导入分类';
        formatInfo.innerHTML = `
<p>请选择一个 <strong>.json</strong> 文件，文件内容格式如下：</p>
<pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px;">[
{
"name": "分类1",
"items": ["条目1", "条目2"]
},
{
"name": "分类2",
"items": []
}]</pre>
<p class="text-muted small">注意：重复的分类将被自动跳过。items 字段可选，如果包含条目，会自动创建并添加到对应分类中。</p>
`;
        textFormatInfo.innerHTML = `
<p>请将分类名称粘贴到下方文本框中，每行一个分类：</p>
<pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px;">分类1
分类2
分类3</pre>
<p class="text-muted small">注意：空行和重复的分类将被自动跳过。</p>
`;
    }
    const modal = new bootstrap.Modal(document.getElementById('importModal'));
    modal.show();
}
// 切换导入方法
function toggleImportMethod() {
    const fileSection = document.getElementById('fileImportSection');
    const textSection = document.getElementById('textImportSection');
    const method = document.querySelector('input[name="importMethod"]:checked').value;
    if (method === 'file') {
        fileSection.style.display = 'block';
        textSection.style.display = 'none';
    } else {
        fileSection.style.display = 'none';
        textSection.style.display = 'block';
    }
}
// 确认导入
function confirmImport() {
    const method = document.querySelector('input[name="importMethod"]:checked').value;
    if (method === 'file') {
        // 文件导入
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];
        if (!file) {
            showAlert('请选择要导入的文件！');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (currentImportType === 'item') {
                    importItems(data);
                } else if (currentImportType === 'category') {
                    importCategories(data);
                }
                // 关闭导入模态框
                const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
                modal.hide();
            } catch (error) {
                showAlert('文件格式错误，请确保文件是有效的JSON格式！');
            }
        };
        reader.readAsText(file);
    } else if (method === 'text') {
        // 文本导入
        const textInput = document.getElementById('importText');
        const text = textInput.value.trim();
        if (!text) {
            showAlert('请输入要导入的文本！');
            return;
        }
        // 按行分割文本
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
        if (lines.length === 0) {
            showAlert('请输入有效的文本内容！');
            return;
        }
        if (currentImportType === 'item') {
            importItems(lines);
        } else if (currentImportType === 'category') {
            // 将文本行转换为分类对象数组
            const categories = lines.map(line => ({
                name: line,
                items: []
            }));
            importCategories(categories);
        }
        // 关闭导入模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
        modal.hide();
    }
}
// 导入条目
function importItems(items) {
    if (!Array.isArray(items)) {
        showAlert('文件格式错误：条目列表应该是一个数组！');
        return;
    }
    const container = document.getElementById('itemContainer');
    const emptyMessage = document.getElementById('itemEmptyMessage');
    const existingItems = Array.from(container.querySelectorAll('.draggable-item')).map(item => {
        // 克隆节点以避免修改原始DOM
        const clone = item.cloneNode(true);
        // 移除编辑按钮和删除按钮
        const editBtn = clone.querySelector('.edit-btn');
        const deleteBtn = clone.querySelector('.delete-btn');
        if (editBtn) {
            editBtn.remove();
        }
        if (deleteBtn) {
            deleteBtn.remove();
        }
        return clone.textContent.trim();
    });
    let successCount = 0;
    let skipCount = 0;
    items.forEach(text => {
        if (typeof text !== 'string' || text.trim() === '') {
            skipCount++;
            return;
        }
        const trimmedText = text.trim();
        // 检查是否已存在
        if (existingItems.includes(trimmedText)) {
            skipCount++;
            return;
        }
        // 移除空消息
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        // 创建条目
        const itemId = 'item-' + itemIdCounter++;
        const item = createItemElement(trimmedText, itemId, container);
        container.appendChild(item);
        successCount++;
    });
    // 显示导入结果
    let resultMessage = `成功导入 ${successCount} 个条目！`;
    if (skipCount > 0) {
        resultMessage += ` 跳过 ${skipCount} 个无效或重复的条目。`;
    }
    showAlert(resultMessage);
    checkEmpty();
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}
// 导入分类
function importCategories(categories) {
    if (!Array.isArray(categories)) {
        showAlert('文件格式错误：分类列表应该是一个数组！');
        return;
    }
    const container = document.getElementById('categoryContainer');
    const emptyMessage = document.getElementById('categoryEmptyMessage');
    const existingCategories = Array.from(container.querySelectorAll('.category-title')).map(title => title.textContent.split('(')[0].trim());
    const itemContainer = document.getElementById('itemContainer');
    const existingItems = Array.from(itemContainer.querySelectorAll('.draggable-item')).map(item => {
        // 克隆节点以避免修改原始DOM
        const clone = item.cloneNode(true);
        // 移除编辑按钮和删除按钮
        const editBtn = clone.querySelector('.edit-btn');
        const deleteBtn = clone.querySelector('.delete-btn');
        if (editBtn) {
            editBtn.remove();
        }
        if (deleteBtn) {
            deleteBtn.remove();
        }
        return clone.textContent.trim();
    });
    let successCount = 0;
    let skipCount = 0;
    let itemSuccessCount = 0;
    let itemSkipCount = 0;
    categories.forEach(categoryData => {
        if (typeof categoryData !== 'object' || !categoryData.name) {
            skipCount++;
            return;
        }
        const name = categoryData.name.trim();
        // 检查分类是否已存在
        if (existingCategories.includes(name)) {
            skipCount++;
            return;
        }
        // 移除空消息
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        // 创建分类
        const categoryId = 'category-' + categoryIdCounter++;
        const category = createCategoryElement(name, categoryId, container);
        container.appendChild(category);
        // 如果分类中有条目，添加到分类中
        if (categoryData.items && Array.isArray(categoryData.items)) {
            const categoryItems = category.querySelector('.category-items');
            categoryData.items.forEach(itemText => {
                if (typeof itemText !== 'string' || itemText.trim() === '') {
                    itemSkipCount++;
                    return;
                }
                const trimmedItemText = itemText.trim();
                // 检查条目是否已存在
                if (existingItems.includes(trimmedItemText)) {
                    itemSkipCount++;
                    return;
                }
                // 创建条目
                const itemId = 'item-' + itemIdCounter++;
                const item = createItemElement(trimmedItemText, itemId, categoryItems);
                categoryItems.appendChild(item);
                itemSuccessCount++;
            });
            // 更新分类计数
            updateCategoryItemCount(category);
        }
        successCount++;
    });
    // 显示导入结果
    let resultMessage = `成功导入 ${successCount} 个分类！`;
    if (skipCount > 0) {
        resultMessage += ` 跳过 ${skipCount} 个无效或重复的分类。`;
    }
    if (itemSuccessCount > 0) {
        resultMessage += ` 成功导入 ${itemSuccessCount} 个条目到分类中。`;
    }
    if (itemSkipCount > 0) {
        resultMessage += ` 跳过 ${itemSkipCount} 个无效或重复的条目。`;
    }
    showAlert(resultMessage);
    checkCategoryEmpty();
    checkEmpty();
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}
// 拖拽开始
function dragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
}
// 拖拽结束
function dragEnd(e) {
    e.target.classList.remove('dragging');
    // 移除所有drag-over类
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}
// 允许放置
function allowDrop(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.category-box, .item-container');
    if (target) {
        target.classList.add('drag-over');
    }
}
// 拖拽离开
function dragLeave(e) {
    const target = e.target.closest('.category-box, .item-container');
    if (target) {
        target.classList.remove('drag-over');
    }
}
// 放置
function drop(e) {
    e.preventDefault();
    e.stopPropagation();
    // 移除所有drag-over类
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    const itemId = e.dataTransfer.getData('text/plain');
    const item = document.getElementById(itemId);
    if (!item) return;
    
    // 保存原始位置信息
    const fromContainerId = item.parentNode.id === 'itemContainer' 
        ? 'itemContainer' 
        : item.parentNode.closest('.category-box').id;
    
    // 检查条目原来所在的分类框（如果有的话）
    const oldParentCategory = item.closest('.category-box');
    // 查找目标容器
    let target = e.target;
    let targetContainerId = null;
    
    // 向上查找最近的分类框或条目容器
    while (target) {
        if (target.classList && target.classList.contains('category-box')) {
            // 找到分类框，将条目添加到内部的category-items容器中
            const categoryItems = target.querySelector('.category-items');
            if (categoryItems) {
                categoryItems.appendChild(item);
                targetContainerId = target.id;
                updateCategoryItemCount(target);
                // 如果是从另一个分类框拖过来的，更新原来分类框的计数
                if (oldParentCategory && oldParentCategory !== target) {
                    updateCategoryItemCount(oldParentCategory);
                }
            }
            break;
        } else if (target.id === 'itemContainer') {
            // 找到条目容器
            target.appendChild(item);
            targetContainerId = 'itemContainer';
            // 如果是从分类框拖过来的，更新原来分类框的计数
            if (oldParentCategory) {
                updateCategoryItemCount(oldParentCategory);
            }
            break;
        }
        target = target.parentElement;
    }
    
    // 如果位置发生了变化，记录历史
    if (targetContainerId && targetContainerId !== fromContainerId) {
        historyManager.push({
            type: 'moveItem',
            data: {
                itemId: itemId,
                fromContainerId: fromContainerId,
                toContainerId: targetContainerId
            }
        });
    }
    
    checkEmpty();
    checkCategoryEmpty();
    // 更新文件名显示（显示未保存状态）
    updateFileNameDisplay();
}
// 更新分类中的条目数量
function updateCategoryItemCount(categoryBox) {
    const count = categoryBox.querySelectorAll('.draggable-item').length;
    const countSpan = categoryBox.querySelector('.item-count');
    if (countSpan) {
        countSpan.textContent = `(${count})`;
    }
}
// 检查条目容器是否为空
function checkEmpty() {
    const container = document.getElementById('itemContainer');
    const items = container.querySelectorAll('.draggable-item');
    const emptyMessage = document.getElementById('itemEmptyMessage');

    if (items.length === 0) {
        if (!emptyMessage) {
            const newEmptyMessage = document.createElement('div');
            newEmptyMessage.className = 'empty-message';
            newEmptyMessage.id = 'itemEmptyMessage';
            newEmptyMessage.textContent = '暂无条目，请添加新条目';
            container.appendChild(newEmptyMessage);
        }
    } else {
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
}
// 检查分类容器是否为空
function checkCategoryEmpty() {
    const container = document.getElementById('categoryContainer');
    const categories = container.querySelectorAll('.category-box');
    const emptyMessage = document.getElementById('categoryEmptyMessage');

    if (categories.length === 0) {
        if (!emptyMessage) {
            const newEmptyMessage = document.createElement('div');
            newEmptyMessage.className = 'empty-message';
            newEmptyMessage.id = 'categoryEmptyMessage';
            newEmptyMessage.textContent = '暂无分类，请添加新分类';
            container.appendChild(newEmptyMessage);
        }
    } else {
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
}
// 回车键添加条目
document.getElementById('itemInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addItem();
    }
});
// 回车键添加分类
document.getElementById('categoryInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addCategory();
    }
});

// 文件数据收集和检查功能
// 收集当前所有数据
function collectCurrentData() {
    const startTime = Date.now();
    
    try {
        // 收集所有条目（排除删除按钮）
        const itemContainer = document.getElementById('itemContainer');
        if (!itemContainer) {
            console.error('找不到条目容器');
            return { version: '1.0', items: [], categories: [] };
        }

        const itemsStartTime = Date.now();
        const items = Array.from(itemContainer.querySelectorAll('.draggable-item'))
            .map(item => {
                const clone = item.cloneNode(true);
                const editBtn = clone.querySelector('.edit-btn');
                const deleteBtn = clone.querySelector('.delete-btn');
                if (editBtn) {
                    editBtn.remove();
                }
                if (deleteBtn) {
                    deleteBtn.remove();
                }
                return clone.textContent.trim();
            })
            .filter(text => text !== '');
        const itemsEndTime = Date.now();
        console.log('收集条目耗时:', itemsEndTime - itemsStartTime + 'ms, 条目数量:', items.length);

        // 收集所有分类及其条目
        const categoryContainer = document.getElementById('categoryContainer');
        if (!categoryContainer) {
            console.error('找不到分类容器');
            return { version: '1.0', items: items, categories: [] };
        }

        const categoriesStartTime = Date.now();
        const categories = Array.from(categoryContainer.querySelectorAll('.category-box'))
            .map(category => {
                const categoryName = category.querySelector('.category-title').textContent.split('(')[0].trim();
                const categoryItems = Array.from(category.querySelectorAll('.draggable-item'))
                    .map(item => {
                        const clone = item.cloneNode(true);
                        const editBtn = clone.querySelector('.edit-btn');
                        const deleteBtn = clone.querySelector('.delete-btn');
                        if (editBtn) {
                            editBtn.remove();
                        }
                        if (deleteBtn) {
                            deleteBtn.remove();
                        }
                        return clone.textContent.trim();
                    })
                    .filter(text => text !== '');
                return {
                    name: categoryName,
                    items: categoryItems
                };
            });
        const categoriesEndTime = Date.now();
        console.log('收集分类耗时:', categoriesEndTime - categoriesStartTime + 'ms, 分类数量:', categories.length);

        const result = {
            version: '1.0',
            items: items,
            categories: categories
        };
        
        const endTime = Date.now();
        console.log('collectCurrentData 总耗时:', endTime - startTime + 'ms');
        
        return result;
    } catch (error) {
        console.error('收集当前数据失败:', error);
        return { version: '1.0', items: [], categories: [] };
    }
}

// 检查内容是否已修改（带缓存和超时保护）
let lastContentCheckTime = 0;
let lastContentCheckResult = false;
const CONTENT_CHECK_CACHE_DURATION = 1000; // 1秒缓存
let isCheckingContent = false; // 防止重复检查
const MAX_ITEMS_TO_CHECK = 1000; // 最大检查的元素数量限制

function isContentModified() {
    // 如果正在检查，直接返回缓存结果或false
    if (isCheckingContent) {
        console.warn('正在检查内容修改，返回缓存结果');
        return lastContentCheckResult;
    }

    if (!originalFileContent) {
        // 没有原始内容，说明是新文件或未保存过
        // 检查当前是否有任何内容（条目或分类）
        const itemContainer = document.getElementById('itemContainer');
        const categoryContainer = document.getElementById('categoryContainer');
        
        if (itemContainer && itemContainer.querySelectorAll('.draggable-item').length > 0) {
            // 有条目，需要保存
            return true;
        }
        
        if (categoryContainer && categoryContainer.querySelectorAll('.category-box').length > 0) {
            // 有分类，需要保存
            return true;
        }
        
        // 没有任何内容，不需要保存
        return false;
    }

    // 使用缓存，避免频繁检查
    const now = Date.now();
    if (now - lastContentCheckTime < CONTENT_CHECK_CACHE_DURATION) {
        return lastContentCheckResult;
    }

    isCheckingContent = true;

    try {
        // 快速检查：先检查元素数量，如果太多就跳过检查
        const itemContainer = document.getElementById('itemContainer');
        const categoryContainer = document.getElementById('categoryContainer');
        
        if (itemContainer) {
            const itemCount = itemContainer.querySelectorAll('.draggable-item').length;
            if (itemCount > MAX_ITEMS_TO_CHECK) {
                console.warn('条目数量过多（' + itemCount + '），跳过检查');
                isCheckingContent = false;
                return false;
            }
        }
        
        if (categoryContainer) {
            const categoryCount = categoryContainer.querySelectorAll('.category-box').length;
            if (categoryCount > MAX_ITEMS_TO_CHECK) {
                console.warn('分类数量过多（' + categoryCount + '），跳过检查');
                isCheckingContent = false;
                return false;
            }
        }

        // 解析原始文件内容
        const originalData = JSON.parse(originalFileContent);
        
        // 收集当前数据
        const currentData = collectCurrentData();
        
        // 只对比 items 和 categories，忽略 version、createdAt 等元数据字段
        const originalContentToCompare = JSON.stringify({
            items: originalData.items || [],
            categories: originalData.categories || []
        });
        
        const currentContentToCompare = JSON.stringify({
            items: currentData.items || [],
            categories: currentData.categories || []
        });
        
        const result = originalContentToCompare !== currentContentToCompare;
        
        // 更新缓存
        lastContentCheckTime = now;
        lastContentCheckResult = result;
        
        return result;
    } catch (error) {
        console.error('检查内容修改失败:', error);
        return false;
    } finally {
        isCheckingContent = false;
    }
}

// 文件操作功能
// 新建文件
function newFile() {
    const modified = isContentModified();
    const saveAndNewBtn = document.getElementById('saveAndNewBtn');
    
    if (modified) {
        // 有未保存的修改，显示"保存并新建"按钮
        if (saveAndNewBtn) {
            saveAndNewBtn.style.display = 'inline-block';
        }
    } else {
        // 没有未保存的修改，隐藏"保存并新建"按钮
        if (saveAndNewBtn) {
            saveAndNewBtn.style.display = 'none';
        }
    }
    
    const modal = new bootstrap.Modal(document.getElementById('newFileModal'));
    modal.show();
}

// 执行新建文件操作
function confirmNewFile() {
    // 清空所有条目
    const itemContainer = document.getElementById('itemContainer');
    const items = itemContainer.querySelectorAll('.draggable-item');
    items.forEach(item => item.remove());

    // 清空所有分类
    const categoryContainer = document.getElementById('categoryContainer');
    const categories = categoryContainer.querySelectorAll('.category-box');
    categories.forEach(category => category.remove());

    // 重置计数器
    itemIdCounter = 0;
    categoryIdCounter = 0;

    // 清空文件信息
    currentFilePath = null;
    currentFileName = null;
    fileHandleInstance = null;
    originalFileContent = null;

    // 显示空状态消息
    checkEmpty();
    checkCategoryEmpty();

    // 更新文件名显示
    updateFileNameDisplay();

    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('newFileModal'));
    if (modal) {
        modal.hide();
    }

    // 显示成功提示
    showAlertToast('已新建文件');
}

// 保存并新建
async function saveAndNew() {
    try {
        // 关闭确认模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('newFileModal'));
        if (modal) {
            modal.hide();
        }

        // 保存当前文件
        await saveFile();

        // 执行新建文件操作
        confirmNewFile();
    } catch (error) {
        console.error('保存并新建文件失败:', error);
        showAlert('保存失败，无法新建文件');
    }
}

// 打开文件确认模态框的按钮处理函数
// 保存并打开
async function saveAndOpen() {
    try {
        // 关闭确认模态框
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById('openFileConfirmModal'));
        if (confirmModal) {
            confirmModal.hide();
        }

        // 保存当前文件（添加超时保护）
        const savePromise = saveFile();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('保存超时')), 5000)
        );
        
        await Promise.race([savePromise, timeoutPromise]);

        // 打开新文件
        if (pendingFileToOpen) {
            openFileDirectly(pendingFileToOpen);
            pendingFileToOpen = null;
        }
    } catch (error) {
        console.error('保存并打开失败:', error);
        showAlert('保存失败，请重试');
        
        // 清空待打开的文件
        pendingFileToOpen = null;
    }
}

// 放弃修改并打开
function discardAndOpen() {
    // 关闭确认模态框
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('openFileConfirmModal'));
    if (confirmModal) {
        confirmModal.hide();
    }

    // 打开新文件
    if (pendingFileToOpen) {
        openFileDirectly(pendingFileToOpen);
        pendingFileToOpen = null;
    }
}

// 取消打开
function cancelOpen() {
    // 关闭确认模态框
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('openFileConfirmModal'));
    if (confirmModal) {
        confirmModal.hide();
    }

    // 清空待打开的文件
    pendingFileToOpen = null;
}

// 打开文件
async function openFile() {
    try {
        if (isElectron) {
            // 使用Electron的文件对话框
            const result = await electronFileAPI.openFileDialog();
            if (result && result.path) {
                // 将文件内容转换为Blob，然后创建File对象
                const blob = new Blob([result.content], { type: 'application/json' });
                const mockFile = new File([blob], result.name, { type: 'application/json' });
                
                // 保存完整路径（在openFileDirectly中使用）
                mockFile.electronPath = result.path;
                mockFile.electronName = result.name;
                
                // 保存待打开的文件
                pendingFileToOpen = mockFile;

                // 检查是否有未保存的修改
                console.log('开始检查内容是否已修改...');
                const modified = isContentModified();
                console.log('内容是否已修改:', modified);

                if (modified) {
                    // 显示确认模态框
                    console.log('显示确认模态框');
                    const modal = new bootstrap.Modal(document.getElementById('openFileConfirmModal'));
                    modal.show();
                } else {
                    // 没有修改，直接打开文件
                    console.log('直接打开文件');
                    openFileDirectly(mockFile);
                    pendingFileToOpen = null;
                }
            }
        } else {
            // 使用浏览器的文件输入
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.click();
            } else {
                console.error('找不到文件输入元素');
                showAlert('无法打开文件，请刷新页面重试');
            }
        }
    } catch (error) {
        console.error('打开文件失败:', error);
        showAlert('无法打开文件，请重试');
    }
}

// 处理文件打开
function handleFileOpen(event) {
    const startTime = Date.now();
    
    try {
        const file = event.target.files[0];
        if (!file) return;

        console.log('选择了文件:', file.name);

        // 保存待打开的文件
        pendingFileToOpen = file;

        // 检查是否有未保存的修改
        console.log('开始检查内容是否已修改...');
        const checkStartTime = Date.now();
        const modified = isContentModified();
        const checkEndTime = Date.now();
        console.log('内容是否已修改:', modified, '检查耗时:', checkEndTime - checkStartTime + 'ms');

        if (modified) {
            // 显示确认模态框
            console.log('显示确认模态框');
            const modal = new bootstrap.Modal(document.getElementById('openFileConfirmModal'));
            modal.show();
        } else {
            // 没有修改，直接打开文件
            console.log('直接打开文件');
            openFileDirectly(file);
            pendingFileToOpen = null;
        }
    } catch (error) {
        console.error('处理文件打开失败:', error);
        showAlert('打开文件失败，请重试');
        pendingFileToOpen = null;
    }
    
    const endTime = Date.now();
    console.log('handleFileOpen 总耗时:', endTime - startTime + 'ms');
}

// 打开文件（直接处理File对象）
function openFileDirectly(file) {
    // 记录文件信息
    if (isElectron && file.electronPath) {
        // Electron环境：使用保存的完整路径
        currentFilePath = file.electronPath;
        currentFileName = file.electronName;
        fileHandleInstance = null;
    } else {
        // 浏览器环境：使用文件名
        currentFilePath = file.name;
        currentFileName = file.name;
        fileHandleInstance = null; // 清空文件句柄，因为通过文件选择器打开的文件没有文件句柄
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const fileContent = e.target.result;

            // 验证数据格式
            if (!data.items || !data.categories) {
                showAlert('文件格式错误！');
                return;
            }

            // 清空当前内容
            const itemContainer = document.getElementById('itemContainer');
            const categoryContainer = document.getElementById('categoryContainer');

            itemContainer.querySelectorAll('.draggable-item').forEach(item => item.remove());
            categoryContainer.querySelectorAll('.category-box').forEach(category => category.remove());

            // 重置计数器
            itemIdCounter = 0;
            categoryIdCounter = 0;

            // 加载条目
            data.items.forEach(itemText => {
                if (typeof itemText === 'string' && itemText.trim() !== '') {
                    const itemId = 'item-' + itemIdCounter++;
                    const item = createItemElement(itemText.trim(), itemId, itemContainer);
                    itemContainer.appendChild(item);
                }
            });

            // 加载分类
            data.categories.forEach(categoryData => {
                if (categoryData.name && typeof categoryData.name === 'string') {
                    const categoryId = 'category-' + categoryIdCounter++;
                    const category = createCategoryElement(categoryData.name, categoryId, categoryContainer);
                    categoryContainer.appendChild(category);

                    // 加载分类中的条目
                    if (categoryData.items && Array.isArray(categoryData.items)) {
                        const categoryItems = category.querySelector('.category-items');
                        categoryData.items.forEach(itemText => {
                            if (typeof itemText === 'string' && itemText.trim() !== '') {
                                const itemId = 'item-' + itemIdCounter++;
                                const item = createItemElement(itemText.trim(), itemId, categoryItems);
                                categoryItems.appendChild(item);
                            }
                        });

                        // 更新分类计数
                        updateCategoryItemCount(category);
                    }
                }
            });

            // 显示空状态消息
            checkEmpty();
            checkCategoryEmpty();

            // 保存原始文件内容（用于检查修改）
            originalFileContent = fileContent;

            // 更新文件名显示
            updateFileNameDisplay();
            showAlertToast('文件加载成功！');
        } catch (error) {
            showAlert('文件格式错误，无法加载！');
            console.error(error);
        }
    };
    reader.readAsText(file);

    // 清空文件输入（仅在浏览器环境中）
    if (typeof event !== 'undefined' && event && event.target) {
        event.target.value = '';
    }
}

// 保存文件
async function saveFile() {
    try {
        // 如果没有关联文件，执行另存为
        if (!currentFilePath) {
            await saveAs();
            return;
        }

        // 收集所有条目（排除删除按钮）
        const itemContainer = document.getElementById('itemContainer');
        const items = Array.from(itemContainer.querySelectorAll('.draggable-item'))
            .map(item => {
                // 克隆节点以避免修改原始DOM
                const clone = item.cloneNode(true);
                // 移除编辑按钮和删除按钮
                const editBtn = clone.querySelector('.edit-btn');
                const deleteBtn = clone.querySelector('.delete-btn');
                if (editBtn) {
                    editBtn.remove();
                }
                if (deleteBtn) {
                    deleteBtn.remove();
                }
                return clone.textContent.trim();
            })
            .filter(text => text !== '');

        // 收集所有分类及其条目
        const categoryContainer = document.getElementById('categoryContainer');
        const categories = Array.from(categoryContainer.querySelectorAll('.category-box'))
            .map(category => {
                const categoryName = category.querySelector('.category-title').textContent.split('(')[0].trim();
                const categoryItems = Array.from(category.querySelectorAll('.draggable-item'))
                .map(item => {
                    // 克隆节点以避免修改原始DOM
                    const clone = item.cloneNode(true);
                    // 移除编辑按钮和删除按钮
                    const editBtn = clone.querySelector('.edit-btn');
                    const deleteBtn = clone.querySelector('.delete-btn');
                    if (editBtn) {
                        editBtn.remove();
                    }
                    if (deleteBtn) {
                        deleteBtn.remove();
                    }
                    return clone.textContent.trim();
                })
                .filter(text => text !== '');
            return {
                name: categoryName,
                items: categoryItems
            };
        });

    // 创建数据对象
    const data = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        items: items,
        categories: categories
    };

    // 转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);

    // 如果在Electron环境中，使用Electron的文件保存功能
    if (isElectron && currentFilePath) {
        try {
            const result = await electronFileAPI.saveFile(currentFilePath, jsonString);
            if (result.success) {
                // 更新原始文件内容
                originalFileContent = jsonString;
                showAlertToast('文件保存成功！');
                // 更新文件名显示（清除未保存标记）
                updateFileNameDisplay();
                // 发送文件保存完成事件（用于菜单退出功能）
                if (window.electronAPI && window.electronAPI.sendFileSaved) {
                    window.electronAPI.sendFileSaved();
                }
                return;
            } else {
                showAlert('保存失败: ' + result.error);
                return;
            }
        } catch (error) {
            console.error('Electron保存文件失败:', error);
            showAlert('保存失败: ' + error.message);
            return;
        }
    }

    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 如果有文件句柄，使用 File System Access API 直接保存
    if (fileHandleInstance) {
        try {
            const writable = await fileHandleInstance.createWritable();
            await writable.write(blob);
            await writable.close();
            // 更新原始文件内容
            originalFileContent = jsonString;
            showAlertToast('文件保存成功！');
            // 更新文件名显示（清除未保存标记）
            updateFileNameDisplay();
            // 发送文件保存完成事件（用于菜单退出功能）
            if (window.electronAPI && window.electronAPI.sendFileSaved) {
                window.electronAPI.sendFileSaved();
            }
            return;
        } catch (err) {
            console.error('使用文件句柄保存失败:', err);
            showAlert('保存失败，将使用传统下载方式');
        }
    }

    // 如果没有文件句柄但有文件路径，提示用户使用另存为来覆盖原文件
    if (currentFilePath && !fileHandleInstance) {
        showAlert('当前文件是通过文件选择器打开的，无法直接覆盖。请使用"另存为"功能，选择原文件进行覆盖。');
        // 自动打开另存为对话框
        await saveAs();
        return;
    }

    // 回退到传统下载方式
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 更新原始文件内容
    originalFileContent = jsonString;
    showAlertToast('文件保存成功！');
    // 发送文件保存完成事件（用于菜单退出功能）
    if (window.electronAPI && window.electronAPI.sendFileSaved) {
        window.electronAPI.sendFileSaved();
    }
    } catch (error) {
        console.error('保存文件失败:', error);
        showAlert('保存文件失败，请重试');
    }
}

// 另存为功能
async function saveAs() {
    // 收集所有条目（排除删除按钮）
    const itemContainer = document.getElementById('itemContainer');
    const items = Array.from(itemContainer.querySelectorAll('.draggable-item'))
        .map(item => {
            // 克隆节点以避免修改原始DOM
            const clone = item.cloneNode(true);
            // 移除编辑按钮和删除按钮
            const editBtn = clone.querySelector('.edit-btn');
            const deleteBtn = clone.querySelector('.delete-btn');
            if (editBtn) {
                editBtn.remove();
            }
            if (deleteBtn) {
                deleteBtn.remove();
            }
            return clone.textContent.trim();
        })
        .filter(text => text !== '');

    // 收集所有分类及其条目
    const categoryContainer = document.getElementById('categoryContainer');
    const categories = Array.from(categoryContainer.querySelectorAll('.category-box'))
        .map(category => {
            const categoryName = category.querySelector('.category-title').textContent.split('(')[0].trim();
            const categoryItems = Array.from(category.querySelectorAll('.draggable-item'))
                .map(item => {
                    // 克隆节点以避免修改原始DOM
                    const clone = item.cloneNode(true);
                    // 移除编辑按钮和删除按钮
                    const editBtn = clone.querySelector('.edit-btn');
                    const deleteBtn = clone.querySelector('.delete-btn');
                    if (editBtn) {
                        editBtn.remove();
                    }
                    if (deleteBtn) {
                        deleteBtn.remove();
                    }
                    return clone.textContent.trim();
                })
                .filter(text => text !== '');
            return {
                name: categoryName,
                items: categoryItems
            };
        });

    // 创建数据对象
    const data = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        items: items,
        categories: categories
    };

    // 转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);

    // 如果在Electron环境中，使用Electron的保存文件对话框
    if (isElectron) {
        try {
            // 确定默认文件名
            let defaultFileName = '条目分类_' + new Date().toISOString().slice(0, 10) + '.json';
            if (currentFileName) {
                defaultFileName = currentFileName;
            }

            // 显示保存文件对话框
            const filePath = await electronFileAPI.saveFileDialog(defaultFileName);
            if (!filePath) {
                // 用户取消了保存，不显示错误消息
                return;
            }
            
            const result = await electronFileAPI.saveFile(filePath, jsonString);
            if (result.success) {
                // 更新文件信息
                currentFilePath = filePath;
                currentFileName = filePath.split('/').pop().split('\\').pop();
                fileHandleInstance = null;
                
                // 更新原始文件内容
                originalFileContent = jsonString;
                
                // 更新文件名显示
                updateFileNameDisplay();
                showAlertToast('文件另存为成功！');
                return;
            } else {
                showAlert('保存失败: ' + result.error);
                return;
            }
        } catch (error) {
            console.error('Electron保存文件失败:', error);
            showAlert('保存失败: ' + error.message);
            return;
        }
    }

    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 尝试使用 File System Access API
    if ('showSaveFilePicker' in window) {
        try {
            // 确定默认文件名
            let defaultFileName = '条目分类_' + new Date().toISOString().slice(0, 10) + '.json';
            if (currentFileName) {
                defaultFileName = currentFileName;
            }

            // 显示另存为对话框
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: defaultFileName,
                types: [{
                    description: 'JSON文件',
                    accept: { 'application/json': ['.json'] }
                }]
            });

            // 写入文件
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            // 更新文件信息
            currentFilePath = fileHandle.name;
            currentFileName = fileHandle.name;
            fileHandleInstance = fileHandle;

            // 更新原始文件内容
            originalFileContent = jsonString;

            // 更新文件名显示
            updateFileNameDisplay();
            showAlertToast('文件另存为成功！');
            return;
        } catch (err) {
            // 用户取消或出错
            if (err.name === 'AbortError') {
                // 用户取消了保存，直接返回
                return;
            }
            console.error('保存文件失败:', err);
            showAlert('保存文件失败，将使用传统下载方式');
        }
    }

    // 回退到传统下载方式
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // 如果当前有文件名，使用它作为默认文件名，否则使用日期
    if (currentFileName) {
        a.download = currentFileName;
    } else {
        a.download = '条目分类_' + new Date().toISOString().slice(0, 10) + '.json';
    }

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 更新原始文件内容
    originalFileContent = jsonString;
    showAlertToast('文件另存为成功！');
}

// 更新文件名显示
function updateFileNameDisplay() {
    if (currentFileName) {
        // 检查是否有未保存的修改
        const modified = isContentModified();
        const prefix = modified ? '● ' : '';

        // 更新窗口标题
        if (isElectron) {
            window.electronAPI.updateWindowTitle(prefix + currentFileName + ' - 条目分类管理器');
        }

        // 更新文件状态元素（用于测试）
        const fileStatusElement = document.getElementById('fileStatus');
        if (fileStatusElement) {
            fileStatusElement.textContent = prefix + currentFileName;
        }
    } else {
        // 未命名文件
        const modified = isContentModified();
        const prefix = modified ? '● ' : '';

        if (isElectron) {
            window.electronAPI.updateWindowTitle(prefix + '未命名 - 条目分类管理器');
        }

        // 更新文件状态元素（用于测试）
        const fileStatusElement = document.getElementById('fileStatus');
        if (fileStatusElement) {
            fileStatusElement.textContent = prefix + '未命名';
        }
    }
}

// 页面加载时初始化文件名显示
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 初始化历史管理器
        historyManager.restore();
        historyManager.onStateChange = updateUndoRedoButtons;
        updateUndoRedoButtons();
        
        // 初始化窗口标题
        updateFileNameDisplay();
        
        // 添加快捷键支持
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    // Ctrl+Shift+Z: 重做
                    redo();
                } else {
                    // Ctrl+Z: 撤销
                    undo();
                }
            }
        });
        
        updateFileNameDisplay();
        
        // 绑定确认新建按钮事件
        const confirmNewFileBtn = document.getElementById('confirmNewFileBtn');
        if (confirmNewFileBtn) {
            confirmNewFileBtn.addEventListener('click', confirmNewFile);
        }

        // 绑定保存并新建按钮事件
        const saveAndNewBtn = document.getElementById('saveAndNewBtn');
        if (saveAndNewBtn) {
            saveAndNewBtn.addEventListener('click', saveAndNew);
        }

        // 绑定打开文件确认模态框的三个按钮事件
        const cancelOpenBtn = document.getElementById('cancelOpenBtn');
        if (cancelOpenBtn) {
            cancelOpenBtn.addEventListener('click', cancelOpen);
        }
        
        const discardAndOpenBtn = document.getElementById('discardAndOpenBtn');
        if (discardAndOpenBtn) {
            discardAndOpenBtn.addEventListener('click', discardAndOpen);
        }
        
        const saveAndOpenBtn = document.getElementById('saveAndOpenBtn');
        if (saveAndOpenBtn) {
            saveAndOpenBtn.addEventListener('click', saveAndOpen);
        }
    } catch (error) {
        console.error('页面初始化失败:', error);
    }
});

// ==================== 搜索功能 ====================

// 存储元素的原始HTML
const originalElementContents = new Map();

// 处理搜索输入
function handleSearch(query) {
    searchQuery = query.trim();
    currentSearchIndex = -1;
    
    // 清空搜索结果
    searchResults = [];
    
    // 清除之前的高亮
    clearSearchHighlights();
    
    // 确保清空后Map是空的
    if (originalElementContents.size > 0) {
        console.warn('originalElementContents 不为空，强制清空');
        originalElementContents.clear();
    }
    
    if (searchQuery === '') {
        updateSearchCounter();
        return;
    }
    
    // 搜索条目
    const itemContainer = document.getElementById('itemContainer');
    const items = itemContainer.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
        // 克隆节点以避免修改原始DOM
        const clone = item.cloneNode(true);
        const editBtn = clone.querySelector('.edit-btn');
        const deleteBtn = clone.querySelector('.delete-btn');
        if (editBtn) editBtn.remove();
        if (deleteBtn) deleteBtn.remove();
        
        const text = clone.textContent.trim();
        const matches = findMatches(text, searchQuery);
        
        if (matches.length > 0) {
            matches.forEach(match => {
                searchResults.push({
                    element: item,
                    match: match,
                    type: 'item'
                });
            });
        }
    });
    
    // 搜索分类
    const categoryContainer = document.getElementById('categoryContainer');
    const categories = categoryContainer.querySelectorAll('.category-box');
    
    categories.forEach(category => {
        // 搜索分类名称
        const titleElement = category.querySelector('.category-title');
        const fullText = titleElement.textContent;
        const categoryName = fullText.split('(')[0].trim();
        const nameMatches = findMatches(categoryName, searchQuery);
        
        if (nameMatches.length > 0) {
            nameMatches.forEach(match => {
                searchResults.push({
                    element: titleElement,
                    match: match,
                    type: 'category-title'
                });
            });
        }
        
        // 搜索分类中的条目
        const categoryItems = category.querySelectorAll('.draggable-item');
        categoryItems.forEach(item => {
            const clone = item.cloneNode(true);
            const editBtn = clone.querySelector('.edit-btn');
            const deleteBtn = clone.querySelector('.delete-btn');
            if (editBtn) editBtn.remove();
            if (deleteBtn) deleteBtn.remove();
            
            const text = clone.textContent.trim();
            const matches = findMatches(text, searchQuery);
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    searchResults.push({
                        element: item,
                        match: match,
                        type: 'category-item'
                    });
                });
            }
        });
    });
    
    // 高亮所有匹配结果
    highlightSearchResults();
    
    // 更新计数器
    updateSearchCounter();
    
    // 如果有结果，跳转到第一个
    if (searchResults.length > 0) {
        navigateSearch(0);
    }
}

// 查找匹配的位置
function findMatches(text, query) {
    const matches = [];
    let startIndex = 0;
    
    while (true) {
        const index = text.toLowerCase().indexOf(query.toLowerCase(), startIndex);
        if (index === -1) break;
        
        matches.push({
            start: index,
            end: index + query.length
        });
        
        startIndex = index + 1;
    }
    
    return matches;
}

// 高亮搜索结果
function highlightSearchResults() {
    // 按元素分组
    const elementResults = new Map();
    
    searchResults.forEach((result, index) => {
        const element = result.element;
        
        if (!elementResults.has(element)) {
            elementResults.set(element, {
                element: element,
                type: result.type,
                matches: []
            });
        }
        
        elementResults.get(element).matches.push({
            match: result.match,
            index: index
        });
    });
    
    // 对每个元素进行高亮
    elementResults.forEach((data) => {
        const element = data.element;
        const type = data.type;
        const matches = data.matches;
        
        // 先清除元素上现有的高亮（如果有的话）
        const existingHighlights = element.querySelectorAll('mark.search-highlight');
        if (existingHighlights.length > 0) {
            existingHighlights.forEach(mark => {
                const parent = mark.parentNode;
                const text = mark.textContent;
                parent.replaceChild(document.createTextNode(text), mark);
            });
            element.normalize();
        }
        
        // 保存清除高亮后的HTML（每次都保存，确保是最新状态）
        originalElementContents.set(element, element.innerHTML);
        
        // 获取纯文本内容
        let text;
        if (type === 'category-title') {
            // 对于分类标题，直接从当前元素获取文本（此时已经清除高亮）
            const fullText = element.textContent;
            text = fullText.split('(')[0].trim();
        } else {
            const clone = element.cloneNode(true);
            const editBtn = clone.querySelector('.edit-btn');
            const deleteBtn = clone.querySelector('.delete-btn');
            if (editBtn) editBtn.remove();
            if (deleteBtn) deleteBtn.remove();
            text = clone.textContent;
        }
        
        // 合并重叠的匹配
        const mergedMatches = mergeOverlappingMatches(matches);
        
        // 使用字符串替换方法高亮（从后往前插入）
        highlightTextString(element, text, mergedMatches, type);
    });

// 使用字符串替换方法高亮文本
function highlightTextString(element, fullText, matches, type) {
    if (matches.length === 0) return;
    
    // 从后往前处理匹配，避免位置偏移
    const sortedMatches = matches.slice().sort((a, b) => b.match.start - a.match.start);
    
    // 构建高亮后的HTML
    let highlightedHTML = fullText;
    
    sortedMatches.forEach((matchData) => {
        const match = matchData.match;
        const before = highlightedHTML.substring(0, match.start);
        const matchedText = highlightedHTML.substring(match.start, match.end);
        const after = highlightedHTML.substring(match.end);
        
        highlightedHTML = `${before}<mark class="search-highlight" data-index="${matchData.index}">${matchedText}</mark>${after}`;
    });
    
    // 更新元素的innerHTML
    if (type === 'category-title') {
        const countSpan = element.querySelector('.item-count');
        const countText = countSpan ? countSpan.outerHTML : '';
        element.innerHTML = highlightedHTML + countText;
    } else {
        const editBtn = element.querySelector('.edit-btn');
        const deleteBtn = element.querySelector('.delete-btn');
        element.innerHTML = highlightedHTML;
        
        if (editBtn) element.appendChild(editBtn);
        if (deleteBtn) element.appendChild(deleteBtn);
    }
}
}

// 合并重叠的匹配
function mergeOverlappingMatches(matches) {
    if (matches.length <= 1) return matches;
    
    // 按起始位置排序
    const sorted = matches.slice().sort((a, b) => a.match.start - b.match.start);
    const merged = [];
    
    for (const match of sorted) {
        if (merged.length === 0) {
            merged.push(match);
            continue;
        }
        
        const last = merged[merged.length - 1];
        // 只有真正重叠时才合并（相邻但不重叠的不合并）
        if (match.match.start < last.match.end && match.match.end > last.match.start) {
            // 合并：扩展结束位置
            last.match.end = Math.max(last.match.end, match.match.end);
        } else {
            merged.push(match);
        }
    }
    
    return merged;
}

// 清除搜索高亮
function clearSearchHighlights() {
    // 方法1：恢复所有元素的原始HTML
    originalElementContents.forEach((originalHTML, element) => {
        element.innerHTML = originalHTML;
    });
    
    // 清空存储
    originalElementContents.clear();
    
    // 方法2：全局清除所有高亮（作为备用，确保彻底清除）
    document.querySelectorAll('mark.search-highlight').forEach(mark => {
        const parent = mark.parentNode;
        const text = mark.textContent;
        parent.replaceChild(document.createTextNode(text), mark);
    });
    
    // 合并所有文本节点
    document.querySelectorAll('.draggable-item, .category-title').forEach(element => {
        element.normalize();
    });
}

// 导航搜索结果
function navigateSearch(direction) {
    if (searchResults.length === 0) return;
    
    // 移除当前高亮
    const currentHighlight = document.querySelector('.search-highlight.current');
    if (currentHighlight) {
        currentHighlight.classList.remove('current');
    }
    
    // 计算新的索引
    if (direction === 0) {
        currentSearchIndex = 0;
    } else {
        currentSearchIndex = (currentSearchIndex + direction + searchResults.length) % searchResults.length;
    }
    
    // 添加新的当前高亮
    const allHighlights = document.querySelectorAll('.search-highlight');
    if (allHighlights[currentSearchIndex]) {
        allHighlights[currentSearchIndex].classList.add('current');
        
        // 滚动到该元素
        const element = allHighlights[currentSearchIndex].closest('.draggable-item, .category-box');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // 更新计数器
    updateSearchCounter();
}

// 更新搜索计数器
function updateSearchCounter() {
    const counter = document.getElementById('searchCounter');
    if (searchResults.length === 0) {
        counter.textContent = '';
    } else {
        counter.textContent = `${currentSearchIndex + 1}/${searchResults.length}`;
    }
}

// 处理搜索框键盘事件
function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            navigateSearch(-1);
        } else {
            navigateSearch(1);
        }
        event.preventDefault();
    } else if (event.key === 'Escape') {
        clearSearch();
        event.preventDefault();
    }
}

// 清除搜索
function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    searchResults = [];
    currentSearchIndex = -1;
    clearSearchHighlights();
    updateSearchCounter();
}

// ==================== 菜单事件监听器 ====================

// 监听来自菜单的新建文件事件
if (window.electronAPI) {
    window.electronAPI.onMenuNewFile(() => {
        newFile();
    });

    // 监听来自菜单的打开文件事件
    window.electronAPI.onMenuOpenFile(() => {
        openFile();
    });

    // 监听来自菜单的保存文件事件
    window.electronAPI.onMenuSaveFile(() => {
        saveFile();
    });

    // 监听来自菜单的另存为事件
    window.electronAPI.onMenuSaveAs(() => {
        saveAs();
    });

    // 监听来自菜单的撤消事件
    window.electronAPI.onMenuUndo(() => {
        undo();
    });

    // 监听来自菜单的重做事件
    window.electronAPI.onMenuRedo(() => {
        redo();
    });

    // 监听来自菜单的退出事件
    window.electronAPI.onMenuExit(() => {
        handleExit();
    });

    // 监听来自菜单的关于事件
    window.electronAPI.onMenuAbout(() => {
        const modal = new bootstrap.Modal(document.getElementById('aboutModal'));
        modal.show();
    });
}

// 处理退出
function handleExit() {
    const modified = isContentModified();
    if (modified) {
        // 显示退出确认模态框
        const modal = new bootstrap.Modal(document.getElementById('exitConfirmModal'));
        modal.show();
    } else {
        // 没有修改，直接退出
        if (window.electronAPI) {
            window.electronAPI.sendAppQuit();
        }
    }
}

// 取消退出
document.getElementById('cancelExitBtn').addEventListener('click', function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('exitConfirmModal'));
    if (modal) {
        modal.hide();
    }
});

// 放弃修改并退出
document.getElementById('discardAndExitBtn').addEventListener('click', async function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('exitConfirmModal'));
    if (modal) {
        modal.hide();
    }
    if (window.electronAPI) {
        window.electronAPI.sendAppQuit();
    }
});

// 保存并退出
document.getElementById('saveAndExitBtn').addEventListener('click', async function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('exitConfirmModal'));
    if (modal) {
        modal.hide();
    }
    await saveFile();
    // 等待保存完成后再退出
    if (window.electronAPI) {
        window.electronAPI.sendAppQuit();
    }
});