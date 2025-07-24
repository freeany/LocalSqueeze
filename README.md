# LocalSqueeze - 图片压缩工具

高效的图片压缩和格式转换工具，保持图片质量的同时减小文件大小。

## 技术栈

- Electron
- React
- TypeScript
- Tailwind CSS
- Electron Forge

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 打包应用

```bash
npm run package
```

### 构建可分发的安装包

```bash
# 构建当前平台的安装包
npm run make

# 构建所有平台的安装包（Windows, macOS, Linux）
npm run make:all
```

### 发布到GitHub Release

```bash
# 发布当前平台的安装包到GitHub Release
npm run publish

# 发布所有平台的安装包到GitHub Release
npm run publish:all
```

### 自动化构建和发布

项目配置了GitHub Actions工作流，当推送带有标签的提交时（如`v1.0.1`），会自动触发构建并发布到GitHub Release。

1. 更新版本号（在`package.json`中）
2. 提交更改并创建标签

```bash
git add .
git commit -m "release: v1.0.1"
git tag v1.0.1
git push && git push --tags
```

## 项目架构

该项目使用Electron Forge作为构建和打包工具，使用Vite作为前端构建工具。

### 主要目录结构

- `src/main.ts` - Electron主进程入口
- `src/preload.ts` - 预加载脚本
- `src/renderer.ts` - 渲染进程入口
- `src/app.tsx` - React应用入口
- `src/components/` - React组件
- `src/views/` - 页面视图
- `src/server/` - 服务端逻辑（在主进程中运行）

## 构建配置

- `forge.config.js` - Electron Forge配置
- `vite.main.config.ts` - 主进程Vite配置
- `vite.preload.config.ts` - 预加载脚本Vite配置
- `vite.renderer.config.ts` - 渲染进程Vite配置

## 许可证

MIT