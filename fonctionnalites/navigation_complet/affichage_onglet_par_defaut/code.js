/**
 * Code métier - Navigation : Affichage onglet par défaut
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Active un onglet dans l'application
 */
function activerOnglet(tabId) {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  const button = document.querySelector(`button[data-tab="${tabId}"]`);
  const content = document.getElementById(`${tabId}-tab`);
  
  if (button) button.classList.add('active');
  if (content) content.classList.add('active');
}

/**
 * Initialise le système de navigation par onglets
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      activerOnglet(tabId);
    });
  });
  
  console.log('✅ Navigation initialisée');
}

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function verifierOngletActif(page, onglet) {
  const ongletMap = { 
    'Transmissions Quotidiennes': 'transmissions', 
    'ADP': 'adp', 
    'Statistiques': 'statistiques' 
  };
  const tabId = ongletMap[onglet];
  return await page.isVisible(`#${tabId}-tab.active`);
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    activerOnglet,
    initTabs,
    verifierOngletActif 
  };
} else {
  // Rendre les fonctions disponibles globalement dans le navigateur
  window.activerOnglet = activerOnglet;
  window.initTabs = initTabs;
}

 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Active un onglet dans l'application
 */
function activerOnglet(tabId) {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  const button = document.querySelector(`button[data-tab="${tabId}"]`);
  const content = document.getElementById(`${tabId}-tab`);
  
  if (button) button.classList.add('active');
  if (content) content.classList.add('active');
}

/**
 * Initialise le système de navigation par onglets
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      activerOnglet(tabId);
    });
  });
  
  console.log('✅ Navigation initialisée');
}

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function verifierOngletActif(page, onglet) {
  const ongletMap = { 
    'Transmissions Quotidiennes': 'transmissions', 
    'ADP': 'adp', 
    'Statistiques': 'statistiques' 
  };
  const tabId = ongletMap[onglet];
  return await page.isVisible(`#${tabId}-tab.active`);
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    activerOnglet,
    initTabs,
    verifierOngletActif 
  };
} else {
  // Rendre les fonctions disponibles globalement dans le navigateur
  window.activerOnglet = activerOnglet;
  window.initTabs = initTabs;
}
