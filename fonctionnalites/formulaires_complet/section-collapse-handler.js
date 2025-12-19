/**
 * Gestion du repliement des sections de formulaire
 */

(function() {
  'use strict';

  /**
   * Initialise le système de repliement des sections
   */
  function initSectionCollapse() {
    console.log('🔄 Initialisation du repliement des sections...');

    // Attendre que les modales soient chargées
    document.addEventListener('html-modules-loaded', () => {
      setupCollapseHandlers();
    });

    // Essayer aussi immédiatement au cas où les modules seraient déjà chargés
    setTimeout(() => {
      setupCollapseHandlers();
    }, 500);
  }
  
  /**
   * Nettoie les event listeners pour éviter les doublons
   */
  function cleanupCollapseHandlers() {
    const sections = document.querySelectorAll('.form-section h3');
    sections.forEach(header => {
      if (header._collapseClickHandler) {
        header.removeEventListener('click', header._collapseClickHandler);
        delete header._collapseClickHandler;
        delete header.dataset.collapseInitialized;
      }
    });
    console.log('🧹 Event listeners de collapse nettoyés');
  }

  function setupCollapseHandlers() {
    // IMPORTANT : Toujours nettoyer AVANT de réinitialiser pour éviter les doublons
    cleanupCollapseHandlers();
    
    // Chercher tous les h3 qui ont un .collapse-toggle
    const sections = document.querySelectorAll('.form-section h3');
    
    console.log(`📋 ${sections.length} sections de formulaire trouvées`);
    
    let collapsibleCount = 0;

    sections.forEach(header => {
      const toggle = header.querySelector('.collapse-toggle');
      if (!toggle) {
        // Ce n'est pas une section collapsible
        return;
      }
      
      collapsibleCount++;
      
      // Marquer comme initialisé
      header.dataset.collapseInitialized = 'true';
      
      // Créer une fonction handler qu'on peut référencer
      const clickHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Trouver la section parente (peut être dans .section-header-with-button ou directement)
        let section = this.closest('.form-section');
        
        if (!section) {
          console.warn('⚠️ Section parente non trouvée');
          return;
        }

        const grid = section.querySelector('.form-grid, .collapsible-content');
        const toggleIcon = this.querySelector('.collapse-toggle');

        if (!grid) {
          console.warn('⚠️ Grid/contenu non trouvé pour', section.id);
          return;
        }

        if (!toggleIcon) {
          console.warn('⚠️ Toggle non trouvé dans', this);
          return;
        }

        // Toggle des classes
        const isCollapsed = grid.classList.contains('collapsed');
        
        if (isCollapsed) {
          // Déplier
          grid.classList.remove('collapsed');
          toggleIcon.classList.remove('collapsed');
          console.log('📂 Section dépliée:', section.id || 'sans id');
        } else {
          // Replier
          grid.classList.add('collapsed');
          toggleIcon.classList.add('collapsed');
          console.log('📁 Section repliée:', section.id || 'sans id');
        }
      };
      
      // Stocker le handler pour pouvoir le supprimer plus tard
      header._collapseClickHandler = clickHandler;
      
      header.addEventListener('click', clickHandler);
    });

    console.log(`✅ Gestionnaires de repliement initialisés (${collapsibleCount} sections collapsibles)`);
  }

  // Fonction utilitaire pour replier une section spécifique
  window.replierSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn('⚠️ Section non trouvée:', sectionId);
      return;
    }

    const grid = section.querySelector('.form-grid, .collapsible-content');
    const toggle = section.querySelector('.collapse-toggle');

    if (grid && toggle) {
      grid.classList.add('collapsed');
      toggle.classList.add('collapsed');
      console.log('📁 Section repliée:', sectionId);
    } else {
      console.warn('⚠️ Grid ou toggle non trouvé dans la section:', sectionId);
    }
  };

  // Fonction utilitaire pour déplier une section spécifique
  window.deplierSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn('⚠️ Section non trouvée:', sectionId);
      return;
    }

    const grid = section.querySelector('.form-grid, .collapsible-content');
    const toggle = section.querySelector('.collapse-toggle');

    if (grid && toggle) {
      grid.classList.remove('collapsed');
      toggle.classList.remove('collapsed');
      console.log('📂 Section dépliée:', sectionId);
    } else {
      console.warn('⚠️ Grid ou toggle non trouvé dans la section:', sectionId);
    }
  };

  // Initialiser au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionCollapse);
  } else {
    initSectionCollapse();
  }

  window.initSectionCollapse = initSectionCollapse;
  window.cleanupCollapseHandlers = cleanupCollapseHandlers;
  window.setupCollapseHandlers = setupCollapseHandlers;
  console.log('📦 Module Section Collapse chargé');
})();

