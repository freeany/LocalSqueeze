import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// eslint-disable-next-line import/no-unresolved
import { CompressionSettings } from "../types/global";
import path from 'path';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 计算压缩率
 * @param originalSize 原始大小（字节）
 * @param compressedSize 压缩后大小（字节）
 * @returns 压缩率百分比字符串
 */
export function calculateCompressionRate(originalSize: number, compressedSize: number): string {
  if (originalSize === 0) return '0%';
  
  const rate = ((originalSize - compressedSize) / originalSize) * 100;
  return `${rate.toFixed(1)}%`;
}

/**
 * 获取文件扩展名
 * @param fileName 文件名
 * @returns 扩展名（小写）
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * 根据命名模板生成输出文件名
 * @param originalPath 原始文件路径
 * @param fileNaming 文件命名模板
 * @param fileExtension 文件扩展名模板
 * @param outputFormat 输出格式
 * @returns 生成的文件名
 */
export function generateOutputFileName(
  originalPath: string, 
  fileNaming = '{filename}_compressed', 
  fileExtension = '.{ext}',
  outputFormat?: string
): string {
  console.log('生成文件名，参数：', {
    originalPath,
    fileNaming,
    fileExtension,
    outputFormat
  });
  
  const fileName = path.basename(originalPath);
  const fileExt = path.extname(originalPath);
  const fileNameWithoutExt = path.basename(fileName, fileExt);
  const originalExt = fileExt.substring(1).toLowerCase(); // 去掉点号
  
  console.log('文件名分析：', {
    fileName,
    fileExt,
    fileNameWithoutExt,
    originalExt
  });
  
  // 替换文件名模板中的变量
  const outputFileName = fileNaming.replace('{filename}', fileNameWithoutExt);
  
  // 替换扩展名模板中的变量
  let outputExtension = fileExtension.replace('{ext}', outputFormat || originalExt);
  if (!outputExtension.startsWith('.')) {
    outputExtension = '.' + outputExtension;
  }
  
  const result = outputFileName + outputExtension;
  console.log('生成的文件名：', result);
  
  return result;
}

/**
 * 保存压缩设置到本地存储
 * @param settings 压缩设置
 */
export function saveCompressionSettings(settings: any): void {
  try {
    const settingsString = JSON.stringify(settings);
    console.log('保存设置到localStorage:', settingsString);
    localStorage.setItem('compressionSettings', settingsString);
  } catch (error) {
    console.error('保存压缩设置失败:', error);
  }
}

/**
 * 从本地存储获取压缩设置
 * @returns 压缩设置对象，如果没有则返回默认设置
 */
export function getCompressionSettings(): any {
  try {
    const savedSettings = localStorage.getItem('compressionSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      console.log('从本地存储加载的设置:', settings);
      console.log('文件命名设置:', settings.fileNaming, settings.fileExtension);
      return settings;
    }
  } catch (error) {
    console.error('获取压缩设置失败:', error);
  }
  
  // 默认设置
  const defaultSettings = {
    preset: '低压缩',
    quality: 70,
    keepDimensions: true,
    width: 1920,
    height: 1080,
    keepRatio: true,
    removeMetadata: true,
    optimizeColors: false,
    progressive: false,
    keepFormat: true,
    outputFormat: 'PNG',
    fileNaming: '{filename}_compressed',
    fileExtension: '.{ext}'
  };
  
  console.log('使用默认设置:', defaultSettings);
  return defaultSettings;
}

/**
 * 构建压缩设置对象
 * @param settings 设置对象
 * @returns 用于压缩API的设置对象
 */
export function buildCompressionSettings(settings: any): CompressionSettings {
  const compressionSettings: CompressionSettings = {
    quality: settings.quality || 70,
    keepDimensions: settings.keepDimensions !== undefined ? settings.keepDimensions : true,
    keepFormat: settings.keepFormat !== undefined ? settings.keepFormat : true,
    removeMetadata: settings.removeMetadata !== undefined ? settings.removeMetadata : true,
    optimizeColors: settings.optimizeColors || false,
    progressive: settings.progressive || false
  };
  
  // 添加可选参数
  if (!compressionSettings.keepDimensions) {
    (compressionSettings as any).width = settings.width || 1920;
    (compressionSettings as any).height = settings.height || 1080;
  }
  
  if (!compressionSettings.keepFormat) {
    (compressionSettings as any).outputFormat = settings.outputFormat || 'PNG';
  }
  
  // 添加文件命名设置
  (compressionSettings as any).fileNaming = settings.fileNaming || '{filename}_compressed';
  (compressionSettings as any).fileExtension = settings.fileExtension || '.{ext}';
  
  return compressionSettings;
} 