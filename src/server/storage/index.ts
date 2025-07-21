/**
 * 存储模块 - 用于保存和获取压缩历史和统计数据
 */

import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// 定义数据结构类型
export interface ProcessedImage {
  id: string;
  name: string;
  originalPath: string;
  outputPath: string;
  originalSize: number; // 以字节为单位
  compressedSize: number; // 以字节为单位
  compressionRate: string;
  width: number;
  height: number;
  format: string;
  processedAt: number; // 时间戳
}

export interface CompressionStats {
  totalProcessedImages: number;
  totalOriginalSize: number; // 以字节为单位
  totalCompressedSize: number; // 以字节为单位
  totalSavedSpace: number; // 以字节为单位
  averageCompressionRate: string;
  lastUpdated: number; // 时间戳
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  processedImages: number;
  savedSpace: number; // 以字节为单位
}

// 存储数据的主类
export class StorageManager {
  private static instance: StorageManager;
  private dataDir: string;
  private historyFile: string;
  private statsFile: string;
  private dailyStatsFile: string;
  
  private history: ProcessedImage[] = [];
  private stats: CompressionStats = {
    totalProcessedImages: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    totalSavedSpace: 0,
    averageCompressionRate: '0%',
    lastUpdated: Date.now()
  };
  private dailyStats: DailyStats[] = [];
  
  private constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.historyFile = path.join(dataDir, 'history.json');
    this.statsFile = path.join(dataDir, 'stats.json');
    this.dailyStatsFile = path.join(dataDir, 'daily-stats.json');
  }
  
  /**
   * 获取存储管理器实例
   */
  public static getInstance(dataDir?: string): StorageManager {
    if (!StorageManager.instance) {
      // 如果没有指定数据目录，则使用应用数据目录
      const appDataDir = app?.getPath('userData') || path.join(process.cwd(), 'data');
      const storageDir = dataDir || path.join(appDataDir, 'storage');
      StorageManager.instance = new StorageManager(storageDir);
      
      // 初始化存储
      StorageManager.instance.init().catch(err => {
        // 已删除日志
      });
    }
    
    return StorageManager.instance;
  }
  
  /**
   * 初始化存储
   */
  private async init(): Promise<void> {
    // 确保数据目录存在
    await fs.mkdir(this.dataDir, { recursive: true });
    // 加载历史数据
    await this.loadHistory();
    
    // 加载统计数据
    await this.loadStats();
    
    // 加载每日统计数据
    await this.loadDailyStats();
  }
  
  /**
   * 加载历史数据
   */
  private async loadHistory(): Promise<void> {
    try {
      if (existsSync(this.historyFile)) {
        const data = await fs.readFile(this.historyFile, 'utf-8');
        this.history = JSON.parse(data);
      } else {
        this.history = [];
        await this.saveHistory();
      }
    } catch (error) {
      // 已删除日志
      this.history = [];
      await this.saveHistory();
    }
  }
  
  /**
   * 保存历史数据
   */
  private async saveHistory(): Promise<void> {
    try {
      await fs.writeFile(this.historyFile, JSON.stringify(this.history, null, 2), 'utf-8');
    } catch (error) {
      // 已删除日志
    }
  }
  
  /**
   * 加载统计数据
   */
  private async loadStats(): Promise<void> {
    try {
      if (existsSync(this.statsFile)) {
        const data = await fs.readFile(this.statsFile, 'utf-8');
        this.stats = JSON.parse(data);
      } else {
        this.stats = {
          totalProcessedImages: 0,
          totalOriginalSize: 0,
          totalCompressedSize: 0,
          totalSavedSpace: 0,
          averageCompressionRate: '0%',
          lastUpdated: Date.now()
        };
        await this.saveStats();
      }
    } catch (error) {
      // 已删除日志
      this.stats = {
        totalProcessedImages: 0,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        totalSavedSpace: 0,
        averageCompressionRate: '0%',
        lastUpdated: Date.now()
      };
      await this.saveStats();
    }
  }
  
  /**
   * 保存统计数据
   */
  private async saveStats(): Promise<void> {
    try {
      await fs.writeFile(this.statsFile, JSON.stringify(this.stats, null, 2), 'utf-8');
    } catch (error) {
      // 已删除日志
    }
  }
  
  /**
   * 加载每日统计数据
   */
  private async loadDailyStats(): Promise<void> {
    try {
      if (existsSync(this.dailyStatsFile)) {
        const data = await fs.readFile(this.dailyStatsFile, 'utf-8');
        this.dailyStats = JSON.parse(data);
      } else {
        this.dailyStats = [];
        await this.saveDailyStats();
      }
    } catch (error) {
      // 已删除日志
      this.dailyStats = [];
      await this.saveDailyStats();
    }
  }
  
  /**
   * 保存每日统计数据
   */
  private async saveDailyStats(): Promise<void> {
    try {
      await fs.writeFile(this.dailyStatsFile, JSON.stringify(this.dailyStats, null, 2), 'utf-8');
    } catch (error) {
      // 已删除日志
    }
  }
  
  /**
   * 添加处理记录
   */
  public async addProcessedImage(image: ProcessedImage): Promise<void> {
    // 添加到历史记录
    this.history.unshift(image);
    
    // 限制历史记录数量，最多保留100条
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
    
    // 更新统计数据
    this.stats.totalProcessedImages += 1;
    this.stats.totalOriginalSize += image.originalSize;
    this.stats.totalCompressedSize += image.compressedSize;
    this.stats.totalSavedSpace += (image.originalSize - image.compressedSize);
    
    // 计算平均压缩率
    const compressionRate = (this.stats.totalSavedSpace / this.stats.totalOriginalSize) * 100;
    this.stats.averageCompressionRate = `${compressionRate.toFixed(1)}%`;
    this.stats.lastUpdated = Date.now();
    
    // 更新每日统计
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyStat = this.dailyStats.find(stat => stat.date === today);
    
    if (dailyStat) {
      dailyStat.processedImages += 1;
      dailyStat.savedSpace += (image.originalSize - image.compressedSize);
    } else {
      this.dailyStats.unshift({
        date: today,
        processedImages: 1,
        savedSpace: (image.originalSize - image.compressedSize)
      });
    }
    
    // 限制每日统计数据数量，最多保留30天
    if (this.dailyStats.length > 30) {
      this.dailyStats = this.dailyStats.slice(0, 30);
    }
    
    // 保存所有数据
    await Promise.all([
      this.saveHistory(),
      this.saveStats(),
      this.saveDailyStats()
    ]);
  }
  
  /**
   * 获取统计数据
   */
  public getStats(): CompressionStats {
    return { ...this.stats };
  }
  
  /**
   * 获取今日统计数据
   */
  public getTodayStats(): { processedImages: number, savedSpace: number } {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyStat = this.dailyStats.find(stat => stat.date === today);
    
    if (dailyStat) {
      return {
        processedImages: dailyStat.processedImages,
        savedSpace: dailyStat.savedSpace
      };
    }
    
    return {
      processedImages: 0,
      savedSpace: 0
    };
  }
  
  /**
   * 获取最近处理的图片
   */
  public getRecentImages(limit = 10): ProcessedImage[] {
    return this.history.slice(0, limit);
  }
  
  /**
   * 清除所有数据
   */
  public async clearAllData(): Promise<void> {
    this.history = [];
    this.stats = {
      totalProcessedImages: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSavedSpace: 0,
      averageCompressionRate: '0%',
      lastUpdated: Date.now()
    };
    this.dailyStats = [];
    
    await Promise.all([
      this.saveHistory(),
      this.saveStats(),
      this.saveDailyStats()
    ]);
  }
}
