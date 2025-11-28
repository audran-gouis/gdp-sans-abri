/**
 * Code métier - Navigation : Navigation vers Statistiques
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function cliquerOnglet(page, nom) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  const tabId = ongletMap[nom];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForTimeout(300);
}

async function verifierOngletActif(page, nom) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  const tabId = ongletMap[nom];
  return await page.isVisible(`#${tabId}-tab.active`);
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cliquerOnglet,
    verifierOngletActif
  };
}
