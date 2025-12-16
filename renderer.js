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
  
  console.log('🚀 Démarrage de l\'initialisation (BASE UNIFIÉE)...');
  
  // CORRECTION ELECTRON : Si on vient d'une suppression, forcer un nettoyage complet
  if (sessionStorage.getItem('just-deleted') === 'true') {
    console.log('🧹 Nettoyage après suppression détecté...');
    sessionStorage.removeItem('just-deleted');
    
    // ATTENDRE que le DOM soit VRAIMENT prêt
    setTimeout(() => {
      console.log('🔧 Démarrage du nettoyage post-suppression...');
      
      // 1. Nettoyer tous les overlays possibles
      document.querySelectorAll('.modal, .historique-modal-overlay').forEach(el => {
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '-9999';
      });
      
      // 2. Forcer tous les inputs critiques à être interactifs
      const criticalInputs = [
        'transmissions-date',
        'filter-nom',
        'filter-prenom',
        'filter-ddn',
        'filter-inconnu',
        'filter-description'
      ];
      
      criticalInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          // Retirer TOUS les attributs bloquants
          input.style.pointerEvents = 'auto';
          input.style.zIndex = '1';
          input.removeAttribute('disabled');
          input.removeAttribute('readonly');
          input.removeAttribute('aria-disabled');
          
          // CRITIQUE : Cycle focus/blur pour réveiller l'input au niveau du moteur
          input.focus();
          input.blur();
          
          // Simuler des événements pour réveiller l'input
          input.dispatchEvent(new Event('mouseenter', { bubbles: true }));
          input.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          input.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          input.dispatchEvent(new Event('mouseleave', { bubbles: true }));
          
          console.log(`   ✓ Input ${id} réveillé`);
        }
      });
      
      // 3. Force un reflow COMPLET du document
      document.body.style.display = 'none';
      document.body.offsetHeight; // Force reflow
      document.body.style.display = '';
      
      console.log('✅ Nettoyage post-suppression terminé');
      
      // 4. DERNIER RECOURS : Focus sur le premier input après un délai
      setTimeout(() => {
        const firstInput = document.getElementById('transmissions-date');
        if (firstInput) {
          firstInput.focus();
          console.log('🎯 Focus final sur transmissions-date');
        }
      }, 100);
      
    }, 200); // Délai augmenté pour être sûr que le DOM est prêt
  }
  
  try {
    // Initialiser la BASE DE DONNÉES UNIFIÉE
    if (typeof window.initDatabaseUnified === 'function') {
      await window.initDatabaseUnified();
      console.log('✅ Base de données Unifiée initialisée');
    } else {
      console.error('❌ Base de données Unifiée non disponible !');
    }
    
    // Les anciennes bases sont conservées temporairement pour la migration
    // Elles seront supprimées après migration réussie
    
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
    
    // Charger les données initiales (TOUTES les personnes dans tous les onglets)
    if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
      await window.afficherToutesLesPersonnesTransmissions();
      console.log('✅ Toutes les personnes chargées dans Transmissions');
    }
    
    if (typeof window.afficherToutesLesPersonnesADP === 'function') {
      await window.afficherToutesLesPersonnesADP();
      console.log('✅ Toutes les personnes chargées dans ADP');
    }
    
    if (typeof window.afficherToutesLesPersonnesPA === 'function') {
      await window.afficherToutesLesPersonnesPA();
      console.log('✅ Toutes les personnes chargées dans Point Accueil');
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
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
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
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
    
    console.log('Sélecteur de date Point Accueil initialisé');
  }
}

// Exposer les fonctions globalement
window.initApp = initApp;
window.initAdpDateSelector = initAdpDateSelector;
window.initPADateSelector = initPADateSelector;
