/**
 * 修复Sharp在Electron应用中的安装问题
 * 这个脚本会在打包前运行，确保Sharp正确安装
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取当前平台
const platform = process.platform;
const arch = process.arch;

console.log(`当前平台: ${platform}-${arch}`);
console.log('开始修复Sharp安装...');

try {
  // 删除现有的sharp模块
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules', 'sharp');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('删除现有Sharp模块...');
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  }

  // 根据平台安装正确版本的Sharp
  console.log('为当前平台重新安装Sharp...');
  
  // 使用pnpm安装sharp
  execSync('pnpm install sharp@0.34.3 --force', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  // 为Electron重新编译Sharp
  console.log('为Electron重新编译Sharp...');
  execSync('pnpm exec electron-rebuild -f -w sharp', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  console.log('Sharp修复完成！');
} catch (error) {
  console.error('修复Sharp时出错:', error);
  process.exit(1);
} 