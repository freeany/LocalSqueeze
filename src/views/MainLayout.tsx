import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MoonIcon, SunIcon } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (!isMounted) return null; // 避免初始渲染闪烁

  return (
    <div className={`h-full bg-background transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col h-full bg-background text-foreground shadow-xl overflow-hidden">
        {/* 顶部导航栏 - 固定 */}
        <header className="bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center shadow-md z-10 sticky top-0">
          <div className="text-2xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            图片压缩工具
          </div>
          <ThemeToggle />
        </header>
        
        {/* 主内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 侧边栏 - 固定，不随内容滚动 */}
          <aside className="w-64 overflow-x-hidden border-r border-border flex-shrink-0 h-full overflow-y-auto">
            <Sidebar />
          </aside>
          
          {/* 内容区域 - 可滚动 */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
        
        {/* 页脚 */}
        <footer className="bg-muted py-4 px-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
          <div className="flex justify-center items-center gap-2">
            <span>图片压缩工具 v1.0.0 © {new Date().getFullYear()}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
            <span>高效 · 简洁 · 专业</span>
          </div>
        </footer>
      </div>
    </div>
  );
} 