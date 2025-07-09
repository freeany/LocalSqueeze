import { useState } from 'react';

export default function CompressionSettings() {
  // 压缩预设状态
  const [activePreset, setActivePreset] = useState<string>('低压缩');
  // 压缩质量状态
  const [compressionQuality, setCompressionQuality] = useState<number>(70);
  // 保持原始尺寸状态
  const [keepDimensions, setKeepDimensions] = useState<boolean>(true);
  // 图像尺寸状态
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  // 保持比例状态
  const [keepRatio, setKeepRatio] = useState<boolean>(true);
  // 高级选项状态
  const [advancedOptions, setAdvancedOptions] = useState({
    removeMetadata: true,
    optimizeColors: false,
    progressive: false,
  });
  // 输出格式状态
  const [keepFormat, setKeepFormat] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('PNG');
  // 文件命名状态
  const [fileNaming, setFileNaming] = useState<string>('{filename}_compressed');
  const [fileExtension, setFileExtension] = useState<string>('.{ext}');

  // 示例图片
  const sampleImages = [
    'https://via.placeholder.com/100',
    'https://via.placeholder.com/100',
    'https://via.placeholder.com/100',
  ];
  const [activeImage, setActiveImage] = useState<number>(0);

  // 处理预设点击
  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    
    // 根据预设更新其他设置
    switch (preset) {
      case '低压缩':
        setCompressionQuality(80);
        break;
      case '中等压缩':
        setCompressionQuality(60);
        break;
      case '高压缩':
        setCompressionQuality(40);
        break;
      case '自定义':
        // 保持当前设置
        break;
    }
  };

  // 处理尺寸变化
  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    
    if (keepRatio && dimensions.width > 0 && dimensions.height > 0) {
      const ratio = dimensions.width / dimensions.height;
      
      if (dimension === 'width') {
        setDimensions({
          width: numValue,
          height: Math.round(numValue / ratio),
        });
      } else {
        setDimensions({
          width: Math.round(numValue * ratio),
          height: numValue,
        });
      }
    } else {
      setDimensions({
        ...dimensions,
        [dimension]: numValue,
      });
    }
  };

  // 处理高级选项变化
  const handleAdvancedOptionChange = (option: keyof typeof advancedOptions) => {
    setAdvancedOptions({
      ...advancedOptions,
      [option]: !advancedOptions[option],
    });
  };

  // 处理下一步按钮点击
  const handleNextStep = () => {
    // 这里可以添加导航到效果对比页面的逻辑
    console.log('应用设置并预览效果');
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-2">压缩设置</h2>
      <p className="text-muted-foreground mb-6">配置图片压缩参数，选择合适的压缩级别和输出选项。</p>
      
      {/* 缩略图容器 */}
      <div className="flex overflow-x-auto gap-4 mb-6 pb-2">
        {sampleImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`图片${index + 1}`} 
            className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 transition-all ${activeImage === index ? 'border-primary shadow-sm' : 'border-transparent'}`}
            onClick={() => setActiveImage(index)}
          />
        ))}
      </div>
      
      <div className="space-y-6">
        {/* 压缩预设卡片 */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <h3 className="text-lg font-semibold">压缩预设</h3>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {['低压缩', '中等压缩', '高压缩', '自定义'].map((preset) => (
              <button
                key={preset}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  activePreset === preset 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-muted border-border hover:bg-muted/80'
                }`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
          
          {/* 压缩质量滑块 */}
          <div className="mb-6">
            <label className="block font-medium mb-1">压缩质量</label>
            <p className="text-sm text-muted-foreground mb-2">调整压缩质量，数值越低文件越小，但图像质量可能降低</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={compressionQuality}
                onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer"
              />
              <span className="font-medium w-12 text-center">{compressionQuality}%</span>
            </div>
          </div>
          
          {/* 图像尺寸 */}
          <div className="mb-6">
            <label className="block font-medium mb-1">图像尺寸</label>
            <p className="text-sm text-muted-foreground mb-2">调整输出图像的尺寸</p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="keep-dimensions"
                checked={keepDimensions}
                onChange={() => setKeepDimensions(!keepDimensions)}
                className="rounded border-border"
              />
              <label htmlFor="keep-dimensions">保持原始尺寸</label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="宽度"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                disabled={keepDimensions}
                className="w-24 px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
              />
              <span>×</span>
              <input
                type="text"
                placeholder="高度"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                disabled={keepDimensions}
                className="w-24 px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
              />
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="checkbox"
                  id="keep-ratio"
                  checked={keepRatio}
                  onChange={() => setKeepRatio(!keepRatio)}
                  disabled={keepDimensions}
                  className="rounded border-border disabled:opacity-50"
                />
                <label htmlFor="keep-ratio" className={keepDimensions ? 'opacity-50' : ''}>保持比例</label>
              </div>
            </div>
          </div>
          
          {/* 高级选项 */}
          <div>
            <label className="block font-medium mb-1">高级选项</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remove-metadata"
                  checked={advancedOptions.removeMetadata}
                  onChange={() => handleAdvancedOptionChange('removeMetadata')}
                  className="rounded border-border"
                />
                <label htmlFor="remove-metadata">移除元数据</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="optimize-colors"
                  checked={advancedOptions.optimizeColors}
                  onChange={() => handleAdvancedOptionChange('optimizeColors')}
                  className="rounded border-border"
                />
                <label htmlFor="optimize-colors">优化颜色</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="progressive"
                  checked={advancedOptions.progressive}
                  onChange={() => handleAdvancedOptionChange('progressive')}
                  className="rounded border-border"
                />
                <label htmlFor="progressive">渐进式加载</label>
              </div>
            </div>
          </div>
        </div>
        
        {/* 输出格式卡片 */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
            <h3 className="text-lg font-semibold">输出格式</h3>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="keep-format"
                checked={keepFormat}
                onChange={() => setKeepFormat(!keepFormat)}
                className="rounded border-border"
              />
              <label htmlFor="keep-format">保持原始格式</label>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {['JPEG', 'PNG', 'WebP', 'GIF'].map((format) => (
                <button
                  key={format}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    outputFormat === format && !keepFormat
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-muted border-border hover:bg-muted/80'
                  } ${keepFormat ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !keepFormat && setOutputFormat(format)}
                  disabled={keepFormat}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          
          {/* 文件命名 */}
          <div>
            <label className="block font-medium mb-1">文件命名</label>
            <p className="text-sm text-muted-foreground mb-2">设置压缩后的文件命名规则</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={fileNaming}
                onChange={(e) => setFileNaming(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-border bg-background"
              />
              <select
                value={fileExtension}
                onChange={(e) => setFileExtension(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value=".{ext}">.{'{ext}'}</option>
                <option value=".jpg">.jpg</option>
                <option value=".png">.png</option>
                <option value=".webp">.webp</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex justify-between mt-8">
        <button 
          className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
          onClick={() => window.history.back()}
        >
          返回上一步
        </button>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={handleNextStep}
        >
          应用设置并预览效果
        </button>
      </div>
    </div>
  );
} 