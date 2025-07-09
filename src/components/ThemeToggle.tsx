import { useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // 在实际应用中，这里会更改文档的类名或使用主题上下文
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-sm">深色模式</span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={`${
            isDarkMode ? 'translate-x-5' : 'translate-x-0'
          } inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform`}
        >
          {isDarkMode ? (
            <MoonIcon className="h-4 w-4 text-primary" />
          ) : (
            <SunIcon className="h-4 w-4 text-amber-500" />
          )}
        </span>
      </button>
    </div>
  );
} 