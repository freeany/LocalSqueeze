/**
 * 这是渲染进程的入口文件
 * 它会自动被Vite加载并在"renderer"上下文中运行
 */

import './index.css';
import './app';

// 添加调试信息
console.log('渲染进程初始化');
console.log('检查预加载脚本API是否可用:', {
  electron: !!window.electron,
  compression: !!window.compression,
  stats: !!window.stats
});

// 如果API不可用，输出更详细的调试信息
if (!window.stats || !window.compression || !window.electron) {
  console.error('预加载脚本API未正确加载!');
  console.log('window对象:', Object.keys(window));
}

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});