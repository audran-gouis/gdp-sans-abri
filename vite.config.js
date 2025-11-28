import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';

// Fonction pour copier récursivement un dossier
function copyFolderSync(src, dest) {
  if (!existsSync(src)) return;
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  
  for (const item of readdirSync(src)) {
    const srcPath = resolve(src, item);
    const destPath = resolve(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyDirFirst: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  plugins: [
    {
      name: 'copy-fonctionnalites',
      closeBundle() {
        console.log('📦 Copie des fichiers fonctionnalites...');
        copyFolderSync('fonctionnalites', 'dist/fonctionnalites');
        copyFileSync('renderer.js', 'dist/renderer.js');
        if (existsSync('preload.js')) {
          copyFileSync('preload.js', 'dist/preload.js');
        }
        console.log('✅ Fichiers copiés dans dist/');
      }
    }
  ]
});