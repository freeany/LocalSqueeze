import { useState, useEffect, useMemo } from 'react';
import { X, Upload, Download, Eye } from 'lucide-react';
import { formatFileSize, calculateCompressionRate } from '../lib/utils';
// eslint-disable-next-line import/no-unresolved
import { CompressionSettings, CompressionResult } from '../types/global';

// 获取文件名（替代path.basename）
function getBasename(filepath: string): string {
  return filepath.split(/[\\/]/).pop() || '';
}

export default function ImageProcessPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{current: number, total: number}>({ current: 0, total: 0 });
  const [stats, setStats] = useState({
    originalSize: '0 MB',
    processedSize: '0 MB',
    savedSpace: '0 MB',
    savingRate: '0%',
    processStatus: '0/0'
  });
  
  // 跟踪未处理的文件
  const [processedFileNames, setProcessedFileNames] = useState<Set<string>>(new Set());
  
  // 计算是否有未处理的文件
  const hasUnprocessedFiles = useMemo(() => {
    return files.some(file => !processedFileNames.has(file.name));
  }, [files, processedFileNames]);
  
  // 初始化压缩设置
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    quality: 70,
    keepDimensions: true,
    keepFormat: true,
    removeMetadata: true,
    optimizeColors: false,
    progressive: false
  });
  
  // 监听压缩进度更新
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    
    if (window.compression) {
      removeListener = window.compression.onCompressionProgress((data) => {
        setProcessingProgress({ current: data.current, total: data.total });
      });
    }
    
    // 组件卸载时移除监听
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
      
      // 直接添加文件，不模拟上传进度
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      
      // 直接添加文件，不模拟上传进度
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
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
    // 检查是否有文件需要处理
    if (files.length === 0) {
      alert('请先上传图片再进行处理');
      return;
    }
    
    // 检查是否有未处理的文件
    const unprocessedFiles = files.filter(file => !processedFileNames.has(file.name));
    if (unprocessedFiles.length === 0) {
      alert('所有文件已处理完成');
      return;
    }
    
    // 设置处理状态
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: unprocessedFiles.length });
    
    try {
      // 将File对象转换为临时文件路径
      const filePaths: string[] = [];
      const fileReaders: Promise<{path: string, error?: string}>[] = [];
      
      // 创建文件读取Promise，只处理未处理的文件
      for (const file of unprocessedFiles) {
        fileReaders.push(
          new Promise<{path: string, error?: string}>((resolve) => {
            try {
              const reader = new FileReader();
              
              reader.onload = async (e) => {
                try {
                  if (e.target && e.target.result) {
                    // 将文件内容发送到主进程，保存为临时文件
                    const tempPath = await window.electron.ipcRenderer.invoke('save-temp-file', {
                      filename: file.name,
                      data: e.target.result
                    });
                    resolve({ path: tempPath });
                  } else {
                    resolve({ path: '', error: '读取文件内容失败' });
                  }
                } catch (error) {
                  console.error(`保存文件 ${file.name} 失败:`, error);
                  resolve({ path: '', error: `保存文件失败: ${error instanceof Error ? error.message : '未知错误'}` });
                }
              };
              
              reader.onerror = () => {
                resolve({ path: '', error: `读取文件 ${file.name} 失败` });
              };
              
              reader.readAsArrayBuffer(file);
            } catch (error) {
              console.error(`处理文件 ${file.name} 时出错:`, error);
              resolve({ path: '', error: `处理文件失败: ${error instanceof Error ? error.message : '未知错误'}` });
            }
          })
        );
      }
      
      // 等待所有文件读取完成
      const results = await Promise.all(fileReaders);
      
      // 检查是否有错误
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('部分文件处理失败:', errors);
        alert(`部分文件处理失败:\n${errors.map(e => e.error).join('\n')}`);
      }
      
      // 过滤出成功的路径
      const validPaths = results.filter(r => r.path).map(r => r.path);
      
      if (validPaths.length === 0) {
        throw new Error('没有有效的文件可以处理');
      }
      
      // 使用compression API压缩图片
      let result: {
        success: boolean;
        results: CompressionResult[];
        error?: string;
      };
      
      try {
        if (window.compression) {
          // 根据文件数量决定使用单张处理还是批量处理
          if (validPaths.length === 1) {
            // 单张图片处理 - 直接保存到临时目录
            const singleResult = await window.compression.compressImage(validPaths[0], { ...compressionSettings });
            // 将单个结果转换为与批量处理相同的格式
            result = {
              success: true,
              results: [singleResult]
            };
          } else {
            // 批量处理 - 保存到子文件夹
            result = await window.compression.batchCompressImages(validPaths, { ...compressionSettings });
          }
        } else {
          // 使用通用IPC调用
          if (validPaths.length === 1) {
            // 单张图片处理
            const singleResult = await window.electron.ipcRenderer.invoke('compress-image', {
              imagePath: validPaths[0],
              settings: { ...compressionSettings }
            });
            result = {
              success: true,
              results: [singleResult]
            };
          } else {
            // 批量处理
            result = await window.electron.ipcRenderer.invoke('batch-compress-images', {
              imagePaths: validPaths,
              settings: { ...compressionSettings }
            });
          }
        }
      } catch (error) {
        console.error('压缩图片失败:', error);
        throw new Error(`压缩图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      if (result && result.success) {
        // 处理压缩结果
        const processed = await Promise.all(result.results.map(async (item: CompressionResult) => {
          try {
            // 获取本地图片URL
            const imageUrl = await window.electron.ipcRenderer.invoke('get-image-data-url', item.outputPath);
            
            // 添加处理记录到统计数据
            try {
              await window.stats.addProcessedImage({
                id: Math.random().toString(36).substr(2, 9),
                name: getBasename(item.originalPath),
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
              name: getBasename(item.originalPath),
              thumbnail: imageUrl, // 使用data URL
              originalSize: formatFileSize(item.originalSize),
              compressedSize: formatFileSize(item.compressedSize),
              dimensions: `${item.width}×${item.height}`,
              format: item.outputFormat.toUpperCase(),
              savingRate: item.compressionRate,
              status: 'completed',
              outputPath: item.outputPath
            };
          } catch (error) {
            console.error(`处理结果 ${item.originalPath} 失败:`, error);
            // 返回带有错误状态的结果
            return {
              id: Math.random().toString(36).substr(2, 9),
              name: getBasename(item.originalPath),
              thumbnail: '',
              originalSize: formatFileSize(item.originalSize),
              compressedSize: formatFileSize(item.compressedSize),
              dimensions: `${item.width}×${item.height}`,
              format: item.outputFormat.toUpperCase(),
              savingRate: item.compressionRate,
              status: 'error',
              outputPath: item.outputPath,
              error: `处理结果失败: ${error instanceof Error ? error.message : '未知错误'}`
            };
          }
        }));
        
        // 更新处理后的文件列表
        setProcessedFiles(prev => [...prev, ...processed]);
        
        // 更新已处理的文件名集合
        const newProcessedNames = new Set(processedFileNames);
        unprocessedFiles.forEach(file => {
          newProcessedNames.add(file.name);
        });
        setProcessedFileNames(newProcessedNames);
        
        // 计算统计数据
        const totalOriginalSize = result.results.reduce((sum: number, item: CompressionResult) => sum + item.originalSize, 0);
        const totalCompressedSize = result.results.reduce((sum: number, item: CompressionResult) => sum + item.compressedSize, 0);
        const savedSpace = totalOriginalSize - totalCompressedSize;
        
        // 更新统计信息
        setStats({
          originalSize: formatFileSize(totalOriginalSize),
          processedSize: formatFileSize(totalCompressedSize),
          savedSpace: formatFileSize(savedSpace),
          savingRate: calculateCompressionRate(totalOriginalSize, totalCompressedSize),
          processStatus: `${newProcessedNames.size}/${files.length}`
        });
      } else {
        throw new Error(`处理失败: ${result?.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('处理图片时出错:', error);
      alert(`处理图片时出错: ${error instanceof Error ? error.message : '未知错误'}\n请查看控制台获取详细信息`);
    } finally {
      // 重置处理状态
      setIsProcessing(false);
    }
  };

  // 获取文件扩展名
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toUpperCase() || '';
  };

  // 获取文件缩略图
  const getFileThumbnail = (file: File) => {
    return URL.createObjectURL(file);
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
  
  // 导出全部文件
  const exportAllFiles = async () => {
    try {
      // 选择保存目录
      let outputDir: string | undefined;
      if (window.compression) {
        outputDir = await window.compression.selectOutputDirectory();
      } else {
        outputDir = await window.electron.ipcRenderer.invoke('select-output-directory');
      }
      
      if (outputDir) {
        // 导出所有文件
        await window.electron.ipcRenderer.invoke('export-all-files', {
          files: processedFiles.map(file => file.outputPath),
          outputDir
        });
        
        alert(`文件已成功导出到: ${outputDir}`);
      }
    } catch (error) {
      console.error('导出文件失败:', error);
      alert('导出文件失败');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="page-header">
        <h1 className="text-3xl font-bold text-foreground mb-2">图片处理</h1>
        <p className="text-muted-foreground">
          上传图片并进行压缩处理，支持单张和批量处理。支持JPG、PNG、GIF、WebP等格式。
        </p>
      </div>
      
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* 左侧面板 */}
        <div className="flex-1 flex flex-col gap-6">
          {/* 上传区域 */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">上传图片</h2>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary hover:bg-accent/30'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <div className="text-lg text-foreground">拖拽图片到这里，或点击选择文件</div>
                <label className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                  选择文件
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
            
            {/* 文件列表 */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-foreground">已选择的图片 ({files.length})</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={clearAllFiles}
                      className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                    >
                      全部清除
                    </button>
                    <label className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent transition-colors cursor-pointer">
                      添加更多
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center p-3 border border-border rounded-lg bg-accent/30">
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center mr-4">
                        <img 
                          src={getFileThumbnail(file)} 
                          alt={file.name} 
                          className="w-12 h-12 object-cover rounded-md" 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground truncate" style={{ maxWidth: '200px' }}>
                          {file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB · {getFileExtension(file.name)}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-destructive/10 rounded-full text-destructive"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 处理结果 */}
          {processedFiles.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">处理结果</h2>
                <button 
                  onClick={exportAllFiles}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  导出全部
                </button>
              </div>
              
              <div className="space-y-3">
                {processedFiles.map((file) => (
                  <div key={file.id} className="flex items-center p-3 border border-border rounded-lg bg-accent/30">
                    {file.thumbnail ? (
                      <img 
                        src={file.thumbnail} 
                        alt={file.name} 
                        className="w-12 h-12 object-cover rounded-md mr-4" 
                        onError={(e) => {
                          console.error(`图片加载失败: ${file.thumbnail}`);
                          // 设置为默认图片
                          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E`;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.status === 'completed' ? (
                          <>
                            {file.compressedSize} · {file.dimensions} · {file.format} (节省 {file.savingRate})
                          </>
                        ) : file.status === 'error' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400">
                            处理失败: {file.error || '未知错误'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">
                            处理中
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => previewFile(file.outputPath)}
                        disabled={file.status !== 'completed'}
                        className={`p-2 rounded-md border border-border flex items-center gap-1 text-xs
                          ${file.status === 'completed' 
                            ? 'hover:bg-accent cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'}`}
                      >
                        <Eye className="h-3 w-3" />
                        预览
                      </button>
                      <button 
                        onClick={() => downloadFile(file.outputPath, file.name)}
                        disabled={file.status !== 'completed'}
                        className={`p-2 rounded-md border border-border flex items-center gap-1 text-xs
                          ${file.status === 'completed' 
                            ? 'hover:bg-accent cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'}`}
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
        
        {/* 右侧面板 */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* 快速操作 */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">快速操作</h2>
            
            <div className="flex justify-center mb-4">
              <button 
                onClick={processImages}
                disabled={isProcessing || files.length === 0 || !hasUnprocessedFiles}
                className={`w-full py-3 rounded-md font-medium transition-all duration-200 text-lg
                  ${!isProcessing && files.length > 0 && hasUnprocessedFiles 
                    ? 'bg-primary cursor-pointer   text-primary-foreground hover:bg-primary/80 hover:shadow-md active:translate-y-0.5' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
              >
                {isProcessing ? `处理中 (${processingProgress.current}/${processingProgress.total})` : 
                 !hasUnprocessedFiles && files.length > 0 ? '所有文件已处理' : '开始处理'}
              </button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              使用当前压缩设置处理图片<br />
              <a href="/settings/compression" className="text-primary hover:underline">
                前往压缩设置页面修改参数
              </a>
            </p>
          </div>
          
          {/* 处理统计 */}
          {processedFiles.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">处理统计</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">原始总大小：</span>
                  <span className="font-semibold">{stats.originalSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">处理后总大小：</span>
                  <span className="font-semibold">{stats.processedSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">节省空间：</span>
                  <span className="font-semibold">{stats.savedSpace} ({stats.savingRate})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">处理状态：</span>
                  <span className="font-semibold">{stats.processStatus} 完成</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 