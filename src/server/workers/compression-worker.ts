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
  compressionLevel?: number;
  adaptiveFiltering?: boolean;
  palette?: boolean;
  lossless?: boolean;
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
  fileType?: string; // 新增
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
    // 记录详细的压缩参数日志
    console.log(`[工作线程] 开始处理图片: ${inputPath}`);
    console.log(`[工作线程] 输出路径: ${outputPath}`);
    console.log(`[工作线程] 压缩参数:`, JSON.stringify(settings, null, 2));
    
    // 获取原始文件信息
    const originalFileStats = await fs.stat(inputPath);
    const originalSize = originalFileStats.size;
    const originalFormat = getFileExtension(inputPath);
    
    console.log(`[工作线程] 原始格式: ${originalFormat}, 原始大小: ${originalSize} 字节`);
    
    // 创建Sharp实例
    let image = sharp(inputPath);
    
    // 获取图像元数据
    const metadata = await image.metadata();
    
    // 设置输出格式
    let outputFormat = originalFormat;
    if (!settings.keepFormat && settings.outputFormat) {
      outputFormat = settings.outputFormat.toLowerCase();
      image = image.toFormat(outputFormat as keyof sharp.FormatEnum);
      console.log(`[工作线程] 转换格式为: ${outputFormat}`);
    }
    
    // 调整尺寸
    if (!settings.keepDimensions && settings.width && settings.height) {
      image = image.resize({
        width: settings.width,
        height: settings.height,
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`[工作线程] 调整尺寸为: ${settings.width}x${settings.height}`);
    }
    
    // 根据不同格式应用不同的压缩设置
    switch (outputFormat) {
      case 'jpeg':
      case 'jpg': {
        console.log(`[工作线程] 应用JPEG特定参数: quality=${settings.quality}, progressive=${settings.progressive}, mozjpeg=true`);
        image = image.jpeg({
          quality: settings.quality,
          progressive: settings.progressive,
          mozjpeg: true // 使用mozjpeg优化
        });
        break;
      }
      
      case 'png': {
        console.log(`[工作线程] 应用PNG特定参数: quality=${settings.quality}, progressive=${settings.progressive}, compressionLevel=${settings.compressionLevel || 9}, adaptiveFiltering=${settings.adaptiveFiltering}, palette=${settings.palette}`);
        image = image.png({
          quality: settings.quality,
          progressive: settings.progressive,
          compressionLevel: settings.compressionLevel || 9, // 最高压缩级别
          adaptiveFiltering: settings.adaptiveFiltering, // 自适应过滤
          palette: settings.palette // 使用调色板优化颜色
        });
        break;
      }
      
      case 'webp': {
        const lossless = settings.lossless !== undefined ? settings.lossless : settings.quality > 90;
        console.log(`[工作线程] 应用WebP特定参数: quality=${settings.quality}, lossless=${lossless}`);
        image = image.webp({
          quality: settings.quality,
          lossless: lossless
        });
        break;
      }
      
      case 'avif': {
        console.log(`[工作线程] 应用AVIF特定参数: quality=${settings.quality}`);
        image = image.avif({
          quality: settings.quality
        });
        break;
      }
      
      case 'gif': {
        console.log(`[工作线程] 应用GIF特定参数: 使用默认设置`);
        // GIF格式使用默认设置
        image = image.gif();
        break;
      }
      
      default: {
        console.log(`[工作线程] 未知格式: ${outputFormat}, 使用默认设置`);
        // 默认使用原始格式
        break;
      }
    }
    
    // 是否移除元数据
    if (settings.removeMetadata) {
      console.log(`[工作线程] 移除元数据，保留方向和DPI信息`);
      image = image.withMetadata({
        orientation: metadata.orientation, // 保留方向信息
        density: metadata.density // 保留DPI信息
      });
    } else {
      console.log(`[工作线程] 保留所有元数据`);
      image = image.withMetadata();
    }
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    
    // 处理图像并保存到输出路径
    console.log(`[工作线程] 开始写入文件: ${outputPath}`);
    await image.toFile(outputPath);
    
    // 获取压缩后的文件信息
    const compressedFileStats = await fs.stat(outputPath);
    const compressedSize = compressedFileStats.size;
    
    // 获取最终图像的尺寸信息
    const outputMetadata = await sharp(outputPath).metadata();
    
    // 计算压缩率
    const savedBytes = originalSize - compressedSize;
    const compressionRate = (savedBytes / originalSize * 100).toFixed(1) + '%';
    
    console.log(`[工作线程] 压缩完成: 原始大小=${originalSize}字节, 压缩后大小=${compressedSize}字节, 压缩率=${compressionRate}`);
    
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
    console.error('[工作线程] 图片压缩失败:', error);
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
    const { inputPath, outputPath, settings, fileType } = workerData as WorkerData & { fileType?: string };
    
    // 压缩图片 - 使用设置的深拷贝，避免共享引用问题
    // 根据文件类型选择不同的处理方法，与主线程保持一致
    const settingsCopy = { ...settings };
    
    // 根据文件类型应用特定的优化
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
        // 针对JPEG的特定优化
        settingsCopy.progressive = settingsCopy.progressive !== undefined ? settingsCopy.progressive : true;
        // 使用mozjpeg优化
        break;
      
      case 'png':
        // 针对PNG的特定优化
        settingsCopy.compressionLevel = 9; // 最高压缩级别
        if (settingsCopy.optimizeColors) {
          settingsCopy.adaptiveFiltering = true;
          settingsCopy.palette = true;
        }
        break;
      
      case 'webp':
        // 针对WebP的特定优化
        settingsCopy.lossless = settingsCopy.quality > 90;
        break;
    }
    
    const result = await compressImage(inputPath, outputPath, settingsCopy);
    
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