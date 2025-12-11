/**
 * Gestion du déplacement d'interventions entre types (Transmissions, ADP, Point Accueil)
 */

/**
 * Affiche une modale pour sélectionner le nouveau type d'intervention
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
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
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
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
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
                  onmouseover="this.style.background='${color.hover}'; this.style.transform='translateX(5px)'"
                  onmouseout="this.style.background='${color.bg}'; this.style.transform='translateX(0)'"
                >
                  ${label}
                </button>
              `;
            }).join('')}
        </div>
        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn-secondary" onclick="this.closest('.modal').remove()">Annuler</button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la modale au body
  document.body.appendChild(modal);
  
  // Ajouter les événements aux boutons de type
  modal.querySelectorAll('[data-nouveau-type]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const nouveauType = btn.dataset.nouveauType;
      await deplacerIntervention(interventionId, typeActuel, nouveauType, personneNom);
      modal.remove();
    });
  });
  
  // Fermer en cliquant sur le fond
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
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
  try {
    const typesLabels = {
      'transmissions': 'Maraudes Départementales',
      'adp': 'ADP',
      'pointAccueil': 'Point Accueil'
    };
    
    const typeActuelLabel = typesLabels[typeActuel] || typeActuel;
    const nouveauTypeLabel = typesLabels[nouveauType] || nouveauType;
    
    if (!confirm(`Êtes-vous sûr de vouloir déplacer cette intervention de "${typeActuelLabel}" vers "${nouveauTypeLabel}" ?`)) {
      return;
    }
    
    await window.changerTypeIntervention(interventionId, nouveauType);
    
    // Afficher un message de succès
    alert(`✅ Intervention déplacée avec succès vers ${nouveauTypeLabel}`);
    
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
  } catch (error) {
    console.error('❌ Erreur lors du déplacement:', error);
    alert('❌ Erreur lors du déplacement : ' + error.message);
  }
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
  window.deplacerIntervention = deplacerIntervention;
  window.trouverInterventionParPersonneDateType = trouverInterventionParPersonneDateType;
}

console.log('✅ Module déplacement d\'interventions chargé');
