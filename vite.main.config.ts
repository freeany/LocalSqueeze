import { defineConfig } from 'vite';
import { builtinModules } from 'module';
// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // 确保sharp不被打包，而是作为外部依赖
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
});
