import { contextBridge, ipcRenderer } from 'electron';

// 图片压缩API
const compressionAPI = {
  // 压缩单个图片
  compressImage: (imagePath: string, settings: any, outputPath?: string) => {
    return ipcRenderer.invoke('compress-image', { imagePath, settings, outputPath });
  },
  
  // 批量压缩图片
  batchCompressImages: (imagePaths: string[], settings: any, outputDir?: string) => {
    return ipcRenderer.invoke('batch-compress-images', { imagePaths, settings, outputDir });
  },
  
  // 转换为WebP格式
  convertToWebp: (imagePath: string, settings: any, outputPath?: string) => {
    return ipcRenderer.invoke('convert-to-webp', { imagePath, settings, outputPath });
  },
  
  // 获取压缩预设
  getCompressionPreset: (presetName: string) => {
    return ipcRenderer.invoke('get-compression-preset', presetName);
  },
  
  // 选择输出目录
  selectOutputDirectory: () => {
    return ipcRenderer.invoke('select-output-directory');
  },
  
  // 清理临时文件
  clearTempFiles: () => {
    return ipcRenderer.invoke('clear-temp-files');
  },
  
  // 监听压缩进度
  onCompressionProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('compression-progress', (_, data) => callback(data));
    return () => {
      ipcRenderer.removeAllListeners('compression-progress');
    };
  }
};

// 统计数据API
const statsAPI = {
  // 获取统计数据
  getStats: () => {
    try {
      return ipcRenderer.invoke('get-stats')
        .catch(error => {
          console.error('调用getStats失败:', error);
          return {
            success: true,
            stats: {
              totalProcessedImages: 0,
              totalOriginalSize: 0,
              totalCompressedSize: 0,
              totalSavedSpace: 0,
              averageCompressionRate: '0%',
              lastUpdated: Date.now()
            },
            todayStats: {
              processedImages: 0,
              savedSpace: 0
            }
          };
        });
    } catch (error) {
      console.error('getStats异常:', error);
      return Promise.resolve({
        success: true,
        stats: {
          totalProcessedImages: 0,
          totalOriginalSize: 0,
          totalCompressedSize: 0,
          totalSavedSpace: 0,
          averageCompressionRate: '0%',
          lastUpdated: Date.now()
        },
        todayStats: {
          processedImages: 0,
          savedSpace: 0
        }
      });
    }
  },
  
  // 获取最近处理的图片
  getRecentImages: (limit = 10) => {
    try {
      return ipcRenderer.invoke('get-recent-images', limit)
        .catch(error => {
          console.error('调用getRecentImages失败:', error);
          return { success: true, images: [] };
        });
    } catch (error) {
      console.error('getRecentImages异常:', error);
      return Promise.resolve({ success: true, images: [] });
    }
  },
  
  // 添加处理记录
  addProcessedImage: (image: any) => {
    try {
      return ipcRenderer.invoke('add-processed-image', image);
    } catch (error) {
      console.error('addProcessedImage异常:', error);
      return Promise.resolve({ success: false, error: '添加处理记录失败' });
    }
  },
  
  // 清除所有统计数据
  clearAllData: () => {
    try {
      return ipcRenderer.invoke('clear-stats-data');
    } catch (error) {
      console.error('clearAllData异常:', error);
      return Promise.resolve({ success: false, error: '清除统计数据失败' });
    }
  }
};

// 定义有效的IPC通道
const validChannels = [
  'compress-image',
  'batch-compress-images',
  'convert-to-webp',
  'get-compression-preset',
  'select-output-directory',
  'clear-temp-files',
  'save-temp-file',
  'get-local-image-url',
  'get-image-url',
  'get-image-data-url',
  'save-file',
  'open-file',
  'show-item-in-folder',
  'export-all-files',
  'get-stats',
  'get-recent-images',
  'add-processed-image',
  'clear-stats-data'
];

// 暴露IPC通信API
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_, ...args) => func(...args));
        return () => ipcRenderer.removeAllListeners(channel);
      }
      return () => { /* 无操作 */ };
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (_, ...args) => func(...args));
      }
    },
    invoke: (channel: string, ...args: any[]) => {
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
          .catch(error => {
            console.error(`调用 ${channel} 失败:`, error);
            throw error;
          });
      }
      return Promise.reject(new Error(`不允许调用 ${channel}`));
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func as any);
      }
    },
    removeAllListeners: (channel: string) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    }
  }
};

// 确保API在渲染进程中可用
try {
  // 暴露API到渲染进程
  contextBridge.exposeInMainWorld('compression', compressionAPI);
  contextBridge.exposeInMainWorld('stats', statsAPI);
  contextBridge.exposeInMainWorld('electron', electronAPI);
  
  console.log('预加载脚本已成功执行，API已暴露到window对象');
} catch (error) {
  console.error('暴露API到渲染进程失败:', error);
}

// 为了与electron-vite兼容，导出函数
export type ElectronAPI = typeof electronAPI;
export type CompressionAPI = typeof compressionAPI;
export type StatsAPI = typeof statsAPI;
