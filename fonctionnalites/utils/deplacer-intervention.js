/**
 * Gestion du déplacement d'interventions entre types (Transmissions, ADP, Point Accueil)
 */

/**
 * Affiche un message de succès temporaire
 */
function afficherMessageSucces(message) {
  const toast = document.createElement('div');
  toast.innerHTML = `<span style="margin-right: 8px;">✅</span>${message}`;
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #10b981; color: white; padding: 12px 24px; border-radius: 8px;
    font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10001;
    display: flex; align-items: center; animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Affiche un message d'erreur temporaire
 */
function afficherMessageErreur(message) {
  const toast = document.createElement('div');
  toast.innerHTML = `<span style="margin-right: 8px;">❌</span>${message}`;
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px;
    font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10001;
    display: flex; align-items: center;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Nettoie tous les overlays et restaure l'interactivité des filtres
 */
function nettoyerApresModal() {
  console.log('🧹 Nettoyage après fermeture de modal de déplacement...');
  
  // Forcer un court délai pour s'assurer que le DOM est à jour
  setTimeout(() => {
    // Nettoyer UNIQUEMENT les overlays de confirmation créés dynamiquement
    // NE PAS toucher aux modaux principaux ou autres éléments de l'interface
    document.querySelectorAll('.confirm-modal-overlay').forEach(el => {
      el.remove();
      console.log('🧹 Overlay de confirmation nettoyé');
    });
    
    // Restaurer l'interactivité des inputs critiques
    const criticalInputs = [
      'transmissions-date',
      'filter-nom',
      'filter-prenom',
      'filter-ddn',
      'filter-inconnu',
      'filter-description',
      'adp-date',
      'adp-filter-nom',
      'pa-date',
      'pa-filter-nom'
    ];
    
    criticalInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.style.pointerEvents = 'auto';
        input.style.zIndex = '1';
        input.removeAttribute('disabled');
        input.removeAttribute('readonly');
      }
    });
    
    // Forcer le reflow
    document.body.offsetHeight;
    
    // Transférer le focus vers un élément visible
    const dateInput = document.getElementById('transmissions-date') || 
                      document.getElementById('adp-date') || 
                      document.getElementById('pa-date');
    if (dateInput) {
      dateInput.focus();
      dateInput.blur();
    }
    
    console.log('✅ Nettoyage terminé - filtres restaurés');
  }, 100);
}

/**
 * Affiche une modale pour sélectionner les transmissions à déplacer et le nouveau type
 * @param {Array} interventions - Liste des interventions [{id, typeTransmission}]
 * @param {string} typeActuel - Type actuel de l'intervention (transmissions, adp, pointAccueil)
 * @param {string} personneNom - Nom de la personne (pour l'affichage)
 * @param {number} personneId - ID de la personne
 * @param {string} date - Date des interventions
 */
