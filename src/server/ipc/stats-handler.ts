/**
 * 统计数据IPC处理程序
 */

import { ipcMain } from 'electron';
import { StorageManager } from '../storage';

// 记录日志函数
const logInfo = (message: string, ...args: any[]) => {
  // 已删除日志
};

// 记录错误函数
const logError = (message: string, error: any) => {
  // 已删除日志
};

/**
 * 初始化统计数据IPC处理程序
 */
export function initStatsHandlers() {
  // 已删除日志
  
  try {
    // 预先初始化存储管理器
    const storage = StorageManager.getInstance();
    // 已删除日志
    
    // 注册获取统计数据的处理程序
    ipcMain.handle('get-stats', async () => {
      // 已删除日志
      try {
        const stats = storage.getStats();
        const todayStats = storage.getTodayStats();
        // 已删除日志
        return {
          success: true,
          stats,
          todayStats
        };
      } catch (error) {
        // 已删除日志
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
      // 已删除日志
      try {
        const images = storage.getRecentImages(limit);
        // 已删除日志
        return {
          success: true,
          images
        };
      } catch (error) {
        // 已删除日志
        return { 
          success: true, 
          images: []
        };
      }
    });
    
    // 注册添加处理记录的处理程序
    ipcMain.handle('add-processed-image', async (_, image) => {
      // 已删除日志
      try {
        await storage.addProcessedImage(image);
        // 已删除日志
        return { success: true };
      } catch (error) {
        // 已删除日志
        return { 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        };
      }
    });
    
    // 注册清除所有数据的处理程序
    ipcMain.handle('clear-stats-data', async () => {
      // 已删除日志
      try {
        await storage.clearAllData();
        // 已删除日志
        return { success: true };
      } catch (error) {
        // 已删除日志
        return { 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误' 
        };
      }
    });
    
    // 已删除日志
  } catch (error) {
    // 已删除日志
  }
}
