/**
 * WebP图片压缩处理模块
 * 使用sharp优化WebP图像
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { CompressionSettings, CompressionResult } from './index';
import { getFileExtension } from '../../lib/utils';

/**
 * WebP专用压缩设置
 */
export interface WebpCompressionSettings extends CompressionSettings {
  lossless: boolean; // 是否使用无损压缩
  nearLossless: boolean; // 是否使用接近无损的压缩
  smartSubsample: boolean; // 是否使用智能二次采样
  effort: number; // 压缩努力程度 (0-6)
}

/**
 * 压缩WebP图片
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 * @param settings 压缩设置
 * @returns 压缩结果
 */
export async function compressWebp(
  inputPath: string,
  outputPath: string,
  settings: WebpCompressionSettings
): Promise<CompressionResult> {
  try {
    // 获取原始文件信息
    const originalFileStats = await fs.stat(inputPath);
    const originalSize = originalFileStats.size;
    const originalFormat = getFileExtension(inputPath);
    
    // 创建Sharp实例
    let image = sharp(inputPath);
    
    // 获取图像元数据
    const metadata = await image.metadata();
    
    // 调整尺寸
    if (!settings.keepDimensions && settings.width && settings.height) {
      image = image.resize({
        width: settings.width,
        height: settings.height,
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 应用WebP特定的优化设置
    image = image.webp({
      quality: settings.quality,
      lossless: settings.lossless,
      nearLossless: settings.nearLossless,
      smartSubsample: settings.smartSubsample,
      effort: settings.effort
    });
    
    // 是否移除元数据
    if (settings.removeMetadata) {
      image = image.withMetadata({
        orientation: metadata.orientation, // 保留方向信息
        density: metadata.density // 保留DPI信息
      });
    } else {
      image = image.withMetadata();
    }
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // 处理图像并保存到输出路径
    await image.toFile(outputPath);
    
    // 获取压缩后的文件信息
    const compressedFileStats = await fs.stat(outputPath);
    const compressedSize = compressedFileStats.size;
    
    // 获取最终图像的尺寸信息
    const outputMetadata = await sharp(outputPath).metadata();
    
    // 计算压缩率
    const savedBytes = originalSize - compressedSize;
    const compressionRate = (savedBytes / originalSize * 100).toFixed(1) + '%';
    
    return {
      success: true,
      originalPath: inputPath,
      outputPath: outputPath,
      originalSize,
      compressedSize,
      compressionRate,
      originalFormat,
      outputFormat: 'webp',
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0
    };
  } catch (error) {
    console.error('WebP压缩失败:', error);
    return {
      success: false,
      originalPath: inputPath,
      outputPath: '',
      originalSize: 0,
      compressedSize: 0,
      compressionRate: '0%',
      originalFormat: '',
      outputFormat: '',
      width: 0,
      height: 0,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 将其他格式转换为WebP
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 * @param settings 压缩设置
 * @returns 压缩结果
 */
export async function convertToWebp(
  inputPath: string,
  outputPath: string,
  settings: WebpCompressionSettings
): Promise<CompressionResult> {
  // 确保输出路径以.webp结尾
  if (!outputPath.toLowerCase().endsWith('.webp')) {
    outputPath = outputPath + '.webp';
  }
  
  // 调用标准的WebP压缩函数
  return compressWebp(inputPath, outputPath, settings);
}

/**
 * 获取WebP优化的默认设置
 * @returns WebP压缩设置
 */
export function getDefaultWebpSettings(): WebpCompressionSettings {
  return {
    quality: 75,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: true,
    progressive: false,
    lossless: false,
    nearLossless: false,
    smartSubsample: true,
    effort: 4
  };
}

/**
 * 获取WebP高质量设置
 * @returns WebP压缩设置
 */
export function getHighQualityWebpSettings(): WebpCompressionSettings {
  return {
    quality: 90,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: true,
    progressive: false,
    lossless: true,
    nearLossless: true,
    smartSubsample: true,
    effort: 6
  };
}

/**
 * 获取WebP高压缩设置
 * @returns WebP压缩设置
 */
export function getHighCompressionWebpSettings(): WebpCompressionSettings {
  return {
    quality: 60,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: true,
    progressive: false,
    lossless: false,
    nearLossless: false,
    smartSubsample: true,
    effort: 2
  };
} 