async function afficherModaleDeplacementMultiple(interventions, typeActuel, personneNom, personneId, date) {
  const types = {
    'transmissions': 'Maraudes Départementales',
    'adp': 'ADP',
    'pointAccueil': 'Point Accueil'
  };
  
  const typeActuelLabel = types[typeActuel] || typeActuel;
  const dateFormatee = new Date(date).toLocaleDateString('fr-FR');
  
  // Si une seule intervention, utiliser l'ancienne modale simplifiée
  if (interventions.length === 1) {
    return afficherModaleDeplacement(interventions[0].id, typeActuel, personneNom);
  }
  
  // Créer la modale avec sélection des transmissions
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.style.zIndex = '2000';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 550px;">
      <div class="modal-header">
        <h2>Déplacer les interventions</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem;">
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0;">
            <strong>Personne :</strong> ${personneNom || 'Inconnu'}
          </p>
          <p style="margin: 0 0 0.5rem 0;">
            <strong>Date :</strong> ${dateFormatee}
          </p>
          <p style="margin: 0;">
            <strong>Type actuel :</strong> <span style="color: #7c3aed; font-weight: 600;">${typeActuelLabel}</span>
          </p>
        </div>
        
        <p style="margin-bottom: 0.75rem; color: #666; font-size: 0.95rem;">
          <strong>Plusieurs transmissions existent pour ce jour.</strong><br>
          Sélectionnez celles à déplacer :
        </p>
        
        <div class="interventions-selection" style="margin-bottom: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <label style="display: flex; align-items: center; padding: 0.75rem 1rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; cursor: pointer;">
            <input type="checkbox" id="select-all-interventions" style="margin-right: 0.75rem; width: 18px; height: 18px;">
            <span style="font-weight: 600;">Tout sélectionner</span>
          </label>
          ${interventions.map(i => `
            <label style="display: flex; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s;" class="intervention-item">
              <input type="checkbox" class="intervention-checkbox" data-id="${i.id}" data-type="${i.typeTransmission}" style="margin-right: 0.75rem; width: 18px; height: 18px;">
              <span style="flex: 1;">
                <strong>${i.typeTransmission || 'Non défini'}</strong>
              </span>
            </label>
          `).join('')}
        </div>
        
        <p style="margin-bottom: 1rem; color: #666; font-size: 0.95rem;">
          Sélectionnez le nouveau type d'intervention :
        </p>
        <div class="btn-types-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${Object.entries(types)
            .filter(([key]) => key !== typeActuel)
            .map(([key, label]) => {
              const colors = {
                'transmissions': { bg: '#dbeafe', border: '#2563eb', hover: '#bfdbfe' },
                'adp': { bg: '#d1fae5', border: '#059669', hover: '#a7f3d0' },
                'pointAccueil': { bg: '#e0e7ff', border: '#0891b2', hover: '#c7d2fe' }
              };
              const color = colors[key] || { bg: '#f3f4f6', border: '#e5e7eb', hover: '#e5e7eb' };
              return `
                <button 
                  class="btn-deplacer-type" 
                  style="text-align: left; padding: 1rem; background: ${color.bg}; border: 2px solid ${color.border}; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; color: #1f2937; opacity: 0.5; pointer-events: none;"
                  data-nouveau-type="${key}"
                  data-color-bg="${color.bg}"
                  data-color-hover="${color.hover}"
                  disabled
                >
                  ${label}
                </button>
              `;
            }).join('')}
        </div>
        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn-annuler-deplacement btn-secondary">Annuler</button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la modale au body
  document.body.appendChild(modal);
  
  // Fonction pour activer/désactiver les boutons de type
  const updateTypeButtons = () => {
    const checkedBoxes = modal.querySelectorAll('.intervention-checkbox:checked');
    const typeButtons = modal.querySelectorAll('.btn-deplacer-type');
    typeButtons.forEach(btn => {
      if (checkedBoxes.length > 0) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.disabled = false;
      } else {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.disabled = true;
      }
    });
  };
  
  // Événement sur le checkbox "Tout sélectionner"
  const selectAllCheckbox = modal.querySelector('#select-all-interventions');
  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = modal.querySelectorAll('.intervention-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
    updateTypeButtons();
  });
  
  // Événements sur les checkboxes individuelles
  modal.querySelectorAll('.intervention-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const allCheckboxes = modal.querySelectorAll('.intervention-checkbox');
      const checkedCount = modal.querySelectorAll('.intervention-checkbox:checked').length;
      selectAllCheckbox.checked = checkedCount === allCheckboxes.length;
      selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
      updateTypeButtons();
    });
  });
  
  // Hover sur les items
  modal.querySelectorAll('.intervention-item').forEach(item => {
    item.addEventListener('mouseenter', () => item.style.background = '#f3f4f6');
    item.addEventListener('mouseleave', () => item.style.background = '');
  });
  
  // Attacher l'événement au bouton de fermeture
  const btnClose = modal.querySelector('.modal-close');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.remove();
      nettoyerApresModal();
    });
  }
  
  // Attacher l'événement au bouton Annuler
  const btnAnnuler = modal.querySelector('.btn-annuler-deplacement');
  if (btnAnnuler) {
    btnAnnuler.addEventListener('click', () => {
      modal.remove();
      nettoyerApresModal();
    });
  }
  
  // Ajouter les événements aux boutons de type
  modal.querySelectorAll('[data-nouveau-type]').forEach(btn => {
    // Événement click
    btn.addEventListener('click', async () => {
      const nouveauType = btn.dataset.nouveauType;
      const selectedIds = Array.from(modal.querySelectorAll('.intervention-checkbox:checked'))
        .map(cb => parseInt(cb.dataset.id));
      
      if (selectedIds.length === 0) return;
      
      await deplacerInterventionsMultiples(selectedIds, typeActuel, nouveauType, personneNom);
      modal.remove();
      nettoyerApresModal();
    });
    
    // Événements hover
    const bgColor = btn.dataset.colorBg;
    const hoverColor = btn.dataset.colorHover;
    
    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) {
        btn.style.background = hoverColor;
        btn.style.transform = 'translateX(5px)';
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = bgColor;
      btn.style.transform = 'translateX(0)';
    });
  });
  
  // Fermer en cliquant sur le fond
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      nettoyerApresModal();
    }
  });
}

