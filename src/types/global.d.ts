/**
 * 全局类型定义
 */

// 全局类型声明

// 压缩设置接口
export interface CompressionSettings {
  quality: number;
  keepDimensions: boolean;
  keepFormat: boolean;
  removeMetadata: boolean;
  optimizeColors: boolean;
  progressive: boolean;
  fileNaming?: string;
  fileExtension?: string;
  width?: number;
  height?: number;
  outputFormat?: string;
}

// 压缩结果接口
export interface CompressionResult {
  success: boolean;
  originalPath: string;
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRate: string;
  width: number;
  height: number;
  outputFormat: string;
  error?: string;
}

// 处理后的图片信息
export interface ProcessedImage {
  id: string;
  name: string;
  originalPath: string;
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRate: string;
  width: number;
  height: number;
  format: string;
  processedAt: number;
}

// 压缩统计数据
export interface CompressionStats {
  totalProcessedImages: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavedSpace: number;
  averageCompressionRate: string;
  lastUpdated: number;
}

// 每日统计数据
export interface DailyStats {
  date: string;
  processedImages: number;
  savedSpace: number;
}

// 声明全局window接口，添加electron和compression属性
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, func: (...args: any[]) => void) => void;
        once: (channel: string, func: (...args: any[]) => void) => void;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
    compression: {
      compressImage: (imagePath: string, settings: CompressionSettings, outputPath?: string) => Promise<CompressionResult>;
      batchCompressImages: (imagePaths: string[], settings: CompressionSettings, outputDir?: string) => Promise<{
        success: boolean;
        results: CompressionResult[];
        error?: string;
      }>;
      convertToWebp: (imagePath: string, settings: CompressionSettings, outputPath?: string) => Promise<CompressionResult>;
      getCompressionPreset: (presetName: string) => Promise<CompressionSettings>;
      selectOutputDirectory: () => Promise<string | undefined>;
      clearTempFiles: () => Promise<any>;
      onCompressionProgress: (callback: (data: {
        current: number;
        total: number;
      }) => void) => () => void;
    };
    stats: {
      getStats: () => Promise<{
        success: boolean;
        stats: CompressionStats;
        todayStats: DailyStats;
        error?: string;
      }>;
      getRecentImages: (limit?: number) => Promise<{
        success: boolean;
        images: ProcessedImage[];
        error?: string;
      }>;
      addProcessedImage: (image: ProcessedImage) => Promise<{
        success: boolean;
        error?: string;
      }>;
      clearAllData: () => Promise<{
        success: boolean;
        error?: string;
      }>;
    };
  }
}

// 添加Electron Forge Vite插件的全局变量声明
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string | undefined;

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
} 