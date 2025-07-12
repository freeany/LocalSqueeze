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
npm run make
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