const { contextBridge, ipcRenderer } = require('electron');

// Exposer une API sécurisée au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // API disponible pour le renderer (actuellement vide mais prête pour extensions)
});

console.log('✅ Preload: electronAPI exposée');

