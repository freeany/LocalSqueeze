import { useState, useEffect } from 'react';
import { X, Upload, Download, Eye } from 'lucide-react';

export default function ImageProcessPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // 模拟初始文件数据
  const mockInitialFiles = [
    {
      name: 'vacation-photo.jpg',
      size: 2.5 * 1024 * 1024, // 2.5 MB
      type: 'image/jpeg',
      lastModified: Date.now()
    },
    {
      name: 'product-image.png',
      size: 1.8 * 1024 * 1024, // 1.8 MB
      type: 'image/png',
      lastModified: Date.now()
    },
    {
      name: 'screenshot.jpg',
      size: 1.2 * 1024 * 1024, // 1.2 MB
      type: 'image/jpeg',
      lastModified: Date.now()
    }
  ];
  
  // 模拟处理后的文件
  const mockProcessedFiles = [
    {
      id: 1,
      name: 'vacation-photo.jpg',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '2.5 MB',
      compressedSize: '650 KB',
      dimensions: '1920×1080',
      format: 'JPG',
      savingRate: '74%',
      status: 'completed'
    },
    {
      id: 2,
      name: 'product-image.png',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '1.8 MB',
      compressedSize: '420 KB',
      dimensions: '1200×800',
      format: 'PNG',
      savingRate: '77%',
      status: 'completed'
    },
    {
      id: 3,
      name: 'screenshot.jpg',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '1.2 MB',
      dimensions: '1600×900',
      format: 'JPG',
      status: 'processing'
    }
  ];

  // 初始化模拟数据
  useEffect(() => {
    // 创建模拟文件对象
    const initialFiles = mockInitialFiles.map(mockFile => {
      // 创建 Blob 对象
      const blob = new Blob(['mock file content'], { type: mockFile.type });
      
      // 使用 File 构造函数创建文件对象
      return new File([blob], mockFile.name, {
        type: mockFile.type,
        lastModified: mockFile.lastModified
      });
    });
    
    // 设置初始文件
    setFiles(initialFiles);
    
    // 设置上传进度
    const initialProgress: {[key: string]: number} = {};
    initialFiles.forEach(file => {
      initialProgress[file.name] = 100; // 已完成上传
    });
    setUploadProgress(initialProgress);
    
    // 默认显示处理结果
    setProcessedFiles(mockProcessedFiles);
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
      
      // 为每个新文件设置初始上传进度
      const newProgress = {...uploadProgress};
      droppedFiles.forEach(file => {
        newProgress[file.name] = 0;
        // 模拟上传进度
        simulateUploadProgress(file.name);
      });
      
      setUploadProgress(newProgress);
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      
      // 为每个新文件设置初始上传进度
      const newProgress = {...uploadProgress};
      selectedFiles.forEach(file => {
        newProgress[file.name] = 0;
        // 模拟上传进度
        simulateUploadProgress(file.name);
      });
      
      setUploadProgress(newProgress);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };
  
  // 模拟上传进度
  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
    }, 300);
  };

  // 删除文件
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove) {
      // 移除该文件的上传进度
      const newProgress = {...uploadProgress};
      delete newProgress[fileToRemove.name];
      setUploadProgress(newProgress);
    }
    
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // 清除所有文件
  const clearAllFiles = () => {
    setFiles([]);
    setUploadProgress({});
  };

  // 处理图片
  const processImages = () => {
    // 在实际应用中，这里应该调用图片压缩API
    // 这里使用模拟数据
    setProcessedFiles(mockProcessedFiles);
  };

  // 计算处理统计
  const stats = {
    originalSize: '5.5 MB',
    processedSize: '1.1 MB',
    savedSpace: '4.4 MB',
    savingRate: '80%',
    processStatus: '2/3'
  };

  // 获取文件扩展名
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toUpperCase() || '';
  };

  // 获取文件缩略图
  const getFileThumbnail = (file: File) => {
    // 对于真实文件，可以使用 URL.createObjectURL
    // 对于模拟文件，使用占位图
    if (file.size > 100) { // 真实文件通常大于100字节
      return URL.createObjectURL(file);
    }
    // 对于模拟文件，返回占位图
    return `https://via.placeholder.com/60/cccccc?text=${getFileExtension(file.name)}`;
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
                        {/* 上传进度条 */}
                        {uploadProgress[file.name] < 100 && (
                          <div className="h-1.5 bg-muted mt-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            ></div>
                          </div>
                        )}
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
                <button className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  导出全部
                </button>
              </div>
              
              <div className="space-y-3">
                {processedFiles.map((file) => (
                  <div key={file.id} className="flex items-center p-3 border border-border rounded-lg bg-accent/30">
                    <img 
                      src={file.thumbnail} 
                      alt={file.name} 
                      className="w-12 h-12 object-cover rounded-md mr-4" 
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.status === 'completed' ? (
                          <>
                            {file.compressedSize} · {file.dimensions} · {file.format} (节省 {file.savingRate})
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">
                            处理中
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
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
                className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors text-lg"
              >
                开始处理
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