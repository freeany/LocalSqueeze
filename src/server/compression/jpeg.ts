/**
 * JPEG图片压缩处理模块
 * 使用sharp和mozjpeg优化JPEG图像
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { CompressionSettings, CompressionResult } from './index';
import { getFileExtension } from '../../lib/utils';

/**
 * JPEG专用压缩设置
 */
export interface JpegCompressionSettings extends CompressionSettings {
  progressive: boolean; // 是否使用渐进式JPEG
  trellisQuantisation: boolean; // 是否使用Trellis量化
  overshootDeringing: boolean; // 是否使用过冲去振铃
  optimizeScans: boolean; // 是否优化扫描
}

/**
 * 压缩JPEG图片
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 * @param settings 压缩设置
 * @returns 压缩结果
 */
export async function compressJpeg(
  inputPath: string,
  outputPath: string,
  settings: JpegCompressionSettings
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
    
    // 应用JPEG特定的优化设置
    image = image.jpeg({
      quality: settings.quality,
      progressive: settings.progressive,
      trellisQuantisation: settings.trellisQuantisation,
      overshootDeringing: settings.overshootDeringing,
      optimizeScans: settings.optimizeScans,
      mozjpeg: true // 使用mozjpeg优化
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
      outputFormat: 'jpeg',
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0
    };
  } catch (error) {
    console.error('JPEG压缩失败:', error);
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
 * 获取JPEG优化的默认设置
 * @returns JPEG压缩设置
 */
export function getDefaultJpegSettings(): JpegCompressionSettings {
  return {
    quality: 75,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: false,
    progressive: true,
    trellisQuantisation: true,
    overshootDeringing: true,
    optimizeScans: true
  };
}

/**
 * 获取JPEG高质量设置
 * @returns JPEG压缩设置
 */
export function getHighQualityJpegSettings(): JpegCompressionSettings {
  return {
    quality: 85,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: false,
    progressive: true,
    trellisQuantisation: true,
    overshootDeringing: true,
    optimizeScans: false
  };
}

/**
 * 获取JPEG高压缩设置
 * @returns JPEG压缩设置
 */
export function getHighCompressionJpegSettings(): JpegCompressionSettings {
  return {
    quality: 60,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: false,
    progressive: true,
    trellisQuantisation: true,
    overshootDeringing: true,
    optimizeScans: true
  };
} 