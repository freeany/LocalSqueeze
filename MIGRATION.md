# 从Electron-Builder迁移到Electron-Forge

本文档记录了将项目从使用electron-builder迁移到electron-forge的过程。

## 迁移步骤

1. 安装electron-forge及相关依赖：

```bash
npm install --save-dev @electron-forge/cli @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/plugin-vite
```

2. 使用electron-forge导入命令初始化配置：

```bash
npx electron-forge import
```

3. 创建Vite配置文件：
   - `vite.main.config.ts` - 主进程配置
   - `vite.preload.config.ts` - 预加载脚本配置
   - `vite.renderer.config.ts` - 渲染进程配置

4. 修改`forge.config.js`以适应项目需求：
   - 添加打包配置
   - 配置Vite插件
   - 从electron-builder.json导入相关配置

5. 更新`package.json`：
   - 修改main字段为`dist-electron/main/main.js`
   - 更新scripts命令
   - 移除不再需要的依赖

6. 更新`main.ts`以适应electron-forge架构：
   - 修改文件路径引用
   - 添加对MAIN_WINDOW_VITE_DEV_SERVER_URL和MAIN_WINDOW_VITE_NAME的引用

7. 添加类型声明：
   - 在`src/types/global.d.ts`中添加Electron Forge Vite插件的全局变量声明

8. 删除不再需要的文件：
   - `electron-builder.json`
   - `electron.vite.config.ts`

## 配置文件变化

### 从electron-builder.json到forge.config.js

electron-builder.json中的配置被迁移到了forge.config.js中，包括：
- appId
- productName
- 图标配置
- 构建输出配置
- 平台特定配置

### 从electron.vite.config.ts到分离的Vite配置

原来的electron.vite.config.ts被分解为三个独立的配置文件：
- vite.main.config.ts
- vite.preload.config.ts
- vite.renderer.config.ts

## 注意事项

1. 确保正确设置main字段为`dist-electron/main/main.js`
2. 确保添加了Electron Forge Vite插件的全局变量声明
3. 在主进程中正确引用预加载脚本和渲染进程文件
4. 适当配置forge.config.js以满足项目需求

## 遇到的问题及解决方案

1. **问题**：找不到main.js入口文件
   **解决方案**：修改package.json中的main字段为正确的路径

2. **问题**：找不到MAIN_WINDOW_VITE_DEV_SERVER_URL等全局变量
   **解决方案**：在src/types/global.d.ts中添加类型声明

3. **问题**：无法正确加载预加载脚本
   **解决方案**：在main.ts中根据应用是否打包使用不同的路径 