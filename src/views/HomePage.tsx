import React from 'react';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">欢迎使用图片压缩工具</h2>
      <p className="text-muted-foreground">
        这是一个简单易用的图片压缩工具，可以帮助您快速压缩图片文件大小，同时保持良好的图像质量。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg font-semibold mb-2">快速开始</h3>
          <p className="text-sm text-muted-foreground">
            拖拽图片到上传区域或点击"图片上传"开始使用。
          </p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm bg-card">
          <h3 className="text-lg font-semibold mb-2">核心功能</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>支持多种图片格式压缩</li>
            <li>批量处理多张图片</li>
            <li>压缩前后效果对比</li>
            <li>自定义压缩参数</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 