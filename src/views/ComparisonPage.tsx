import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { CompressionResult } from '../types/global';
import ComparisonView from '../components/ComparisonView';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 加载压缩结果
  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        setIsLoading(true);
        console.log('开始加载压缩结果');
        
        // 直接从主进程获取最近处理的图片
        console.log('从stats API获取最近处理的图片');
        if (window.stats) {
          console.log('调用window.stats.getRecentImages(5)');
          const recentImages = await window.stats.getRecentImages(5);
          console.log('获取到最近处理的图片:', recentImages);
          
          if (recentImages && recentImages.success && recentImages.images && recentImages.images.length > 0) {
            // 将 ProcessedImage 转换为 CompressionResult 格式
            const convertedResults: CompressionResult[] = recentImages.images.map(img => ({
              success: true,
              originalPath: img.originalPath,
              outputPath: img.outputPath,
              originalSize: img.originalSize,
              compressedSize: img.compressedSize,
              compressionRate: img.compressionRate,
              width: img.width,
              height: img.height,
              outputFormat: img.format
            }));
            
            console.log('转换后的结果:', convertedResults);
            setResults(convertedResults);
          } else {
            console.error('没有找到可用的压缩结果', recentImages);
            setError('没有找到可用的压缩结果，请先压缩图片');
          }
        } else {
          console.error('window.stats API不可用');
          setError('无法访问统计数据 API');
        }
      } catch (err) {
        console.error('加载压缩结果失败:', err);
        setError(`加载压缩结果失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadComparisonData();
  }, []);

  // 处理重新压缩
  const handleRecompress = () => {
    navigate('/process');
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">加载压缩结果...</p>
      </div>
    );
  }

  // 显示错误信息
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">加载失败</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={() => navigate('/process')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          上传并压缩图片
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <ComparisonView results={results} onRecompress={handleRecompress} />
    </div>
  );
} 