import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { CompressionSettings as CompressionSettingsInterface } from '../types/global';

// 扩展压缩设置类型，添加可选属性
interface CompressionSettingsType extends CompressionSettingsInterface {
  width?: number;
  height?: number;
  outputFormat?: string;
}

export default function CompressionSettings() {
  // 导航钩子
  const navigate = useNavigate();
  
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
  
  // 加载状态
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 预览状态
  const [previewResult, setPreviewResult] = useState<{
    original: { size: string, dimensions: string },
    compressed: { size: string, dimensions: string, savings: string }
  } | null>(null);

  // 初始化加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // 从本地存储加载上次的设置
        const savedSettings = localStorage.getItem('compressionSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          
          // 应用保存的设置
          setActivePreset(settings.preset || '低压缩');
          setCompressionQuality(settings.quality || 70);
          setKeepDimensions(settings.keepDimensions !== undefined ? settings.keepDimensions : true);
          setDimensions({
            width: settings.width || 1920,
            height: settings.height || 1080
          });
          setKeepRatio(settings.keepRatio !== undefined ? settings.keepRatio : true);
          setAdvancedOptions({
            removeMetadata: settings.removeMetadata !== undefined ? settings.removeMetadata : true,
            optimizeColors: settings.optimizeColors || false,
            progressive: settings.progressive || false
          });
          setKeepFormat(settings.keepFormat !== undefined ? settings.keepFormat : true);
          setOutputFormat(settings.outputFormat || 'PNG');
          setFileNaming(settings.fileNaming || '{filename}_compressed');
          setFileExtension(settings.fileExtension || '.{ext}');
        } else {
          // 从后端获取默认预设
          if (window.compression) {
            const defaultSettings = await window.compression.getCompressionPreset('低压缩');
            applySettings(defaultSettings as CompressionSettingsType);
          }
        }
        
        // 生成预览结果
        generatePreview();
        
        setIsLoading(false);
      } catch (error) {
        console.error('加载压缩设置失败:', error);
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // 应用压缩设置
  const applySettings = (settings: CompressionSettingsType) => {
    setCompressionQuality(settings.quality);
    setKeepDimensions(settings.keepDimensions);
    setKeepFormat(settings.keepFormat);
    setAdvancedOptions({
      removeMetadata: settings.removeMetadata,
      optimizeColors: settings.optimizeColors,
      progressive: settings.progressive
    });
    
    // 如果有尺寸设置
    if (!settings.keepDimensions && settings.width && settings.height) {
      setDimensions({
        width: settings.width,
        height: settings.height
      });
    }
    
    // 如果有输出格式
    if (!settings.keepFormat && settings.outputFormat) {
      setOutputFormat(settings.outputFormat.toUpperCase());
    }
  };

  // 处理预设点击
  const handlePresetClick = async (preset: string) => {
    setActivePreset(preset);
    
    try {
      // 从后端获取预设设置
      if (window.compression) {
        const presetSettings = await window.compression.getCompressionPreset(preset);
        applySettings(presetSettings as CompressionSettingsType);
      } else {
        // 如果后端API不可用，使用前端预设
        switch (preset) {
          case '低压缩':
            setCompressionQuality(80);
            setAdvancedOptions({
              removeMetadata: true,
              optimizeColors: false,
              progressive: false
            });
            break;
          case '中等压缩':
            setCompressionQuality(60);
            setAdvancedOptions({
              removeMetadata: true,
              optimizeColors: true,
              progressive: true
            });
            break;
          case '高压缩':
            setCompressionQuality(40);
            setAdvancedOptions({
              removeMetadata: true,
              optimizeColors: true,
              progressive: true
            });
            break;
          case '自定义':
            // 保持当前设置
            break;
        }
      }
      
      // 更新预览
      generatePreview();
    } catch (error) {
      console.error(`应用预设 ${preset} 失败:`, error);
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
    
    // 更新预览
    generatePreview();
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };

  // 处理高级选项变化
  const handleAdvancedOptionChange = (option: keyof typeof advancedOptions) => {
    setAdvancedOptions({
      ...advancedOptions,
      [option]: !advancedOptions[option],
    });
    
    // 更新预览
    generatePreview();
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };
  
  // 处理质量变化
  const handleQualityChange = (value: number) => {
    setCompressionQuality(value);
    
    // 更新预览
    generatePreview();
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };
  
  // 处理保持尺寸变化
  const handleKeepDimensionsChange = () => {
    setKeepDimensions(!keepDimensions);
    
    // 更新预览
    generatePreview();
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };
  
  // 处理保持比例变化
  const handleKeepRatioChange = () => {
    setKeepRatio(!keepRatio);
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };
  
  // 处理保持格式变化
  const handleKeepFormatChange = () => {
    setKeepFormat(!keepFormat);
    
    // 更新预览
    generatePreview();
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };
  
  // 处理输出格式变化
  const handleOutputFormatChange = (format: string) => {
    setOutputFormat(format);
    
    // 更新预览
    generatePreview();
    
    // 切换到自定义预设
    if (activePreset !== '自定义') {
      setActivePreset('自定义');
    }
  };
  
  // 生成预览结果
  const generatePreview = async () => {
    try {
      // 模拟压缩结果
      // 在实际应用中，这里可以调用后端API进行实时预览
      setPreviewResult({
        original: {
          size: '1.2 MB',
          dimensions: '1920×1080'
        },
        compressed: {
          size: `${(1.2 * (1 - compressionQuality / 100)).toFixed(2)} MB`,
          dimensions: keepDimensions ? '1920×1080' : `${dimensions.width}×${dimensions.height}`,
          savings: `${Math.round(compressionQuality / 2)}%`
        }
      });
    } catch (error) {
      console.error('生成预览失败:', error);
    }
  };

  // 保存设置到本地存储
  const saveSettings = () => {
    try {
      const settings = {
        preset: activePreset,
        quality: compressionQuality,
        keepDimensions,
        width: dimensions.width,
        height: dimensions.height,
        keepRatio,
        removeMetadata: advancedOptions.removeMetadata,
        optimizeColors: advancedOptions.optimizeColors,
        progressive: advancedOptions.progressive,
        keepFormat,
        outputFormat,
        fileNaming,
        fileExtension
      };
      
      localStorage.setItem('compressionSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  // 处理下一步按钮点击
  const handleNextStep = () => {
    // 保存设置
    saveSettings();
    
    // 构建压缩设置对象
    const settings: CompressionSettingsType = {
      quality: compressionQuality,
      keepDimensions,
      keepFormat,
      removeMetadata: advancedOptions.removeMetadata,
      optimizeColors: advancedOptions.optimizeColors,
      progressive: advancedOptions.progressive
    };
    
    // 添加可选参数
    if (!keepDimensions) {
      settings.width = dimensions.width;
      settings.height = dimensions.height;
    }
    
    if (!keepFormat) {
      settings.outputFormat = outputFormat;
    }
    
    // 将设置保存到全局状态或传递给下一个页面
    // 这里可以使用状态管理库或URL参数
    
    // 导航到图片处理页面
    navigate('/process');
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-2">压缩设置</h2>
      <p className="text-muted-foreground mb-6">配置图片压缩参数，选择合适的压缩级别和输出选项。</p>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {/* 压缩预设卡片 */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
                <h3 className="text-lg font-semibold">压缩预设</h3>
                
                {/* 预览结果 */}
                {previewResult && (
                  <div className="text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">预计压缩率:</span>
                      <span className="font-medium text-primary">{previewResult.compressed.savings}</span>
                    </div>
                  </div>
                )}
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
                    onChange={(e) => handleQualityChange(parseInt(e.target.value))}
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
                    onChange={handleKeepDimensionsChange}
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
                      onChange={handleKeepRatioChange}
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
                    onChange={handleKeepFormatChange}
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
                      onClick={() => !keepFormat && handleOutputFormatChange(format)}
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
        </>
      )}
    </div>
  );
} 