import React, { useEffect, useState } from 'react';
import { Upload, Sliders, Images, Package, Search, Repeat, Smartphone, Lock, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatFileSize } from '../lib/utils';

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
  // 统计数据状态
  const [stats, setStats] = useState({
    processedImages: 0,
    savedSpace: '0 MB',
    compressionRate: '0%',
    todayProcessed: 0
  });
  
  // 最近处理的图片
  const [recentImages, setRecentImages] = useState<ImageItem[]>([]);
  
  // 加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        // 获取统计数据
        const response = await window.stats.getStats();
        if (response && response.success && response.stats) {
          setStats({
            processedImages: response.stats.totalProcessedImages || 0,
            savedSpace: formatFileSize(response.stats.totalSavedSpace || 0),
            compressionRate: response.stats.averageCompressionRate || '0%',
            todayProcessed: response.todayStats?.processedImages || 0
          });
        }
        
        // 获取最近处理的图片
        const recentResponse = await window.stats.getRecentImages(4);
        if (recentResponse && recentResponse.success && Array.isArray(recentResponse.images)) {
          const formattedImages: ImageItem[] = [];
          
          // 处理每张图片
          for (const img of recentResponse.images) {
            try {
              // 获取缩略图
              const thumbnail = await window.electron.ipcRenderer.invoke('get-image-data-url', img.outputPath);
              
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
              console.error('获取缩略图失败:', error);
            }
          }
          
          setRecentImages(formattedImages);
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
        // 错误时使用默认值
        setStats({
          processedImages: 0,
          savedSpace: '0 MB',
          compressionRate: '0%',
          todayProcessed: 0
        });
      }
    };
    
    loadStats();
  }, []);

  // 打开文件位置
  const openFileLocation = async (filePath: string) => {
    try {
      // 使用electron的shell.showItemInFolder方法打开文件所在位置
      await window.electron.ipcRenderer.invoke('show-item-in-folder', filePath);
    } catch (error) {
      console.error('打开文件位置失败:', error);
      alert('打开文件位置失败');
    }
  };

  // 重新处理图片
  const reprocessImage = (image: ImageItem) => {
    // 导航到处理页面并传递图片信息
    // 这里可以根据实际需求实现
    console.log('重新处理图片:', image);
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
        <h3 className="text-xl font-semibold mb-4 text-foreground">使用统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary">{stats.processedImages}</div>
            <div className="text-sm text-muted-foreground">已处理图片</div>
          </div>
          <div className="bg-background rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary">{stats.savedSpace}</div>
            <div className="text-sm text-muted-foreground">节省空间</div>
          </div>
          <div className="bg-background rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary">{stats.compressionRate}</div>
            <div className="text-sm text-muted-foreground">平均压缩率</div>
          </div>
          <div className="bg-background rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary">{stats.todayProcessed}</div>
            <div className="text-sm text-muted-foreground">今日处理</div>
          </div>
        </div>
      </div>
      
      {/* 最近处理 */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">最近处理</h3>
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          {recentImages.length > 0 ? (
            recentImages.map((image) => (
              <div key={image.id} className="flex items-center p-4 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
                <img 
                  src={image.thumbnail} 
                  alt={image.name} 
                  className="w-12 h-12 object-cover rounded-md mr-4" 
                  onError={(e) => {
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
      
      {/* 快速操作 */}
      <div className="mt-8 flex justify-center gap-4">
        <Link 
          to="/batch" 
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Package className="h-4 w-4" />
          批量处理
        </Link>
        <button className="px-6 py-2 border border-primary text-primary rounded-md font-medium hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-sm">
          <FileImage className="h-4 w-4" />
          查看所有历史
        </button>
      </div>
    </div>
  );
} 