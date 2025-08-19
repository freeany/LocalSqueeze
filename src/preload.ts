import { contextBridge, ipcRenderer } from 'electron';

// 记录日志函数
const logInfo = (message: string, ...args: any[]) => {
  // 已删除日志
};

// 记录错误函数
const logError = (message: string, error: any) => {
  // 已删除日志
};

// 已删除日志

// 图片压缩API
const compressionAPI = {
  // 压缩单个图片
  compressImage: (imagePath: string, settings: any, outputPath?: string) => {
    // 已删除日志
    return ipcRenderer.invoke('compress-image', { imagePath, settings, outputPath });
  },
  
  // 批量压缩图片
  batchCompressImages: (imagePaths: string[], settings: any, outputDir?: string) => {
    // 已删除日志
    return ipcRenderer.invoke('batch-compress-images', { imagePaths, settings, outputDir });
  },
  
  // 转换为WebP格式
  convertToWebp: (imagePath: string, settings: any, outputPath?: string) => {
    // 已删除日志
    return ipcRenderer.invoke('convert-to-webp', { imagePath, settings, outputPath });
  },
  
  // 获取压缩预设
  getCompressionPreset: (presetName: string) => {
    // 已删除日志
    return ipcRenderer.invoke('get-compression-preset', presetName);
  },
  
  // 选择输出目录
  selectOutputDirectory: () => {
    // 已删除日志
    return ipcRenderer.invoke('select-output-directory');
  },
  
  // 清理临时文件
  clearTempFiles: () => {
    // 已删除日志
    return ipcRenderer.invoke('clear-temp-files');
  },
  
  // 删除单个临时文件
  deleteTempFile: (filePath: string) => {
    // 已删除日志
    return ipcRenderer.invoke('delete-temp-file', filePath);
  },
  
  // 监听压缩进度
  onCompressionProgress: (callback: (data: any) => void) => {
    // 已删除日志
    ipcRenderer.on('compression-progress', (_, data) => callback(data));
    return () => {
      // 已删除日志
      ipcRenderer.removeAllListeners('compression-progress');
    };
  },
  
  // 保存压缩设置到配置文件
  saveCompressionSettings: (settings: any) => {
    // 已删除日志
    return ipcRenderer.invoke('save-compression-settings', settings);
  },
  
  // 从配置文件获取压缩设置
  getCompressionSettings: () => {
    // 已删除日志
    return ipcRenderer.invoke('get-compression-settings');
  }
};

// 统计数据API
const statsAPI = {
  // 获取统计数据
  getStats: () => {
    // 已删除日志
    try {
      return ipcRenderer.invoke('get-stats')
        .then(result => {
          // 已删除日志
          return result;
        })
        .catch(error => {
          // 已删除日志
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
      // 已删除日志
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
    // 已删除日志
    try {
      return ipcRenderer.invoke('get-recent-images', limit)
        .then(result => {
          // 已删除日志
          return result;
        })
        .catch(error => {
          // 已删除日志
          return { success: true, images: [] as any[] };
        });
    } catch (error) {
      // 已删除日志
      return Promise.resolve({ success: true, images: [] });
    }
  },
  
  // 添加处理记录
  addProcessedImage: (image: any) => {
    // 已删除日志
    try {
      return ipcRenderer.invoke('add-processed-image', image)
        .then(result => {
          // 已删除日志
          return result;
        })
        .catch(error => {
          // 已删除日志
          return { success: false, error: '添加处理记录失败' };
        });
    } catch (error) {
      // 已删除日志
      return Promise.resolve({ success: false, error: '添加处理记录失败' });
    }
  },
  
  // 清除所有统计数据
  clearAllData: () => {
    // 已删除日志
    try {
      return ipcRenderer.invoke('clear-stats-data')
        .then(result => {
          // 已删除日志
          return result;
        })
        .catch(error => {
          // 已删除日志
          return { success: false, error: '清除统计数据失败' };
        });
    } catch (error) {
      // 已删除日志
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
  'delete-temp-file',
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
  'clear-stats-data',
  'save-compression-settings',
  'get-compression-settings',
  'select-folder',
  'get-images-from-folder',
  'read-file-as-buffer'
];

// 暴露IPC通信API
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      if (validChannels.includes(channel)) {
        // 已删除日志
        ipcRenderer.send(channel, ...args);
      } else {
        // 已删除日志
      }
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        // 已删除日志
        ipcRenderer.on(channel, (_, ...args) => func(...args));
        return () => ipcRenderer.removeAllListeners(channel);
      }
      // 已删除日志
      return () => { /* 无操作 */ };
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        // 已删除日志
        ipcRenderer.once(channel, (_, ...args) => func(...args));
      } else {
        // 已删除日志
      }
    },
    invoke: (channel: string, ...args: any[]) => {
      if (validChannels.includes(channel)) {
        // 已删除日志
        return ipcRenderer.invoke(channel, ...args)
          .then(result => {
            // 已删除日志
            return result;
          })
          .catch(error => {
            // 已删除日志
            throw error;
          });
      }
      // 已删除日志
      return Promise.reject(new Error(`不允许调用 ${channel}`));
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      if (validChannels.includes(channel)) {
        // 已删除日志
        ipcRenderer.removeListener(channel, func as any);
      } else {
        // 已删除日志
      }
    },
    removeAllListeners: (channel: string) => {
      if (validChannels.includes(channel)) {
        // 已删除日志
        ipcRenderer.removeAllListeners(channel);
      } else {
        // 已删除日志
      }
    }
  }
};

// 使用contextBridge暴露API到渲染进程
if (process.contextIsolated) {
  try {
    // 已删除日志
    contextBridge.exposeInMainWorld('compression', compressionAPI);
    contextBridge.exposeInMainWorld('stats', statsAPI);
    contextBridge.exposeInMainWorld('electron', electronAPI);
    // 已删除日志
  } catch (error) {
    // 已删除日志
  }
} else {
  // 已删除日志
  // 如果上下文隔离被禁用，直接设置到window对象
  (window as any).compression = compressionAPI;
  (window as any).stats = statsAPI;
  (window as any).electron = electronAPI;
}

// 导出类型定义
export type ElectronAPI = typeof electronAPI;
export type CompressionAPI = typeof compressionAPI;
export type StatsAPI = typeof statsAPI;
