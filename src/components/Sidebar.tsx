import { Link, useLocation } from 'react-router-dom';
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
import { useState } from 'react';

const menuItems = [
  { name: '首页', icon: <Home className="h-5 w-5" />, path: '/' },
  { name: '图片处理', icon: <Upload className="h-5 w-5" />, path: '/upload' },
  { name: '压缩设置', icon: <Sliders className="h-5 w-5" />, path: '/settings/compression' },
  { name: '效果对比', icon: <Images className="h-5 w-5" />, path: '/comparison' },
  { name: '批量处理', icon: <Package className="h-5 w-5" />, path: '/batch' },
  { name: '导出管理', icon: <Download className="h-5 w-5" />, path: '/export' },
  { name: '设置', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  { name: '帮助', icon: <HelpCircle className="h-5 w-5" />, path: '/help' },
];

export default function Sidebar() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="w-64 bg-secondary/50 dark:bg-muted p-5 border-r border-border transition-all duration-300 shadow-sm">
      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 relative overflow-hidden
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-accent hover:text-accent-foreground'}
              `}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span className={`transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {isActive && (
                <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-foreground"></span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-4 border-t border-border">
        <div className="bg-accent/50 rounded-lg p-3 text-xs text-center text-muted-foreground">
          <p className="font-medium text-foreground mb-1">专业图片压缩工具</p>
          <p>高效处理，节省存储空间</p>
        </div>
      </div>
    </div>
  );
} 