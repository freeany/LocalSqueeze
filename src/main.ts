import { app, BrowserWindow, ipcMain, dialog, shell, protocol, net } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from 'fs/promises';
import { existsSync } from 'fs'; // 添加同步版本的fs
import os from 'os';
import { initCompressionHandlers } from './server/ipc/compression-handler';
import { URL } from 'url';

// 临时目录路径
const TEMP_DIR = path.join(os.tmpdir(), 'imgs-compress');

// 确保临时目录存在
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('创建临时目录失败:', error);
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // 添加以下配置以禁用自动填充功能
      spellcheck: false,
      // 确保上下文隔离
      contextIsolation: true,
      // 允许加载本地资源
      webSecurity: false, // 注意：这会降低安全性，但在本地应用中可以接受
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await ensureTempDir();
  initCompressionHandlers();
  
  // 注册自定义协议，用于安全地加载本地文件
  protocol.registerFileProtocol('app-image', (request, callback) => {
    try {
      // 从请求URL中提取文件ID
      const fileId = request.url.substring('app-image://'.length);
      // 解码文件ID
      const decodedId = decodeURIComponent(fileId);
      console.log(`请求图片ID: ${decodedId}`);
      
      // 从缓存中获取实际文件路径
      const filePath = imagePathCache.get(decodedId);
      if (!filePath) {
        console.error(`未找到图片路径: ${decodedId}`);
        return callback({ error: -2 });
      }
      
      console.log(`加载图片: ${filePath}`);
      callback({ path: filePath });
    } catch (error) {
      console.error('加载图片失败:', error);
      callback({ error: -2 });
    }
  });
  
  // 图片路径缓存，用于存储ID到文件路径的映射
  const imagePathCache = new Map<string, string>();
  
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
      
      console.log(`文件已保存到: ${tempFilePath}`);
      return tempFilePath;
    } catch (error) {
      console.error('保存临时文件失败:', error);
      // 返回详细的错误信息
      throw new Error(`保存临时文件失败: ${error.message || '未知错误'}`);
    }
  });
  
  // 注册获取图片URL的处理程序
  ipcMain.handle('get-image-url', (_, filePath) => {
    try {
      // 检查文件是否存在
      if (!existsSync(filePath)) {
        console.error(`文件不存在: ${filePath}`);
        return '';
      }
      
      // 为文件生成一个唯一ID
      const fileId = Date.now() + '_' + Math.floor(Math.random() * 1000000);
      
      // 将文件路径存储在缓存中
      imagePathCache.set(fileId, filePath);
      
      // 返回自定义协议URL
      const url = `app-image://${fileId}`;
      console.log(`为文件 ${filePath} 生成URL: ${url}`);
      return url;
    } catch (error) {
      console.error('生成图片URL失败:', error);
      return '';
    }
  });
  
  // 注册读取图片为Data URL的处理程序
  ipcMain.handle('get-image-data-url', async (_, filePath) => {
    try {
      // 读取文件
      const data = await fs.readFile(filePath);
      
      // 检测文件类型
      let mimeType = 'image/png'; // 默认MIME类型
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (filePath.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else if (filePath.endsWith('.gif')) {
        mimeType = 'image/gif';
      }
      
      // 转换为Base64
      const base64Data = data.toString('base64');
      
      // 返回Data URL
      return `data:${mimeType};base64,${base64Data}`;
    } catch (error) {
      console.error('读取图片失败:', error);
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
      console.error('保存文件失败:', error);
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
      console.error('打开文件失败:', error);
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
      console.error('导出文件失败:', error);
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

// 退出前清理临时文件
app.on('will-quit', async () => {
  try {
    // 读取临时目录中的所有文件
    const files = await fs.readdir(TEMP_DIR);
    
    // 删除所有文件
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error('清理临时文件失败:', error);
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