/**
 * Déplace plusieurs interventions vers un nouveau type
 * @param {Array} interventionIds - IDs des interventions à déplacer
 * @param {string} typeActuel - Type actuel
 * @param {string} nouveauType - Nouveau type
 * @param {string} personneNom - Nom de la personne
 */
async function deplacerInterventionsMultiples(interventionIds, typeActuel, nouveauType, personneNom) {
  const typesLabels = {
    'transmissions': 'Maraudes Départementales',
    'adp': 'ADP',
    'pointAccueil': 'Point Accueil'
  };
  
  const typeActuelLabel = typesLabels[typeActuel] || typeActuel;
  const nouveauTypeLabel = typesLabels[nouveauType] || nouveauType;
  
  const count = interventionIds.length;
  const pluriel = count > 1 ? 's' : '';
  
  // Créer une modal de confirmation HTML
  return new Promise((resolve) => {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal-overlay';
    confirmModal.innerHTML = `
      <div class="confirm-modal">
        <h3>Confirmer le déplacement</h3>
        <p>Êtes-vous sûr de vouloir déplacer <strong>${count} intervention${pluriel}</strong> de "${typeActuelLabel}" vers "${nouveauTypeLabel}" ?</p>
        <div class="confirm-modal-buttons">
          <button class="btn-secondary" id="btn-confirm-cancel">Annuler</button>
          <button class="btn-primary" id="btn-confirm-ok">Déplacer</button>
        </div>
      </div>
    `;
    confirmModal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 10000;
    `;
    confirmModal.querySelector('.confirm-modal').style.cssText = `
      background: white; padding: 20px; border-radius: 8px;
      max-width: 450px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    confirmModal.querySelector('.confirm-modal-buttons').style.cssText = `
      display: flex; gap: 10px; justify-content: center; margin-top: 20px;
    `;
    
    document.body.appendChild(confirmModal);
    
    // Gérer les boutons
    confirmModal.querySelector('#btn-confirm-cancel').addEventListener('click', () => {
      confirmModal.remove();
      nettoyerApresModal();
      resolve(false);
    });
    
    confirmModal.querySelector('#btn-confirm-ok').addEventListener('click', async () => {
      confirmModal.remove();
      
      try {
        // Déplacer chaque intervention
        for (const id of interventionIds) {
          await window.updateIntervention(id, { type: nouveauType });
        }
        
        // Afficher un message de succès avec une modal
        afficherMessageSucces(`${count} intervention${pluriel} déplacée${pluriel} avec succès vers ${nouveauTypeLabel}`);
        
        // Rafraîchir toutes les listes
        if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
          await window.afficherToutesLesPersonnesTransmissions();
        }
        if (typeof window.afficherToutesLesPersonnesADP === 'function') {
          await window.afficherToutesLesPersonnesADP();
        }
        if (typeof window.afficherToutesLesPersonnesPA === 'function') {
          await window.afficherToutesLesPersonnesPA();
        }
        
        console.log(`✅ ${count} intervention(s) déplacée(s) de ${typeActuel} vers ${nouveauType}`);
        nettoyerApresModal();
        resolve(true);
      } catch (error) {
        console.error('❌ Erreur lors du déplacement:', error);
        afficherMessageErreur('Erreur lors du déplacement : ' + error.message);
        nettoyerApresModal();
        resolve(false);
      }
    });
  });
}

