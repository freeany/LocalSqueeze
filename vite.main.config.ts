import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist-electron/main',
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    minify: false,
    rollupOptions: {
      external: [
        'electron',
        'sharp',
        ...builtinModules,
      ],
      output: {
        format: 'cjs',
      }
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