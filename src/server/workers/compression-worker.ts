/**
 * 图片压缩工作线程
 * 用于处理大量图片时的并行处理
 */

import { parentPort, workerData } from 'worker_threads';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { getFileExtension } from '../../lib/utils';

// 压缩设置类型定义
interface CompressionSettings {
  quality: number;
  keepDimensions: boolean;
  width?: number;
  height?: number;
  keepFormat: boolean;
  outputFormat?: string;
  removeMetadata: boolean;
  optimizeColors: boolean;
  progressive: boolean;
}

// 压缩结果类型定义
interface CompressionResult {
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

// 工作线程数据类型
interface WorkerData {
  inputPath: string;
  outputPath: string;
  settings: CompressionSettings;
}

/**
 * 压缩图片
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 * @param settings 压缩设置
 * @returns 压缩结果
 */
async function compressImage(
  inputPath: string,
  outputPath: string,
  settings: CompressionSettings
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
    
    // 设置输出格式
    let outputFormat = originalFormat;
    if (!settings.keepFormat && settings.outputFormat) {
      outputFormat = settings.outputFormat.toLowerCase();
      image = image.toFormat(outputFormat as keyof sharp.FormatEnum);
    }
    
    // 调整尺寸
    if (!settings.keepDimensions && settings.width && settings.height) {
      image = image.resize({
        width: settings.width,
        height: settings.height,
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 根据不同格式应用不同的压缩设置
    switch (outputFormat) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({
          quality: settings.quality,
          progressive: settings.progressive,
          mozjpeg: true // 使用mozjpeg优化
        });
        break;
      
      case 'png':
        image = image.png({
          quality: settings.quality,
          progressive: settings.progressive,
          compressionLevel: 9, // 最高压缩级别
          adaptiveFiltering: settings.optimizeColors, // 自适应过滤
          palette: settings.optimizeColors // 使用调色板优化颜色
        });
        break;
      
      case 'webp':
        image = image.webp({
          quality: settings.quality,
          lossless: settings.quality > 90 // 质量超过90使用无损模式
        });
        break;
      
      case 'avif':
        image = image.avif({
          quality: settings.quality
        });
        break;
      
      case 'gif':
        // GIF格式使用默认设置
        image = image.gif();
        break;
      
      default:
        // 默认使用原始格式
        break;
    }
    
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
      outputFormat,
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0
    };
  } catch (error) {
    console.error('图片压缩失败:', error);
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

// 主函数：处理工作线程数据
async function main() {
  if (!parentPort) {
    throw new Error('该脚本必须作为工作线程运行');
  }
  
  try {
    const { inputPath, outputPath, settings } = workerData as WorkerData;
    
    // 压缩图片
    const result = await compressImage(inputPath, outputPath, settings);
    
    // 将结果发送回主线程
    parentPort.postMessage({
      status: 'completed',
      result
    });
  } catch (error) {
    // 发送错误信息回主线程
    parentPort.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}

// 执行主函数
main().catch(error => {
  console.error('工作线程错误:', error);
  if (parentPort) {
    parentPort.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}); 