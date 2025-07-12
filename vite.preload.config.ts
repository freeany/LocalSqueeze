import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist-electron/preload',
    minify: false, // 不要压缩预加载脚本，以便于调试
    sourcemap: 'inline', // 添加内联源映射，以便于调试
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
      ],
      output: {
        format: 'cjs', // 使用CommonJS格式
        entryFileNames: '[name].js',
      }
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}); 