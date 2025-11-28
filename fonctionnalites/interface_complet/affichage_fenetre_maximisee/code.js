/**
 * Code métier - Interface : Affichage fenêtre maximisée
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function verifierFenetreMaximisee(electronApp) {
  const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return {
      isMaximized: win.isMaximized(),
      bounds: win.getBounds()
    };
  });
  return windowState.isMaximized;
}

async function verifierLargeurMinimale(electronApp, largeurMin) {
  const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win.getBounds();
  });
  console.log(`📏 Largeur fenêtre: ${windowState.width}px (min: ${largeurMin}px)`);
  return windowState.width >= largeurMin;
}

async function verifierHauteurMinimale(electronApp, hauteurMin) {
  const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win.getBounds();
  });
  console.log(`📏 Hauteur fenêtre: ${windowState.height}px (min: ${hauteurMin}px)`);
  return windowState.height >= hauteurMin;
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifierFenetreMaximisee,
    verifierLargeurMinimale,
    verifierHauteurMinimale
  };
}
