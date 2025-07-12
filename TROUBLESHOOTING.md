# 故障排除指南

## 迁移到Electron Forge后的常见问题

### 1. 预加载脚本API不可用

**症状**: 
- 控制台报错 "加载统计数据失败 Error: window.stats API不可用"
- 渲染进程中无法访问通过contextBridge暴露的API

**解决方案**:
1. 修改预加载脚本，确保正确使用contextBridge暴露API:
   ```javascript
   // 使用contextBridge暴露API到渲染进程
   if (process.contextIsolated) {
     try {
       contextBridge.exposeInMainWorld('compression', compressionAPI);
       contextBridge.exposeInMainWorld('stats', statsAPI);
       contextBridge.exposeInMainWorld('electron', electronAPI);
     } catch (error) {
       console.error('暴露API到渲染进程失败', error);
     }
   } else {
     // 如果上下文隔离被禁用，直接设置到window对象
     (window as any).compression = compressionAPI;
     (window as any).stats = statsAPI;
     (window as any).electron = electronAPI;
   }
   ```

2. 确保主进程中正确加载预加载脚本:
   ```javascript
   // 获取预加载脚本路径
   const getPreloadPath = () => {
     // 开发环境下的路径
     const devPath = path.join(__dirname, '../../dist-electron/preload/preload.js');
     // 生产环境下的路径
     const prodPath = path.join(__dirname, '../preload/preload.js');
     
     // 根据环境选择正确的路径
     return app.isPackaged ? prodPath : devPath;
   };
   
   // 在创建BrowserWindow时使用
   const mainWindow = new BrowserWindow({
     webPreferences: {
       preload: getPreloadPath(),
       contextIsolation: true,
       nodeIntegration: false,
     },
   });
   ```

3. 在Vite预加载脚本配置中设置正确的输出格式:
   ```javascript
   // vite.preload.config.ts
   export default defineConfig({
     build: {
       outDir: 'dist-electron/preload',
       minify: false, // 不要压缩预加载脚本，以便于调试
       sourcemap: 'inline', // 添加内联源映射，以便于调试
       rollupOptions: {
         external: ['electron', ...builtinModules],
         output: {
           format: 'cjs', // 使用CommonJS格式
           entryFileNames: '[name].js',
         }
       },
       emptyOutDir: true,
     },
   });
   ```

### 2. 调试技巧

1. 在渲染进程中添加调试代码，检查window对象上是否有预期的API:
   ```javascript
   console.log('检查预加载脚本API是否可用:', {
     electron: !!window.electron,
     compression: !!window.compression,
     stats: !!window.stats
   });
   ```

2. 在主进程中打印预加载脚本路径:
   ```javascript
   console.log('检查预加载脚本路径:');
   console.log('- 开发环境路径:', devPath, existsSync(devPath) ? '存在' : '不存在');
   console.log('- 生产环境路径:', prodPath, existsSync(prodPath) ? '存在' : '不存在');
   console.log('选择的预加载脚本路径:', preloadPath);
   ```

3. 添加错误处理和回退机制:
   ```javascript
   // 检查window.stats是否存在
   if (!window.stats) {
     console.warn('window.stats API不可用，尝试使用默认值');
     setStats({
       processedImages: 0,
       savedSpace: '0 MB',
       compressionRate: '0%',
       todayProcessed: 0
     });
     setError('统计数据API不可用，请检查预加载脚本是否正确加载');
     return;
   }
   ```

### 3. 路径问题

在Electron Forge架构中，开发模式和生产模式的路径结构不同：

- **开发模式**:
  - 主进程: `dist-electron/main/main.js`
  - 预加载脚本: `dist-electron/preload/preload.js`
  - 渲染进程: 通过Vite开发服务器加载

- **生产模式**:
  - 主进程: `.vite/build/main.js`
  - 预加载脚本: `.vite/build/preload.js`
  - 渲染进程: `.vite/build/renderer/index.html`

确保在不同模式下使用正确的路径。 