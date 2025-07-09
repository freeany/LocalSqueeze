import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../views/MainLayout';
import HomePage from '../views/HomePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<div>图片上传页面</div>} />
          <Route path="settings/compression" element={<div>压缩设置页面</div>} />
          <Route path="comparison" element={<div>效果对比页面</div>} />
          <Route path="batch" element={<div>批量处理页面</div>} />
          <Route path="export" element={<div>导出管理页面</div>} />
          <Route path="settings" element={<div>设置页面</div>} />
          <Route path="help" element={<div>帮助页面</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
