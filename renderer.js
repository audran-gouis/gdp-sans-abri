/**
 * Renderer - Point d'entrée minimal de l'application
 * Attend que les modules HTML soient chargés avant d'initialiser
 */

console.log("📦 Initialisation de l'application...");

// Attendre que les modules HTML soient chargés
window.addEventListener('html-modules-loaded', async () => {
  console.log('✅ Modules HTML chargés, initialisation...');
  await initApp();
});

// Fallback si l'événement n'est pas déclenché (chargement direct)
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.tab-button')) {
    console.log('✅ DOM déjà prêt, initialisation directe...');
      initApp();
  }
});

async function initApp() {
  if (window.APP_INITIALIZED) return;
  window.APP_INITIALIZED = true;
  
  console.log('🚀 Démarrage de l\'initialisation...');
  
  try {
    // Initialiser les bases de données
    if (typeof window.initDB === 'function') {
    await window.initDB();
      console.log('✅ Base de données Transmissions initialisée');
    }
    
    if (typeof window.initDBADP === 'function') {
      await window.initDBADP();
      console.log('✅ Base de données ADP initialisée');
    }
    
    if (typeof window.initDatabasePA === 'function') {
      await window.initDatabasePA();
      console.log('✅ Base de données Point Accueil initialisée');
    }
    
    // Initialiser la navigation par onglets
    if (typeof window.initTabs === 'function') {
    window.initTabs();
    }
    
    // Initialiser les sélecteurs de date (Transmissions)
    if (typeof window.initDateSelectors === 'function') {
    window.initDateSelectors();
    }
    
    // Initialiser le sélecteur de date ADP
    initAdpDateSelector();
    
    // Initialiser le sélecteur de date Point Accueil
    initPADateSelector();
    
    // Initialiser le formulaire Transmissions
    if (typeof window.initTransmissionsForm === 'function') {
    window.initTransmissionsForm();
    }
    
    // Initialiser le formulaire ADP
    if (typeof window.initAdpForm === 'function') {
    window.initAdpForm();
    }
    
    // Initialiser les filtres ADP
    if (typeof window.initAdpFilters === 'function') {
      window.initAdpFilters();
    }
    
    // Initialiser le formulaire Point Accueil
    if (typeof window.initPointAccueilForm === 'function') {
      window.initPointAccueilForm();
    }
    
    // Initialiser les filtres Point Accueil
    if (typeof window.initPAFilters === 'function') {
      window.initPAFilters();
    }
    
    // Initialiser les boutons d'agrandissement des modales
    if (typeof window.initModalExpandButtons === 'function') {
      window.initModalExpandButtons();
    }
    
    // Initialiser l'autocomplétion intelligente (typologie -> nb personnes/mineurs)
    if (typeof window.initTypologieAutocomplete === 'function') {
      window.initTypologieAutocomplete();
    }
    
    // Initialiser le module Statistiques
    if (typeof window.initStatistiques === 'function') {
      window.initStatistiques();
    }
    
    // Charger les données initiales (TOUTES les fiches dans tous les onglets)
    if (typeof window.afficherToutesFichesTransmissions === 'function') {
    await window.afficherToutesFichesTransmissions();
      console.log('✅ Toutes les fiches chargées dans Transmissions');
    }
    
    if (typeof window.afficherToutesFichesADP === 'function') {
      await window.afficherToutesFichesADP();
      console.log('✅ Toutes les fiches chargées dans ADP');
    }
    
    if (typeof window.afficherToutesFichesPA === 'function') {
      await window.afficherToutesFichesPA();
      console.log('✅ Toutes les fiches chargées dans Point Accueil');
    }
    
    console.log('🎉 Application prête');
    window.APP_READY = true;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    window.APP_READY = false;
  }
}

/**
 * Initialise le sélecteur de date ADP (même comportement que Transmissions)
 */
function initAdpDateSelector() {
  const dateInput = document.getElementById('adp-date');
  if (dateInput) {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si entre 0h et 3h, utiliser la veille
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    dateInput.value = today.toISOString().split('T')[0];
    dateInput.addEventListener('change', () => {
      if (typeof window.afficherToutesFichesADP === 'function') {
        window.afficherToutesFichesADP();
  }
    });
  
    console.log('Sélecteur de date ADP initialisé');
  }
}

/**
 * Initialise le sélecteur de date Point Accueil (même comportement que ADP/Transmissions)
 */
function initPADateSelector() {
  const dateInput = document.getElementById('pa-date');
  if (dateInput) {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si entre 0h et 3h, utiliser la veille
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    dateInput.value = today.toISOString().split('T')[0];
    dateInput.addEventListener('change', () => {
      if (typeof window.afficherToutesFichesPA === 'function') {
        window.afficherToutesFichesPA();
      }
    });
    
    console.log('Sélecteur de date Point Accueil initialisé');
  }
}

// Exposer les fonctions globalement
window.initApp = initApp;
window.initAdpDateSelector = initAdpDateSelector;
window.initPADateSelector = initPADateSelector;
