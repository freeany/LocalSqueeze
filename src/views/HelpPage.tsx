import React, { useState } from 'react';
import { Button } from '../components/ui';
import { Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const HelpPage: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('tutorial');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  // 切换FAQ展开/折叠状态
  const toggleFaq = (index: number) => {
    if (expandedFaqs.includes(index)) {
      setExpandedFaqs(expandedFaqs.filter(i => i !== index));
    } else {
      setExpandedFaqs([...expandedFaqs, index]);
    }
  };

  // 搜索功能
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 常见问题数据
  const faqs = [
    {
      question: '如何获得最佳压缩效果？',
      answer: (
        <div>
          <p>要获得最佳压缩效果，请考虑以下因素：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>针对不同类型的图片选择合适的压缩级别</li>
            <li>照片和自然图像通常可以使用较低的JPEG质量（60-75%）</li>
            <li>对于包含文本或线条的图像，PNG格式通常效果更好</li>
            <li>考虑使用WebP格式，它通常能在保持相似质量的同时提供更小的文件大小</li>
            <li>移除图片元数据可以进一步减小文件大小</li>
            <li>如果不需要原始尺寸，适当缩小图片尺寸也能显著减小文件大小</li>
          </ul>
        </div>
      ),
    },
    {
      question: '支持哪些图片格式？',
      answer: (
        <div>
          <p>本工具支持以下图片格式：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>JPEG/JPG</li>
            <li>PNG</li>
            <li>GIF（包括动态GIF）</li>
            <li>WebP</li>
            <li>BMP</li>
            <li>TIFF</li>
          </ul>
          <p className="mt-2">导出时，您可以选择保持原始格式或转换为JPEG、PNG或WebP格式。</p>
        </div>
      ),
    },
    {
      question: '压缩过程中会丢失图片质量吗？',
      answer: (
        <div>
          <p>图片压缩通常分为有损压缩和无损压缩：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>有损压缩</strong>：会丢失一些图像信息，但通常在视觉上很难察觉。压缩率高，文件体积小。</li>
            <li><strong>无损压缩</strong>：不会丢失图像信息，但压缩率相对较低。</li>
          </ul>
          <p className="mt-2">本工具默认使用有损压缩，但您可以通过调整压缩质量来平衡文件大小和图像质量。低压缩级别（高质量）下，肉眼几乎无法察觉质量损失。</p>
        </div>
      ),
    },
    {
      question: '图片压缩后会保留原始元数据吗？',
      answer: (
        <div>
          <p>默认情况下，本工具会移除图片元数据（如EXIF信息、GPS位置、相机信息等），以进一步减小文件大小。</p>
          <p className="mt-2">如果您需要保留这些信息，可以在压缩设置中取消选中"移除元数据"选项。</p>
        </div>
      ),
    },
    {
      question: '批量处理有数量限制吗？',
      answer: (
        <div>
          <p>本工具理论上没有批量处理的图片数量限制，但实际处理能力取决于您的计算机配置。</p>
          <p className="mt-2">对于大量图片（如100张以上），建议：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>分批处理，每批50-100张</li>
            <li>在高级设置中调整并行处理线程数，以平衡处理速度和系统负载</li>
            <li>关闭其他占用系统资源的应用程序</li>
          </ul>
        </div>
      ),
    },
    {
      question: '如何处理透明背景的图片？',
      answer: (
        <div>
          <p>对于带有透明背景的图片（通常是PNG或WebP格式）：</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>如果需要保留透明度，请选择PNG或WebP作为输出格式</li>
            <li>JPEG格式不支持透明度，会将透明部分转换为白色或其他背景色</li>
            <li>如果将透明PNG转换为WebP，通常可以获得更小的文件大小同时保留透明度</li>
          </ul>
        </div>
      ),
    },
  ];

  // 快捷键数据
  const shortcuts = [
    { function: '打开文件', key: 'Ctrl + O' },
    { function: '保存结果', key: 'Ctrl + S' },
    { function: '批量导出', key: 'Ctrl + E' },
    { function: '撤销操作', key: 'Ctrl + Z' },
    { function: '重做操作', key: 'Ctrl + Y' },
    { function: '删除选中图片', key: 'Delete' },
    { function: '全选图片', key: 'Ctrl + A' },
    { function: '放大图片', key: '+ 或 Ctrl + 滚轮上' },
    { function: '缩小图片', key: '- 或 Ctrl + 滚轮下' },
    { function: '切换深色/浅色模式', key: 'Ctrl + D' },
    { function: '打开设置', key: 'Ctrl + ,' },
    { function: '打开帮助', key: 'F1' },
  ];

  // 过滤搜索结果
  const filteredFaqs = searchQuery
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        React.isValidElement(faq.answer) && faq.answer.props && (
          Array.isArray((faq.answer.props as any).children) 
            ? (faq.answer.props as any).children.some(child => typeof child === 'string' && child.toLowerCase().includes(searchQuery.toLowerCase()))
            : typeof (faq.answer.props as any).children === 'string' && (faq.answer.props as any).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : faqs;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">帮助中心</h1>
        <p className="text-muted-foreground">获取使用图片压缩工具的帮助和支持。</p>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="搜索常见问题..."
          className="w-full pl-10 py-2 border border-input rounded-md bg-background"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* 标签页导航 */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'tutorial'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:rounded-t-md'
          }`}
          onClick={() => setActiveTab('tutorial')}
        >
          使用教程
        </button>
        <button
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'faq'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:rounded-t-md'
          }`}
          onClick={() => setActiveTab('faq')}
        >
          常见问题
        </button>
        <button
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'shortcuts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:rounded-t-md'
          }`}
          onClick={() => setActiveTab('shortcuts')}
        >
          快捷键
        </button>
        <button
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'contact'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:rounded-t-md'
          }`}
          onClick={() => setActiveTab('contact')}
        >
          联系支持
        </button>
      </div>

      {/* 使用教程内容 */}
      {activeTab === 'tutorial' && (
        <div className="space-y-8">
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">快速入门教程</h2>
            
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-3">1</div>
                <h3 className="text-lg font-semibold">上传图片</h3>
              </div>
              <div className="ml-11">
                <p>您可以通过拖拽图片到上传区域，或点击"选择文件"按钮来上传图片。支持JPG、PNG、GIF、WebP等常见图片格式。</p>
                {/* <div className="my-4 bg-muted rounded-md p-2 text-center text-muted-foreground">[图片上传示例]</div> */}
                <p>上传完成后，您可以在列表中看到所有已上传的图片，包括它们的预览缩略图和基本信息。</p>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-3">2</div>
                <h3 className="text-lg font-semibold">配置压缩设置</h3>
              </div>
              <div className="ml-11">
                <p>在压缩设置页面，您可以选择预设压缩级别（低、中、高）或自定义压缩参数。</p>
                {/* <div className="my-4 bg-muted rounded-md p-2 text-center text-muted-foreground">[压缩设置示例]</div> */}
                <p>主要设置项包括：</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>压缩质量：调整图片的压缩程度，数值越低文件越小，但可能影响图像质量</li>
                  <li>图像尺寸：可选择保持原始尺寸或调整为新尺寸</li>
                  <li>输出格式：可保持原始格式或转换为其他格式</li>
                  <li>高级选项：如移除元数据、优化颜色等</li>
                </ul>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-3">3</div>
                <h3 className="text-lg font-semibold">查看压缩效果</h3>
              </div>
              <div className="ml-11">
                <p>应用压缩设置后，您可以查看压缩前后的效果对比。支持并排对比和滑动对比两种方式。</p>
                {/* <div className="my-4 bg-muted rounded-md p-2 text-center text-muted-foreground">[效果对比示例]</div> */}
                <p>在对比页面，您可以看到：</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>压缩前后的文件大小对比</li>
                  <li>节省的空间百分比</li>
                  <li>图像尺寸信息</li>
                  <li>放大/缩小功能，查看细节差异</li>
                </ul>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-3">4</div>
                <h3 className="text-lg font-semibold">导出压缩结果</h3>
              </div>
              <div className="ml-11">
                <p>确认压缩效果后，您可以导出压缩后的图片。在导出页面，您可以：</p>
                {/* <div className="my-4 bg-muted rounded-md p-2 text-center text-muted-foreground">[导出设置示例]</div> */}
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>选择保存位置</li>
                  <li>设置文件命名规则</li>
                  <li>选择是否创建子文件夹</li>
                  <li>批量导出多张图片</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">批量处理教程</h2>
            <p>图片处理功能支持单个处理或批量处理多张图片，应用相同的压缩设置。</p>
            {/* <div className="my-4 bg-muted rounded-md p-2 text-center text-muted-foreground">[批量处理示例]</div> */}
            <p>使用批量处理功能的步骤：</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>上传多张图片</li>
              <li>选择所有需要处理的图片</li>
              <li>配置压缩设置</li>
              <li>点击"开始处理"按钮</li>
              <li>等待处理完成</li>
              <li>导出所有结果</li>
            </ol>
            <p className="mt-2">批量处理支持并行压缩，可以大大提高处理效率。</p>
          </div>
        </div>
      )}

      {/* 常见问题内容 */}
      {activeTab === 'faq' && (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">常见问题解答</h2>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-4 last:border-0">
                  <button
                    className="w-full text-left font-medium py-2 flex justify-between items-center hover:text-primary"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {expandedFaqs.includes(index) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  {expandedFaqs.includes(index) && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>没有找到匹配的问题，请尝试其他关键词。</p>
            </div>
          )}
        </div>
      )}

      {/* 快捷键内容 */}
      {activeTab === 'shortcuts' && (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">键盘快捷键</h2>
          <p className="mb-4">使用以下键盘快捷键可以提高操作效率：</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left py-3 px-4 font-semibold">功能</th>
                  <th className="text-left py-3 px-4 font-semibold">快捷键</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((shortcut, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{shortcut.function}</td>
                    <td className="py-3 px-4">
                      {shortcut.key.split(' + ').map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && <span className="mx-1">+</span>}
                          <span className="inline-block px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
                            {key}
                          </span>
                        </React.Fragment>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 联系支持内容 */}
      {activeTab === 'contact' && (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">联系支持</h2>
          <p className="mb-4">如果您在使用过程中遇到问题或需要帮助，可以通过以下方式联系我们：</p>
          
          <div className="bg-muted/50 p-4 rounded-md mb-6">
            <p className="mb-2"><strong>电子邮件：</strong> <a href="https://github.com/freeany/LocalSqueeze" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              GitHub 主页
              <ExternalLink className="h-3 w-3 ml-1" />
            </a></p>
            <p className="mb-2"><strong>官方网站：</strong> <a href="https://github.com/freeany/LocalSqueeze" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              GitHub 主页
              <ExternalLink className="h-3 w-3 ml-1" />
            </a></p>
            <p><strong>反馈问题：</strong> <a href="https://github.com/freeany/LocalSqueeze" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              GitHub 主页
              <ExternalLink className="h-3 w-3 ml-1" />
            </a></p>
          </div>
          
          <p className="mb-4">您也可以查看我们的在线文档获取更详细的使用指南：</p>
          <Button variant="default" className="flex items-center" onClick={() => window.open('https://github.com/freeany/LocalSqueeze', '_blank')}>
            查看在线文档
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="mt-8 pt-4 border-t border-border">
            <h3 className="text-lg font-bold mb-2">关于</h3>
            <p>© 2025 图片压缩工具 v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;