/**
 * Gestionnaire de la modale de gestion des doublons
 * Ouvre avec la fiche sélectionnée à gauche et les filtres à droite
 */

(function() {
  'use strict';

  let ficheSelectionnee = null;
  let toutesLesPersonnes = [];

  /**
   * Calcule la similarité entre deux chaînes (distance de Levenshtein normalisée)
   */
  function calculerSimilarite(str1, str2) {
    if (!str1 || !str2) return 0;
    
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();
    
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    // Matrice de distance
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[len1][len2];
    return 1 - (distance / maxLen);
  }

  /**
   * Calcule le score de similarité entre deux personnes
   */
  function calculerScoreSimilarite(personne1, personne2) {
    if (personne1.id === personne2.id) return 0; // Même personne
    
    let score = 0;
    let poids = 0;
    
    // Nom (poids: 3)
    if (personne1.nom && personne2.nom) {
      score += calculerSimilarite(personne1.nom, personne2.nom) * 3;
      poids += 3;
    }
    
    // Prénom (poids: 3)
    if (personne1.prenom && personne2.prenom) {
      score += calculerSimilarite(personne1.prenom, personne2.prenom) * 3;
      poids += 3;
    }
    
    // Date de naissance (poids: 4) - exact match
    if (personne1.dateNaissance && personne2.dateNaissance) {
      score += (personne1.dateNaissance === personne2.dateNaissance ? 1 : 0) * 4;
      poids += 4;
    }
    
    // Description physique (poids: 2)
    if (personne1.descriptionPhysique && personne2.descriptionPhysique) {
      score += calculerSimilarite(personne1.descriptionPhysique, personne2.descriptionPhysique) * 2;
      poids += 2;
    }
    
    // Typologie (poids: 1)
    if (personne1.typologie && personne2.typologie) {
      score += (personne1.typologie === personne2.typologie ? 1 : 0) * 1;
      poids += 1;
    }
    
    return poids > 0 ? score / poids : 0;
  }

  /**
   * Ouvre la modale de gestion des doublons
   */
  async function ouvrirModaleDoublons(personneId) {
    const modal = document.getElementById('modal-doublons');
    if (!modal) {
      console.error('❌ Modale doublons introuvable');
      return;
    }
    
    try {
      // Charger la personne sélectionnée
      ficheSelectionnee = await window.getPersonneById(personneId);
      
      if (!ficheSelectionnee) {
        alert('Erreur : impossible de charger la fiche');
        return;
      }
      
      // Charger toutes les personnes
      toutesLesPersonnes = await window.getAllPersonnes();
      
      // Afficher la fiche parent
      afficherFicheSelectionnee();
      
      // Vérifier s'il y a des transmissions en doublon pour cette personne
      await verifierTransmissionsDoublons();
      
      // Afficher un état vide (l'utilisateur doit rechercher manuellement)
      const container = document.getElementById('doublons-candidates-container');
      const countElement = document.getElementById('doublons-count');
      
      if (container) {
        container.innerHTML = `
          <div class="doublons-empty-results">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <p>Utilisez les filtres ci-dessus pour rechercher des fiches</p>
            <small>Tapez un nom, prénom, date de naissance, etc.</small>
          </div>
        `;
      }
      
      if (countElement) {
        countElement.textContent = '0';
      }
      
      // Réinitialiser les filtres
      document.getElementById('filter-doublon-nom').value = '';
      document.getElementById('filter-doublon-prenom').value = '';
      document.getElementById('filter-doublon-ddn').value = '';
      document.getElementById('filter-doublon-description').value = '';
      document.getElementById('filter-doublon-typologie').value = '';
      document.getElementById('filter-doublon-departement').value = '';
      
      // Réattacher les événements (au cas où)
      const btnClose = document.getElementById('close-modal-doublons');
      if (btnClose) {
        btnClose.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          fermerModaleDoublons();
        };
      }
      
      // Ouvrir la modale
      modal.classList.add('active');
      
      console.log('✅ Modale doublons ouverte pour personne ID:', personneId);
      
    } catch (error) {
      console.error('❌ Erreur ouverture modale doublons:', error);
      alert('Erreur lors de l\'ouverture de la modale');
    }
  }

  /**
   * Affiche la fiche sélectionnée
   */
  function afficherFicheSelectionnee() {
    const container = document.getElementById('fiche-selected-container');
    if (!container || !ficheSelectionnee) return;
    
    const nomComplet = ficheSelectionnee.inconnu 
      ? 'Inconnu' 
      : `${ficheSelectionnee.prenom || ''} ${ficheSelectionnee.nom || ''}`.trim() || 'Non renseigné';
    
    container.innerHTML = `
      <div class="fiche-selected-card">
        <h4>${nomComplet}</h4>
        <div class="fiche-detail-row">
          <span class="fiche-detail-label">ID :</span>
          <span class="fiche-detail-value">#${ficheSelectionnee.id}</span>
        </div>
        <div class="fiche-detail-row">
          <span class="fiche-detail-label">Nom :</span>
          <span class="fiche-detail-value">${ficheSelectionnee.nom || 'Non renseigné'}</span>
        </div>
        <div class="fiche-detail-row">
          <span class="fiche-detail-label">Prénom :</span>
          <span class="fiche-detail-value">${ficheSelectionnee.prenom || 'Non renseigné'}</span>
        </div>
        <div class="fiche-detail-row">
          <span class="fiche-detail-label">Date de naissance :</span>
          <span class="fiche-detail-value">${ficheSelectionnee.dateNaissance ? new Date(ficheSelectionnee.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
        </div>
        ${ficheSelectionnee.descriptionPhysique ? `
          <div class="fiche-detail-row">
            <span class="fiche-detail-label">Description :</span>
            <span class="fiche-detail-value">${ficheSelectionnee.descriptionPhysique}</span>
          </div>
        ` : ''}
        ${ficheSelectionnee.typologie ? `
          <div class="fiche-detail-row">
            <span class="fiche-detail-label">Typologie :</span>
            <span class="fiche-detail-value">${ficheSelectionnee.typologie}</span>
          </div>
        ` : ''}
        ${ficheSelectionnee.departement ? `
          <div class="fiche-detail-row">
            <span class="fiche-detail-label">Département :</span>
            <span class="fiche-detail-value">${ficheSelectionnee.departement}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Vérifie s'il y a des transmissions en doublon (même jour, même personne)
   */
  async function verifierTransmissionsDoublons() {
    if (!ficheSelectionnee) return;
    
    try {
      // Récupérer toutes les interventions de cette personne
      let interventions = [];
      
      if (typeof window.getAllInterventions === 'function') {
        const allInterventions = await window.getAllInterventions();
        interventions = allInterventions.filter(i => i.personneId === ficheSelectionnee.id);
      } else {
        console.warn('⚠️ Fonction getAllInterventions non disponible');
        return;
      }
      
      console.log(`🔍 ${interventions.length} intervention(s) trouvée(s) pour la personne ${ficheSelectionnee.id}`);
      
      // Grouper par date et type
      const groupesParDateType = {};
      
      interventions.forEach(intervention => {
        const key = `${intervention.date}_${intervention.type}`;
        if (!groupesParDateType[key]) {
          groupesParDateType[key] = [];
        }
        groupesParDateType[key].push(intervention);
      });
      
      // Trouver les doublons (même date, même type, plus d'une intervention)
      const doublons = Object.entries(groupesParDateType)
        .filter(([key, interventions]) => interventions.length > 1)
        .map(([key, interventions]) => ({
          date: interventions[0].date,
          type: interventions[0].type,
          interventions: interventions
        }));
      
      console.log(`⚠️ ${doublons.length} doublon(s) de transmission détecté(s)`);
      
      if (doublons.length > 0) {
        afficherInterfaceFusionTransmissions(doublons);
      }
    } catch (error) {
      console.error('❌ Erreur vérification transmissions doublons:', error);
    }
  }

  /**
   * Affiche l'interface de fusion des transmissions en doublon
   */
  function afficherInterfaceFusionTransmissions(doublons) {
    const container = document.getElementById('doublons-candidates-container');
    if (!container) return;
    
    // Créer une section avant les candidats
    let html = '';
    
    doublons.forEach((doublon, index) => {
      const [intervention1, intervention2] = doublon.interventions;
      
      html += `
        <div class="fusion-transmissions-section" data-doublon-index="${index}">
          <h4>
            <span class="warning-icon">⚠️</span>
            Transmissions en doublon détectées - ${new Date(doublon.date).toLocaleDateString('fr-FR')} - ${doublon.type}
          </h4>
          
          <div class="fusion-help">
            <strong>💡 Instructions :</strong> Ces deux transmissions ont été saisies le même jour pour la même maraude. 
            Modifiez les champs de la transmission parent (gauche, qui sera conservée), 
            vous pouvez copier des valeurs depuis le doublon (droite) avec les boutons « ← Copier ».
          </div>
          
          <div class="transmissions-compare">
            <!-- Transmission parent (gauche) -->
            <div class="transmission-panel primary">
              <div class="transmission-panel-header">
                <span class="transmission-panel-title">Transmission parent (à conserver)</span>
                <span class="panel-badge">Parent</span>
              </div>
              ${genererChampsTransmission(intervention1, intervention2, 'principal', index)}
            </div>
            
            <!-- Transmission à fusionner (droite) -->
            <div class="transmission-panel">
              <div class="transmission-panel-header">
                <span class="transmission-panel-title">Transmission doublon (à supprimer)</span>
                <span class="panel-badge">Doublon</span>
              </div>
              ${genererChampsTransmission(intervention2, intervention1, 'secondaire', index)}
            </div>
          </div>
          
          <div class="fusion-actions">
            <button class="btn-fusion-validate" data-intervention1-id="${intervention1.id}" data-intervention2-id="${intervention2.id}" data-doublon-index="${index}">
              ✓ Fusionner et supprimer le doublon
            </button>
            <button class="btn-fusion-cancel" data-doublon-index="${index}">
              Ignorer
            </button>
          </div>
        </div>
      `;
    });
    
    // Insérer au début du container
    container.insertAdjacentHTML('afterbegin', html);
    
    // Attacher les événements
    attachFusionTransmissionsEvents();
  }

  /**
   * Génère les champs d'une transmission pour la comparaison
   */
  function genererChampsTransmission(intervention, autreIntervention, type, index) {
    const isEditable = type === 'principal';
    const fields = [
      { key: 'typeTransmission', label: 'Type transmission' },
      { key: 'adresse', label: 'Adresse' },
      { key: 'ville', label: 'Ville' },
      { key: 'signalement', label: 'Signalement' },
      { key: 'transmission', label: 'Transmission', multiline: true }
    ];
    
    let html = '';
    
    fields.forEach(field => {
      const value = intervention[field.key] || '';
      const autreValue = autreIntervention[field.key] || '';
      const isEmpty = !value;
      const isDifferent = value !== autreValue;
      
      html += `<div class="transmission-field">`;
      html += `<label class="transmission-field-label">${field.label}</label>`;
      
      if (isEditable) {
        if (field.multiline) {
          html += `<textarea class="transmission-field-input" data-field="${field.key}" data-index="${index}">${value}</textarea>`;
        } else {
          html += `<input type="text" class="transmission-field-input" data-field="${field.key}" data-index="${index}" value="${value}">`;
        }
        
        // Bouton copier si la valeur est différente et l'autre a une valeur
        if (isDifferent && autreValue) {
          html += `<div class="transmission-field-actions">`;
          html += `<button class="btn-copy-field" data-source-value="${autreValue.replace(/"/g, '&quot;')}" data-target-field="${field.key}" data-index="${index}">← Copier depuis la droite</button>`;
          html += `</div>`;
        }
      } else {
        html += `<div class="transmission-field-value ${isEmpty ? 'empty' : ''}">${value || 'Non renseigné'}</div>`;
      }
      
      html += `</div>`;
    });
    
    return html;
  }

  /**
   * Attache les événements pour la fusion des transmissions
   */
  function attachFusionTransmissionsEvents() {
    console.log('🔧 Attachement des événements de fusion');
    
    // Boutons copier
    document.querySelectorAll('.btn-copy-field').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sourceValue = btn.dataset.sourceValue;
        const targetField = btn.dataset.targetField;
        const index = btn.dataset.index;
        
        console.log(`📋 Copie du champ ${targetField} avec la valeur:`, sourceValue);
        
        const input = document.querySelector(`[data-field="${targetField}"][data-index="${index}"]`);
        if (input) {
          input.value = sourceValue;
          btn.disabled = true;
          btn.textContent = '✓ Copié';
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '← Copier depuis la droite';
          }, 1500);
        }
      });
    });
    
    // Boutons valider fusion
    document.querySelectorAll('.btn-fusion-validate').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const intervention1Id = parseInt(btn.dataset.intervention1Id);
        const intervention2Id = parseInt(btn.dataset.intervention2Id);
        const index = btn.dataset.doublonIndex;
        
        console.log(`🔄 Début fusion: intervention ${intervention1Id} et ${intervention2Id}, index ${index}`);
        
        await fusionnerTransmissions(intervention1Id, intervention2Id, index);
      });
    });
    
    // Boutons annuler
    document.querySelectorAll('.btn-fusion-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = btn.closest('.fusion-transmissions-section');
        if (section) {
          section.style.display = 'none';
        }
      });
    });
  }

  /**
   * Fusionne deux transmissions
   */
  async function fusionnerTransmissions(intervention1Id, intervention2Id, index) {
    console.log(`🔄 Fusion demandée: ${intervention1Id} <- ${intervention2Id}`);
    
    const confirmMsg = 'Êtes-vous sûr de vouloir fusionner ces transmissions ?\n\n' +
                      'La transmission de gauche sera mise à jour avec vos modifications,\n' +
                      'et la transmission de droite sera supprimée.\n\n' +
                      'Cette action est IRRÉVERSIBLE.';
    
    if (!confirm(confirmMsg)) {
      console.log('❌ Fusion annulée par l\'utilisateur');
      return;
    }
    
    try {
      // Récupérer les valeurs modifiées
      const section = document.querySelector(`[data-doublon-index="${index}"]`);
      if (!section) {
        console.error(`❌ Section avec index ${index} introuvable`);
        alert('Erreur : impossible de trouver la section de fusion');
        return;
      }
      
      const updates = {};
      const inputs = section.querySelectorAll(`[data-index="${index}"]`);
      
      console.log(`📝 ${inputs.length} champs à mettre à jour`);
      
      inputs.forEach(input => {
        const field = input.dataset.field;
        updates[field] = input.value;
        console.log(`  - ${field}: ${input.value}`);
      });
      
      console.log('📤 Mise à jour de l\'intervention', intervention1Id, 'avec:', updates);
      
      // Vérifier que les fonctions existent
      if (typeof window.updateIntervention !== 'function') {
        throw new Error('Fonction updateIntervention non disponible');
      }
      
      if (typeof window.deleteIntervention !== 'function') {
        throw new Error('Fonction deleteIntervention non disponible');
      }
      
      // Mettre à jour l'intervention principale
      await window.updateIntervention(intervention1Id, updates);
      console.log('✅ Intervention mise à jour');
      
      // Supprimer l'intervention en doublon
      await window.deleteIntervention(intervention2Id);
      console.log('✅ Intervention en doublon supprimée');
      
      alert('✅ Transmissions fusionnées avec succès !');
      
      // Masquer la section
      section.style.display = 'none';
      
      // Recharger les données
      console.log('🔄 Rechargement des données...');
      await verifierTransmissionsDoublons();
      
    } catch (error) {
      console.error('❌ Erreur fusion transmissions:', error);
      alert(`Erreur lors de la fusion des transmissions : ${error.message}`);
    }
  }

  /**
   * Recherche les fiches selon les filtres
   */
  async function rechercherDoublons() {
    if (!ficheSelectionnee) return;
    
    const filterNom = document.getElementById('filter-doublon-nom').value.toLowerCase().trim();
    const filterPrenom = document.getElementById('filter-doublon-prenom').value.toLowerCase().trim();
    const filterDdn = document.getElementById('filter-doublon-ddn').value;
    const filterDescription = document.getElementById('filter-doublon-description')?.value.toLowerCase().trim() || '';
    const filterTypologie = document.getElementById('filter-doublon-typologie')?.value.toLowerCase().trim() || '';
    const filterDepartement = document.getElementById('filter-doublon-departement')?.value.toLowerCase().trim() || '';
    
    // Filtrer les personnes (exclure la fiche parent)
    let candidats = toutesLesPersonnes.filter(p => p.id !== ficheSelectionnee.id);
    
    // Appliquer les filtres
    if (filterNom) {
      candidats = candidats.filter(p => 
        p.nom && p.nom.toLowerCase().includes(filterNom)
      );
    }
    
    if (filterPrenom) {
      candidats = candidats.filter(p => 
        p.prenom && p.prenom.toLowerCase().includes(filterPrenom)
      );
    }
    
    if (filterDdn) {
      candidats = candidats.filter(p => p.dateNaissance === filterDdn);
    }
    
    if (filterDescription) {
      candidats = candidats.filter(p => 
        p.descriptionPhysique && p.descriptionPhysique.toLowerCase().includes(filterDescription)
      );
    }
    
    if (filterTypologie) {
      candidats = candidats.filter(p => 
        p.typologie && p.typologie.toLowerCase().includes(filterTypologie)
      );
    }
    
    if (filterDepartement) {
      candidats = candidats.filter(p => 
        p.departement && p.departement.toLowerCase().includes(filterDepartement)
      );
    }
    
    // Afficher les résultats
    afficherCandidats(candidats);
  }

  /**
   * Affiche les candidats
   */
  function afficherCandidats(candidats) {
    const container = document.getElementById('doublons-candidates-container');
    const countElement = document.getElementById('doublons-count');
    
    if (!container || !countElement) return;
    
    countElement.textContent = candidats.length;
    
    if (candidats.length === 0) {
      container.innerHTML = `
        <div class="doublons-empty-results">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p>Aucun résultat trouvé</p>
          <small>Utilisez les filtres ci-dessus pour rechercher des fiches</small>
        </div>
      `;
      return;
    }
    
    container.innerHTML = candidats.map(candidat => {
      const nomComplet = candidat.inconnu 
        ? 'Inconnu' 
        : `${candidat.prenom || ''} ${candidat.nom || ''}`.trim() || 'Non renseigné';
      
      return `
        <div class="doublon-candidate-card">
          <div class="candidate-header">
            <h4 class="candidate-name">${nomComplet}</h4>
          </div>
          <div class="candidate-details">
            <div class="candidate-detail-row">
              <strong>ID :</strong>
              <span>#${candidat.id}</span>
            </div>
            <div class="candidate-detail-row">
              <strong>Nom :</strong>
              <span>${candidat.nom || 'Non renseigné'}</span>
            </div>
            <div class="candidate-detail-row">
              <strong>Prénom :</strong>
              <span>${candidat.prenom || 'Non renseigné'}</span>
            </div>
            <div class="candidate-detail-row">
              <strong>Date naissance :</strong>
              <span>${candidat.dateNaissance ? new Date(candidat.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
            </div>
            ${candidat.descriptionPhysique ? `
              <div class="candidate-detail-row">
                <strong>Description :</strong>
                <span>${candidat.descriptionPhysique}</span>
              </div>
            ` : ''}
            ${candidat.typologie ? `
              <div class="candidate-detail-row">
                <strong>Typologie :</strong>
                <span>${candidat.typologie}</span>
              </div>
            ` : ''}
            ${candidat.departement ? `
              <div class="candidate-detail-row">
                <strong>Département :</strong>
                <span>${candidat.departement}</span>
              </div>
            ` : ''}
          </div>
          <div class="candidate-actions">
            <button class="btn-merge" data-candidat-id="${candidat.id}">
              Fusionner avec la fiche parent
            </button>
            <button class="btn-not-duplicate" data-candidat-id="${candidat.id}">
              Ignorer
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Ajouter les événements
    attachCandidateEvents();
  }

  /**
   * Attache les événements aux boutons des candidats
   */
  function attachCandidateEvents() {
    // Boutons fusionner
    document.querySelectorAll('.btn-merge').forEach(btn => {
      btn.addEventListener('click', () => {
        const candidatId = parseInt(btn.dataset.candidatId);
        fusionnerFiches(ficheSelectionnee.id, candidatId);
      });
    });
    
    // Boutons "ignorer"
    document.querySelectorAll('.btn-not-duplicate').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.doublon-candidate-card');
        card.style.display = 'none';
        
        // Mettre à jour le compteur
        const countElement = document.getElementById('doublons-count');
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = Math.max(0, currentCount - 1);
      });
    });
  }

  /**
   * Fusionne deux fiches
   */
  async function fusionnerFiches(ficheOrigineId, ficheCibleId) {
    const confirm_msg = 'Êtes-vous sûr de vouloir fusionner ces deux fiches ?\n\n' +
                       'Cette action va :\n' +
                       '- Transférer toutes les interventions vers la fiche principale\n' +
                       '- Supprimer la fiche en doublon\n' +
                       '- Cette action est IRRÉVERSIBLE';
    
    if (!confirm(confirm_msg)) {
      return;
    }
    
    try {
      console.log(`🔄 Fusion des fiches ${ficheOrigineId} et ${ficheCibleId}`);
      
      // Utiliser la fonction de fusion si disponible
      if (typeof window.fusionnerPersonnes === 'function') {
        // fusionnerPersonnes attend (idPrincipal, [idsAFusionner])
        await window.fusionnerPersonnes(ficheOrigineId, [ficheCibleId]);
        alert('✅ Fiches fusionnées avec succès !');
        
        // Rafraîchir la recherche
        toutesLesPersonnes = await window.getAllPersonnes();
        rechercherDoublons();
        
      } else {
        alert('❌ Fonction de fusion non disponible');
      }
      
    } catch (error) {
      console.error('❌ Erreur fusion:', error);
      alert(`Erreur lors de la fusion des fiches : ${error.message}`);
    }
  }

  /**
   * Ferme la modale
   */
  function fermerModaleDoublons() {
    const modal = document.getElementById('modal-doublons');
    if (modal) {
      modal.classList.remove('active');
      ficheSelectionnee = null;
      toutesLesPersonnes = [];
    }
  }

  /**
   * Initialisation
   */
  function initModaleDoublons() {
    const modal = document.getElementById('modal-doublons');
    const btnClose = document.getElementById('close-modal-doublons');
    
    // Vérifier que les éléments existent
    if (!modal || !btnClose) {
      console.warn('⚠️ Modale doublons : éléments non trouvés, réessai dans 500ms');
      setTimeout(initModaleDoublons, 500);
      return;
    }
    
    // Bouton fermer
    btnClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fermerModaleDoublons();
      console.log('✅ Modale fermée via bouton X');
    });
    
    // Clic en dehors de la modale
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        fermerModaleDoublons();
      }
    });
    
    // Touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        fermerModaleDoublons();
      }
    });
    
    // Filtres
    const filters = [
      'filter-doublon-nom',
      'filter-doublon-prenom',
      'filter-doublon-ddn',
      'filter-doublon-description',
      'filter-doublon-typologie',
      'filter-doublon-departement'
    ];
    
    filters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('input', rechercherDoublons);
        filter.addEventListener('change', rechercherDoublons);
      }
    });
    
    console.log('✅ Modale doublons initialisée');
  }

  // Initialiser au chargement - avec délai pour attendre le html-loader
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initModaleDoublons, 1000); // Attendre que html-loader ait fini
    });
  } else {
    setTimeout(initModaleDoublons, 1000);
  }

  // Exposer les fonctions globalement
  window.ouvrirModaleDoublons = ouvrirModaleDoublons;
  window.fermerModaleDoublons = fermerModaleDoublons;

  console.log('✅ Module modale doublons chargé');
})();

