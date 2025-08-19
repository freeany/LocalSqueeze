import React, { useEffect, useState, useMemo } from 'react';
import { Images, Package, Search, Repeat, Smartphone, Lock, FileImage, Upload, X, Download, Eye, FolderOpen } from 'lucide-react';
import { formatFileSize, getCompressionSettings, buildCompressionSettings } from '../lib/utils';
// eslint-disable-next-line import/no-unresolved
import { CompressionSettings, CompressionResult } from '../types/global';

// 定义图片类型接口
interface ImageItem {
  id: string;
  name: string;
  thumbnail: string;
  originalSize: string;
  compressedSize: string;
  compressionRate: string;
  date: string;
  outputPath: string;
}

export default function HomePage() {
  // 已删除日志
  
  // 统计数据状态
  const [stats, setStats] = useState({
    processedImages: 0,
    savedSpace: '0 MB',
    compressionRate: '0%',
    todayProcessed: 0
  });
  
  // 最近处理的图片
  const [recentImages, setRecentImages] = useState<ImageItem[]>([]);
  
  // 加载中状态
  const [loading, setLoading] = useState(true);
  
  // 错误状态
  const [error, setError] = useState<string | null>(null);
  
  // 图片处理相关状态
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{current: number, total: number}>({ current: 0, total: 0 });
  const [processedFileNames, setProcessedFileNames] = useState<Set<string>>(new Set());
  const [showQuickProcess, setShowQuickProcess] = useState(true);
  
  // 压缩设置
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({

    quality: 80,
    outputFormat: 'original',
    removeMetadata: true,
    keepDimensions: true,
    keepFormat: false,
    optimizeColors: true,
    progressive: false
  });
  
  // 计算是否有未处理的文件
  const hasUnprocessedFiles = useMemo(() => {
    return files.some(file => !processedFileNames.has(file.name));
  }, [files, processedFileNames]);
  
  // 加载统计数据
  useEffect(() => {
    let isMounted = true;
    
    const loadStats = async () => {
      // 已删除日志
      try {
        setLoading(true);
        setError(null);
        
        // 已删除日志
        
        // 检查window.stats是否存在
        if (!window.stats) {
          console.warn('window.stats API不可用，尝试使用默认值');
          setStats({
            processedImages: 0,
            savedSpace: '0 MB',
            compressionRate: '0%',
            todayProcessed: 0
          });
          setRecentImages([]);
          setLoading(false);
          setError('统计数据API不可用，请检查预加载脚本是否正确加载');
          return;
        }
        
        // 已删除日志
        // 同时请求统计数据和最近图片
        const [statsResponse, recentResponse] = await Promise.all([
          window.stats.getStats(),
          window.stats.getRecentImages(4)
        ]);
        
        // 确保组件仍然挂载
        if (!isMounted) {
          // 已删除日志
          return;
        }
        
        // 已删除日志
        // 处理统计数据
        if (statsResponse && statsResponse.success && statsResponse.stats) {
          setStats({
            processedImages: statsResponse.stats.totalProcessedImages || 0,
            savedSpace: formatFileSize(statsResponse.stats.totalSavedSpace || 0),
            compressionRate: statsResponse.stats.averageCompressionRate || '0%',
            todayProcessed: statsResponse.todayStats?.processedImages || 0
          });
        }
        
        // 已删除日志
        // 处理最近图片数据
        if (recentResponse && recentResponse.success && Array.isArray(recentResponse.images)) {
          const formattedImages: ImageItem[] = [];
          
          // 处理每张图片
          for (const img of recentResponse.images) {
            try {
              // 已删除日志
              // 获取缩略图
              const thumbnail = await window.electron.ipcRenderer.invoke('get-image-data-url', img.outputPath);
              
              if (!isMounted) {
                // 已删除日志
                return;
              }
              
              formattedImages.push({
                id: img.id,
                name: img.name,
                thumbnail,
                originalSize: formatFileSize(img.originalSize),
                compressedSize: formatFileSize(img.compressedSize),
                compressionRate: img.compressionRate,
                date: new Date(img.processedAt).toLocaleString(),
                outputPath: img.outputPath
              });
            } catch (error) {
              // 已删除日志
            }
          }
          
          if (isMounted) {
            // 已删除日志
            setRecentImages(formattedImages);
          }
        } else {
          // 已删除日志
        }
      } catch (error) {
        // 已删除日志
        // 错误时使用默认值
        if (isMounted) {
          setStats({
            processedImages: 0,
            savedSpace: '0 MB',
            compressionRate: '0%',
            todayProcessed: 0
          });
          setError(error instanceof Error ? error.message : '加载数据失败');
        }
      } finally {
        if (isMounted) {
          // 已删除日志
          setLoading(false);
        }
      }
    };
    
    // 立即执行加载函数
    loadStats();
    
    // 清理函数
    return () => {
      // 已删除日志
      isMounted = false;
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 监听文件变化，自动处理新上传的文件
  useEffect(() => {
    const unprocessedFiles = files.filter(file => !processedFileNames.has(file.name));
    
    // 如果有未处理的文件且当前没有在处理中，则自动开始处理
    if (unprocessedFiles.length > 0 && !isProcessing) {
      // 使用setTimeout确保状态更新完成
      const timer = setTimeout(() => {
        processImages();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [files, processedFileNames, isProcessing]);

  // 打开文件位置
  const openFileLocation = async (filePath: string) => {
    try {
      // 已删除日志
      // 使用electron的shell.showItemInFolder方法打开文件所在位置
      await window.electron.ipcRenderer.invoke('show-item-in-folder', filePath);
    } catch (error) {
      // 已删除日志
      alert('打开文件位置失败');
    }
  };

  // 重新处理图片
  const reprocessImage = (image: ImageItem) => {
    // 导航到处理页面并传递图片信息
    // 这里可以根据实际需求实现
    // 已删除日志
  };

  // 手动刷新数据
  const refreshData = () => {
    // 已删除日志
    setLoading(true);
    setError(null);
    
    // 检查API是否可用
    if (!window.stats) {
      setError('统计数据API不可用');
      setLoading(false);
      return;
    }
    
    // 重新加载数据
    Promise.all([
      window.stats.getStats(),
      window.stats.getRecentImages(4)
    ])
    .then(([statsResponse, recentResponse]) => {
      // 已删除日志
      
      // 处理统计数据
      if (statsResponse && statsResponse.success && statsResponse.stats) {
        setStats({
          processedImages: statsResponse.stats.totalProcessedImages || 0,
          savedSpace: formatFileSize(statsResponse.stats.totalSavedSpace || 0),
          compressionRate: statsResponse.stats.averageCompressionRate || '0%',
          todayProcessed: statsResponse.todayStats?.processedImages || 0
        });
      }
      
      // 处理最近图片数据
      if (recentResponse && recentResponse.success && Array.isArray(recentResponse.images)) {
        Promise.all(recentResponse.images.map(async (img) => {
          try {
            const thumbnail = await window.electron.ipcRenderer.invoke('get-image-data-url', img.outputPath);
            return {
              id: img.id,
              name: img.name,
              thumbnail,
              originalSize: formatFileSize(img.originalSize),
              compressedSize: formatFileSize(img.compressedSize),
              compressionRate: img.compressionRate,
              date: new Date(img.processedAt).toLocaleString(),
              outputPath: img.outputPath
            };
          } catch (error) {
            // 已删除日志
            return null;
          }
        }))
        .then((images) => {
          setRecentImages(images.filter(Boolean) as ImageItem[]);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    })
    .catch(err => {
      // 已删除日志
      setError(err instanceof Error ? err.message : '刷新数据失败');
      setLoading(false);
    });
  };

  // 获取文件名（替代path.basename）
  function getBasename(filepath: string): string {
    return filepath.split(/[\\/]/).pop() || '';
  }

  // 加载压缩设置
  useEffect(() => {
    async function loadSettings() {
      try {
        const savedSettings = await getCompressionSettings();
        const settings = buildCompressionSettings(savedSettings);
        setCompressionSettings(settings);
      } catch (error) {
        console.error('加载压缩设置失败:', error);
      }
    }
    loadSettings();
  }, []);

  // 监听压缩进度更新
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    
    if (window.compression) {
      removeListener = window.compression.onCompressionProgress((data) => {
        setProcessingProgress({ current: data.current, total: data.total });
      });
    }
    
    return () => {
      if (removeListener) {
        removeListener();
      }
    };
  }, []);

  // 处理文件拖放
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      setShowQuickProcess(true);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      setShowQuickProcess(true);
    }
  };
  
  // 删除文件
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // 清除所有文件
  const clearAllFiles = () => {
    setFiles([]);
    setProcessedFiles([]);
    setProcessedFileNames(new Set());
  };

  // 处理图片
  const processImages = async () => {
    if (files.length === 0) {
      alert('请先上传图片再进行处理');
      return;
    }
    
    const unprocessedFiles = files.filter(file => !processedFileNames.has(file.name));
    if (unprocessedFiles.length === 0) {
      alert('所有文件已处理完成');
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: unprocessedFiles.length });
    
    let validPaths: string[] = [];
    
    try {
      const savedSettings = await getCompressionSettings();
      const currentSettings = buildCompressionSettings(savedSettings);
      
      const fileReaders: Promise<{path: string, originalFilename?: string, error?: string}>[] = [];
      
      for (const file of unprocessedFiles) {
        fileReaders.push(
          new Promise<{path: string, originalFilename?: string, error?: string}>((resolve) => {
            try {
              const reader = new FileReader();
              
              reader.onload = async (e) => {
                try {
                  if (e.target && e.target.result) {
                    const result = await window.electron.ipcRenderer.invoke('save-temp-file', {
                      filename: file.name,
                      data: e.target.result
                    });
                    resolve({ path: result.path, originalFilename: result.originalFilename });
                  } else {
                    resolve({ path: '', error: '读取文件内容失败' });
                  }
                } catch (error) {
                  resolve({ path: '', error: `保存文件失败: ${error instanceof Error ? error.message : '未知错误'}` });
                }
              };
              
              reader.onerror = () => {
                resolve({ path: '', error: `读取文件 ${file.name} 失败` });
              };
              
              reader.readAsArrayBuffer(file);
            } catch (error) {
              resolve({ path: '', error: `处理文件失败: ${error instanceof Error ? error.message : '未知错误'}` });
            }
          })
        );
      }
      
      const results = await Promise.all(fileReaders);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('部分文件处理失败:', errors);
      }
      
      validPaths = results.filter(r => r.path).map(r => r.path);
      const originalFilenames = new Map<string, string>();
      results.forEach(r => {
        if (r.path && r.originalFilename) {
          originalFilenames.set(r.path, r.originalFilename);
        }
      });
      
      if (validPaths.length === 0) {
        throw new Error('没有有效的文件可以处理');
      }
      
      let result: {
        success: boolean;
        results: CompressionResult[];
        error?: string;
      };
      
      try {
        if (window.compression) {
          if (validPaths.length === 1) {
            const singleResult = await window.compression.compressImage(validPaths[0], currentSettings);
            result = {
              success: true,
              results: [singleResult]
            };
          } else {
            result = await window.compression.batchCompressImages(validPaths, currentSettings);
          }
        } else {
          if (validPaths.length === 1) {
            const singleResult = await window.electron.ipcRenderer.invoke('compress-image', {
              imagePath: validPaths[0],
              settings: currentSettings
            });
            result = {
              success: true,
              results: [singleResult]
            };
          } else {
            result = await window.electron.ipcRenderer.invoke('batch-compress-images', {
              imagePaths: validPaths,
              settings: currentSettings
            });
          }
        }
      } catch (error) {
        throw new Error(`压缩图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      if (result && result.success) {
        const processed = await Promise.all(result.results.map(async (item: CompressionResult) => {
          try {
            const imageUrl = await window.electron.ipcRenderer.invoke('get-image-data-url', item.outputPath);
            const originalFilename = originalFilenames.get(item.originalPath) || getBasename(item.originalPath);
            
            try {
              await window.stats.addProcessedImage({
                id: Math.random().toString(36).substr(2, 9),
                name: originalFilename,
                originalPath: item.originalPath,
                outputPath: item.outputPath,
                originalSize: item.originalSize,
                compressedSize: item.compressedSize,
                compressionRate: item.compressionRate,
                width: item.width,
                height: item.height,
                format: item.outputFormat,
                processedAt: Date.now()
              });
            } catch (error) {
              console.error('添加处理记录失败:', error);
            }
            
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: originalFilename,
              thumbnail: imageUrl,
              originalSize: formatFileSize(item.originalSize),
              compressedSize: formatFileSize(item.compressedSize),
              dimensions: `${item.width}×${item.height}`,
              format: item.outputFormat.toUpperCase(),
              savingRate: typeof item.compressionRate === 'number' ? item.compressionRate : parseFloat(item.compressionRate) || 0,
              status: 'completed',
              outputPath: item.outputPath
            };
          } catch (error) {
            const originalFilename = originalFilenames.get(item.originalPath) || getBasename(item.originalPath);
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: originalFilename,
              thumbnail: '',
              originalSize: formatFileSize(item.originalSize),
              compressedSize: formatFileSize(item.compressedSize),
              dimensions: `${item.width}×${item.height}`,
              format: item.outputFormat.toUpperCase(),
              savingRate: typeof item.compressionRate === 'number' ? item.compressionRate : parseFloat(item.compressionRate) || 0,
              status: 'error',
              outputPath: item.outputPath,
              error: `处理结果失败: ${error instanceof Error ? error.message : '未知错误'}`
            };
          }
        }));
        
        setProcessedFiles(prev => [...prev, ...processed]);
        
        const newProcessedNames = new Set(processedFileNames);
        unprocessedFiles.forEach(file => {
          newProcessedNames.add(file.name);
        });
        setProcessedFileNames(newProcessedNames);
        
        // 刷新统计数据
        refreshData();
      } else {
        throw new Error(`处理失败: ${result?.error || '未知错误'}`);
      }
      
      try {
        for (const tempPath of validPaths) {
          await window.compression.deleteTempFile(tempPath);
        }
      } catch (cleanupError) {
        console.warn('清理临时文件时出错:', cleanupError);
      }
    } catch (error) {
      console.error('处理图片时出错:', error);
      alert(`处理图片时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      
      // 即使处理失败，也要清理临时文件
      try {
        for (const tempPath of validPaths) {
          await window.compression.deleteTempFile(tempPath);
        }
      } catch (cleanupError) {
        console.warn('清理临时文件时出错:', cleanupError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载处理后的文件
  const downloadFile = async (outputPath: string, fileName: string) => {
    try {
      await window.electron.ipcRenderer.invoke('save-file', {
        sourcePath: outputPath,
        suggestedName: fileName
      });
    } catch (error) {
      console.error('下载文件失败:', error);
      alert('下载文件失败');
    }
  };
  
  // 预览文件
  const previewFile = (outputPath: string) => {
    window.electron.ipcRenderer.invoke('open-file', outputPath);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-8">

      
      {/* 欢迎区域 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-primary mb-3">欢迎使用图片压缩工具</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          简单高效的图片压缩解决方案，帮助您减小图片文件大小，同时保持良好的图像质量
        </p>
      </div>
      
      {/* 快速处理区域 */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            快速处理
          </h2>
          <button
            onClick={() => setShowQuickProcess(!showQuickProcess)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showQuickProcess ? '收起' : '展开'}
          </button>
        </div>
        
        {showQuickProcess && (
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-4">
                 拖拽图片到此处或点击选择文件
               </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors"
              >
                选择文件
              </label>
            </div>
            
            {/* 待处理文件列表 */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">待处理文件 ({files.length})</h3>
                  <button
                    onClick={clearAllFiles}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    清空全部
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 处理控制 */}
            {files.length > 0 && (
              <div className="space-y-4">
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">处理进度</span>
                      <span className="text-foreground">
                        {processingProgress.current} / {processingProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${processingProgress.total > 0 ? (processingProgress.current / processingProgress.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                

              </div>
            )}
            
            {/* 处理结果 */}
            {processedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">处理结果 ({processedFiles.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {processedFiles.map((file) => (
                    <div key={file.id} className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-start gap-3">
                        {file.thumbnail && (
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>原始: {file.originalSize}</span>
                              <span>压缩: {file.compressedSize}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{file.dimensions}</span>
                              <span className="text-green-600 font-medium">
                                节省 {file.savingRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-3">
                        <button
                          onClick={() => previewFile(file.outputPath)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          预览
                        </button>
                        <button
                          onClick={() => openFileLocation(file.outputPath)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                        >
                          <FolderOpen className="h-3 w-3" />
                          位置
                        </button>
                        <button
                          onClick={() => downloadFile(file.outputPath, file.name)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          下载
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-auto max-w-2xl">
          <p className="font-medium">加载数据时出现错误:</p>
          <p>{error}</p>
          <button 
            onClick={refreshData}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm"
          >
            重试
          </button>
        </div>
      )}
      
      {/* 功能特点 */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">主要功能</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-xl shadow-sm bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:translate-y-[-5px]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">高质量压缩</h3>
              <p className="text-sm text-muted-foreground">
                智能压缩算法，在保持图片质量的同时最大程度减小文件大小
              </p>
            </div>
          </div>
          
          <div className="p-6 border border-border rounded-xl shadow-sm bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:translate-y-[-5px]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">批量处理</h3>
              <p className="text-sm text-muted-foreground">
                同时处理多张图片，提高工作效率
              </p>
            </div>
          </div>
          
          <div className="p-6 border border-border rounded-xl shadow-sm bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:translate-y-[-5px]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Repeat className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">格式转换</h3>
              <p className="text-sm text-muted-foreground">
                支持多种图片格式之间的转换
              </p>
            </div>
          </div>
          
          <div className="p-6 border border-border rounded-xl shadow-sm bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:translate-y-[-5px]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Images className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">压缩效果对比</h3>
              <p className="text-sm text-muted-foreground">
                直观对比压缩前后的效果，确保图片质量
              </p>
            </div>
          </div>
          
          <div className="p-6 border border-border rounded-xl shadow-sm bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:translate-y-[-5px]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">调整图片尺寸</h3>
              <p className="text-sm text-muted-foreground">
                根据需要调整图片尺寸，适应不同场景
              </p>
            </div>
          </div>
          
          <div className="p-6 border border-border rounded-xl shadow-sm bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 hover:translate-y-[-5px]">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">本地处理</h3>
              <p className="text-sm text-muted-foreground">
                所有处理在本地完成，保护您的隐私
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 使用统计 */}
      <div className="mt-10 bg-accent/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-foreground">使用统计</h3>
          {error ? (
            <button 
              onClick={refreshData}
              className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
          ) : (
            <button 
              onClick={refreshData}
              className="text-sm px-3 py-1 border border-primary text-primary rounded hover:bg-primary/10 transition-colors"
              disabled={loading}
            >
              刷新
            </button>
          )}
        </div>
        
        {error ? (
          <div className="p-4 bg-red-50 text-red-500 rounded-lg text-center">
            加载数据失败: {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">{loading ? '...' : stats.processedImages}</div>
              <div className="text-sm text-muted-foreground">已处理图片</div>
            </div>
            <div className="bg-background rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">{loading ? '...' : stats.savedSpace}</div>
              <div className="text-sm text-muted-foreground">节省空间</div>
            </div>
            <div className="bg-background rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">{loading ? '...' : stats.compressionRate}</div>
              <div className="text-sm text-muted-foreground">平均压缩率</div>
            </div>
            <div className="bg-background rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">{loading ? '...' : stats.todayProcessed}</div>
              <div className="text-sm text-muted-foreground">今日处理</div>
            </div>
          </div>
        )}
      </div>
      
      {/* 最近处理 */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">最近处理</h3>
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">
              加载失败，请刷新重试
            </div>
          ) : recentImages.length > 0 ? (
            recentImages.map((image) => (
              <div key={image.id} className="flex items-center p-4 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
                <img 
                  src={image.thumbnail} 
                  alt={image.name} 
                  className="w-12 h-12 object-cover rounded-md mr-4" 
                  onError={(e) => {
                    // 已删除日志
                    (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E`;
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{image.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {image.originalSize} → {image.compressedSize} (-{image.compressionRate}) · {image.date}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 text-xs border border-border rounded hover:bg-accent transition-colors text-foreground"
                    onClick={() => reprocessImage(image)}
                  >
                    重新处理
                  </button>
                  <button 
                    className="px-3 py-1 text-xs border border-border rounded hover:bg-accent transition-colors text-foreground"
                    onClick={() => openFileLocation(image.outputPath)}
                  >
                    打开位置
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              暂无处理记录
            </div>
          )}
        </div>
      </div>
      

    </div>
  );
}