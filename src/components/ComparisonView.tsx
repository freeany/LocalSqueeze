import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Plus, Minus, Maximize, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatFileSize, calculateCompressionRate } from '../lib/utils';
// eslint-disable-next-line import/no-unresolved
import { CompressionResult } from '../types/global';

interface ComparisonViewProps {
  results: CompressionResult[];
  onRecompress?: () => void;
}

export default function ComparisonView({ results, onRecompress }: ComparisonViewProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  // 当前选中的压缩结果
  const currentResult = results[activeIndex];
  
  // 处理缩放
  const handleZoom = (action: 'in' | 'out' | 'reset') => {
    if (action === 'in') {
      setZoom(prev => Math.min(prev + 0.25, 3));
    } else if (action === 'out') {
      setZoom(prev => Math.max(prev - 0.25, 0.5));
    } else {
      setZoom(1);
    }
  };
  
  // 处理滑块拖动开始
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
  };
  
  // 处理滑块拖动
  const handleSliderMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !sliderContainerRef.current) return;
    
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);
  
  // 处理滑块拖动结束
  const handleSliderMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  
  // 添加和移除全局事件监听器
  useEffect(() => {
    document.addEventListener('mousemove', handleSliderMouseMove);
    document.addEventListener('mouseup', handleSliderMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleSliderMouseMove);
      document.removeEventListener('mouseup', handleSliderMouseUp);
    };
  }, [handleSliderMouseMove, handleSliderMouseUp]);
  
  // 处理下载压缩后的图片
  const handleDownload = async () => {
    if (!currentResult) return;
    
    try {
      // 使用原始文件名作为建议名称
      const fileName = currentResult.outputPath.split(/[\\/]/).pop() || 'compressed-image';
      await window.electron.ipcRenderer.invoke('save-file', {
        sourcePath: currentResult.outputPath,
        suggestedName: fileName
      });
    } catch (error) {
      console.error('下载文件时出错:', error);
      alert('保存文件失败');
    }
  };
  
  // 处理导航到上一张/下一张图片
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else {
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    }
  };
  
  // 如果没有结果，显示空状态
  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-4xl mb-4">🖼️</div>
        <h3 className="text-xl font-bold mb-2">没有可对比的图片</h3>
        <p className="text-muted-foreground mb-6">请先上传并压缩图片，然后查看效果对比</p>
        <button 
          onClick={() => navigate('/process')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          上传图片
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-2">效果对比</h2>
      <p className="text-muted-foreground mb-6">查看压缩前后的图片效果对比，确认压缩质量是否满足需求</p>
      
      {/* 缩略图导航 */}
      {results.length > 1 && (
        <div className="flex overflow-x-auto gap-4 pb-4 mb-6">
          {results.map((result, index) => (
            <div 
              key={result.originalPath} 
              className={`relative cursor-pointer flex-shrink-0 ${activeIndex === index ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <img 
                src={`file://${result.originalPath}`} 
                alt={`缩略图 ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center truncate rounded-b-md">
                {result.originalPath.split(/[\\/]/).pop()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 当前图片信息和操作 */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold">
          {currentResult.originalPath.split(/[\\/]/).pop()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRecompress}
            className="flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm"
          >
            <RefreshCw size={16} />
            重新压缩
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm"
          >
            <Download size={16} />
            保存结果
          </button>
        </div>
      </div>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-card p-4 rounded-lg shadow-sm">
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
          <div className="text-2xl font-bold">{formatFileSize(currentResult.originalSize)}</div>
          <div className="text-sm text-muted-foreground">原始大小</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
          <div className="text-2xl font-bold">{formatFileSize(currentResult.compressedSize)}</div>
          <div className="text-sm text-muted-foreground">压缩后大小</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
          <div className="text-2xl font-bold text-green-600">-{currentResult.compressionRate}</div>
          <div className="text-sm text-muted-foreground">节省空间</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
          <div className="text-2xl font-bold">{currentResult.width}×{currentResult.height}</div>
          <div className="text-sm text-muted-foreground">图片尺寸</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
          <div className="text-2xl font-bold">{currentResult.outputFormat.toUpperCase()}</div>
          <div className="text-sm text-muted-foreground">文件格式</div>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
          <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
          <div className="text-sm text-muted-foreground">处理日期</div>
        </div>
      </div>
      
      {/* 对比模式切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('side-by-side')}
          className={`px-3 py-1.5 rounded-md text-sm ${
            viewMode === 'side-by-side' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          并排对比
        </button>
        <button
          onClick={() => setViewMode('slider')}
          className={`px-3 py-1.5 rounded-md text-sm ${
            viewMode === 'slider' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          滑动对比
        </button>
      </div>
      
      {/* 图片导航（上一张/下一张） */}
      {results.length > 1 && (
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigateImage('prev')}
            disabled={activeIndex === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
              activeIndex === 0 
                ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <ArrowLeft size={16} />
            上一张
          </button>
          <div className="text-sm text-muted-foreground">
            {activeIndex + 1} / {results.length}
          </div>
          <button
            onClick={() => navigateImage('next')}
            disabled={activeIndex === results.length - 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
              activeIndex === results.length - 1 
                ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            下一张
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      
      {/* 对比视图 */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 原始图片 */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-muted/30">
              <div className="font-medium">原始图片</div>
              <div className="text-sm text-muted-foreground">{formatFileSize(currentResult.originalSize)}</div>
            </div>
            <div className="relative h-[400px] overflow-auto bg-[#f0f0f0] dark:bg-[#1a1a1a]">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="min-h-full min-w-full">
                <img 
                  src={`file://${currentResult.originalPath}`} 
                  alt="原始图片" 
                  className="max-w-none"
                />
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1">
                <button
                  onClick={() => handleZoom('in')}
                  className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* 压缩后图片 */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-muted/30">
              <div className="font-medium">压缩后图片</div>
              <div className="text-sm text-muted-foreground">{formatFileSize(currentResult.compressedSize)}</div>
            </div>
            <div className="relative h-[400px] overflow-auto bg-[#f0f0f0] dark:bg-[#1a1a1a]">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="min-h-full min-w-full">
                <img 
                  src={`file://${currentResult.outputPath}`} 
                  alt="压缩后图片" 
                  className="max-w-none"
                />
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1">
                <button
                  onClick={() => handleZoom('in')}
                  className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 滑动对比视图
        <div className="border border-border rounded-lg overflow-hidden mb-6">
          <div className="flex justify-between items-center p-3 bg-muted/30">
            <div className="font-medium">滑动对比</div>
            <div className="text-sm text-muted-foreground">
              原始: {formatFileSize(currentResult.originalSize)} | 
              压缩后: {formatFileSize(currentResult.compressedSize)} | 
              节省: {currentResult.compressionRate}
            </div>
          </div>
          <div 
            ref={sliderContainerRef}
            className="relative h-[500px] bg-[#f0f0f0] dark:bg-[#1a1a1a] overflow-hidden"
          >
            {/* 原始图片 */}
            <div className="absolute inset-0 overflow-auto">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="min-h-full min-w-full">
                <img 
                  src={`file://${currentResult.originalPath}`} 
                  alt="原始图片" 
                  className="max-w-none"
                />
              </div>
            </div>
            
            {/* 压缩后图片（带裁剪） */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="min-h-full min-w-full">
                <img 
                  src={`file://${currentResult.outputPath}`} 
                  alt="压缩后图片" 
                  className="max-w-none"
                />
              </div>
            </div>
            
            {/* 滑块 */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleSliderMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                ↔
              </div>
            </div>
            
            {/* 缩放控制 */}
            <div className="absolute bottom-3 right-3 flex gap-1">
              <button
                onClick={() => handleZoom('in')}
                className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => handleZoom('reset')}
                className="w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-md hover:bg-white dark:hover:bg-black/90"
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
} 