/**
 * Code métier - Formulaires : Autocomplétion intelligente des champs
 * Gère la logique d'auto-remplissage de "Nombre de personnes" et "dont Mineurs"
 * en fonction de la "Typologie de Ménages" sélectionnée.
 * Compatible Electron (pas d'import/export ES6)
 * Exposé globalement sur window.initTypologieAutocomplete
 */

(function() {
  'use strict';

  /**
   * Applique la logique d'autocomplétion pour un formulaire donné.
   * @param {string} prefix - Le préfixe des IDs des champs (ex: 'form-' pour Transmissions, 'adp-form-' pour ADP, 'form-pa-' pour Point Accueil)
   */
  function applyAutocompleteLogic(prefix) {
    const typologieSelect = document.getElementById(`${prefix}typologie`);
    const nbPersonnesSelect = document.getElementById(`${prefix}nb-personnes`);
    const mineursSelect = document.getElementById(`${prefix}mineurs`);
    const checkboxInconnu = document.getElementById(`${prefix}inconnu`);
    const inputNom = document.getElementById(`${prefix}nom`);
    const inputPrenom = document.getElementById(`${prefix}prenom`);
    const inputDescription = document.getElementById(`${prefix}description`);

    if (!typologieSelect || !nbPersonnesSelect || !mineursSelect) {
      // console.warn(`Champs d'autocomplétion non trouvés pour le préfixe: ${prefix}`);
      return;
    }

    const updateFields = () => {
      const typologieValue = typologieSelect.value;

      // Réactiver tous les champs par défaut
      nbPersonnesSelect.disabled = false;
      mineursSelect.disabled = false;

      switch (typologieValue) {
        case 'homme-seul':
        case 'femme-seule':
          // Homme seul ou Femme seule → 1 personne, 0 mineurs (bloqués)
          nbPersonnesSelect.value = '1';
          mineursSelect.value = '0';
          nbPersonnesSelect.disabled = true;
          mineursSelect.disabled = true;
          console.log(`🔄 ${typologieValue}: 1 personne, 0 mineurs (bloqués)`);
          break;
          
        case 'groupe-adultes-sans-enfant':
          // Groupe adultes sans enfant → 0 mineurs (bloqué), personnes modifiable
          mineursSelect.value = '0';
          mineursSelect.disabled = true;
          nbPersonnesSelect.disabled = false;
          console.log(`🔄 ${typologieValue}: 0 mineurs (bloqué), personnes modifiable`);
          break;
          
        default:
          // Pour les autres typologies, les champs restent modifiables
          // Ne pas réinitialiser les valeurs pour permettre la saisie manuelle
          console.log(`🔄 ${typologieValue}: tous les champs modifiables`);
          break;
      }
    };

    // Écouter les changements sur la typologie
    typologieSelect.addEventListener('change', updateFields);

    // Appliquer la logique une première fois au chargement (pour les modes édition)
    updateFields();

    // Gestion de la checkbox "Personne inconnue"
    if (checkboxInconnu && inputNom && inputPrenom && inputDescription) {
      const toggleInconnuFields = () => {
        const isDisabled = checkboxInconnu.checked;
        inputNom.disabled = isDisabled;
        inputPrenom.disabled = isDisabled;
        // inputDescription.disabled = !isDisabled; // La description est toujours modifiable

        if (isDisabled) {
          inputNom.value = '';
          inputPrenom.value = '';
        }
      };
      checkboxInconnu.addEventListener('change', toggleInconnuFields);
      toggleInconnuFields(); // Appliquer au chargement
    }
  }

  /**
   * Initialise l'autocomplétion pour tous les formulaires
   */
  function initTypologieAutocomplete() {
    console.log('🚀 Initialisation de l\'autocomplétion typologie...');
    applyAutocompleteLogic('form-'); // Formulaire Transmissions
    applyAutocompleteLogic('adp-form-'); // Formulaire ADP
    applyAutocompleteLogic('form-pa-'); // Formulaire Point Accueil
    console.log('✅ Autocomplétion typologie initialisée pour tous les formulaires.');
  }

  // Exposer la fonction globalement
  window.initTypologieAutocomplete = initTypologieAutocomplete;
})();

console.log('✅ Module typologie autocomplétion chargé');