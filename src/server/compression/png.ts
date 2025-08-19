/**
 * PNG图片压缩处理模块
 * 使用sharp和pngquant优化PNG图像
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { CompressionSettings, CompressionResult } from './index';
import { getFileExtension } from '../../lib/utils';

/**
 * PNG专用压缩设置
 */
export interface PngCompressionSettings extends CompressionSettings {
  compressionLevel: number; // 压缩级别 (0-9)
  adaptiveFiltering: boolean; // 是否使用自适应过滤
  palette: boolean; // 是否使用调色板
  dither: number; // 抖动级别 (0-1)
  colors: number; // 颜色数量 (2-256)
}

/**
 * 压缩PNG图片
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 * @param settings 压缩设置
 * @returns 压缩结果
 */
export async function compressPng(
  inputPath: string,
  outputPath: string,
  settings: PngCompressionSettings
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
    
    // 应用PNG特定的优化设置
    image = image.png({
      quality: settings.quality,
      compressionLevel: settings.compressionLevel,
      adaptiveFiltering: settings.adaptiveFiltering,
      palette: settings.palette,
      colors: settings.colors,
      dither: settings.dither
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
      outputFormat: 'png',
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0
    };
  } catch (error) {

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
 * 获取PNG优化的默认设置
 * @returns PNG压缩设置
 */
export function getDefaultPngSettings(): PngCompressionSettings {
  return {
    quality: 80,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: true,
    progressive: false,
    compressionLevel: 9,
    adaptiveFiltering: true,
    palette: true,
    dither: 1.0,
    colors: 256
  };
}

/**
 * 获取PNG高质量设置
 * @returns PNG压缩设置
 */
export function getHighQualityPngSettings(): PngCompressionSettings {
  return {
    quality: 90,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: true,
    progressive: false,
    compressionLevel: 7,
    adaptiveFiltering: true,
    palette: false,
    dither: 0,
    colors: 256
  };
}

/**
 * 获取PNG高压缩设置
 * @returns PNG压缩设置
 */
export function getHighCompressionPngSettings(): PngCompressionSettings {
  return {
    quality: 60,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: true,
    progressive: false,
    compressionLevel: 9,
    adaptiveFiltering: true,
    palette: true,
    dither: 1.0,
    colors: 128
  };
}