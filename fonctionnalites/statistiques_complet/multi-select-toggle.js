/**
 * Permet de désélectionner une option dans un select multiple en recliquant dessus
 * Sans avoir besoin de maintenir Ctrl/Cmd
 */
(function() {
  'use strict';

  function initMultiSelectToggle() {
    // Cibler tous les selects multiples dans les statistiques
    const multiSelects = document.querySelectorAll('select[multiple]');
    
    multiSelects.forEach(select => {
      // Stocker l'état précédent des options sélectionnées
      let previouslySelected = new Set(
        Array.from(select.selectedOptions).map(opt => opt.value)
      );
      
      // Écouter les événements mousedown sur le select
      select.addEventListener('mousedown', function(e) {
        e.preventDefault();
        
        const option = e.target;
        if (option.tagName !== 'OPTION') return;
        
        const value = option.value;
        
        // Toggle : inverser l'état de sélection
        if (previouslySelected.has(value)) {
          // Était sélectionné → désélectionner
          option.selected = false;
          previouslySelected.delete(value);
        } else {
          // N'était pas sélectionné → sélectionner
          option.selected = true;
          previouslySelected.add(value);
        }
        
        // Déclencher l'événement change
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        return false;
      }, true);
      
      // Empêcher le comportement par défaut du click
      select.addEventListener('click', function(e) {
        e.preventDefault();
        return false;
      }, true);
      
      // Mettre à jour l'état après un changement externe (ex: reset)
      select.addEventListener('change', function() {
        previouslySelected = new Set(
          Array.from(select.selectedOptions).map(opt => opt.value)
        );
      });
    });
    
    console.log('✅ Toggle multi-select initialisé pour', multiSelects.length, 'selects');
  }

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMultiSelectToggle);
  } else {
    initMultiSelectToggle();
  }

  // Réinitialiser après chargement de module
  window.initMultiSelectToggle = initMultiSelectToggle;
})();
