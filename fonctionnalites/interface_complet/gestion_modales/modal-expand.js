/**
 * Gestion de l'agrandissement des modales en plein écran
 */

(function() {
  'use strict';
  
  console.log('🔄 Chargement modal-expand.js...');
  
  /**
   * Initialise le bouton d'agrandissement pour une modale
   * @param {string} modalId - ID de la modale
   * @param {string} btnExpandId - ID du bouton d'agrandissement
   */
  function initExpandButton(modalId, btnExpandId) {
    const modal = document.getElementById(modalId);
    const btnExpand = document.getElementById(btnExpandId);
    
    console.log(`🔍 Recherche éléments pour ${modalId}:`, {
      modal: modal ? 'trouvé' : 'NON TROUVÉ',
      btnExpand: btnExpand ? 'trouvé' : 'NON TROUVÉ'
    });
    
    if (!modal || !btnExpand) {
      console.warn(`⚠️ Elements non trouvés pour expand: modal=${modalId}, btn=${btnExpandId}`);
      return false;
    }
    
    let isExpanded = false;
    
    btnExpand.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const modalContent = modal.querySelector('.modal-content');
      
      if (!modalContent) {
        console.warn('⚠️ modal-content non trouvé dans', modalId);
        return;
      }
      
      if (!isExpanded) {
        // Agrandir
        modalContent.classList.add('modal-expanded');
        btnExpand.textContent = '🗗'; // Icône rétrécir
        btnExpand.title = 'Réduire';
        isExpanded = true;
        console.log('✅ Modale agrandie:', modalId);
      } else {
        // Réduire
        modalContent.classList.remove('modal-expanded');
        btnExpand.textContent = '⛶'; // Icône agrandir
        btnExpand.title = 'Agrandir';
        isExpanded = false;
        console.log('✅ Modale réduite:', modalId);
      }
    });
    
    console.log(`✅ Bouton expand initialisé pour ${modalId}`);
    return true;
  }
  
  /**
   * Initialise tous les boutons d'agrandissement au chargement de la page
   */
  function initAllExpandButtons() {
    console.log('🚀 Initialisation de tous les boutons expand...');
    
    let successCount = 0;
    
    // Transmission
    if (initExpandButton('modal-ajout', 'btn-expand')) {
      successCount++;
    }
    
    // ADP
    if (initExpandButton('modal-adp', 'adp-btn-expand')) {
      successCount++;
    }
    
    // Point Accueil
    if (initExpandButton('modal-point-accueil', 'pa-btn-expand')) {
      successCount++;
    }
    
    console.log(`✅ ${successCount}/3 boutons expand initialisés avec succès`);
  }
  
  // Écouter l'événement custom de html-loader
  window.addEventListener('html-modules-loaded', function() {
    console.log('✅ Modules HTML chargés, initialisation des boutons expand...');
    initAllExpandButtons();
  });
  
  // Exposer globalement si besoin
  if (typeof window !== 'undefined') {
    window.initExpandButton = initExpandButton;
    window.initAllExpandButtons = initAllExpandButtons;
  }
  
})();

console.log('✅ Module modal-expand.js chargé');

