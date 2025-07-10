/**
 * 全局类型定义
 */

// 压缩结果类型
export interface CompressionResult {
  originalPath: string;
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRate: string;
  width: number;
  height: number;
  outputFormat: string;
}

// 压缩设置类型
export interface CompressionSettings {
  quality: number;
  keepDimensions: boolean;
  keepFormat: boolean;
  removeMetadata: boolean;
  optimizeColors: boolean;
  progressive: boolean;
}

// 处理后的图片记录
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

// 统计数据
export interface CompressionStats {
  totalProcessedImages: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavedSpace: number;
  averageCompressionRate: string;
  lastUpdated: number;
}

// 每日统计
export interface DailyStats {
  processedImages: number;
  savedSpace: number;
}

// 扩展Window接口
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, func: (...args: any[]) => void) => void;
        once: (channel: string, func: (...args: any[]) => void) => void;
        removeListener: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
        send: (channel: string, ...args: any[]) => void;
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
      clearTempFiles: () => Promise<{ success: boolean; error?: string }>;
      onCompressionProgress: (callback: (data: { current: number; total: number }) => void) => () => void;
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