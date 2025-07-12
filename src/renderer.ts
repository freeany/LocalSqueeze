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

// 阻止所有到localhost的请求
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : '';
  
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.warn('阻止了对localhost的请求:', url);
    return Promise.reject(new Error('在生产环境中不允许请求localhost'));
  }
  
  return originalFetch.call(this, input, init);
};

// 重写XMLHttpRequest以阻止localhost请求
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(
  method: string, 
  url: string | URL, 
  async = true, 
  username?: string, 
  password?: string
): void {
  if (typeof url === 'string' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    console.warn('阻止了对localhost的XHR请求:', url);
    throw new Error('在生产环境中不允许请求localhost');
  }
  
  return originalXHROpen.call(this, method, url, async, username, password);
};

// 添加全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});