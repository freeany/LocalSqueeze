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
    console.error('创建临时目录失败:', error);
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
      
      console.log(`[IPC] 单张压缩请求: ${imagePath}`);
      console.log(`[IPC] 单张压缩参数:`, JSON.stringify(settings, null, 2));
      console.log(`[IPC] 文件命名设置:`, {
        fileNaming: (settings as any).fileNaming,
        fileExtension: (settings as any).fileExtension
      });
      
      // 如果没有指定输出路径，则使用临时目录
      if (!outputPath) {
        // 使用命名模板生成文件名
        const fileName = generateOutputFileName(
          imagePath,
          (settings as any).fileNaming,
          (settings as any).fileExtension,
          !settings.keepFormat && (settings as any).outputFormat ? (settings as any).outputFormat.toLowerCase() : undefined
        );
        
        outputPath = path.join(TEMP_DIR, fileName);
        console.log(`[IPC] 单张压缩输出路径: ${outputPath}`);
      }
      
      // 根据文件类型选择不同的压缩方法
      const fileExtension = getFileExtension(imagePath);
      let result: CompressionResult;
      
      console.log(`[IPC] 单张压缩文件类型: ${fileExtension}`);
      
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
          console.log(`[IPC] 使用JPEG专用压缩方法`);
          result = await compressJpeg(imagePath, outputPath, {
            ...getDefaultJpegSettings(),
            ...settings
          });
          break;
          
        case 'png':
          console.log(`[IPC] 使用PNG专用压缩方法`);
          result = await compressPng(imagePath, outputPath, {
            ...getDefaultPngSettings(),
            ...settings
          });
          break;
          
        case 'webp':
          console.log(`[IPC] 使用WebP专用压缩方法`);
          result = await compressWebp(imagePath, outputPath, {
            ...getDefaultWebpSettings(),
            ...settings
          });
          break;
          
        default:
          console.log(`[IPC] 使用通用压缩方法`);
          // 默认使用通用压缩方法
          result = await compressImage(imagePath, outputPath, settings);
      }
      
      console.log(`[IPC] 单张压缩完成: ${imagePath}, 压缩率: ${result.compressionRate}`);
      
      return result;
    } catch (error) {
      console.error('[IPC] 压缩图片失败:', error);
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
      
      console.log(`[IPC] 批量压缩请求: ${imagePaths.length} 个文件`);
      console.log(`[IPC] 批量压缩参数:`, JSON.stringify(settings, null, 2));
      
      // 如果没有指定输出目录，则使用临时目录
      if (!outputDir) {
        outputDir = path.join(TEMP_DIR, 'batch_' + Date.now());
        console.log(`[IPC] 批量压缩输出目录: ${outputDir}`);
      }
      
      // 创建输出目录
      await fs.mkdir(outputDir, { recursive: true });
      
      // 批量压缩图片 - 使用单张图片处理的逻辑，确保一致性
      const results: CompressionResult[] = [];
      let current = 0;
      const total = imagePaths.length;
      
      for (const imagePath of imagePaths) {
        // 使用命名模板生成文件名
        const fileName = generateOutputFileName(
          imagePath,
          (settings as any).fileNaming,
          (settings as any).fileExtension,
          !settings.keepFormat && (settings as any).outputFormat ? (settings as any).outputFormat.toLowerCase() : undefined
        );
        
        const outputPath = path.join(outputDir, fileName);
        
        console.log(`[IPC] 批量处理文件 ${++current}/${total}: ${imagePath} -> ${outputPath}`);
        
        // 使用与单张处理相同的逻辑，根据文件类型选择不同的压缩方法
        const fileExtension = getFileExtension(imagePath);
        let result: CompressionResult;
        
        console.log(`[IPC] 批量处理文件类型: ${fileExtension}`);
        
        switch (fileExtension) {
          case 'jpg':
          case 'jpeg':
            console.log(`[IPC] 使用JPEG专用压缩方法 (批量)`);
            result = await compressJpeg(imagePath, outputPath, {
              ...getDefaultJpegSettings(),
              ...settings
            });
            break;
            
          case 'png':
            console.log(`[IPC] 使用PNG专用压缩方法 (批量)`);
            result = await compressPng(imagePath, outputPath, {
              ...getDefaultPngSettings(),
              ...settings
            });
            break;
            
          case 'webp':
            console.log(`[IPC] 使用WebP专用压缩方法 (批量)`);
            result = await compressWebp(imagePath, outputPath, {
              ...getDefaultWebpSettings(),
              ...settings
            });
            break;
            
          default:
            console.log(`[IPC] 使用通用压缩方法 (批量)`);
            // 默认使用通用压缩方法
            result = await compressImage(imagePath, outputPath, { ...settings });
        }
        
        results.push(result);
        
        console.log(`[IPC] 批量处理文件完成 ${current}/${total}: ${imagePath}, 压缩率: ${result.compressionRate}`);
        
        // 发送进度更新
        event.sender.send('compression-progress', {
          current,
          total,
          result
        });
      }
      
      console.log(`[IPC] 批量压缩全部完成: ${results.length} 个文件`);
      
      return {
        success: true,
        results,
        outputDir
      };
    } catch (error) {
      console.error('[IPC] 批量压缩图片失败:', error);
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
      console.error('转换为WebP失败:', error);
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
      console.error('清理临时文件失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  });
} 