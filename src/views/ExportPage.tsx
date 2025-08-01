import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Input } from '../components/ui';
import { RadioGroup } from '../components/ui/radio-group';
import { Radio } from '../components/ui/radio';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { cn } from '../lib/utils';
// eslint-disable-next-line import/no-unresolved
import { ProcessedImage } from '../types/global'

const ExportPage: React.FC = () => {
  // 状态管理
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    totalSavedSpace: 0,
  });
  const [exportSettings, setExportSettings] = useState({
    outputDirectory: '',
    fileNaming: '{filename}',
    exportFormat: 'original',
    overwriteExisting: false,
    openAfterExport: true,
    saveAsDefault: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 加载所有处理过的图片
  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      try {
        // 获取所有处理过的图片（这里使用100作为限制，实际上是获取全部）
        const result = await window.stats.getRecentImages(100);
        if (result.success && result.images) {
          setProcessedImages(result.images);
          
          // 计算统计数据
          const totalOriginalSize = result.images.reduce((sum, img) => sum + img.originalSize, 0);
          const totalCompressedSize = result.images.reduce((sum, img) => sum + img.compressedSize, 0);
          
          setStats({
            totalOriginalSize,
            totalCompressedSize,
            totalSavedSpace: totalOriginalSize - totalCompressedSize
          });
          
          // 默认全选所有图片
          setSelectedImages(result.images.map(img => img.id));
        }
      } catch (error) {
        console.error('加载图片失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadImages();
  }, []);

  // 选择输出目录
  const selectOutputDirectory = async () => {
    try {
      const outputDir = await window.compression.selectOutputDirectory();
      if (outputDir) {
        setExportSettings(prev => ({
          ...prev,
          outputDirectory: outputDir
        }));
      }
    } catch (error) {
      console.error('选择输出目录失败:', error);
    }
  };

  // 导出选中的图片
  const exportSelectedImages = async () => {
    try {
      if (!exportSettings.outputDirectory) {
        alert('请先选择导出目录');
        return;
      }
      
      if (selectedImages.length === 0) {
        alert('请至少选择一张图片');
        return;
      }
      
      // 获取选中图片的输出路径
      const selectedFiles = processedImages
        .filter(img => selectedImages.includes(img.id))
        .map(img => img.outputPath);
      
      // 调用导出函数
      await window.electron.ipcRenderer.invoke('export-all-files', {
        files: selectedFiles,
        outputDir: exportSettings.outputDirectory
      });
      
      alert(`已成功导出 ${selectedFiles.length} 张图片到: ${exportSettings.outputDirectory}`);
      
      // 如果设置了导出后打开文件夹
      if (exportSettings.openAfterExport) {
        await window.electron.ipcRenderer.invoke('show-item-in-folder', exportSettings.outputDirectory);
      }
    } catch (error) {
      console.error('导出图片失败:', error);
      alert('导出图片失败');
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedImages.length === processedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(processedImages.map(img => img.id));
    }
  };

  // 选择已压缩的图片
  const selectCompressedOnly = () => {
    const compressedImages = processedImages
      .filter(img => img.originalSize > img.compressedSize)
      .map(img => img.id);
    setSelectedImages(compressedImages);
  };

  // 切换单个图片的选择状态
  const toggleImageSelection = (id: string) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter(imgId => imgId !== id));
    } else {
      setSelectedImages([...selectedImages, id]);
    }
  };

  // 移除图片
  const removeImage = (id: string) => {
    setProcessedImages(processedImages.filter(img => img.id !== id));
    setSelectedImages(selectedImages.filter(imgId => imgId !== id));
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-foreground">导出管理</h1>
      <p className="text-muted-foreground mb-6">管理和导出您处理过的图片</p>
      
      {/* 导出概览 */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">导出概览</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-blue-600 dark:text-blue-400">可导出图片</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{processedImages.length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-blue-600 dark:text-blue-400">原始总大小</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatFileSize(stats.totalOriginalSize)}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-blue-600 dark:text-blue-400">压缩后总大小</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatFileSize(stats.totalCompressedSize)}</p>
          </div>
        </div>
      </div>
      
      {/* 导出设置 */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">导出设置</h2>
        
        {/* 导出位置 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">导出位置</label>
          <div className="flex">
            <Input 
              value={exportSettings.outputDirectory} 
              readOnly 
              placeholder="请选择导出目录" 
              className="flex-1 mr-2" 
            />
            <Button onClick={selectOutputDirectory} className="cursor-pointer">选择目录</Button>
          </div>
        </div>
        

        
        {/* 文件命名（已禁用） */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground mb-1">文件命名（暂不可用）</label>
          <Input 
            value={exportSettings.fileNaming}
            disabled={true}
            placeholder="例如: {filename}_exported"
            className="w-full mb-1 opacity-70 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">可用变量: {'{filename}'} - 原始文件名, {'{date}'} - 当前日期, {'{time}'} - 当前时间</p>
        </div>
        
        {/* 导出格式 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">导出格式</label>
          <RadioGroup 
            value={exportSettings.exportFormat}
            onValueChange={(value) => setExportSettings(prev => ({ ...prev, exportFormat: value }))}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center">
              <Radio 
                id="formatOriginal" 
                value="original"
              />
              <label htmlFor="formatOriginal" className="ml-2 text-sm text-foreground">原始格式</label>
            </div>
            <div className="flex items-center">
              <Radio 
                id="formatJpeg" 
                value="jpeg"
              />
              <label htmlFor="formatJpeg" className="ml-2 text-sm text-foreground">JPEG</label>
            </div>
            <div className="flex items-center">
              <Radio 
                id="formatPng" 
                value="png"
              />
              <label htmlFor="formatPng" className="ml-2 text-sm text-foreground">PNG</label>
            </div>
            <div className="flex items-center">
              <Radio 
                id="formatWebp" 
                value="webp"
              />
              <label htmlFor="formatWebp" className="ml-2 text-sm text-foreground">WebP</label>
            </div>
          </RadioGroup>
        </div>
        
        {/* 其他选项 */}
        <div className="space-y-2">
          <div>
            <Checkbox 
              id="overwriteExisting"
              checked={exportSettings.overwriteExisting}
              onCheckedChange={(checked) => 
                setExportSettings(prev => ({ ...prev, overwriteExisting: !!checked }))
              }
            />
            <label htmlFor="overwriteExisting" className="ml-2 text-sm text-foreground">
                覆盖已存在的文件
              </label>
          </div>
          <div>
            <Checkbox 
              id="openAfterExport"
              checked={exportSettings.openAfterExport}
              onCheckedChange={(checked) => 
                setExportSettings(prev => ({ ...prev, openAfterExport: !!checked }))
              }
            />
            <label htmlFor="openAfterExport" className="ml-2 text-sm text-foreground">
                导出后打开文件夹
              </label>
          </div>
          <div>
            <Checkbox 
              id="saveAsDefault"
              checked={exportSettings.saveAsDefault}
              onCheckedChange={(checked) => 
                setExportSettings(prev => ({ ...prev, saveAsDefault: !!checked }))
              }
            />
            <label htmlFor="saveAsDefault" className="ml-2 text-sm text-foreground">
                保存为默认设置
              </label>
          </div>
        </div>
      </div>
      
      {/* 待导出图片列表 */}
      <div className="bg-card rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">待导出图片 ({selectedImages.length}/{processedImages.length})</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={toggleSelectAll} className="cursor-pointer">
              {selectedImages.length === processedImages.length ? '取消全选' : '全选'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedImages([])} className="cursor-pointer">取消选择</Button>
            <Button variant="outline" size="sm" onClick={selectCompressedOnly} className="cursor-pointer">仅选择已压缩</Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-foreground">加载中...</p>
          </div>
        ) : processedImages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">没有可导出的图片</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedImages.map(image => (
              <div 
                key={image.id} 
                className={cn(
                  "border rounded-lg overflow-hidden",
                  selectedImages.includes(image.id) ? "border-primary" : "border-border"
                )}
              >
                <div className="relative">
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedImages.includes(image.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedImages([...selectedImages, image.id]);
                        } else {
                          setSelectedImages(selectedImages.filter(imgId => imgId !== image.id));
                        }
                      }}
                      className="h-5 w-5 bg-white/90"
                    />
                  </div>
                  <img 
                    src={`file://${image.outputPath}`} 
                    alt={image.name}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => toggleImageSelection(image.id)}
                    onError={(e) => {
                      // 图片加载失败时显示占位图
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==';
                    }}
                  />
                </div>
                <div className="p-3 bg-card">
                    <p className="font-medium truncate text-foreground" title={image.name}>{image.name}</p>
                    <div className="text-sm text-muted-foreground mt-1">
                    <p>
                      {formatFileSize(image.originalSize)} → {formatFileSize(image.compressedSize)}
                      <span className="ml-2 text-green-600 dark:text-green-400">{image.compressionRate}</span>
                    </p>
                    <p>{image.width} × {image.height} · {image.format.toUpperCase()}</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.electron.ipcRenderer.invoke('open-file', image.outputPath)}
                      className="cursor-pointer"
                    >
                      预览
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeImage(image.id)}
                      className="cursor-pointer"
                    >
                      移除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 底部操作按钮 */}
        <div className="mt-6 flex justify-between">
         <div className='flex items-center'>
           <Button 
            onClick={exportSelectedImages}
            disabled={selectedImages.length === 0 || !exportSettings.outputDirectory}
            className={selectedImages.length === 0 || !exportSettings.outputDirectory ? "cursor-not-allowed" : "cursor-pointer"}
          >
            导出选中图片 ({selectedImages.length})
          </Button>
          {!exportSettings.outputDirectory ? (
            <div className="text-red-500 text-sm ml-2">请先选择导出目录</div>
          ) : null}
         </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;