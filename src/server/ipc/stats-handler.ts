/**
 * 统计数据IPC处理程序
 */

import { ipcMain } from 'electron';
import { StorageManager } from '../storage';

/**
 * 初始化统计数据IPC处理程序
 */
export function initStatsHandlers() {
  const storage = StorageManager.getInstance();
  
  // 注册获取统计数据的处理程序
  ipcMain.handle('get-stats', async () => {
    try {
      const stats = storage.getStats();
      const todayStats = storage.getTodayStats();
      return {
        success: true,
        stats,
        todayStats
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  });
  
  // 注册获取最近处理图片的处理程序
  ipcMain.handle('get-recent-images', async (_, limit = 10) => {
    try {
      const images = storage.getRecentImages(limit);
      return {
        success: true,
        images
      };
    } catch (error) {
      console.error('获取最近处理图片失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  });
  
  // 注册添加处理记录的处理程序
  ipcMain.handle('add-processed-image', async (_, image) => {
    try {
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
