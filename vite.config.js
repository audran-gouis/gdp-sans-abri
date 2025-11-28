import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process entry
        entry: 'main.js',
      },
    ]),
    renderer(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: './index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@modules': '/modules'
    }
  }
});


import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process entry
        entry: 'main.js',
      },
    ]),
    renderer(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: './index.html'
      }
    }
  },
  resolve: {
    alias: {
      '@modules': '/modules'
    }
  }
});




