import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import MainLayout from '../views/MainLayout';
import HomePage from '../views/HomePage';
import ImageProcessPage from '../views/ImageProcessPage';
import CompressionSettings from '../views/CompressionSettings';

export default function App() {
  // 判断是否为生产环境
  const isProduction = !window.location.href.includes('localhost');
  
  // 使用HashRouter可以避免路径问题
  const RouterComponent = isProduction ? HashRouter : Router;
  
  return (
    <RouterComponent>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<ImageProcessPage />} />
          <Route path="settings/compression" element={<CompressionSettings />} />
          <Route path="comparison" element={<div>效果对比页面</div>} />
          <Route path="batch" element={<div>批量处理页面</div>} />
          <Route path="export" element={<div>导出管理页面</div>} />
          <Route path="settings" element={<div>设置页面</div>} />
          <Route path="help" element={<div>帮助页面</div>} />
        </Route>
      </Routes>
    </RouterComponent>
  );
}
