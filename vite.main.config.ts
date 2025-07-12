import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist-electron/main',
    rollupOptions: {
      external: [
        'electron',
        'sharp',
        ...builtinModules,
      ]
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // 确保正确处理原生模块
  optimizeDeps: {
    exclude: ['sharp']
  }
}); 