/**
 * Affiche une modale pour sélectionner le nouveau type d'intervention (une seule intervention)
 * @param {number} interventionId - ID de l'intervention à déplacer
 * @param {string} typeActuel - Type actuel de l'intervention
 * @param {string} personneNom - Nom de la personne (pour l'affichage)
 */
async function afficherModaleDeplacement(interventionId, typeActuel, personneNom) {
  const types = {
    'transmissions': 'Maraudes Départementales',
    'adp': 'ADP',
    'pointAccueil': 'Point Accueil'
  };
  
  const typeActuelLabel = types[typeActuel] || typeActuel;
  
  // Créer la modale
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.style.zIndex = '2000';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2>Déplacer l'intervention</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body" style="padding: 1.5rem;">
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <p style="margin: 0 0 0.5rem 0;">
            <strong>Personne :</strong> ${personneNom || 'Inconnu'}
          </p>
          <p style="margin: 0;">
            <strong>Type actuel :</strong> <span style="color: #7c3aed; font-weight: 600;">${typeActuelLabel}</span>
          </p>
        </div>
        <p style="margin-bottom: 1rem; color: #666; font-size: 0.95rem;">
          Sélectionnez le nouveau type d'intervention :
        </p>
        <div class="btn-types-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${Object.entries(types)
            .filter(([key]) => key !== typeActuel)
            .map(([key, label]) => {
              const colors = {
                'transmissions': { bg: '#dbeafe', border: '#2563eb', hover: '#bfdbfe' },
                'adp': { bg: '#d1fae5', border: '#059669', hover: '#a7f3d0' },
                'pointAccueil': { bg: '#e0e7ff', border: '#0891b2', hover: '#c7d2fe' }
              };
              const color = colors[key] || { bg: '#f3f4f6', border: '#e5e7eb', hover: '#e5e7eb' };
              return `
                <button 
                  class="btn-deplacer-type" 
                  style="text-align: left; padding: 1rem; background: ${color.bg}; border: 2px solid ${color.border}; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; color: #1f2937;"
                  data-nouveau-type="${key}"
                  data-color-bg="${color.bg}"
                  data-color-hover="${color.hover}"
                >
                  ${label}
                </button>
              `;
            }).join('')}
        </div>
        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn-annuler-deplacement btn-secondary">Annuler</button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la modale au body
  document.body.appendChild(modal);
  
  // Attacher l'événement au bouton de fermeture
  const btnClose = modal.querySelector('.modal-close');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.remove();
      nettoyerApresModal();
    });
  }
  
  // Attacher l'événement au bouton Annuler
  const btnAnnuler = modal.querySelector('.btn-annuler-deplacement');
  if (btnAnnuler) {
    btnAnnuler.addEventListener('click', () => {
      modal.remove();
      nettoyerApresModal();
    });
  }
  
  // Ajouter les événements aux boutons de type
  modal.querySelectorAll('[data-nouveau-type]').forEach(btn => {
    // Événement click
    btn.addEventListener('click', async () => {
      const nouveauType = btn.dataset.nouveauType;
      modal.remove();
      await deplacerIntervention(interventionId, typeActuel, nouveauType, personneNom);
      // Le nettoyage est fait dans deplacerIntervention
    });
    
    // Événements hover
    const bgColor = btn.dataset.colorBg;
    const hoverColor = btn.dataset.colorHover;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = hoverColor;
      btn.style.transform = 'translateX(5px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = bgColor;
      btn.style.transform = 'translateX(0)';
    });
  });
  
  // Fermer en cliquant sur le fond
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      nettoyerApresModal();
    }
  });
}

/**
 * Déplace une intervention d'un type à un autre
 * @param {number} interventionId - ID de l'intervention
 * @param {string} typeActuel - Type actuel
 * @param {string} nouveauType - Nouveau type
 * @param {string} personneNom - Nom de la personne (pour les messages)
 */
