import { contextBridge, ipcRenderer } from 'electron';

// 记录日志函数
const logInfo = (message: string, ...args: any[]) => {
  console.log(`[Preload] ${message}`, ...args);
};

// 记录错误函数
const logError = (message: string, error: any) => {
  console.error(`[Preload Error] ${message}`, error);
};

logInfo('预加载脚本开始执行');

// 图片压缩API
const compressionAPI = {
  // 压缩单个图片
  compressImage: (imagePath: string, settings: any, outputPath?: string) => {
    logInfo('调用compressImage', { imagePath, settings, outputPath });
    return ipcRenderer.invoke('compress-image', { imagePath, settings, outputPath });
  },
  
  // 批量压缩图片
  batchCompressImages: (imagePaths: string[], settings: any, outputDir?: string) => {
    logInfo('调用batchCompressImages', { count: imagePaths.length, settings, outputDir });
    return ipcRenderer.invoke('batch-compress-images', { imagePaths, settings, outputDir });
  },
  
  // 转换为WebP格式
  convertToWebp: (imagePath: string, settings: any, outputPath?: string) => {
    logInfo('调用convertToWebp', { imagePath, settings, outputPath });
    return ipcRenderer.invoke('convert-to-webp', { imagePath, settings, outputPath });
  },
  
  // 获取压缩预设
  getCompressionPreset: (presetName: string) => {
    logInfo('调用getCompressionPreset', { presetName });
    return ipcRenderer.invoke('get-compression-preset', presetName);
  },
  
  // 选择输出目录
  selectOutputDirectory: () => {
    logInfo('调用selectOutputDirectory');
    return ipcRenderer.invoke('select-output-directory');
  },
  
  // 清理临时文件
  clearTempFiles: () => {
    logInfo('调用clearTempFiles');
    return ipcRenderer.invoke('clear-temp-files');
  },
  
  // 监听压缩进度
  onCompressionProgress: (callback: (data: any) => void) => {
    logInfo('设置压缩进度监听器');
    ipcRenderer.on('compression-progress', (_, data) => callback(data));
    return () => {
      logInfo('移除压缩进度监听器');
      ipcRenderer.removeAllListeners('compression-progress');
    };
  }
};

// 统计数据API
const statsAPI = {
  // 获取统计数据
  getStats: () => {
    logInfo('调用getStats');
    try {
      return ipcRenderer.invoke('get-stats')
        .then(result => {
          logInfo('getStats成功', result);
          return result;
        })
        .catch(error => {
          logError('调用getStats失败', error);
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
      logError('getStats异常', error);
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
    logInfo('调用getRecentImages', { limit });
    try {
      return ipcRenderer.invoke('get-recent-images', limit)
        .then(result => {
          logInfo('getRecentImages成功', { count: result?.images?.length || 0 });
          return result;
        })
        .catch(error => {
          logError('调用getRecentImages失败', error);
          return { success: true, images: [] };
        });
    } catch (error) {
      logError('getRecentImages异常', error);
      return Promise.resolve({ success: true, images: [] });
    }
  },
  
  // 添加处理记录
  addProcessedImage: (image: any) => {
    logInfo('调用addProcessedImage', { imageId: image.id });
    try {
      return ipcRenderer.invoke('add-processed-image', image)
        .then(result => {
          logInfo('addProcessedImage成功', result);
          return result;
        })
        .catch(error => {
          logError('调用addProcessedImage失败', error);
          return { success: false, error: '添加处理记录失败' };
        });
    } catch (error) {
      logError('addProcessedImage异常', error);
      return Promise.resolve({ success: false, error: '添加处理记录失败' });
    }
  },
  
  // 清除所有统计数据
  clearAllData: () => {
    logInfo('调用clearAllData');
    try {
      return ipcRenderer.invoke('clear-stats-data')
        .then(result => {
          logInfo('clearAllData成功', result);
          return result;
        })
        .catch(error => {
          logError('调用clearAllData失败', error);
          return { success: false, error: '清除统计数据失败' };
        });
    } catch (error) {
      logError('clearAllData异常', error);
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
        logInfo(`发送IPC消息: ${channel}`);
        ipcRenderer.send(channel, ...args);
      } else {
        logError(`尝试发送无效的IPC通道: ${channel}`, null);
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        logInfo(`注册IPC监听器: ${channel}`);
        ipcRenderer.on(channel, (_, ...args) => func(...args));
        return () => ipcRenderer.removeAllListeners(channel);
      }
      logError(`尝试监听无效的IPC通道: ${channel}`, null);
      return () => { /* 无操作 */ };
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        logInfo(`注册一次性IPC监听器: ${channel}`);
        ipcRenderer.once(channel, (_, ...args) => func(...args));
      } else {
        logError(`尝试一次性监听无效的IPC通道: ${channel}`, null);
      }
    },
    invoke: (channel: string, ...args: any[]) => {
      if (validChannels.includes(channel)) {
        logInfo(`调用IPC方法: ${channel}`);
        return ipcRenderer.invoke(channel, ...args)
          .then(result => {
            logInfo(`IPC方法调用成功: ${channel}`);
            return result;
          })
          .catch(error => {
            logError(`调用 ${channel} 失败`, error);
            throw error;
          });
      }
      logError(`尝试调用无效的IPC通道: ${channel}`, null);
      return Promise.reject(new Error(`不允许调用 ${channel}`));
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        logInfo(`移除IPC监听器: ${channel}`);
        ipcRenderer.removeListener(channel, func as any);
      } else {
        logError(`尝试移除无效的IPC通道监听器: ${channel}`, null);
      }
    },
    removeAllListeners: (channel: string) => {
      if (validChannels.includes(channel)) {
        logInfo(`移除所有IPC监听器: ${channel}`);
        ipcRenderer.removeAllListeners(channel);
      } else {
        logError(`尝试移除无效的IPC通道所有监听器: ${channel}`, null);
      }
    }
  }
};

// 确保API在渲染进程中可用
try {
  // 测试IPC通道是否可用
  logInfo('测试IPC通道是否可用');
  
  // 暴露API到渲染进程
  logInfo('开始暴露API到window对象');
  contextBridge.exposeInMainWorld('compression', compressionAPI);
  contextBridge.exposeInMainWorld('stats', statsAPI);
  contextBridge.exposeInMainWorld('electron', electronAPI);
  
  logInfo('预加载脚本已成功执行，API已暴露到window对象');
} catch (error) {
  logError('暴露API到渲染进程失败', error);
}

// 为了与electron-vite兼容，导出函数
export type ElectronAPI = typeof electronAPI;
export type CompressionAPI = typeof compressionAPI;
export type StatsAPI = typeof statsAPI;
