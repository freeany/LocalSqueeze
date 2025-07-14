/**
 * 图片压缩服务主入口
 * 处理不同格式图片的压缩逻辑
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { calculateCompressionRate, getFileExtension } from '../../lib/utils';

// 压缩设置类型定义
export interface CompressionSettings {
  quality: number; // 压缩质量 (1-100)
  keepDimensions: boolean; // 是否保持原始尺寸
  width?: number; // 输出宽度
  height?: number; // 输出高度
  keepFormat: boolean; // 是否保持原始格式
  outputFormat?: string; // 输出格式
  removeMetadata: boolean; // 是否移除元数据
  optimizeColors: boolean; // 是否优化颜色（主要用于PNG）
  progressive: boolean; // 是否使用渐进式（主要用于JPEG）
}

// 压缩结果类型定义
export interface CompressionResult {
  success: boolean;
  originalPath: string;
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRate: string;
  originalFormat: string;
  outputFormat: string;
  width: number;
  height: number;
  error?: string;
}

/**
 * 压缩单个图片
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 * @param settings 压缩设置
 * @returns 压缩结果
 */
export async function compressImage(
  inputPath: string,
  outputPath: string,
  settings: CompressionSettings
): Promise<CompressionResult> {
  try {
    // 记录详细的压缩参数日志
    console.log(`[单张压缩] 开始处理图片: ${inputPath}`);
    console.log(`[单张压缩] 输出路径: ${outputPath}`);
    console.log(`[单张压缩] 压缩参数:`, JSON.stringify(settings, null, 2));
    
    // 获取原始文件信息
    const originalFileStats = await fs.stat(inputPath);
    const originalSize = originalFileStats.size;
    const originalFormat = getFileExtension(inputPath);
    
    console.log(`[单张压缩] 原始格式: ${originalFormat}, 原始大小: ${originalSize} 字节`);
    
    // 创建Sharp实例
    let image = sharp(inputPath);
    
    // 获取图像元数据
    const metadata = await image.metadata();
    console.log(`[单张压缩] 原始元数据:`, {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      hasAlpha: metadata.hasAlpha
    });
    
    // 设置输出格式
    let outputFormat = originalFormat;
    if (!settings.keepFormat && settings.outputFormat) {
      outputFormat = settings.outputFormat.toLowerCase();
      image = image.toFormat(outputFormat as keyof sharp.FormatEnum);
      console.log(`[单张压缩] 转换格式为: ${outputFormat}`);
    }
    
    // 调整尺寸
    if (!settings.keepDimensions && settings.width && settings.height) {
      image = image.resize({
        width: settings.width,
        height: settings.height,
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`[单张压缩] 调整尺寸为: ${settings.width}x${settings.height}`);
    }
    
    // 根据不同格式应用不同的压缩设置
    switch (outputFormat) {
      case 'jpeg':
      case 'jpg':
        console.log(`[单张压缩] 应用JPEG特定参数: quality=${settings.quality}, progressive=${settings.progressive}, mozjpeg=true`);
        image = image.jpeg({
          quality: settings.quality,
          progressive: settings.progressive,
          mozjpeg: true // 使用mozjpeg优化
        });
        break;
      
      case 'png':
        console.log(`[单张压缩] 应用PNG特定参数: quality=${settings.quality}, progressive=${settings.progressive}, compressionLevel=9, adaptiveFiltering=${settings.optimizeColors}, palette=${settings.optimizeColors}`);
        image = image.png({
          quality: settings.quality,
          progressive: settings.progressive,
          compressionLevel: 9, // 最高压缩级别
          adaptiveFiltering: settings.optimizeColors, // 自适应过滤
          palette: settings.optimizeColors // 使用调色板优化颜色
        });
        break;
      
      case 'webp': {
        const lossless = settings.quality > 90;
        console.log(`[单张压缩] 应用WebP特定参数: quality=${settings.quality}, lossless=${lossless}`);
        image = image.webp({
          quality: settings.quality,
          lossless: lossless // 质量超过90使用无损模式
        });
        break;
      }
      
      case 'avif':
        console.log(`[单张压缩] 应用AVIF特定参数: quality=${settings.quality}`);
        image = image.avif({
          quality: settings.quality
        });
        break;
      
      case 'gif':
        console.log(`[单张压缩] 应用GIF特定参数: 使用默认设置`);
        // GIF格式使用默认设置
        image = image.gif();
        break;
      
      default:
        console.log(`[单张压缩] 未知格式: ${outputFormat}, 使用默认设置`);
        // 默认使用原始格式
        break;
    }
    
    // 是否移除元数据
    if (settings.removeMetadata) {
      console.log(`[单张压缩] 移除元数据，保留方向和DPI信息`);
      image = image.withMetadata({
        orientation: metadata.orientation, // 保留方向信息
        density: metadata.density // 保留DPI信息
      });
    } else {
      console.log(`[单张压缩] 保留所有元数据`);
      image = image.withMetadata();
    }
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // 处理图像并保存到输出路径
    console.log(`[单张压缩] 开始写入文件: ${outputPath}`);
    await image.toFile(outputPath);
    
    // 获取压缩后的文件信息
    const compressedFileStats = await fs.stat(outputPath);
    const compressedSize = compressedFileStats.size;
    
    // 获取最终图像的尺寸信息
    const outputMetadata = await sharp(outputPath).metadata();
    
    const compressionRate = calculateCompressionRate(originalSize, compressedSize);
    console.log(`[单张压缩] 压缩完成: 原始大小=${originalSize}字节, 压缩后大小=${compressedSize}字节, 压缩率=${compressionRate}`);
    
    return {
      success: true,
      originalPath: inputPath,
      outputPath: outputPath,
      originalSize,
      compressedSize,
      compressionRate,
      originalFormat,
      outputFormat,
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0
    };
  } catch (error) {
    console.error('[单张压缩] 图片压缩失败:', error);
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
 * 批量压缩图片
 * @param inputPaths 输入文件路径数组
 * @param outputDir 输出目录
 * @param settings 压缩设置
 * @param progressCallback 进度回调函数
 * @returns 压缩结果数组
 */
export async function batchCompressImages(
  inputPaths: string[],
  outputDir: string,
  settings: CompressionSettings,
  progressCallback?: (current: number, total: number, result?: CompressionResult) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = inputPaths.length;
  
  // 确保输出目录存在
  await fs.mkdir(outputDir, { recursive: true });
  
  for (let i = 0; i < total; i++) {
    const inputPath = inputPaths[i];
    const fileName = path.basename(inputPath);
    const fileExt = path.extname(fileName);
    const fileNameWithoutExt = path.basename(fileName, fileExt);
    
    // 确定输出格式
    let outputExt = fileExt;
    if (!settings.keepFormat && settings.outputFormat) {
      outputExt = `.${settings.outputFormat.toLowerCase()}`;
    }
    
    // 构建输出文件路径
    const outputPath = path.join(outputDir, `${fileNameWithoutExt}_compressed${outputExt}`);
    
    // 压缩单个图片 - 使用设置的深拷贝，确保每个图片使用独立的设置副本
    const result = await compressImage(inputPath, outputPath, { ...settings });
    results.push(result);
    
    // 调用进度回调
    if (progressCallback) {
      progressCallback(i + 1, total, result);
    }
  }
  
  return results;
}

/**
 * 获取预设压缩设置
 * @param presetName 预设名称
 * @returns 压缩设置
 */
export function getPresetSettings(presetName: string): CompressionSettings {
  switch (presetName) {
    case '低压缩':
      return {
        quality: 80,
        keepDimensions: true,
        keepFormat: true,
        removeMetadata: true,
        optimizeColors: false,
        progressive: false
      };
    
    case '中等压缩':
      return {
        quality: 60,
        keepDimensions: true,
        keepFormat: true,
        removeMetadata: true,
        optimizeColors: true,
        progressive: true
      };
    
    case '高压缩':
      return {
        quality: 40,
        keepDimensions: true,
        keepFormat: true,
        removeMetadata: true,
        optimizeColors: true,
        progressive: true
      };
    
    case 'Web优化':
      return {
        quality: 70,
        keepDimensions: false,
        width: 1920,
        height: 1080,
        keepFormat: false,
        outputFormat: 'webp',
        removeMetadata: true,
        optimizeColors: true,
        progressive: true
      };
    
    default:
      // 默认为中等压缩
      return {
        quality: 70,
        keepDimensions: true,
        keepFormat: true,
        removeMetadata: true,
        optimizeColors: false,
        progressive: false
      };
  }
} 