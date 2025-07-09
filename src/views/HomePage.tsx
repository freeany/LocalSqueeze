import React from 'react';
import { Upload, Sliders, Images, Package, Search, Repeat, Smartphone, Lock, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  // 模拟统计数据
  const stats = {
    processedImages: 128,
    savedSpace: '256 MB',
    compressionRate: '72%',
    todayProcessed: 10
  };

  // 模拟最近处理的图片
  const recentImages = [
    {
      id: 1,
      name: 'vacation-photo.jpg',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '2.5 MB',
      compressedSize: '650 KB',
      compressionRate: '74%',
      date: '今天 14:30'
    },
    {
      id: 2,
      name: 'product-image.png',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '1.8 MB',
      compressedSize: '420 KB',
      compressionRate: '77%',
      date: '今天 13:15'
    },
    {
      id: 3,
      name: 'screenshot.jpg',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '1.2 MB',
      compressedSize: '350 KB',
      compressionRate: '71%',
      date: '昨天 18:45'
    },
    {
      id: 4,
      name: 'logo-design.png',
      thumbnail: 'https://via.placeholder.com/60',
      originalSize: '2.2 MB',
      compressedSize: '580 KB',
      compressionRate: '74%',
      date: '昨天 16:20'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      {/* 欢迎区域 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-primary mb-3">欢迎使用图片压缩工具</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          简单高效的图片压缩解决方案，帮助您减小图片文件大小，同时保持良好的图像质量
        </p>
      </div>
      
      {/* 上传区域 */}
      <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-card hover:border-primary hover:bg-accent/30 transition-all duration-300 cursor-pointer">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <p className="text-lg text-foreground">拖放图片到这里，或点击选择文件</p>
          <Link 
            to="/upload" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            图片处理
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            支持 JPG、PNG、GIF、WebP 等格式
          </p>
        </div>
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
          {recentImages.map((image) => (
            <div key={image.id} className="flex items-center p-4 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
              <img 
                src={image.thumbnail} 
                alt={image.name} 
                className="w-12 h-12 object-cover rounded-md mr-4" 
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{image.name}</div>
                <div className="text-xs text-muted-foreground">
                  {image.originalSize} → {image.compressedSize} (-{image.compressionRate}) · {image.date}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-border rounded hover:bg-accent transition-colors text-foreground">
                  重新处理
                </button>
                <button className="px-3 py-1 text-xs border border-border rounded hover:bg-accent transition-colors text-foreground">
                  打开位置
                </button>
              </div>
            </div>
          ))}
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