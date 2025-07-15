/**
 * 配置处理程序
 * 负责处理应用配置的保存和读取
 */

import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

// 获取应用数据目录
const APP_DATA_DIR = path.join(app.getPath('userData'), 'config');
const CONFIG_FILE = path.join(APP_DATA_DIR, 'compression-settings.json');

console.log(CONFIG_FILE, 'CONFIG_FILE');

// 确保配置目录存在
async function ensureConfigDir() {
  try {
    await fs.mkdir(APP_DATA_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error('创建配置目录失败:', error);
    return false;
  }
}

/**
 * 初始化配置处理程序
 */
export function initConfigHandlers() {
  // 保存压缩设置
  ipcMain.handle('save-compression-settings', async (_, settings) => {
    try {
      await ensureConfigDir();
      await fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('保存压缩设置失败:', error);
      return { success: false, error: error.message };
    }
  });

  // 读取压缩设置
  ipcMain.handle('get-compression-settings', async () => {
    try {
      // 检查配置文件是否存在
      try {
        await fs.access(CONFIG_FILE);
      } catch (error) {
        // 如果文件不存在，返回默认设置
        return {
          success: true,
          settings: {
            preset: '低压缩',
            quality: 70,
            keepDimensions: true,
            width: 1920,
            height: 1080,
            keepRatio: true,
            removeMetadata: true,
            optimizeColors: false,
            progressive: false,
            keepFormat: true,
            outputFormat: 'PNG',
            fileNaming: '{filename}_compressed'
          }
        };
      }

      // 读取配置文件
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      const settings = JSON.parse(data);
      
      return { success: true, settings };
    } catch (error) {
      console.error('读取压缩设置失败:', error);
      return { success: false, error: error.message };
    }
  });
} 