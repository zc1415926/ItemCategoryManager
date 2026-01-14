# 条目分类管理器 - Electron版本

## 功能特点

- ✅ 完整的文件系统访问（可以直接覆盖文件）
- ✅ 原生的文件对话框
- ✅ 桌面应用体验
- ✅ 支持新建、打开、保存、另存为文件
- ✅ 智能的修改检测
- ✅ 拖拽式条目分类管理
- ✅ 批量导入导出功能

## 开发环境要求

- Node.js 16+ 
- npm

## 安装依赖

```bash
npm install
```

## 启动Electron应用

```bash
npm start
```

## 构建可执行文件

### Windows
```bash
npm run build-win
```

### macOS
```bash
npm run build-mac
```

### Linux
```bash
npm run build-linux
```

构建后的文件会生成在 `dist` 目录中。

## Electron版本与Web版本的区别

### 文件操作
- **Web版本**：受浏览器安全限制，无法直接覆盖文件
- **Electron版本**：完整的文件系统访问，可以读取、写入、覆盖文件

### 保存功能
- **Web版本**：
  - 使用 File System Access API（需要用户授权）
  - 传统方式只能下载新文件
  - 无法直接覆盖原文件
  
- **Electron版本**：
  - 使用 Node.js 的 `fs` 模块
  - 可以直接覆盖原文件
  - 原生的文件对话框

### 文件对话框
- **Web版本**：浏览器原生文件选择器
- **Electron版本**：Electron 原生文件对话框（更美观，功能更强）

### 用户体验
- **Web版本**：在浏览器中运行
- **Electron版本**：桌面应用，可以创建快捷方式

## 技术栈

- Electron 28.0.0
- Bootstrap 5.3.0
- Node.js
- HTML5 / CSS3 / JavaScript

## 项目结构

```
ItemManager/
├── electron-main.js    # Electron主进程
├── preload.js          # 预加载脚本
├── main.js             # 应用逻辑（兼容Web和Electron）
├── index.html          # 主页面
├── style.css           # 样式文件
├── assets/             # 静态资源
│   ├── css/
│   └── js/
├── package.json        # 项目配置
└── icon.png            # 应用图标
```

## 注意事项

1. **文件路径**：Electron版本使用绝对路径，Web版本使用相对路径
2. **文件权限**：Electron版本有完整的文件读写权限
3. **跨平台**：支持 Windows、macOS、Linux 三个平台
4. **GPU错误**：启动时的GPU警告可以忽略，不影响功能

## 开发说明

- 所有文件操作代码都封装在 `electronFileAPI` 对象中
- 通过 `isElectron` 变量检测运行环境
- 代码同时兼容 Web 和 Electron 环境
- 使用 `contextBridge` 安全地暴露 Node.js 功能

## 许可证

MIT License