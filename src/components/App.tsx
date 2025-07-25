import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import MainLayout from '../views/MainLayout';
import HomePage from '../views/HomePage';
import ImageProcessPage from '../views/ImageProcessPage';
import CompressionSettings from '../views/CompressionSettings';
import ComparisonPage from '../views/ComparisonPage';
import ExportPage from '../views/ExportPage';
import HelpPage from '../views/HelpPage';

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
          <Route path="process" element={<ImageProcessPage />} />
          <Route path="settings" element={<CompressionSettings />} />
          <Route path="comparison" element={<ComparisonPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </RouterComponent>
  );
}
