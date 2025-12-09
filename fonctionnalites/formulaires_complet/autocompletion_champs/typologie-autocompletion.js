/**
 * Gestion automatique des champs en fonction de la typologie de ménage
 */

/**
 * Configure l'auto-complétion pour un formulaire donné
 * @param {string} typologieId - ID du select typologie
 * @param {string} nbPersonnesId - ID du select nombre de personnes
 * @param {string} mineursId - ID du select mineurs
 */
function initTypologieAutoComplete(typologieId, nbPersonnesId, mineursId) {
  const typologieSelect = document.getElementById(typologieId);
  const nbPersonnesSelect = document.getElementById(nbPersonnesId);
  const mineursSelect = document.getElementById(mineursId);
  
  if (!typologieSelect || !nbPersonnesSelect || !mineursSelect) {
    console.warn('Éléments pour auto-complétion typologie non trouvés');
    return;
  }
  
  const applyTypologieRules = () => {
    const typologie = typologieSelect.value;
    
    switch(typologie) {
      case 'homme-seul':
      case 'femme-seule':
        // Homme seul ou Femme seule → 1 personne, 0 mineurs
        nbPersonnesSelect.value = '1';
        mineursSelect.value = '0';
        // Désactiver les champs car ils sont automatiques
        nbPersonnesSelect.disabled = true;
        mineursSelect.disabled = true;
        break;
        
      case 'groupe-adultes-sans-enfant':
        // Groupe d'adultes sans enfant → 0 mineurs, personnes libre
        mineursSelect.value = '0';
        nbPersonnesSelect.disabled = false;
        mineursSelect.disabled = true;
        break;
        
      default:
        // Autres cas → tous les champs sont modifiables
        nbPersonnesSelect.disabled = false;
        mineursSelect.disabled = false;
        break;
    }
    
    console.log(`🔄 Typologie changée: ${typologie}, NbPersonnes: ${nbPersonnesSelect.value}, Mineurs: ${mineursSelect.value}`);
  };
  
  typologieSelect.addEventListener('change', applyTypologieRules);
  
  // Déclencher l'événement au chargement si une valeur est déjà sélectionnée
  if (typologieSelect.value) {
    applyTypologieRules();
  }
  
  // Exposer la fonction pour l'appeler manuellement (utile en mode édition)
  return applyTypologieRules;
}

// Exposer globalement
if (typeof window !== 'undefined') {
  window.initTypologieAutoComplete = initTypologieAutoComplete;
}

console.log('✅ Module typologie auto-complétion chargé');

