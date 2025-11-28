/**
 * Renderer - Point d'entrée minimal de l'application
 * Orchestre l'initialisation (les modules sont chargés via index.html)
 */

console.log('📦 Initialisation de l'application...');

(async () => {
  try {
    console.log('✅ Modules déjà chargés via index.html');
    
    // Initialiser l'application quand le DOM est prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    window.APP_READY = false;
  }
})();

async function initApp() {
  console.log('✅ DOM chargé, initialisation...');
  
  try {
    // Initialiser les bases de données (Transmissions uniquement)
    // Note: ADP sera initialisée à la demande lors du premier accès
    await window.initDB();
    
    // Initialiser l'interface
    window.initTabs();
    window.initDateSelectors();
    window.initTransmissionsForm();
    window.initAdpForm();
    initAdpDateSelectors();
    
    // Charger les données initiales
    await window.loadAndDisplayCards();
    if (typeof window.loadAndDisplayCardsAdp === 'function') {
      await window.loadAndDisplayCardsAdp();
    }
    
    console.log('🎉 Application prête');
    
    // Marquer l'application comme prête pour les tests
    window.APP_READY = true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    window.APP_READY = false;
  }
}

// ==================== FONCTIONS ADP ====================
// Les fonctions ADP sont définies dans fonctionnalites/adp_complet/ajout_personne_complete/code.js
// et sont automatiquement exposées à window lors du chargement

function initAdpDateSelectors() {
  const dateInputAdp = document.getElementById('adp-date');
  if (dateInputAdp) {
    dateInputAdp.value = new Date().toISOString().split('T')[0];
    dateInputAdp.addEventListener('change', window.loadAndDisplayCardsAdp);
  }
  
  console.log('✅ Sélecteurs de date ADP initialisés');
}

// Exposer les fonctions globalement pour qu'elles soient accessibles par les handlers
window.editTransmission = editTransmission;
window.deletePersonCard = deletePersonCard;
window.loadAndDisplayCards = loadAndDisplayCards;
