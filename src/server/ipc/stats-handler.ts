/**
 * 统计数据IPC处理程序
 */

import { ipcMain } from 'electron';
import { StorageManager } from '../storage';

/**
 * 初始化统计数据IPC处理程序
 */
export function initStatsHandlers() {
  // 注册获取统计数据的处理程序
  ipcMain.handle('get-stats', async () => {
    try {
      const storage = StorageManager.getInstance();
      const stats = storage.getStats();
      const todayStats = storage.getTodayStats();
      return {
        success: true,
        stats,
        todayStats
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
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
    try {
      const storage = StorageManager.getInstance();
      const images = storage.getRecentImages(limit);
      return {
        success: true,
        images
      };
    } catch (error) {
      console.error('获取最近处理图片失败:', error);
      return { 
        success: true, 
        images: []
      };
    }
  });
  
  // 注册添加处理记录的处理程序
  ipcMain.handle('add-processed-image', async (_, image) => {
    try {
      const storage = StorageManager.getInstance();
      await storage.addProcessedImage(image);
      return { success: true };
    } catch (error) {
      console.error('添加处理记录失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  });
  
  // 注册清除所有数据的处理程序
  ipcMain.handle('clear-stats-data', async () => {
    try {
      const storage = StorageManager.getInstance();
      await storage.clearAllData();
      return { success: true };
    } catch (error) {
      console.error('清除统计数据失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  });
}
