// 历史管理器 - 撤销/重做功能
(function(window) {
    'use strict';

    // 历史管理器类
    class HistoryManager {
        constructor(options = {}) {
            this.undoStack = [];
            this.redoStack = [];
            this.maxSize = options.maxSize || 50; // 最多记录50步
            this.onStateChange = options.onStateChange || null; // 状态变化回调
        }

        // 推入操作
        push(operation) {
            this.undoStack.push({
                type: operation.type,      // 操作类型
                data: operation.data,      // 操作数据
                timestamp: Date.now()      // 时间戳
            });
            
            // 清空 redo 栈
            this.redoStack = [];
            
            // 限制栈大小
            if (this.undoStack.length > this.maxSize) {
                this.undoStack.shift();
            }
            
            // 持久化到 localStorage
            this.persist();
            
            // 触发状态变化回调
            this.notifyStateChange();
        }

        // 撤销
        undo() {
            if (this.undoStack.length === 0) return null;
            
            const operation = this.undoStack.pop();
            this.redoStack.push(operation);
            
            // 持久化
            this.persist();
            
            // 触发状态变化回调
            this.notifyStateChange();
            
            return operation;
        }

        // 重做
        redo() {
            if (this.redoStack.length === 0) return null;
            
            const operation = this.redoStack.pop();
            this.undoStack.push(operation);
            
            // 持久化
            this.persist();
            
            // 触发状态变化回调
            this.notifyStateChange();
            
            return operation;
        }

        // 是否可以撤销
        canUndo() {
            return this.undoStack.length > 0;
        }

        // 是否可以重做
        canRedo() {
            return this.redoStack.length > 0;
        }

        // 清空历史
        clear() {
            this.undoStack = [];
            this.redoStack = [];
            this.persist();
            this.notifyStateChange();
        }

        // 持久化到 localStorage
        persist() {
            try {
                const data = {
                    undo: this.undoStack,
                    redo: this.redoStack
                };
                localStorage.setItem('itemManagerHistory', JSON.stringify(data));
            } catch (e) {
                console.error('保存历史失败:', e);
            }
        }

        // 从 localStorage 恢复
        restore() {
            try {
                const data = localStorage.getItem('itemManagerHistory');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.undoStack = parsed.undo || [];
                    this.redoStack = parsed.redo || [];
                    this.notifyStateChange();
                }
            } catch (e) {
                console.error('恢复历史失败:', e);
            }
        }

        // 通知状态变化
        notifyStateChange() {
            if (this.onStateChange) {
                this.onStateChange({
                    canUndo: this.canUndo(),
                    canRedo: this.canRedo(),
                    undoCount: this.undoStack.length,
                    redoCount: this.redoStack.length
                });
            }
        }

        // 获取历史信息
        getInfo() {
            return {
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                undoCount: this.undoStack.length,
                redoCount: this.redoStack.length,
                lastOperation: this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1] : null
            };
        }
    }

    // 导出全局实例
    window.HistoryManager = HistoryManager;
    
    // 创建默认实例
    window.historyManager = new HistoryManager({
        maxSize: 50
    });

})(window);