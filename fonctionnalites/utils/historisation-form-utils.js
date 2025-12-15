/**
 * Utilitaires communs pour l'historisation dans les formulaires
 */

(function() {
  'use strict';

  /**
   * Initialise la détection des changements pour les champs historisés
   * @param {HTMLFormElement} form - Le formulaire
   * @param {string} alerteId - L'ID de l'alerte à afficher
   * @param {Array<string>} fieldIds - Les IDs des champs à surveiller
   */
  function initChangementHistorisation(form, alerteId, fieldIds) {
    if (!form) {
      console.warn('Formulaire non fourni pour initChangementHistorisation');
      return;
    }

    const alerteModif = document.getElementById(alerteId);
    if (!alerteModif) {
      console.warn(`Alerte ${alerteId} non trouvée`);
      return;
    }

    fieldIds.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('change', () => {
          // Vérifier si on est en mode édition (pas création)
          if (!form.dataset.personneId) return;

          // Vérifier si au moins un champ a changé
          let hasChanges = false;
          
          fieldIds.forEach(id => {
            const fieldElement = document.getElementById(id);
            const initialKey = `initial${id.replace(/-/g, '_')}`;
            if (fieldElement && fieldElement.value !== (form.dataset[initialKey] || '')) {
              hasChanges = true;
            }
          });

          if (hasChanges) {
            alerteModif.style.display = 'block';
            console.log('⚠️ Modification détectée des informations historisées');
          } else {
            alerteModif.style.display = 'none';
          }
        });
      }
    });
  }

  /**
   * Charge les informations historiques dans le formulaire
   * @param {Object} personne - La personne
   * @param {string} date - La date de l'intervention
   * @param {Object} fieldMapping - Mapping des champs {fieldId: 'propertyName'}
   * @param {HTMLFormElement} form - Le formulaire
   */
  function chargerInfosHistoriques(personne, date, fieldMapping, form) {
    if (!personne || !date || !fieldMapping || !form) {
      console.warn('Paramètres manquants pour chargerInfosHistoriques');
      return;
    }

    // Récupérer les infos historiques valides à cette date
    const infosALaDate = window.getInfosALaDate ? window.getInfosALaDate(personne, date) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };

    // Remplir les champs
    Object.entries(fieldMapping).forEach(([fieldId, property]) => {
      const field = document.getElementById(fieldId);
      if (field && infosALaDate[property] !== undefined) {
        field.value = infosALaDate[property];
        
        // Stocker la valeur initiale
        const initialKey = `initial${fieldId.replace(/-/g, '_')}`;
        form.dataset[initialKey] = infosALaDate[property];
      }
    });

    // Afficher les boutons historique si la personne a un historique
    if (personne.infoHistorique && personne.infoHistorique.length > 0) {
      // Afficher tous les boutons d'historique
      const btnsHistorique = form.querySelectorAll('[id*="btn-voir-historique"]');
      btnsHistorique.forEach(btn => {
        btn.classList.add('has-history');
      });
    }
  }

  /**
   * Réinitialise les données d'historisation dans le formulaire
   * @param {HTMLFormElement} form - Le formulaire
   * @param {Array<string>} fieldIds - Les IDs des champs
   */
  function resetInfosHistorisation(form, fieldIds) {
    if (!form) return;

    fieldIds.forEach(fieldId => {
      const initialKey = `initial${fieldId.replace(/-/g, '_')}`;
      delete form.dataset[initialKey];
    });

    // Cacher tous les boutons historique
    const btnsHistorique = form.querySelectorAll('[id*="btn-voir-historique"]');
    btnsHistorique.forEach(btn => {
      btn.classList.remove('has-history');
    });

    // Cacher l'alerte
    const alerteModif = form.querySelector('[id*="alerte-modification-infos"]');
    if (alerteModif) {
      alerteModif.style.display = 'none';
    }
  }

  /**
   * Gère l'historisation lors de la sauvegarde
   * @param {number} personneId - ID de la personne
   * @param {string} date - Date de l'intervention
   * @param {Object} nouvellesInfos - Nouvelles infos {departement, typologie, nbPersonnes, mineurs}
   * @returns {Array|null} L'historique mis à jour ou null
   */
  async function gererHistorisationSauvegarde(personneId, date, nouvellesInfos) {
    if (!personneId || !date || !nouvellesInfos) return null;

    try {
      const personneExistante = await window.getPersonneById(personneId);
      
      if (window.ajouterVersionInfos && personneExistante) {
        const historiqueMAJ = window.ajouterVersionInfos(
          personneExistante,
          date,
          nouvellesInfos
        );
        console.log('📋 Historique mis à jour:', historiqueMAJ);
        return historiqueMAJ;
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'historisation:', error);
    }
    
    return null;
  }

  /**
   * Initialise le bouton "Voir l'historique"
   * @param {string} btnId - ID du bouton
   * @param {HTMLFormElement} form - Le formulaire
   */
  function initBoutonHistorique(btnId, form) {
    const btnVoirHistorique = document.getElementById(btnId);
    if (!btnVoirHistorique || !form) return;

    btnVoirHistorique.addEventListener('click', async (e) => {
      e.preventDefault();
      const personneId = form.dataset.personneId;
      if (personneId && window.afficherHistoriqueModal) {
        const personne = await window.getPersonneById(parseInt(personneId));
        if (personne) {
          window.afficherHistoriqueModal(personne);
        }
      }
    });
  }

  /**
   * Initialise tous les boutons d'historique d'un formulaire
   * @param {HTMLFormElement} form - Le formulaire
   */
  function initTousBoutonsHistorique(form) {
    if (!form) return;
    
    const btnsHistorique = form.querySelectorAll('[id*="btn-voir-historique"]');
    btnsHistorique.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const personneId = form.dataset.personneId;
        if (personneId && window.afficherHistoriqueModal) {
          const personne = await window.getPersonneById(parseInt(personneId));
          if (personne) {
            window.afficherHistoriqueModal(personne);
          }
        }
      });
    });
  }

  // Exposer les fonctions globalement
  window.initChangementHistorisation = initChangementHistorisation;
  window.chargerInfosHistoriques = chargerInfosHistoriques;
  window.resetInfosHistorisation = resetInfosHistorisation;
  window.gererHistorisationSauvegarde = gererHistorisationSauvegarde;
  window.initBoutonHistorique = initBoutonHistorique;
  window.initTousBoutonsHistorique = initTousBoutonsHistorique;

  console.log('✅ Utilitaires historisation formulaire chargés');
})();



