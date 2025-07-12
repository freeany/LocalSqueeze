import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-unresolved
import electron from 'vite-plugin-electron/simple';
import renderer from 'vite-plugin-electron-renderer';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { builtinModules } from 'module';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`
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
      preload: {
        // Shortcut of `build.rollupOptions.input`
        input: 'src/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
          }
        },
      },
      // 可选: 在渲染进程中使用 Node.js API
      renderer: {},
    }),
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