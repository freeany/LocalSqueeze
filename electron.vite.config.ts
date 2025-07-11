import { defineConfig } from 'electron-vite';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/main.ts')
        },
        external: ['sharp']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          preload: path.resolve(__dirname, 'src/preload.ts')
        }
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html')
        }
      }
    }
  }
}); 