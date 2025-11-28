/**
 * Code métier - Navigation : Navigation vers ADP
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
  console.log(`✅ Onglet "${nom}" cliqué`);
}

async function verifierOngletActif(page, nom) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  const tabId = ongletMap[nom];
  const buttonSelector = `button[data-tab="${tabId}"]`;
  const hasActiveClass = await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    return button.classList.contains('active');
  }, buttonSelector);
  console.log(`✅ Onglet "${nom}" ${hasActiveClass ? 'actif' : 'inactif'}`);
  return hasActiveClass;
}

async function verifierOngletInactif(page, nom) {
  return !(await verifierOngletActif(page, nom));
}

async function verifierContenuVisible(page, nom) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  const tabId = ongletMap[nom];
  const isVisible = await page.isVisible(`#${tabId}-tab.active`);
  console.log(`✅ Contenu "${nom}" ${isVisible ? 'visible' : 'invisible'}`);
  return isVisible;
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cliquerOnglet,
    verifierOngletActif,
    verifierOngletInactif,
    verifierContenuVisible
  };
}
