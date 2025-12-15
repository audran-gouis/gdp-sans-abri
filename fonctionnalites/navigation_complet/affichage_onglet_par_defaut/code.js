/**
 * Code métier - Navigation : Affichage onglet par défaut
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Active un onglet dans l'application
 */
function activerOnglet(tabId) {
  console.log('Activation onglet:', tabId);
  
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  console.log('Boutons trouvés:', tabButtons.length);
  console.log('Contenus trouvés:', tabContents.length);
  
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  const button = document.querySelector(`button[data-tab="${tabId}"]`);
  const content = document.getElementById(`${tabId}-tab`);
  
  console.log('Bouton cible:', button);
  console.log('Contenu cible:', content);
  
  if (button) button.classList.add('active');
  if (content) content.classList.add('active');
  
  // Recharger les données de l'onglet activé
  rechargerDonneesOnglet(tabId);
}

/**
 * Recharge les données pour un onglet spécifique
 */
async function rechargerDonneesOnglet(tabId) {
  console.log('🔄 Rechargement des données pour:', tabId);
  
  try {
    switch (tabId) {
      case 'transmissions':
        if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
          await window.afficherToutesLesPersonnesTransmissions();
          console.log('✅ Transmissions rechargées');
        }
        break;
        
      case 'adp':
        if (typeof window.afficherToutesLesPersonnesADP === 'function') {
          await window.afficherToutesLesPersonnesADP();
          console.log('✅ ADP rechargé');
        }
        break;
        
      case 'point-accueil':
        if (typeof window.afficherToutesLesPersonnesPA === 'function') {
          await window.afficherToutesLesPersonnesPA();
          console.log('✅ Point Accueil rechargé');
        }
        break;
        
      case 'statistiques':
        // Les statistiques se rechargent manuellement avec le bouton "Appliquer"
        console.log('📊 Statistiques (pas de rechargement auto)');
        break;
      
      case 'archives':
        if (typeof window.afficherToutesLesPersonnesArchives === 'function') {
          window.afficherToutesLesPersonnesArchives();
        }
        break;
        
      default:
        console.log('⚠️ Onglet inconnu:', tabId);
    }
  } catch (error) {
    console.error('❌ Erreur lors du rechargement:', error);
  }
}

/**
 * Initialise le système de navigation par onglets
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  console.log('initTabs - Boutons trouvés:', tabButtons.length);
  console.log('initTabs - Contenus trouvés:', tabContents.length);
  
  if (tabButtons.length === 0) {
    console.error('❌ Aucun bouton .tab-button trouvé !');
    return;
  }
  
  tabButtons.forEach(button => {
    // Retirer les anciens listeners pour éviter les doublons
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = newButton.dataset.tab;
      console.log('Clic sur onglet:', tabId);
      activerOnglet(tabId);
    });
  });
  
  // S'assurer qu'un onglet est actif par défaut
  const activeContent = document.querySelector('.tab-content.active');
  if (!activeContent && tabContents.length > 0) {
    console.log('Aucun onglet actif, activation du premier...');
    activerOnglet('transmissions');
  }
  
  console.log('Navigation initialisée');
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
    rechargerDonneesOnglet,
    verifierOngletActif 
  };
} else {
  window.activerOnglet = activerOnglet;
  window.initTabs = initTabs;
  window.rechargerDonneesOnglet = rechargerDonneesOnglet;
}