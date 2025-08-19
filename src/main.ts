import { app, BrowserWindow, ipcMain, dialog, shell, protocol } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import fs from 'fs/promises';
import { existsSync } from 'fs'; // 添加同步版本的fs
import os from 'os';
import { initAllHandlers } from './server/ipc';


// 声明Electron Forge Vite插件注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string | undefined;

// 临时目录路径
const TEMP_DIR = path.join(os.tmpdir(), 'imgs-compress');

// 确保临时目录存在
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    // 已删除日志
  }
}

// 设置应用程序ID，解决Windows上显示为"Deployment Tool"的问题
app.setAppUserModelId('com.squirrel.LocalSqueeze.LocalSqueeze');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// 图片路径缓存，用于存储ID到文件路径的映射
const imagePathCache = new Map<string, string>();

// 声明全局变量以保存对主窗口的引用
let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // 判断是否为生产环境
  const isProduction = process.env.NODE_ENV === 'production' || !MAIN_WINDOW_VITE_DEV_SERVER_URL;
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    show: false, // 先隐藏窗口，等准备好后再显示，避免闪烁
    // 在生产环境下禁用菜单栏
    autoHideMenuBar: isProduction,
    frame: true,
    webPreferences: {
      preload:  path.join(__dirname, 'preload.js'),
      // 添加以下配置以禁用自动填充功能
      spellcheck: false,
      // 确保上下文隔离
      contextIsolation: true,
      // 允许加载本地资源
      webSecurity: false, // 注意：这会降低安全性，但在本地应用中可以接受
      // 启用开发者工具，在生产环境下禁用
      devTools: true,
      // 允许远程模块
      nodeIntegration: false,
      // 启用沙箱
      sandbox: false,
    },
  });

  // 只在开发环境下打开开发者工具
  if (!isProduction) {
    mainWindow.webContents.openDevTools();
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // 监听页面加载完成事件
  mainWindow.webContents.on('did-finish-load', () => {
    // 已删除日志
    
    // 显示窗口
    mainWindow.show();
  });

  // 监听渲染进程错误
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    // 已删除日志
  });

  // 监听页面崩溃
  mainWindow.webContents.on('crashed' as any, () => {
    // 已删除日志
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // 判断是否为生产环境
  const isProduction = process.env.NODE_ENV === 'production' || !MAIN_WINDOW_VITE_DEV_SERVER_URL;
  
  // 在生产环境下禁用开发者工具
  if (isProduction) {
    // 设置默认窗口选项，禁用开发者工具
    app.on('browser-window-created', (_, window) => {
      // 强制关闭开发者工具
      window.webContents.on('devtools-opened', () => {
        window.webContents.closeDevTools();
      });
      
      // 禁用右键菜单中的检查元素选项
      window.webContents.on('context-menu', (e, params) => {
        e.preventDefault();
      });
      
      // 禁用所有可能打开开发者工具的快捷键
      window.webContents.on('before-input-event', (e, input) => {
        // 禁用F12、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+Shift+C等快捷键
        if (
          input.key === 'F12' || 
          (input.control && input.shift && (input.key === 'I' || input.key === 'J' || input.key === 'C')) ||
          (input.control && input.alt && input.key === 'I')
        ) {
          e.preventDefault();
        }
      });
    });
    
    // 禁用应用程序菜单，防止通过菜单打开开发者工具
    app.on('browser-window-focus', () => {
      if (process.platform !== 'darwin') {
        // 在非macOS平台上禁用菜单
        BrowserWindow.getFocusedWindow()?.setMenuBarVisibility(false);
      }
    });
    
    // 完全禁用开发者工具
    app.commandLine.appendSwitch('disable-devtools');
  }
  
  await ensureTempDir();
  initAllHandlers(); // 初始化所有IPC处理程序

  // 注册读取图片为Data URL的处理程序（必须在initAllHandlers之后）
  ipcMain.handle('get-image-data-url', async (_, filePath) => {
    try {
      console.log('=== NEW HANDLER ===');
      console.log('正在尝试加载图片:', filePath);
      console.log('文件是否存在:', existsSync(filePath));
      console.log('=== NEW HANDLER ===');
      
      // 检查文件是否存在
      if (!existsSync(filePath)) {
        console.log('文件不存在，返回默认图片');
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiIGZpbGw9IiM5OTkiLz48L3N2Zz4=';
      }
      
      console.log('文件存在，继续处理...');

      // 读取文件
      console.log('开始读取文件:', filePath);
      const data = await fs.readFile(filePath);
      console.log('文件读取成功，大小:', data.length, '字节');

      // 检测文件类型
      let mimeType = 'image/png'; // 默认MIME类型
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (filePath.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else if (filePath.endsWith('.gif')) {
        mimeType = 'image/gif';
      }
      console.log('检测到的MIME类型:', mimeType);

      // 转换为Base64
      const base64Data = data.toString('base64');
      console.log('Base64转换成功，长度:', base64Data.length);

      // 返回Data URL
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      console.log('返回Data URL，前50个字符:', dataUrl.substring(0, 50));
      return dataUrl;
    } catch (error) {
      console.error('加载图片时发生错误:', error);
      console.error('错误详情:', error.message);
      console.error('文件路径:', filePath);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy59LTcuNTlMMTkgOGwtOSA5eiIgZmlsbD0iIzk5OSIvPjwvc3ZnPg==';
    }
  });

  // 注册自定义协议，用于安全地加载本地文件
  protocol.registerFileProtocol('app-image', (request, callback) => {
    try {
      // 从请求URL中提取文件ID
      const fileId = request.url.substring('app-image://'.length);
      // 解码文件ID
      const decodedId = decodeURIComponent(fileId);
      // 已删除日志

      // 从缓存中获取实际文件路径
      const filePath = imagePathCache.get(decodedId);
      if (!filePath) {
        // 已删除日志
        return callback({ error: -2 });
      }

      // 已删除日志
      callback({ path: filePath });
    } catch (error) {
      // 已删除日志
      callback({ error: -2 });
    }
  });

  // 注册保存临时文件的处理程序
  ipcMain.handle('save-temp-file', async (_, args) => {
    try {
      const { filename, data } = args;

      // 生成安全的文件名，避免中文和特殊字符问题
      const safeFilename = Date.now() + '_' + Math.floor(Math.random() * 10000) + '_' +
        filename.replace(/[^a-zA-Z0-9.-]/g, '_');

      // 确保临时目录存在
      await fs.mkdir(TEMP_DIR, { recursive: true });

      const tempFilePath = path.join(TEMP_DIR, safeFilename);

      // 将Buffer写入文件
      await fs.writeFile(tempFilePath, Buffer.from(data));

      // 已删除日志
      // 返回临时文件路径和原始文件名
      return {
        path: tempFilePath,
        originalFilename: filename
      };
    } catch (error) {
      // 已删除日志
      // 返回详细的错误信息
      throw new Error(`保存临时文件失败: ${error.message || '未知错误'}`);
    }
  });

  // 注册获取图片URL的处理程序
  ipcMain.handle('get-image-url', (_, filePath) => {
    try {
      // 检查文件是否存在
      if (!existsSync(filePath)) {
        // 已删除日志
        return '';
      }

      // 为文件生成一个唯一ID
      const fileId = Date.now() + '_' + Math.floor(Math.random() * 1000000);

      // 将文件路径存储在缓存中
      imagePathCache.set(fileId, filePath);

      // 返回自定义协议URL
      const url = `app-image://${fileId}`;
      // 已删除日志
      return url;
    } catch (error) {
      // 已删除日志
      return '';
    }
  });



  // 注册保存文件的处理程序
  ipcMain.handle('save-file', async (_, args) => {
    try {
      const { sourcePath, suggestedName } = args;

      // 打开保存对话框
      const result = await dialog.showSaveDialog({
        defaultPath: suggestedName,
        filters: [
          { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        // 复制文件
        await fs.copyFile(sourcePath, result.filePath);
        return { success: true, path: result.filePath };
      }

      return { success: false, reason: 'User canceled' };
    } catch (error) {
      // 已删除日志
      return { success: false, error: error.message };
    }
  });

  // 注册打开文件的处理程序
  ipcMain.handle('open-file', async (_, filePath) => {
    try {
      // 使用系统默认应用打开文件
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      // 已删除日志
      return { success: false, error: error.message };
    }
  });

  // 注册在文件管理器中显示文件的处理程序
  ipcMain.handle('show-item-in-folder', async (_, filePath) => {
    try {
      // 使用shell.showItemInFolder在文件管理器中显示文件
      shell.showItemInFolder(filePath);
      return { success: true };
    } catch (error) {
      // 已删除日志
      return { success: false, error: error.message };
    }
  });

  // 注册导出所有文件的处理程序
  ipcMain.handle('export-all-files', async (_, args) => {
    try {
      const { files, outputDir } = args;

      for (const filePath of files) {
        const fileName = path.basename(filePath);
        const destPath = path.join(outputDir, fileName);
        await fs.copyFile(filePath, destPath);
      }

      return { success: true };
    } catch (error) {
      // 已删除日志
      return { success: false, error: error.message };
    }
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
