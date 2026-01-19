# Windows 安装包构建说明

由于在 Linux 系统上构建 Windows 安装程序需要安装 wine，建议在 Windows 系统上进行构建。

## 方法一：在 Windows 系统上构建（推荐）

### 前提条件
- Windows 10 或更高版本
- Node.js 16+ 已安装
- npm 已安装

### 构建步骤

1. **克隆项目到 Windows 系统**
   ```bash
   git clone https://github.com/zc1415926/ItemCategoryManager.git
   cd ItemCategoryManager
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建 Windows 安装包**
   ```bash
   npm run build-win
   ```

4. **构建结果**
   安装包将生成在 `dist/` 目录下：
   - `条目分类管理器 Setup 1.0.0.exe` - NSIS 安装程序
   - `条目分类管理器-1.0.0-Windows-x64.zip` - 便携版压缩包

## 方法二：在 Linux 上使用 Wine 构建

### 安装 Wine

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install wine64 wine32

# CentOS/RHEL
sudo yum install wine
```

### 构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建安装包
npm run build-win
```

## 安装包特性

生成的 NSIS 安装程序包含以下特性：

✓ **自动创建桌面快捷方式**
  - 安装完成后自动在桌面创建快捷方式
  - 快捷方式名称：条目分类管理器

✓ **自动创建开始菜单快捷方式**
  - 添加到开始菜单的"条目分类管理器"文件夹
  - 支持从开始菜单快速启动

✓ **自定义安装目录**
  - 用户可以选择安装位置
  - 默认安装路径：`C:\Program Files\条目分类管理器\`

✓ **中文界面**
  - 安装程序界面为中文
  - 提供清晰的用户指引

✓ **文件关联**
  - 自动关联 .json 文件
  - 双击 .json 文件可直接在应用中打开

✓ **卸载支持**
  - 提供完整的卸载程序
  - 卸载时保留用户数据（可选）

✓ **数字签名支持**
  - 支持代码签名（需要证书）
  - 提高安装包可信度

## 安装包配置

当前配置（package.json）：

```json
{
  "nsis": {
    "oneClick": false,
    "allowElevation": true,
    "allowToChangeInstallationDirectory": true,
    "installerIcon": "build/icon.ico",
    "uninstallerIcon": "build/icon.ico",
    "installerHeaderIcon": "build/icon.ico",
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "条目分类管理器",
    "include": "build/installer.nsh",
    "license": "LICENSE",
    "runAfterFinish": true,
    "deleteAppDataOnUninstall": false,
    "perMachine": false,
    "packElevateHelper": false,
    "displayLanguageSelector": false,
    "installerLanguages": ["zh_CN"],
    "multiLanguageInstaller": false
  }
}
```

## 自定义安装包

如需自定义安装包，可以修改 `package.json` 中的配置：

### 常用配置项

- `createDesktopShortcut` - 是否创建桌面快捷方式
- `createStartMenuShortcut` - 是否创建开始菜单快捷方式
- `shortcutName` - 快捷方式名称
- `runAfterFinish` - 安装完成后是否运行应用
- `deleteAppDataOnUninstall` - 卸载时是否删除用户数据

### 自定义安装脚本

可以在 `build/installer.nsh` 中添加自定义 NSIS 脚本：

```nsis
; 自定义安装页面
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${BUILD_RESOURCES_DIR}\LICENSE"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; 自定义卸载页面
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; 安装后操作
!define MUI_FINISHPAGE_RUN "$INSTDIR\条目分类管理器.exe"
!define MUI_FINISHPAGE_RUN_TEXT "启动 条目分类管理器"
```

## 发布安装包

构建完成后，可以：

1. **上传到 GitHub Releases**
   ```bash
   gh release create v1.0.0 dist/*.exe
   ```

2. **分享给用户**
   - 直接分享 .exe 文件
   - 或分享包含 .exe 的压缩包

3. **自动更新**
   - 配置 electron-updater 实现自动更新
   - 用户安装后可自动获取更新

## 故障排除

### 构建失败

1. **Wine 错误**
   - 确保已正确安装 wine
   - 运行 `wine --version` 检查版本

2. **网络错误**
   - 使用国内镜像：`export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`
   - 检查网络连接

3. **磁盘空间不足**
   - 清理磁盘空间
   - 至少需要 1GB 可用空间

### 安装包问题

1. **无法安装**
   - 检查 Windows 版本（需要 Windows 10+）
   - 以管理员身份运行安装程序

2. **快捷方式未创建**
   - 检查 NSIS 配置
   - 查看 nsis 配置中的 `createDesktopShortcut` 选项

3. **文件关联失败**
   - 检查 fileAssociations 配置
   - 确保已正确配置 .json 文件关联

## 技术支持

如有问题，请访问：
- GitHub: https://github.com/zc1415926/ItemCategoryManager
- Issues: https://github.com/zc1415926/ItemCategoryManager/issues

## 许可证

MIT License
Copyright (c) 2026 零点壹吨