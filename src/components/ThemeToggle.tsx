import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm font-medium">
        {isDarkMode ? '深色' : '浅色'}
      </span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-7 w-12 items-center rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
      >
        <span
          className={`
            ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}
            ${isAnimating ? 'animate-spin' : ''}
            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out
          `}
        >
          <div className="flex h-full w-full items-center justify-center">
            {isDarkMode ? (
              <MoonIcon className="h-4 w-4 text-primary" />
            ) : (
              <SunIcon className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </span>
      </button>
    </div>
  );
} 