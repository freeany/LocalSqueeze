/**
 * 统计数据IPC处理程序
 */

import { ipcMain } from 'electron';
import { StorageManager } from '../storage';

// 记录日志函数
const logInfo = (message: string, ...args: any[]) => {
  console.log(`[Stats Handler] ${message}`, ...args);
};

// 记录错误函数
const logError = (message: string, error: any) => {
  console.error(`[Stats Handler Error] ${message}`, error);
};

/**
 * 初始化统计数据IPC处理程序
 */
export function initStatsHandlers() {
  logInfo('开始初始化统计数据IPC处理程序');
  
  try {
    // 预先初始化存储管理器
    const storage = StorageManager.getInstance();
    logInfo('存储管理器初始化成功');
    
    // 注册获取统计数据的处理程序
    ipcMain.handle('get-stats', async () => {
      logInfo('收到get-stats请求');
      try {
        const stats = storage.getStats();
        const todayStats = storage.getTodayStats();
        logInfo('获取统计数据成功', { stats, todayStats });
        return {
          success: true,
          stats,
          todayStats
        };
      } catch (error) {
        logError('获取统计数据失败', error);
        // 返回默认统计数据，避免前端出错
        return { 
          success: true, 
          stats: {
            totalProcessedImages: 0,
            totalOriginalSize: 0,
            totalCompressedSize: 0,
            totalSavedSpace: 0,
            averageCompressionRate: '0%',
            lastUpdated: Date.now()
          },
          todayStats: {
            processedImages: 0,
            savedSpace: 0
          }
        };
      }
    });
    
    // 注册获取最近处理图片的处理程序
    ipcMain.handle('get-recent-images', async (_, limit = 10) => {
      logInfo('收到get-recent-images请求', { limit });
      try {
        const images = storage.getRecentImages(limit);
        logInfo('获取最近处理图片成功', { count: images.length });
        return {
          success: true,
          images
        };
      } catch (error) {
        logError('获取最近处理图片失败', error);
        return { 
          success: true, 
          images: []
        };
      }
    });
    
    // 注册添加处理记录的处理程序
    ipcMain.handle('add-processed-image', async (_, image) => {
      logInfo('收到add-processed-image请求', { imageId: image.id });
      try {
        await storage.addProcessedImage(image);
        logInfo('添加处理记录成功');
        return { success: true };
      } catch (error) {
        logError('添加处理记录失败', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        };
      }
    });
    
    // 注册清除所有数据的处理程序
    ipcMain.handle('clear-stats-data', async () => {
      logInfo('收到clear-stats-data请求');
      try {
        await storage.clearAllData();
        logInfo('清除统计数据成功');
        return { success: true };
      } catch (error) {
        logError('清除统计数据失败', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        };
      }
    });
    
    logInfo('统计数据IPC处理程序初始化完成');
  } catch (error) {
    logError('初始化统计数据IPC处理程序失败', error);
  }
}