async function deplacerIntervention(interventionId, typeActuel, nouveauType, personneNom) {
  const typesLabels = {
    'transmissions': 'Maraudes Départementales',
    'adp': 'ADP',
    'pointAccueil': 'Point Accueil'
  };
  
  const typeActuelLabel = typesLabels[typeActuel] || typeActuel;
  const nouveauTypeLabel = typesLabels[nouveauType] || nouveauType;
  
  // Créer une modal de confirmation HTML (au lieu de confirm() natif)
  return new Promise((resolve) => {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal-overlay';
    confirmModal.innerHTML = `
      <div class="confirm-modal">
        <h3>Confirmer le déplacement</h3>
        <p>Êtes-vous sûr de vouloir déplacer cette intervention de "<strong>${typeActuelLabel}</strong>" vers "<strong>${nouveauTypeLabel}</strong>" ?</p>
        <div class="confirm-modal-buttons">
          <button class="btn-secondary" id="btn-confirm-cancel">Annuler</button>
          <button class="btn-primary" id="btn-confirm-ok">Déplacer</button>
        </div>
      </div>
    `;
    confirmModal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 10000;
    `;
    confirmModal.querySelector('.confirm-modal').style.cssText = `
      background: white; padding: 20px; border-radius: 8px;
      max-width: 450px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    confirmModal.querySelector('.confirm-modal-buttons').style.cssText = `
      display: flex; gap: 10px; justify-content: center; margin-top: 20px;
    `;
    
    document.body.appendChild(confirmModal);
    
    // Gérer Annuler
    confirmModal.querySelector('#btn-confirm-cancel').addEventListener('click', () => {
      confirmModal.remove();
      nettoyerApresModal();
      resolve(false);
    });
    
    // Gérer Déplacer
    confirmModal.querySelector('#btn-confirm-ok').addEventListener('click', async () => {
      confirmModal.remove();
      
      try {
        // Utiliser updateIntervention pour changer le type
        await window.updateIntervention(interventionId, { type: nouveauType });
        
        // Afficher un message de succès
        afficherMessageSucces(`Intervention déplacée avec succès vers ${nouveauTypeLabel}`);
        
        // Rafraîchir toutes les listes pour que l'intervention apparaisse dans le bon onglet
        if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
          await window.afficherToutesLesPersonnesTransmissions();
        }
        if (typeof window.afficherToutesLesPersonnesADP === 'function') {
          await window.afficherToutesLesPersonnesADP();
        }
        if (typeof window.afficherToutesLesPersonnesPA === 'function') {
          await window.afficherToutesLesPersonnesPA();
        }
        
        console.log(`✅ Intervention ${interventionId} déplacée de ${typeActuel} vers ${nouveauType}`);
        
        // Nettoyer après l'opération
        nettoyerApresModal();
        resolve(true);
      } catch (error) {
        console.error('❌ Erreur lors du déplacement:', error);
        afficherMessageErreur('Erreur lors du déplacement : ' + error.message);
        nettoyerApresModal();
        resolve(false);
      }
    });
  });
}

/**
 * Trouve l'intervention pour une personne à une date donnée dans un type donné
 * @param {number} personneId - ID de la personne
 * @param {string} date - Date de l'intervention
 * @param {string} type - Type d'intervention
 * @returns {Promise<Object|null>} - L'intervention trouvée ou null
 */
async function trouverInterventionParPersonneDateType(personneId, date, type) {
  try {
    if (typeof window.getInterventionsByPersonneIdAndDateAndType === 'function') {
      return await window.getInterventionsByPersonneIdAndDateAndType(personneId, date, type);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'intervention:', error);
    return null;
  }
}

// Exposer globalement
if (typeof window !== 'undefined') {
  window.afficherModaleDeplacement = afficherModaleDeplacement;
  window.afficherModaleDeplacementMultiple = afficherModaleDeplacementMultiple;
  window.deplacerIntervention = deplacerIntervention;
  window.deplacerInterventionsMultiples = deplacerInterventionsMultiples;
  window.trouverInterventionParPersonneDateType = trouverInterventionParPersonneDateType;
}

console.log('✅ Module déplacement d\'interventions chargé');
