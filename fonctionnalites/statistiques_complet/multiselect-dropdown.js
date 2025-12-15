/**
 * Multi-Select Dropdown avec Checkboxes
 * Transforme les select multiple en menus déroulants modernes
 */
(function() {
  'use strict';

  // Gestionnaire global pour fermer les dropdowns
  let globalClickHandlerAttached = false;
  
  function attachGlobalClickHandler() {
    if (globalClickHandlerAttached) return;
    
    globalClickHandlerAttached = true;
    
    // Utiliser un listener qui ne s'exécute QUE si des dropdowns sont ouverts
    // et qui ne bloque PAS les autres événements (PAS de capture)
    document.addEventListener('click', (e) => {
      // Vérifier d'abord s'il y a des dropdowns ouverts
      const openDropdowns = document.querySelectorAll('.stats-filters-complete .multiselect-wrapper.open');
      if (openDropdowns.length === 0) return; // Ne rien faire si aucun dropdown ouvert
      
      // Vérifier si le clic est dans un dropdown
      const clickedInsideDropdown = e.target.closest('.stats-filters-complete .multiselect-wrapper');
      
      // Fermer seulement si le clic est en dehors d'un dropdown
      if (!clickedInsideDropdown) {
        openDropdowns.forEach(w => {
          w.classList.remove('open');
        });
      }
    }); // PAS de capture: true pour ne pas bloquer les autres événements
    
    // Fermer aussi sur Escape (seulement les dropdowns dans stats)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.stats-filters-complete .multiselect-wrapper.open').forEach(w => {
          w.classList.remove('open');
        });
      }
    });
    
    console.log('✅ Gestionnaire click pour dropdowns attaché (scope: .stats-filters-complete)');
  }

  function createMultiSelectDropdown(selectElement) {
    // Ne pas transformer si déjà transformé
    if (selectElement.classList.contains('multiselect-transformed')) return;
    
    // Marquer comme transformé
    selectElement.classList.add('multiselect-transformed');
    
    // Créer le conteneur principal
    const wrapper = document.createElement('div');
    wrapper.className = 'multiselect-wrapper';
    
    // Créer le bouton qui affiche la sélection
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'multiselect-button';
    
    const buttonText = document.createElement('span');
    buttonText.className = 'multiselect-button-text';
    buttonText.textContent = 'Sélectionner...';
    
    const arrow = document.createElement('span');
    arrow.className = 'multiselect-arrow';
    arrow.textContent = '▼';
    
    button.appendChild(buttonText);
    button.appendChild(arrow);
    
    // Créer la liste déroulante
    const dropdown = document.createElement('div');
    dropdown.className = 'multiselect-dropdown';
    
    // Créer les options comme des checkboxes
    Array.from(selectElement.options).forEach(option => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'multiselect-option';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option.value;
      checkbox.id = `multiselect-${selectElement.id}-${option.value}`;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = option.textContent;
      
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(label);
      dropdown.appendChild(optionDiv);
      
      // Synchroniser checkbox avec select
      checkbox.addEventListener('change', () => {
        option.selected = checkbox.checked;
        updateButtonText();
        // Déclencher l'événement change sur le select original
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Permettre de cliquer sur toute l'option pour cocher/décocher
      optionDiv.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          option.selected = checkbox.checked;
          updateButtonText();
          selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    
    // Ajouter le bouton "Tout effacer" si il y a des options
    if (selectElement.options.length > 0) {
      const clearBtn = document.createElement('div');
      clearBtn.className = 'multiselect-clear-btn';
      clearBtn.textContent = 'Tout effacer';
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Array.from(selectElement.options).forEach(option => {
          option.selected = false;
        });
        dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.checked = false;
        });
        updateButtonText();
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      });
      dropdown.appendChild(clearBtn);
    }
    
    // Fonction pour mettre à jour le texte du bouton
    function updateButtonText() {
      const selectedOptions = Array.from(selectElement.selectedOptions);
      if (selectedOptions.length === 0) {
        buttonText.textContent = 'Sélectionner...';
        buttonText.classList.remove('has-selection');
      } else if (selectedOptions.length === 1) {
        buttonText.textContent = selectedOptions[0].textContent;
        buttonText.classList.add('has-selection');
      } else {
        buttonText.innerHTML = `${selectedOptions.length} sélectionné(s) <span class="multiselect-count">${selectedOptions.length}</span>`;
        buttonText.classList.add('has-selection');
      }
    }
    
    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      
      // Fermer tous les autres dropdowns
      document.querySelectorAll('.multiselect-wrapper.open').forEach(w => {
        if (w !== wrapper) w.classList.remove('open');
      });
      
      // Toggle celui-ci
      wrapper.classList.toggle('open', !isOpen);
    });
    
    // Empêcher la fermeture si on clique dans le dropdown
    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Assembler le composant
    wrapper.appendChild(button);
    wrapper.appendChild(dropdown);
    
    // Remplacer le select par le wrapper
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    selectElement.style.display = 'none';
    
    // Initialiser le texte du bouton
    updateButtonText();
    
    // Observer les changements du select (pour les resets)
    const observer = new MutationObserver(() => {
      // Synchroniser les checkboxes avec le select
      Array.from(selectElement.options).forEach((option, index) => {
        const checkbox = dropdown.querySelectorAll('input[type="checkbox"]')[index];
        if (checkbox) {
          checkbox.checked = option.selected;
        }
      });
      updateButtonText();
    });
    
    observer.observe(selectElement, { 
      attributes: true, 
      attributeFilter: ['value'],
      childList: true,
      subtree: true
    });
  }

  function initMultiSelectDropdowns() {
    // Attacher le gestionnaire global une seule fois
    attachGlobalClickHandler();
    
    // Attendre un peu pour s'assurer que le DOM est complètement chargé
    setTimeout(() => {
      // Cibler tous les selects multiples dans les statistiques
      const multiSelects = document.querySelectorAll('.stats-filters-complete select[multiple]');
      
      console.log('🔍 Recherche de selects multiples...', multiSelects.length, 'trouvés');
      
      multiSelects.forEach((select, index) => {
        console.log(`  - Transformation du select #${index}:`, select.id);
        createMultiSelectDropdown(select);
      });
      
      console.log('✅ Menus déroulants multi-sélection initialisés:', multiSelects.length);
    }, 100);
  }

  // Initialiser au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMultiSelectDropdowns);
  } else {
    initMultiSelectDropdowns();
  }
  
  // Aussi initialiser après un court délai (pour être sûr)
  setTimeout(initMultiSelectDropdowns, 500);

  // Exposer la fonction d'initialisation
  window.initMultiSelectDropdowns = initMultiSelectDropdowns;
})();
