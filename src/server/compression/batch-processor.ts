/**
 * 批量图片处理管理器
 * 使用工作线程并行处理多张图片
 */

import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { Worker } from 'worker_threads';
import { CompressionSettings, CompressionResult } from './index';

// 默认并行处理的最大线程数
const DEFAULT_MAX_WORKERS = Math.max(os.cpus().length - 1, 1);

/**
 * 批量处理管理器
 */
export class BatchProcessor {
  private maxWorkers: number;
  private activeWorkers = 0;
  private queue: {
    inputPath: string;
    outputPath: string;
    settings: CompressionSettings;
    resolve: (result: CompressionResult) => void;
    reject: (error: Error) => void;
  }[] = [];
  private results: CompressionResult[] = [];
  private onProgressCallback?: (current: number, total: number, result?: CompressionResult) => void;
  private total = 0;
  private completed = 0;
  
  /**
   * 创建批量处理管理器
   * @param maxWorkers 最大工作线程数
   */
  constructor(maxWorkers: number = DEFAULT_MAX_WORKERS) {
    this.maxWorkers = maxWorkers;
  }
  
  /**
   * 添加处理任务
   * @param inputPath 输入文件路径
   * @param outputPath 输出文件路径
   * @param settings 压缩设置
   * @returns 压缩结果Promise
   */
  addTask(inputPath: string, outputPath: string, settings: CompressionSettings): Promise<CompressionResult> {
    this.total++;
    
    return new Promise<CompressionResult>((resolve, reject) => {
      this.queue.push({
        inputPath,
        outputPath,
        settings,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }
  
  /**
   * 设置进度回调函数
   * @param callback 进度回调函数
   */
  onProgress(callback: (current: number, total: number, result?: CompressionResult) => void): void {
    this.onProgressCallback = callback;
  }
  
  /**
   * 等待所有任务完成
   * @returns 所有任务的结果数组
   */
  async waitForAll(): Promise<CompressionResult[]> {
    if (this.queue.length === 0 && this.activeWorkers === 0) {
      return this.results;
    }
    
    return new Promise<CompressionResult[]>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.queue.length === 0 && this.activeWorkers === 0) {
          clearInterval(checkInterval);
          resolve(this.results);
        }
      }, 100);
    });
  }
  
  /**
   * 处理队列中的任务
   */
  private processQueue(): void {
    if (this.queue.length === 0 || this.activeWorkers >= this.maxWorkers) {
      return;
    }
    
    const task = this.queue.shift();
    if (!task) return;
    
    this.activeWorkers++;
    
    // 创建工作线程
    const worker = new Worker(path.join(__dirname, '../workers/compression-worker.js'), {
      workerData: {
        inputPath: task.inputPath,
        outputPath: task.outputPath,
        settings: task.settings
      }
    });
    
    // 处理工作线程消息
    worker.on('message', (message) => {
      if (message.status === 'completed') {
        this.completed++;
        const result = message.result as CompressionResult;
        this.results.push(result);
        
        // 调用进度回调
        if (this.onProgressCallback) {
          this.onProgressCallback(this.completed, this.total, result);
        }
        
        task.resolve(result);
      } else if (message.status === 'error') {
        this.completed++;
        const error = new Error(message.error || '压缩失败');
        
        // 创建错误结果
        const errorResult: CompressionResult = {
          success: false,
          originalPath: task.inputPath,
          outputPath: '',
          originalSize: 0,
          compressedSize: 0,
          compressionRate: '0%',
          originalFormat: '',
          outputFormat: '',
          width: 0,
          height: 0,
          error: message.error
        };
        
        this.results.push(errorResult);
        
        // 调用进度回调
        if (this.onProgressCallback) {
          this.onProgressCallback(this.completed, this.total, errorResult);
        }
        
        task.reject(error);
      }
    });
    
    // 处理工作线程错误
    worker.on('error', (error) => {
      this.completed++;
      
      // 创建错误结果
      const errorResult: CompressionResult = {
        success: false,
        originalPath: task.inputPath,
        outputPath: '',
        originalSize: 0,
        compressedSize: 0,
        compressionRate: '0%',
        originalFormat: '',
        outputFormat: '',
        width: 0,
        height: 0,
        error: error.message
      };
      
      this.results.push(errorResult);
      
      // 调用进度回调
      if (this.onProgressCallback) {
        this.onProgressCallback(this.completed, this.total, errorResult);
      }
      
      task.reject(error);
    });
    
    // 工作线程退出
    worker.on('exit', (code) => {
      this.activeWorkers--;
      
      // 继续处理队列
      this.processQueue();
    });
  }
  
  /**
   * 批量压缩图片
   * @param inputPaths 输入文件路径数组
   * @param outputDir 输出目录
   * @param settings 压缩设置
   * @param progressCallback 进度回调函数
   * @returns 压缩结果数组
   */
  static async batchProcess(
    inputPaths: string[],
    outputDir: string,
    settings: CompressionSettings,
    progressCallback?: (current: number, total: number, result?: CompressionResult) => void
  ): Promise<CompressionResult[]> {
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });
    
    // 创建批量处理管理器
    const processor = new BatchProcessor();
    
    // 设置进度回调
    if (progressCallback) {
      processor.onProgress(progressCallback);
    }
    
    // 添加所有任务
    for (const inputPath of inputPaths) {
      const fileName = path.basename(inputPath);
      const fileExt = path.extname(fileName);
      const fileNameWithoutExt = path.basename(fileName, fileExt);
      
      // 确定输出格式
      let outputExt = fileExt;
      if (!settings.keepFormat && settings.outputFormat) {
        outputExt = `.${settings.outputFormat.toLowerCase()}`;
      }
      
      // 构建输出文件路径
      const outputPath = path.join(outputDir, `${fileNameWithoutExt}_compressed${outputExt}`);
      
      // 添加任务
      processor.addTask(inputPath, outputPath, settings);
    }
    
    // 等待所有任务完成
    return processor.waitForAll();
  }
}