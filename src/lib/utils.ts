import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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