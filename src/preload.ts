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

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('compression', compressionAPI);

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
  'export-all-files'
];

// 暴露IPC通信API
contextBridge.exposeInMainWorld('electron', {
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
        return ipcRenderer.invoke(channel, ...args);
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
});
