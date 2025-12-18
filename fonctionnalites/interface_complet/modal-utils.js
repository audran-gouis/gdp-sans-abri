/**
 * Utilitaires pour la gestion des modales
 */

(function() {
  'use strict';

  /**
   * Ferme une modale de manière sécurisée
   * @param {HTMLElement} modal - L'élément modal à fermer
   * @param {HTMLFormElement} form - Le formulaire à réinitialiser (optionnel)
   * @param {Object} options - Options supplémentaires
   */
  function closeModalSafely(modal, form = null, options = {}) {
    if (!modal) {
      console.warn('closeModalSafely: modal is null');
      return;
    }

    console.log('🚪 Fermeture sécurisée de la modal:', modal.id);

    // 1. Retirer la classe 'show' pour déclencher l'animation de fermeture
    modal.classList.remove('show');
    
    // 2. Réinitialiser le formulaire si fourni
    if (form) {
      form.reset();
      // Nettoyer les datasets
      delete form.dataset.editId;
      delete form.dataset.personneId;
      delete form.dataset.initialDepartement;
      delete form.dataset.initialTypologie;
      delete form.dataset.initialNbPersonnes;
      delete form.dataset.initialMineurs;
    }
    
    // Nettoyer les datasets du modal
    if (modal.dataset) {
      delete modal.dataset.editId;
      delete modal.dataset.personneId;
    }

    // 3. S'assurer que le modal ne bloque plus l'interface
    modal.style.pointerEvents = 'none';
    
    // 4. Restaurer le focus sur un élément approprié après un court délai
    setTimeout(() => {
      // Trouver le premier input visible en dehors du modal
      const focusTarget = options.focusTarget || 
                         document.querySelector('#transmissions-date, #adp-date, #pa-date, #filter-nom, #adp-filter-nom, #pa-filter-nom');
      
      if (focusTarget && focusTarget.offsetParent !== null) {
        // L'élément est visible
        focusTarget.focus();
        console.log('🎯 Focus restauré sur:', focusTarget.id);
      }
      
      // 5. Nettoyer tous les overlays d'historique qui pourraient traîner
      document.querySelectorAll('.historique-modal-overlay').forEach(overlay => {
        overlay.remove();
      });
      
      // 5b. Nettoyer le navigateur de dates pour éviter l'accumulation d'event listeners
      if (window.cleanupDateNavigator && modal.id) {
        if (modal.id.includes('transmission')) {
          window.cleanupDateNavigator('transmissions');
          console.log('🧹 Navigateur transmissions nettoyé');
        } else if (modal.id.includes('adp')) {
          window.cleanupDateNavigator('adp');
          console.log('🧹 Navigateur ADP nettoyé');
        } else if (modal.id.includes('point-accueil') || modal.id.includes('pa')) {
          window.cleanupDateNavigator('pointAccueil');
          console.log('🧹 Navigateur Point Accueil nettoyé');
        }
      }
      
      // 5c. Nettoyer TOUS les flags de collapse dans le modal
      if (modal) {
        const collapseHeaders = modal.querySelectorAll('h3[data-collapse-initialized]');
        collapseHeaders.forEach(header => {
          delete header.dataset.collapseInitialized;
        });
        console.log('🧹 Flags collapse nettoyés:', collapseHeaders.length);
      }
      
      // 6. S'assurer que tous les inputs critiques sont interactifs
      const criticalSelectors = [
        'transmissions-date', 'filter-nom', 'filter-prenom', 'filter-ddn', 'filter-inconnu', 'filter-description',
        'adp-date', 'adp-filter-nom', 'adp-filter-prenom', 'adp-filter-ddn', 'adp-filter-inconnu', 'adp-filter-description',
        'pa-date', 'pa-filter-nom', 'pa-filter-prenom', 'pa-filter-ddn', 'pa-filter-inconnu', 'pa-filter-description'
      ];
      
      criticalSelectors.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.style.pointerEvents = 'auto';
          input.removeAttribute('disabled');
          input.removeAttribute('readonly');
        }
      });
      
      // 7. SOLUTION DÉFINITIVE : Mettre le focus sur le sélecteur de date (surligné en bleu)
      const dateSelectors = ['transmissions-date', 'adp-date', 'pa-date'];
      dateSelectors.forEach(id => {
        const dateInput = document.getElementById(id);
        if (dateInput && dateInput.offsetParent !== null) {
          // Le champ est visible, donc c'est l'onglet actif
          setTimeout(() => {
            dateInput.focus();
            console.log('📅 Focus sur le sélecteur de date:', id);
          }, 150);
        }
      });
      
      console.log('✅ Modal fermée, interface restaurée');
    }, 100);
  }

  /**
   * Ouvre une modale de manière sécurisée
   * @param {HTMLElement} modal - L'élément modal à ouvrir
   */
  function openModalSafely(modal) {
    if (!modal) {
      console.warn('openModalSafely: modal is null');
      return;
    }

    console.log('🚪 Ouverture sécurisée de la modal:', modal.id);

    // Rendre le modal visible
    modal.style.pointerEvents = 'auto';
    modal.classList.add('show');
    
    // Focus sur le premier champ éditable
    setTimeout(() => {
      const firstInput = modal.querySelector('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  // Exposer les fonctions globalement
  window.closeModalSafely = closeModalSafely;
  window.openModalSafely = openModalSafely;

  console.log('✅ Modal utils chargés');
})();

