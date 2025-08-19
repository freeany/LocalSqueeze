/**
 * 图片压缩IPC处理程序
 * 处理前端发来的图片压缩请求
 */

import { ipcMain, IpcMainEvent, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { 
  compressImage, 
  batchCompressImages,
  CompressionSettings,
  CompressionResult,
  getPresetSettings
} from '../compression';
import { 
  compressJpeg, 
  getDefaultJpegSettings 
} from '../compression/jpeg';
import { 
  compressPng, 
  getDefaultPngSettings 
} from '../compression/png';
import { 
  compressWebp,
  convertToWebp,
  getDefaultWebpSettings 
} from '../compression/webp';
import { formatFileSize, getFileExtension, generateOutputFileName } from '../../lib/utils';

// 临时目录路径
const TEMP_DIR = path.join(os.tmpdir(), 'imgs-compress');

// 确保临时目录存在
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    // 已删除日志
  }
}

// 初始化
ensureTempDir();

// 添加一个标志变量
let handlersInitialized = false;

/**
 * 初始化IPC处理程序
 */
export function initCompressionHandlers() {
  // 如果已经初始化过，直接返回
  if (handlersInitialized) {
    return;
  }
  
  // 设置标志为已初始化
  handlersInitialized = true;
  
  // 压缩单个图片
  ipcMain.handle('compress-image', async (event: IpcMainEvent, args: {
    imagePath: string;
    settings: CompressionSettings;
    outputPath?: string;
  }) => {
    try {
      const { imagePath, settings } = args;
      let outputPath = args.outputPath;
      
      // 已删除日志
      // 已删除日志
      // 已删除日志
      
      // 如果没有指定输出路径，则使用临时目录
      if (!outputPath) {
        // 使用命名模板生成文件名
        const fileName = generateOutputFileName(
          imagePath,
          (settings as any).fileNaming,
          (settings as any).outputFormat,
          settings.keepFormat
        );
        
        outputPath = path.join(TEMP_DIR, fileName);
        // 已删除日志
      }
      
      // 根据文件类型选择不同的压缩方法
      const fileExtension = getFileExtension(imagePath);
      let result: CompressionResult;
      
      // 已删除日志
      
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':

          result = await compressJpeg(imagePath, outputPath, {
            ...getDefaultJpegSettings(),
            ...settings
          });
          break;
          
        case 'png':
          // 已删除日志
          result = await compressPng(imagePath, outputPath, {
            ...getDefaultPngSettings(),
            ...settings
          });
          break;
          
        case 'webp':
          // 已删除日志
          result = await compressWebp(imagePath, outputPath, {
            ...getDefaultWebpSettings(),
            ...settings
          });
          break;
          
        default:
          // 已删除日志
          // 默认使用通用压缩方法
          result = await compressImage(imagePath, outputPath, settings);
      }
      
      // 已删除日志
      
      return result;
    } catch (error) {
      // 已删除日志
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  });
  
  // 批量压缩图片
  ipcMain.handle('batch-compress-images', async (event: IpcMainEvent, args: {
    imagePaths: string[];
    settings: CompressionSettings;
    outputDir?: string;
  }) => {
    try {
      const { imagePaths, settings } = args;
      let outputDir = args.outputDir;
      
      // 已删除日志
      // 已删除日志
      
      // 如果没有指定输出目录，则使用临时目录
      if (!outputDir) {
        outputDir = path.join(TEMP_DIR, 'batch_' + Date.now());
        // 已删除日志
      }
      
      // 创建输出目录
      await fs.mkdir(outputDir, { recursive: true });
      
      // 批量压缩图片 - 使用单张图片处理的逻辑，确保一致性
      const results: CompressionResult[] = [];
      const current = 0;
      const total = imagePaths.length;
      
      for (const imagePath of imagePaths) {
        // 使用命名模板生成文件名
        const fileName = generateOutputFileName(
          imagePath,
          (settings as any).fileNaming,
          (settings as any).outputFormat,
          settings.keepFormat
        );
        
        const outputPath = path.join(outputDir, fileName);
        
        // 已删除日志
        
        // 使用与单张处理相同的逻辑，根据文件类型选择不同的压缩方法
        const fileExtension = getFileExtension(imagePath);
        let result: CompressionResult;
        
        // 已删除日志
        
        switch (fileExtension) {
          case 'jpg':
          case 'jpeg':
            // 已删除日志
            result = await compressJpeg(imagePath, outputPath, {
              ...getDefaultJpegSettings(),
              ...settings
            });
            break;
            
          case 'png':
            // 已删除日志
            result = await compressPng(imagePath, outputPath, {
              ...getDefaultPngSettings(),
              ...settings
            });
            break;
            
          case 'webp':
            // 已删除日志
            result = await compressWebp(imagePath, outputPath, {
              ...getDefaultWebpSettings(),
              ...settings
            });
            break;
            
          default:
            // 已删除日志
            // 默认使用通用压缩方法
            result = await compressImage(imagePath, outputPath, { ...settings });
        }
        
        results.push(result);
        
        // 已删除日志
        
        // 发送进度更新
        event.sender.send('compression-progress', {
          current,
          total,
          result
        });
      }
      
      // 已删除日志
      
      return {
        success: true,
        results,
        outputDir
      };
    } catch (error) {
      // 已删除日志
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  });
  
  // 转换为WebP格式
  ipcMain.handle('convert-to-webp', async (event: IpcMainEvent, args: {
    imagePath: string;
    settings: CompressionSettings;
    outputPath?: string;
  }) => {
    try {
      const { imagePath, settings } = args;
      let outputPath = args.outputPath;
      
      // 如果没有指定输出路径，则使用临时目录
      if (!outputPath) {
        const fileName = path.basename(imagePath);
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        outputPath = path.join(TEMP_DIR, `${fileNameWithoutExt}.webp`);
      }
      
      // 转换为WebP
      const result = await convertToWebp(imagePath, outputPath, {
        ...getDefaultWebpSettings(),
        ...settings
      });
      
      return result;
    } catch (error) {
      // 已删除日志
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  });
  
  // 获取压缩预设
  ipcMain.handle('get-compression-preset', (event: IpcMainEvent, presetName: string) => {
    return getPresetSettings(presetName);
  });
  
  // 选择输出目录
  ipcMain.handle('select-output-directory', async (event: IpcMainEvent) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    
    return result.filePaths[0];
  });
  
  // 清理临时文件
  ipcMain.handle('clear-temp-files', async () => {
    try {
      // 读取临时目录中的所有文件
      const files = await fs.readdir(TEMP_DIR);
      
      // 删除所有文件
      for (const file of files) {
        const filePath = path.join(TEMP_DIR, file);
        await fs.unlink(filePath);
      }
      
      return { success: true };
    } catch (error) {
      // 已删除日志
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  });
  
  // 删除单个临时文件
  ipcMain.handle('delete-temp-file', async (event: IpcMainEvent, filePath: string) => {
    try {
      // 检查文件是否存在
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!exists) {

        return { success: true };
      }
      
      // 删除文件
      await fs.unlink(filePath);

      
      return { success: true };
    } catch (error) {

      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  });
}