import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { builtinModules } from 'module';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process
        entry: 'src/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: [
                'electron',
                'sharp',
                ...builtinModules,
              ]
            }
          },
          // 确保正确处理原生模块
          optimizeDeps: {
            exclude: ['sharp']
          }
        },
      },
      {
        // Preload scripts
        entry: 'src/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
          }
        },
      }
    ]),
    // 使用renderer()来处理Electron渲染进程
    renderer(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}); 