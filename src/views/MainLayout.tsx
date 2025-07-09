import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MoonIcon, SunIcon } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // 实际应用中，这里会更改文档的类名或使用主题上下文
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col min-h-screen max-w-7xl mx-auto bg-white dark:bg-gray-900 shadow-md">
        {/* 顶部导航栏 */}
        <header className="bg-primary text-primary-foreground px-5 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">图片压缩工具</div>
          <ThemeToggle />
        </header>
        
        {/* 主内容区域 */}
        <div className="flex flex-1">
          {/* 侧边栏 */}
          <Sidebar />
          
          {/* 内容区域 */}
          <main className="flex-1 p-5">
            <Outlet />
          </main>
        </div>
        
        {/* 页脚 */}
        <footer className="bg-muted py-4 px-5 text-center text-sm text-muted-foreground">
          图片压缩工具 v1.0.0 © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
} 