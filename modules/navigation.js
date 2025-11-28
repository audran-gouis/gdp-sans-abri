/**
 * MODULE NAVIGATION - Gestion des onglets
 * Compatible Electron (pas d'import/export ES6)
 * Expose window.Navigation
 */

(function() {
  'use strict';

  const setupNavigation = () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Désactiver tous les onglets et boutons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activer l'onglet sélectionné
        button.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
      });
    });

    console.log('✅ Module Navigation initialisé');
  };

  // Exposition globale
  window.Navigation = {
    setup: setupNavigation
  };

  console.log('📦 Module Navigation chargé');
})();



 * Compatible Electron (pas d'import/export ES6)
 * Expose window.Navigation
 */

(function() {
  'use strict';

  const setupNavigation = () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Désactiver tous les onglets et boutons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activer l'onglet sélectionné
        button.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
      });
    });

    console.log('✅ Module Navigation initialisé');
  };

  // Exposition globale
  window.Navigation = {
    setup: setupNavigation
  };

  console.log('📦 Module Navigation chargé');
})();