/**
 * Gestion de l'agrandissement des modales en plein écran
 */

(function() {
  'use strict';
  
  /**
   * Initialise le bouton d'agrandissement pour une modale
   * @param {string} modalId - ID de la modale
   * @param {string} btnExpandId - ID du bouton d'agrandissement
   */
  function initExpandButton(modalId, btnExpandId) {
    const modal = document.getElementById(modalId);
    const btnExpand = document.getElementById(btnExpandId);
    
    if (!modal || !btnExpand) {
      console.warn(`Elements non trouvés pour expand: modal=${modalId}, btn=${btnExpandId}`);
      return;
    }
    
    let isExpanded = false;
    
    btnExpand.addEventListener('click', function() {
      const modalContent = modal.querySelector('.modal-content');
      
      if (!modalContent) {
        console.warn('modal-content non trouvé');
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
  }
  
  /**
   * Initialise tous les boutons d'agrandissement au chargement de la page
   */
  function initAllExpandButtons() {
    // Transmission
    initExpandButton('modal-ajout', 'btn-expand');
    
    // ADP
    initExpandButton('modal-adp', 'adp-btn-expand');
    
    // Point Accueil
    initExpandButton('modal-point-accueil', 'pa-btn-expand');
    
    console.log('✅ Tous les boutons expand initialisés');
  }
  
  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllExpandButtons);
  } else {
    initAllExpandButtons();
  }
  
  // Exposer globalement si besoin
  if (typeof window !== 'undefined') {
    window.initExpandButton = initExpandButton;
    window.initAllExpandButtons = initAllExpandButtons;
  }
  
})();

console.log('✅ Module modal-expand chargé');

