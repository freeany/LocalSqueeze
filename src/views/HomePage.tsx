import React from 'react';
import { Upload, Sliders, Images, Package, Search, Repeat, Smartphone, Lock, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
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