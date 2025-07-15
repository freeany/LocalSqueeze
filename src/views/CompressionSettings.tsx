import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { CompressionSettings as CompressionSettingsInterface } from '../types/global';
import { saveCompressionSettings, getCompressionSettings, buildCompressionSettings } from '../lib/utils';

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
        
        // 从配置文件加载上次的设置
        const settings = await getCompressionSettings();
        console.log('CompressionSettings组件加载设置:', settings);
        
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
          optimizeColors: settings.optimizeColors !== undefined ? settings.optimizeColors : false,
          progressive: settings.progressive !== undefined ? settings.progressive : false
        });
        
        // 确保keepFormat和outputFormat正确设置
        const keepFormatValue = settings.keepFormat !== undefined ? settings.keepFormat : true;
        setKeepFormat(keepFormatValue);
        
        // 确保输出格式正确设置，即使keepFormat为true
        if (settings.outputFormat) {
          setOutputFormat(settings.outputFormat.toUpperCase());
          console.log(`加载设置，输出格式: ${settings.outputFormat.toUpperCase()}, 保持原始格式: ${keepFormatValue}`);
        } else {
          setOutputFormat('PNG');
        }
        
        setFileNaming(settings.fileNaming || '{filename}_compressed');
        
        // 生成预览结果
        setTimeout(() => generatePreview(), 100);
        
        setIsLoading(false);
      } catch (error) {
        console.error('加载压缩设置失败:', error);
        setIsLoading(false);
        
        // 如果加载失败，使用默认设置
        setActivePreset('低压缩');
        setCompressionQuality(70);
        setKeepDimensions(true);
        setDimensions({ width: 1920, height: 1080 });
        setKeepRatio(true);
        setAdvancedOptions({ removeMetadata: true, optimizeColors: false, progressive: false });
        setKeepFormat(true);
        setOutputFormat('PNG');
        setFileNaming('{filename}_compressed');
      }
    };
    
    loadSettings();
  }, []);

  // 应用压缩设置
  const applySettings = (settings: CompressionSettingsType) => {
    setCompressionQuality(settings.quality);
    setKeepDimensions(settings.keepDimensions);
    setKeepFormat(settings.keepFormat);
    
    // 如果有尺寸设置
    if (!settings.keepDimensions && settings.width && settings.height) {
      setDimensions({
        width: settings.width,
        height: settings.height
      });
    }
    
    // 如果有输出格式
    if (!settings.keepFormat && settings.outputFormat) {
      // 在UI中显示大写的格式名称
      setOutputFormat(settings.outputFormat.toUpperCase());
      console.log(`设置输出格式为: ${settings.outputFormat.toUpperCase()}`);
    }
  };

  // 处理预设点击
  const handlePresetClick = async (preset: string) => {
    try {
      console.log('选择预设:', preset);
      
      // 设置活动预设
      setActivePreset(preset);
      
      // 从后端获取预设设置
      if (window.compression) {
        const presetSettings = await window.compression.getCompressionPreset(preset);
        // 修改预设设置，允许用户选择输出格式
        presetSettings.keepFormat = false;
        applySettings(presetSettings as CompressionSettingsType);
      } else {
        // 如果后端API不可用，使用前端预设
        switch (preset) {
          case '低压缩':
            setCompressionQuality(80); // 对应压缩率20%
            // 设置为false，允许用户选择输出格式
            setKeepFormat(false);
            break;
          case '中等压缩':
            setCompressionQuality(60); // 对应压缩率40%
            // 设置为false，允许用户选择输出格式
            setKeepFormat(false);
            break;
          case '高压缩':
            setCompressionQuality(40); // 对应压缩率60%
            // 设置为false，允许用户选择输出格式
            setKeepFormat(false);
            break;
          case '自定义':
            // 保持当前设置
            break;
        }
      }
      
      // 使用Promise和setTimeout确保状态更新后再保存
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 更新预览
      generatePreview();
      
      // 再次确保activePreset已更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 手动构建设置对象，确保使用最新的预设名称
      const compressionRate = preset === '低压缩' ? 20 : preset === '中等压缩' ? 40 : preset === '高压缩' ? 60 : 100 - compressionQuality;
      const quality = 100 - compressionRate;
      
      const settings = {
        preset: preset,
        quality: quality,
        keepDimensions,
        width: dimensions.width,
        height: dimensions.height,
        keepRatio,
        removeMetadata: advancedOptions.removeMetadata,
        optimizeColors: advancedOptions.optimizeColors,
        progressive: advancedOptions.progressive,
        // 设置为false，允许用户选择输出格式
        keepFormat: false,
        outputFormat: outputFormat.toLowerCase(), // 确保保存小写的格式名称
        fileNaming
      };
      
      console.log('直接保存预设设置:', settings);
      await saveCompressionSettings(settings);
      
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
    
    // 不再自动切换到自定义预设
    // 仅保存设置
    saveCurrentSettings();
  };

  // 处理高级选项变化
  const handleAdvancedOptionChange = (option: keyof typeof advancedOptions) => {
    setAdvancedOptions({
      ...advancedOptions,
      [option]: !advancedOptions[option],
    });
    
    // 更新预览
    generatePreview();
    
    // 不再自动切换到自定义预设
    // 仅保存设置
    saveCurrentSettings();
  };
  
  // 处理质量变化
  const handleQualityChange = (value: number) => {
    setCompressionQuality(value);
    
    // 直接构建设置对象并保存，避免使用状态中可能未更新的值
    const settings = {
      preset: activePreset,
      quality: value, // 使用传入的新值
      keepDimensions,
      width: dimensions.width,
      height: dimensions.height,
      keepRatio,
      removeMetadata: advancedOptions.removeMetadata,
      optimizeColors: advancedOptions.optimizeColors,
      progressive: advancedOptions.progressive,
      keepFormat,
      outputFormat: outputFormat.toLowerCase(),
      fileNaming
    };
    
    // 立即保存设置，然后更新预览
    saveCompressionSettings(settings).then(() => {
      generatePreview();
    });
  };
  
  // 处理保持尺寸变化
  const handleKeepDimensionsChange = () => {
    setKeepDimensions(!keepDimensions);
    
    // 更新预览
    generatePreview();
    
    // 不再自动切换到自定义预设
    // 仅保存设置
    saveCurrentSettings();
  };
  
  // 处理保持比例变化
  const handleKeepRatioChange = () => {
    setKeepRatio(!keepRatio);
    
    // 不再自动切换到自定义预设
    // 仅保存设置
    saveCurrentSettings();
  };
  
  // 处理保持格式变化
  const handleKeepFormatChange = () => {
    const newKeepFormat = !keepFormat;
    setKeepFormat(newKeepFormat);
    
    // 直接构建设置对象并保存，避免使用状态中可能未更新的值
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
      keepFormat: newKeepFormat, // 使用新的值
      outputFormat: outputFormat.toLowerCase(),
      fileNaming
    };
    
    // 立即保存设置，然后更新预览
    saveCompressionSettings(settings).then(() => {
      generatePreview();
    });
  };
  
  // 处理输出格式变化
  const handleOutputFormatChange = (format: string) => {
    // 在UI中显示大写格式
    setOutputFormat(format.toUpperCase());
    console.log(`输出格式变更为: ${format.toUpperCase()} (保存为小写)`);
    
    // 确保设置keepFormat为false，允许选择输出格式
    setKeepFormat(false);
    
    // 切换到自定义预设，确保设置能被保存
    setActivePreset('自定义');
    
    // 直接构建设置对象并保存，避免使用状态中可能未更新的值
    const settings = {
      preset: '自定义', // 强制设为自定义预设
      quality: compressionQuality,
      keepDimensions,
      width: dimensions.width,
      height: dimensions.height,
      keepRatio,
      removeMetadata: advancedOptions.removeMetadata,
      optimizeColors: advancedOptions.optimizeColors,
      progressive: advancedOptions.progressive,
      keepFormat: false, // 强制设为false，允许选择输出格式
      outputFormat: format.toLowerCase(), // 使用传入的format参数，确保正确保存
      fileNaming
    };
    
    console.log('保存输出格式设置:', settings);
    saveCompressionSettings(settings).then(() => {
      // 保存成功后更新预览
      generatePreview();
    });
  };
  
  // 处理文件命名变化
  const handleFileNamingChange = (value: string) => {
    console.log('文件命名变更前:', fileNaming);
    setFileNaming(value);
    console.log('文件命名变更后:', value);
    
    // 文件命名不应该影响预设类型，所以不再切换到自定义预设
    // 直接保存设置，不使用setTimeout延迟
    // 使用传入的value值而不是状态中的fileNaming，因为状态更新是异步的
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
      outputFormat: outputFormat.toLowerCase(),
      fileNaming: value // 使用传入的新值
    };
    
    console.log('保存文件命名设置:', value);
    saveCompressionSettings(settings);
  };
  
  // 生成预览结果
  const generatePreview = async () => {
    try {
      // 计算压缩率
      const compressionRate = 100 - compressionQuality;
      
      // 模拟压缩结果
      // 在实际应用中，这里可以调用后端API进行实时预览
      setPreviewResult({
        original: {
          size: '1.2 MB',
          dimensions: '1920×1080'
        },
        compressed: {
          size: `${(1.2 * (1 - compressionRate / 100)).toFixed(2)} MB`,
          dimensions: keepDimensions ? '1920×1080' : `${dimensions.width}×${dimensions.height}`,
          savings: `${compressionRate}%`
        }
      });
      
      // 不再自动保存设置，避免覆盖已保存的格式选择
    } catch (error) {
      console.error('生成预览失败:', error);
    }
  };

  // 保存当前设置到配置文件
  const saveCurrentSettings = async () => {
    try {
      // 获取当前最新状态
      console.log('当前预设:', activePreset);
      console.log('当前输出格式:', outputFormat);
      console.log('当前保持原始格式:', keepFormat);
      console.log('当前文件命名设置:', fileNaming);
      
      // 构建设置对象
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
        outputFormat: outputFormat.toLowerCase(), // 确保保存小写的格式名称
        fileNaming
      };
      
      console.log('保存设置到配置文件，输出格式:', settings.outputFormat);
      
      // 直接保存设置，不再进行额外检查
      console.log('最终保存的设置:', settings);
      await saveCompressionSettings(settings);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  // 获取当前压缩设置对象
  const getCurrentSettings = (): CompressionSettingsType => {
    return buildCompressionSettings({
      quality: compressionQuality,
      keepDimensions,
      width: dimensions.width,
      height: dimensions.height,
      keepFormat,
      outputFormat: outputFormat.toLowerCase(), // 确保使用小写格式
      removeMetadata: advancedOptions.removeMetadata,
      optimizeColors: advancedOptions.optimizeColors,
      progressive: advancedOptions.progressive,
      fileNaming,
    }) as CompressionSettingsType;
  };

  // 手动切换到自定义预设
  const switchToCustomPreset = () => {
    setActivePreset('自定义');
    saveCurrentSettings();
  };

  // 判断是否与预设设置不同
  const isCustomSettings = () => {
    try {
      // 根据当前预设获取标准设置
      if (activePreset === '自定义') {
        return true;
      }
      
      // 检查当前设置是否与预设不同
      const currentCompressionRate = 100 - compressionQuality;
      
      switch (activePreset) {
        case '低压缩':
          return currentCompressionRate !== 20;
        case '中等压缩':
          return currentCompressionRate !== 40;
        case '高压缩':
          return currentCompressionRate !== 60;
        default:
          return false;
      }
    } catch (error) {
      console.error('检查自定义设置失败:', error);
      return false;
    }
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
                {[
                  { name: '轻度压缩', value: '低压缩', compressionRate: 20, quality: 80 },
                  { name: '中度压缩', value: '中等压缩', compressionRate: 40, quality: 60 },
                  { name: '高度压缩', value: '高压缩', compressionRate: 60, quality: 40 }
                ].map((preset) => (
                  <button
                    key={preset.value}
                    className={`px-4 py-2 rounded-md border transition-colors ${
                      activePreset === preset.value 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted border-border hover:bg-muted/80'
                    }`}
                    onClick={() => handlePresetClick(preset.value)}
                  >
                    {preset.name}
                  </button>
                ))}
                <button
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    activePreset === '自定义' 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-muted border-border hover:bg-muted/80'
                  }`}
                  onClick={switchToCustomPreset}
                >
                  自定义
                </button>
              </div>
              
              {/* 预设说明 */}
              <div className="mb-4 text-sm text-muted-foreground">
                {activePreset === '低压缩' && (
                  <p>轻度压缩模式：压缩率20%，保持较高图像质量，适合需要高清晰度的场景。</p>
                )}
                {activePreset === '中等压缩' && (
                  <p>中度压缩模式：压缩率40%，在文件大小和图像质量之间取得平衡。</p>
                )}
                {activePreset === '高压缩' && (
                  <p>高度压缩模式：压缩率60%，获得更小文件大小，适合网络传输和存储空间受限的场景。</p>
                )}
                {activePreset === '自定义' && (
                  <p>自定义模式：根据您的需求自定义所有压缩参数。</p>
                )}
              </div>
              
              {/* 当前设置与预设不同时的提示 */}
              {activePreset !== '自定义' && isCustomSettings() && (
                <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md text-sm">
                  <p className="text-amber-700 dark:text-amber-300">
                    当前设置已与"{activePreset === '低压缩' ? '轻度压缩' : activePreset === '中等压缩' ? '中度压缩' : '高度压缩'}"预设不同。您可以点击"自定义"按钮保存为自定义设置。
                  </p>
                </div>
              )}
              
              {/* 压缩质量滑块 */}
              <div className="mb-6">
                <label className="block font-medium mb-1">压缩率</label>
                <p className="text-sm text-muted-foreground mb-2">调整压缩率，数值越高文件越小，但图像质量可能降低</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={100 - compressionQuality}
                    onChange={(e) => handleQualityChange(100 - parseInt(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                  <span className="font-medium w-12 text-center">{100 - compressionQuality}%</span>
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
                <p className="text-sm text-muted-foreground mb-2">这些功能暂时不开放</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remove-metadata"
                      checked={advancedOptions.removeMetadata}
                      onChange={() => handleAdvancedOptionChange('removeMetadata')}
                      className="rounded border-border"
                      disabled
                    />
                    <label htmlFor="remove-metadata" className="opacity-50">移除元数据</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="optimize-colors"
                      checked={advancedOptions.optimizeColors}
                      onChange={() => handleAdvancedOptionChange('optimizeColors')}
                      className="rounded border-border"
                      disabled
                    />
                    <label htmlFor="optimize-colors" className="opacity-50">优化颜色</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="progressive"
                      checked={advancedOptions.progressive}
                      onChange={() => handleAdvancedOptionChange('progressive')}
                      className="rounded border-border"
                      disabled
                    />
                    <label htmlFor="progressive" className="opacity-50">渐进式加载</label>
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
                        outputFormat.toUpperCase() === format.toUpperCase() && !keepFormat
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
                
                {/* 格式说明 */}
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="mb-1 font-medium">格式简介：</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 bg-muted/30 rounded-md">
                      <p className="font-medium">JPEG</p>
                      <p>照片最佳选择，高压缩率，不支持透明</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <p className="font-medium">PNG</p>
                      <p>无损压缩，支持透明，适合图标和截图</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <p className="font-medium">WebP</p>
                      <p>更小的文件体积，同时支持透明和高压缩</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <p className="font-medium">GIF</p>
                      <p>支持动画，256色限制，简单图像适用</p>
                    </div>
                  </div>
                  
                  <p className="mt-2 italic">
                    <span className="font-medium">提示：</span> 选择合适的格式可以获得最佳压缩效果
                  </p>
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
                    onChange={(e) => handleFileNamingChange(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-border bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}