import { Link } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Settings, 
  Sliders, 
  Images, 
  Package, 
  Download, 
  HelpCircle 
} from 'lucide-react';

const menuItems = [
  { name: '首页', icon: <Home className="h-5 w-5" />, path: '/' },
  { name: '图片上传', icon: <Upload className="h-5 w-5" />, path: '/upload' },
  { name: '压缩设置', icon: <Sliders className="h-5 w-5" />, path: '/settings/compression' },
  { name: '效果对比', icon: <Images className="h-5 w-5" />, path: '/comparison' },
  { name: '批量处理', icon: <Package className="h-5 w-5" />, path: '/batch' },
  { name: '导出管理', icon: <Download className="h-5 w-5" />, path: '/export' },
  { name: '设置', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  { name: '帮助', icon: <HelpCircle className="h-5 w-5" />, path: '/help' },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-muted/30 p-5 border-r">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 