/**
 * Code métier ADP - Ajout personne complète avec BASE UNIFIÉE
 * Utilise database-unified.js
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Trouve une intervention ADP par personneId et date
 */
async function findAdpByPersonAndDate(personneId, date) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  const interventions = await window.getInterventionsByPersonneAndDate(pid, date);
  console.log('🔍 Recherche ADP pour personneId:', pid, 'date:', date, '- trouvé:', interventions?.length || 0, 'interventions');
  const found = interventions.find(i => i.type === 'adp');
  console.log('🔍 ADP trouvée:', found ? `ID ${found.id}` : 'Aucune');
  return found;
}

/**
 * Trouve une ADP par personId, date ET typeTransmission
 */
async function findAdpByPersonDateAndType(personneId, date, typeTransmission) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  // Vérifier que les paramètres requis sont valides
  if (!pid || !date) {
    console.warn('🔍 Paramètres invalides pour findAdpByPersonDateAndType:', { pid, date, typeTransmission });
    return null;
  }
  
  // Si typeTransmission est vide, utiliser findAdpByPersonAndDate
  if (!typeTransmission || (typeof typeTransmission === 'string' && typeTransmission.trim() === '')) {
    console.log('🔍 typeTransmission vide, utilisation de findAdpByPersonAndDate');
    return await findAdpByPersonAndDate(pid, date);
  }
  
  console.log('🔍 Recherche ADP pour personneId:', pid, 'date:', date, 'typeTransmission:', typeTransmission);
  
  try {
    // Utiliser la nouvelle fonction si disponible
    if (typeof window.getInterventionByFullKey === 'function') {
      const intervention = await window.getInterventionByFullKey(pid, date, 'adp', typeTransmission);
      console.log('🔍 Résultat via getInterventionByFullKey:', intervention ? `ID ${intervention.id}` : 'Aucune');
      
      // Si pas trouvé, essayer avec recherche insensible à la casse
      if (!intervention) {
        const allInterventions = await window.getInterventionsByPersonneAndDate(pid, date);
        const found = allInterventions.find(i => i.type === 'adp' && i.typeTransmission && i.typeTransmission.toLowerCase() === typeTransmission.toLowerCase());
        if (found) {
          console.log('🔍 ✅ ADP trouvée via recherche insensible à la casse! ID:', found.id);
          return found;
        }
      }
      
      return intervention;
    }
    
    // Fallback : chercher parmi toutes les interventions de cette date
    const interventions = await window.getInterventionsByPersonneAndDate(pid, date);
    const found = interventions.find(i => i.type === 'adp' && i.typeTransmission && i.typeTransmission.toLowerCase() === typeTransmission.toLowerCase());
    console.log('🔍 Résultat via filtrage:', found ? `ID ${found.id}` : 'Aucune');
    return found;
  } catch (error) {
    console.error('Erreur lors de la recherche ADP:', error);
    return null;
  }
}

/**
 * Récupère la dernière adresse utilisée pour une personne
 * @param {number} personneId - L'ID de la personne
 * @returns {Object|null} - Objet avec adresse et ville, ou null
 */
async function getDerniereAdresseAdp(personneId) {
  try {
    const toutesInterventions = await window.getAllInterventions();
    const interventionsPersonne = toutesInterventions
      .filter(i => i.personneId === personneId && (i.adresse || i.lieu))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (interventionsPersonne.length === 0) {
      return null;
    }
    
    const derniereIntervention = interventionsPersonne[0];
    return {
      adresse: derniereIntervention.adresse || derniereIntervention.lieu || '',
      ville: derniereIntervention.ville || ''
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la dernière adresse:', error);
    return null;
  }
}

/**
 * Réinitialise les champs du formulaire ADP pour une nouvelle transmission
 * @param {string} date - La date au format YYYY-MM-DD
 * @param {string} typeTransmission - Le type de transmission (Jour/Nuit/Coordo)
 */
function resetAdpFormFieldsForNewTransmission(date, typeTransmission) {
  console.log('🔄 Réinitialisation du formulaire ADP pour nouvelle transmission');
  
  // Réinitialiser l'ID d'édition
  const editIdField = document.getElementById('edit-adp-id');
  if (editIdField) editIdField.value = '';
  
  // Mettre à jour la date et le type de transmission
  const dateField = document.getElementById('adp-form-date');
  if (dateField) dateField.value = date;
  
  const typeField = document.getElementById('adp-form-type-transmission');
  if (typeField) typeField.value = typeTransmission;
  
  // Réinitialiser les champs de transmission (garder les infos personnelles)
  const fieldsToReset = [
    'adp-form-lieu-rencontre',
    'adp-form-aller-vers',
    'adp-form-commentaires'
  ];
  
  fieldsToReset.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = '';
  });
  
  // Réinitialiser les checkboxes d'accompagnement
  const accompCheckboxes = document.querySelectorAll('#modal-adp input[name="accompagnement"]');
  accompCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser les checkboxes de distribution
  const distribCheckboxes = document.querySelectorAll('#modal-adp input[name="distribution"]');
  distribCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser les checkboxes de motif intervention
  const motifCheckboxes = document.querySelectorAll('#modal-adp input[name="motifIntervention"]');
  motifCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser le checkbox Attention
  const attentionCheckbox = document.getElementById('adp-form-attention');
  if (attentionCheckbox) attentionCheckbox.checked = false;
  
  console.log('✅ Formulaire ADP réinitialisé pour nouvelle transmission');
}

/**
 * Charge les données ADP pour une date et un type donnés
 * @param {number} personneId - L'ID de la personne
 * @param {string} date - La date au format YYYY-MM-DD
 * @param {string} typeTransmission - Le type de transmission (Jour/Nuit/Coordo)
 */
async function loadAdpDataForDate(personneId, date, typeTransmission) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  console.log('📅 loadAdpDataForDate appelé avec:', { personneId: pid, date, typeTransmission });
  
  try {
    // Recharger les informations de la personne pour s'assurer d'avoir les données à jour
    const personne = await window.getPersonneById(pid);
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', pid);
      await window.customAlert('Erreur : personne non trouvée', 'error');
      return;
    }
    
    // S'assurer que le personneId est défini dans le dataset du formulaire pour les boutons historique
    const form = document.getElementById('form-adp');
    if (form) {
      form.dataset.personneId = pid;
      console.log('📝 PersonneId défini dans le dataset ADP:', pid);
    }
    
    // Récupérer les DERNIÈRES infos connues
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Recharger les informations personnelles
    document.getElementById('adp-form-nom').value = personne.nom || '';
    document.getElementById('adp-form-prenom').value = personne.prenom || '';
    document.getElementById('adp-form-ddn').value = personne.dateNaissance || '';
    document.getElementById('adp-form-description').value = personne.descriptionPhysique || '';
    document.getElementById('adp-form-inconnu').checked = personne.inconnu || false;
    document.getElementById('adp-form-departement').value = dernieresInfos.departement;
    document.getElementById('adp-form-typologie').value = dernieresInfos.typologie;
    document.getElementById('adp-form-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('adp-form-mineurs').value = dernieresInfos.mineurs;
    
    // Chercher si une ADP existe pour cette personne à cette date avec ce type
    const existingAdp = await findAdpByPersonDateAndType(pid, date, typeTransmission);
    
    console.log('📋 ADP trouvée:', existingAdp ? `ID ${existingAdp.id}` : 'Aucune', existingAdp);
    
    // Mettre à jour le sélecteur de type de transmission
    const typeSelect = document.getElementById('adp-form-type-transmission');
    if (typeSelect && typeTransmission) {
      typeSelect.value = typeTransmission;
    }
    
    if (existingAdp) {
      // Remplir les champs de l'intervention existante
      document.getElementById('adp-form-type-transmission').value = existingAdp.typeTransmission || '';
      document.getElementById('adp-form-adresse').value = existingAdp.lieu || '';
      document.getElementById('adp-form-ville').value = existingAdp.ville || '';
      document.getElementById('adp-form-signalement').value = existingAdp.signalement || '';
      document.getElementById('adp-form-transmission').value = existingAdp.observations || '';
      
      // Checkbox Attention
      if (document.getElementById('adp-form-attention')) {
        document.getElementById('adp-form-attention').checked = existingAdp.attention || false;
      }
      
      // Checkboxes Orly
      if (existingAdp.orly) {
        ['adp-form-premier-contact', 'adp-form-personne-presente', 'adp-form-pnt', 'adp-form-maraude', 'adp-form-veille', 'adp-form-refus-contact'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            const key = id.replace('adp-form-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            el.checked = existingAdp.orly[key] || false;
          }
        });
      } else {
        ['adp-form-premier-contact', 'adp-form-personne-presente', 'adp-form-pnt', 'adp-form-maraude', 'adp-form-veille', 'adp-form-refus-contact'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      // Checkboxes Accompagnement
      if (existingAdp.accompagnement) {
        const accompMap = {
          'adp-form-accomp-hygiene': 'hygiene',
          'adp-form-accomp-accueil-jour': 'accueilJour',
          'adp-form-accomp-admin': 'admin',
          'adp-form-accomp-hebergement': 'hebergement',
          'adp-form-accomp-medical': 'medical'
        };
        Object.entries(accompMap).forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) el.checked = existingAdp.accompagnement[key] || false;
        });
      } else {
        ['adp-form-accomp-hygiene', 'adp-form-accomp-accueil-jour', 'adp-form-accomp-admin', 'adp-form-accomp-hebergement', 'adp-form-accomp-medical'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      // Checkboxes Distribution
      if (existingAdp.distribution) {
        const distribMap = {
          'adp-form-distrib-boisson': 'boisson',
          'adp-form-distrib-alimentaire': 'alimentaire',
          'adp-form-distrib-duvet': 'duvet',
          'adp-form-distrib-couverture-survie': 'couvertureSurvie',
          'adp-form-distrib-bonnets-gants': 'bonnetsGants',
          'adp-form-distrib-sous-vetements': 'sousVetements',
          'adp-form-distrib-kits-hygiene': 'kitsHygiene'
        };
        Object.entries(distribMap).forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) el.checked = existingAdp.distribution[key] || false;
        });
      } else {
        ['adp-form-distrib-boisson', 'adp-form-distrib-alimentaire', 'adp-form-distrib-duvet', 'adp-form-distrib-couverture-survie', 'adp-form-distrib-bonnets-gants', 'adp-form-distrib-sous-vetements', 'adp-form-distrib-kits-hygiene'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      document.getElementById('modal-adp').dataset.editId = existingAdp.id;
      
      // Afficher le bouton de suppression en mode édition
      const btnSupprimer = document.getElementById('btn-supprimer-adp');
      if (btnSupprimer) btnSupprimer.style.display = 'inline-block';
    } else {
      // Pas de transmission pour cette date - réinitialiser les champs
      document.getElementById('adp-form-type-transmission').value = '';
      document.getElementById('adp-form-signalement').value = '';
      document.getElementById('adp-form-transmission').value = '';
      
      // Cacher le bouton de suppression
      const btnSupprimer = document.getElementById('btn-supprimer-adp');
      if (btnSupprimer) btnSupprimer.style.display = 'none';
      
      // Charger automatiquement la dernière adresse utilisée
      const derniereAdresse = await getDerniereAdresseAdp(personneId);
      if (derniereAdresse) {
        document.getElementById('adp-form-adresse').value = derniereAdresse.adresse || '';
        document.getElementById('adp-form-ville').value = derniereAdresse.ville || '';
      } else {
        document.getElementById('adp-form-adresse').value = '';
        document.getElementById('adp-form-ville').value = '';
      }
      
      // Décocher toutes les checkboxes de transmission
      document.querySelectorAll('#modal-adp .checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('modal-adp').dataset.editId;
    }
    
    console.log('✅ Données ADP chargées pour date:', date);
    
    // Réinitialiser les event listeners de collapse après chargement des données
    if (window.setupCollapseHandlers) {
      window.setupCollapseHandlers();
      console.log('🔄 Event listeners de collapse réinitialisés (ADP)');
    }
    
    // Si on est en mode consultation (depuis les statistiques), redésactiver les champs
    if (window.currentConsultationModal === 'modal-adp') {
      setTimeout(() => {
        if (typeof window.disableFormFieldsForConsultation === 'function') {
          window.disableFormFieldsForConsultation('modal-adp');
        }
      }, 50);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données ADP pour la date:', error);
  }
}
window.loadAdpDataForDate = loadAdpDataForDate;

/**
 * Édite une intervention ADP pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB unifiée
 * @param {string} date - Date optionnelle
 * @param {boolean} consultationMode - Mode consultation
 * @param {string} newTypeTransmission - Type à pré-sélectionner pour une nouvelle ADP
 */
async function editTransmissionAdp(personneId, date = null, consultationMode = false, newTypeTransmission = null) {
  console.log('📝 Compléter l\'ADP pour personne ID:', personneId, 'newType:', newTypeTransmission);
  
  try {
    // Charger la personne depuis la DB unifiée
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      await window.customAlert('Erreur lors du chargement des données', 'error');
      return;
    }
    
    console.log('✅ Personne trouvée:', personne);
    
    // Définir le personneId dans le dataset du formulaire pour les boutons historique
    const formAdp = document.getElementById('form-adp');
    if (formAdp) {
      formAdp.dataset.personneId = personneId;
      console.log('📝 PersonneId défini dans le dataset ADP (editTransmissionAdp):', personneId);
    }
    
    // Utiliser la date passée en paramètre si fournie, sinon celle de l'input
    const selectedDate = date || document.getElementById('adp-date')?.value;
    console.log('📅 Date sélectionnée:', selectedDate, '(paramètre date:', date, ')');
    
    // Chercher si une ADP existe pour cette personne à cette date
    // Si newTypeTransmission est fourni, on cherche pour ce type spécifique
    let existingAdp = null;
    if (newTypeTransmission) {
      // Chercher une ADP pour le type spécifique demandé
      existingAdp = await findAdpByPersonDateAndType(personneId, selectedDate, newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1));
      console.log('🆕 Création nouvelle ADP type:', newTypeTransmission, '- Existante:', existingAdp ? 'oui' : 'non');
    } else {
      // Comportement normal : chercher la première ADP pour cette date
      existingAdp = await findAdpByPersonAndDate(personneId, selectedDate);
    }
    
    console.log('📋 ADP existante:', existingAdp ? `ID ${existingAdp.id}` : 'Aucune');
    
    // Récupérer les DERNIÈRES infos connues (pour pré-remplir le formulaire)
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Remplir les champs avec les infos de la personne
    document.getElementById('adp-form-nom').value = personne.nom || '';
    document.getElementById('adp-form-prenom').value = personne.prenom || '';
    document.getElementById('adp-form-ddn').value = personne.dateNaissance || '';
    document.getElementById('adp-form-description').value = personne.descriptionPhysique || '';
    document.getElementById('adp-form-inconnu').checked = personne.inconnu || false;
    document.getElementById('adp-form-departement').value = dernieresInfos.departement;
    document.getElementById('adp-form-typologie').value = dernieresInfos.typologie;
    document.getElementById('adp-form-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('adp-form-mineurs').value = dernieresInfos.mineurs;
    
    if (existingAdp) {
      // MODE ÉDITION : charger toutes les données de l'ADP
      console.log('✅ ADP existante pour cette date - MODE ÉDITION');
      document.getElementById('adp-form-type-transmission').value = existingAdp.typeTransmission || '';
      document.getElementById('adp-form-adresse').value = existingAdp.lieu || '';
      document.getElementById('adp-form-ville').value = existingAdp.ville || '';
      document.getElementById('adp-form-signalement').value = existingAdp.signalement || '';
      document.getElementById('adp-form-transmission').value = existingAdp.observations || '';
      
      // Checkbox Attention
      if (document.getElementById('adp-form-attention')) {
        document.getElementById('adp-form-attention').checked = existingAdp.attention || false;
      }
      
      // Checkboxes Orly
      if (existingAdp.orly) {
        document.getElementById('adp-form-premier-contact').checked = existingAdp.orly.premierContact || false;
        document.getElementById('adp-form-personne-presente').checked = existingAdp.orly.personnePresente || false;
        document.getElementById('adp-form-pnt').checked = existingAdp.orly.pnt || false;
        document.getElementById('adp-form-maraude').checked = existingAdp.orly.maraude || false;
        document.getElementById('adp-form-veille').checked = existingAdp.orly.veille || false;
        document.getElementById('adp-form-refus-contact').checked = existingAdp.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingAdp.accompagnement) {
        const hygieneEl = document.getElementById('adp-form-accomp-hygiene');
        if (hygieneEl) hygieneEl.checked = existingAdp.accompagnement.hygiene || false;
        
        const accueilJourEl = document.getElementById('adp-form-accomp-accueil-jour');
        if (accueilJourEl) accueilJourEl.checked = existingAdp.accompagnement.accueilJour || false;
        
        const adminEl = document.getElementById('adp-form-accomp-admin');
        if (adminEl) adminEl.checked = existingAdp.accompagnement.admin || false;
        
        const hebergementEl = document.getElementById('adp-form-accomp-hebergement');
        if (hebergementEl) hebergementEl.checked = existingAdp.accompagnement.hebergement || false;
        
        const medicalEl = document.getElementById('adp-form-accomp-medical');
        if (medicalEl) medicalEl.checked = existingAdp.accompagnement.medical || false;
      }
      
      // Checkboxes Distribution
      if (existingAdp.distribution) {
        const boissonEl = document.getElementById('adp-form-distrib-boisson');
        if (boissonEl) boissonEl.checked = existingAdp.distribution.boisson || false;
        
        const alimentaireEl = document.getElementById('adp-form-distrib-alimentaire');
        if (alimentaireEl) alimentaireEl.checked = existingAdp.distribution.alimentaire || false;
        
        const duvetEl = document.getElementById('adp-form-distrib-duvet');
        if (duvetEl) duvetEl.checked = existingAdp.distribution.duvet || false;
        
        const couvertureSurvieEl = document.getElementById('adp-form-distrib-couverture-survie');
        if (couvertureSurvieEl) couvertureSurvieEl.checked = existingAdp.distribution.couvertureSurvie || false;
        
        const bonnetsGantsEl = document.getElementById('adp-form-distrib-bonnets-gants');
        if (bonnetsGantsEl) bonnetsGantsEl.checked = existingAdp.distribution.bonnetsGants || false;
        
        const sousVetementsEl = document.getElementById('adp-form-distrib-sous-vetements');
        if (sousVetementsEl) sousVetementsEl.checked = existingAdp.distribution.sousVetements || false;
        
        const kitsHygieneEl = document.getElementById('adp-form-distrib-kits-hygiene');
        if (kitsHygieneEl) kitsHygieneEl.checked = existingAdp.distribution.kitsHygiene || false;
      }
      
      document.getElementById('modal-adp').dataset.editId = existingAdp.id;
      console.log('🔖 editId défini à:', existingAdp.id);
      
      // Afficher le bouton de suppression en mode édition
      const btnSupprimer = document.getElementById('btn-supprimer-adp');
      if (btnSupprimer) btnSupprimer.style.display = 'inline-block';
    } else {
      // MODE CRÉATION : réinitialiser les champs d'intervention
      console.log('➕ Pas d\'ADP pour cette date - MODE CRÉATION');
      // Si un type est pré-sélectionné via newTypeTransmission, l'utiliser
      document.getElementById('adp-form-type-transmission').value = newTypeTransmission ? newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1) : '';
      document.getElementById('adp-form-signalement').value = '';
      document.getElementById('adp-form-transmission').value = '';
      
      // Cacher le bouton de suppression en mode création
      const btnSupprimer = document.getElementById('btn-supprimer-adp');
      if (btnSupprimer) btnSupprimer.style.display = 'none';
      
      // Charger automatiquement la dernière adresse utilisée
      const derniereAdresse = await getDerniereAdresseAdp(personneId);
      if (derniereAdresse) {
        document.getElementById('adp-form-adresse').value = derniereAdresse.adresse || '';
        document.getElementById('adp-form-ville').value = derniereAdresse.ville || '';
        console.log('📍 Adresse chargée automatiquement:', derniereAdresse);
      } else {
        document.getElementById('adp-form-adresse').value = '';
        document.getElementById('adp-form-ville').value = '';
      }
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-adp input[type="checkbox"]').forEach(cb => {
        if (cb.id !== 'adp-form-inconnu') { // Ne pas décocher "inconnu"
          cb.checked = false;
        }
      });
      
      delete document.getElementById('modal-adp').dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle ADP');
    }
    
    document.getElementById('modal-adp').dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
    // Replier automatiquement la section "Informations Personnelles" pour une personne existante
    const gridInfoPerso = document.getElementById('adp-grid-info-perso');
    const toggleIcon = document.querySelector('#adp-section-info-perso .collapse-toggle');
    if (gridInfoPerso && toggleIcon) {
      gridInfoPerso.classList.add('collapsed');
      gridInfoPerso.style.display = ''; // Reset display pour laisser le CSS gérer
      toggleIcon.classList.add('collapsed');
      console.log('📁 Section Informations Personnelles repliée automatiquement (ADP)');
    }
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-adp');
    if (modal) {
      // S'ASSURER que le modal est COMPLÈTEMENT réactivé
      modal.style.pointerEvents = 'auto';
      modal.style.zIndex = '1000';
      modal.classList.add('show');
      
      // RESTAURER les boutons Annuler et Enregistrer (pourraient être cachés par mode consultation)
      const btnAnnuler = document.getElementById('adp-btn-annuler');
      if (btnAnnuler) btnAnnuler.style.display = '';
      const btnEnregistrer = modal.querySelector('button[type="submit"]');
      if (btnEnregistrer) btnEnregistrer.style.display = '';
      
      // Retirer le bouton Fermer si présent (depuis mode consultation)
      const btnFermerConsultation = modal.querySelector('.btn-fermer-consultation');
      if (btnFermerConsultation) btnFermerConsultation.remove();
      
      // Nettoyer les anciens intervalles/timers avant d'en créer de nouveaux
      if (window._adpCollapseInterval) {
        clearInterval(window._adpCollapseInterval);
        window._adpCollapseInterval = null;
      }
      
      // Scroll vers le haut du formulaire et replier la section Informations Personnelles
      setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
        
        // S'assurer que les sections sont bien chargées avant d'initialiser
        let checkAttempts = 0;
        const maxAttempts = 20; // 1 seconde max
        window._adpCollapseInterval = setInterval(() => {
          checkAttempts++;
          const section = document.getElementById('adp-section-info-perso');
          if (section && section.querySelector('.form-grid')) {
            clearInterval(window._adpCollapseInterval);
            window._adpCollapseInterval = null;
            
            // Réinitialiser les gestionnaires de collapse directement
            if (window.setupCollapseHandlers) {
              window.setupCollapseHandlers();
            }
            
            // Replier la section après un court délai
            setTimeout(() => {
              if (window.replierSection) {
                window.replierSection('adp-section-info-perso');
              }
            }, 100);
          } else if (checkAttempts >= maxAttempts) {
            clearInterval(window._adpCollapseInterval);
            window._adpCollapseInterval = null;
            console.warn('⚠️ Timeout : section info perso ADP non trouvée');
          }
        }, 50);
        
        // Nettoyer l'ancien navigateur de dates s'il existe
        if (window._dateNavigatorCleanup) {
          window._dateNavigatorCleanup();
        }
        
        // Initialiser le navigateur de dates
        if (window.initDateNavigator) {
          const currentTypeTransmission = existingAdp?.typeTransmission || 
            document.getElementById('adp-form-type-transmission')?.value || '';
          
          window.initDateNavigator({
            type: 'adp',
            personneId: personneId,
            currentDate: selectedDate,
            currentTypeTransmission: currentTypeTransmission,
            hideToday: consultationMode, // En mode consultation, ne pas afficher la date du jour
            onDateChange: async (newDate, newTypeTransmission, isNewTransmission) => {
              if (isNewTransmission) {
                console.log('➕ Création nouvelle transmission ADP:', newTypeTransmission, 'pour', newDate);
                resetAdpFormFieldsForNewTransmission(newDate, newTypeTransmission);
              } else {
                await loadAdpDataForDate(personneId, newDate, newTypeTransmission);
              }
            }
          });
        }
      }, 100);
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
    await window.customAlert('Erreur lors du chargement des données', 'error');
  }
}
window.editTransmissionAdp = editTransmissionAdp;

/**
 * Initialise les filtres ADP
 */
function initAdpFilters() {
  // Initialiser la date du jour pour le sélecteur
  const dateInput = document.getElementById('adp-date');
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si entre minuit et 3h, utiliser la veille
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    dateInput.value = today.toISOString().split('T')[0];
    console.log('📅 Date ADP initialisée à:', dateInput.value);
  }
  
  // Ajouter listener pour rechargement au changement de date
  if (dateInput && !dateInput._listenersAttached) {
    dateInput.addEventListener('change', () => {
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
      }
    });
    dateInput._listenersAttached = true;
  }
  
  const filterNom = document.getElementById('adp-filter-nom');
  const filterPrenom = document.getElementById('adp-filter-prenom');
  const filterDdn = document.getElementById('adp-filter-ddn');
  const filterInconnu = document.getElementById('adp-filter-inconnu');
  const filterDescription = document.getElementById('adp-filter-description');

  const rechargerFiches = () => {
    if (typeof window.afficherToutesLesPersonnesADP === 'function') {
      window.afficherToutesLesPersonnesADP();
    }
  };

  if (filterNom && !filterNom._listenersAttached) {
    filterNom.addEventListener('input', rechargerFiches);
    filterNom._listenersAttached = true;
  }

  if (filterPrenom && !filterPrenom._listenersAttached) {
    filterPrenom.addEventListener('input', rechargerFiches);
    filterPrenom._listenersAttached = true;
  }

  if (filterDdn && !filterDdn._listenersAttached) {
    filterDdn.addEventListener('change', rechargerFiches);
    filterDdn._listenersAttached = true;
  }

  if (filterInconnu && !filterInconnu._listenersAttached) {
    filterInconnu.addEventListener('change', rechargerFiches);
    filterInconnu._listenersAttached = true;
  }

  if (filterDescription && !filterDescription._listenersAttached) {
    filterDescription.addEventListener('input', rechargerFiches);
    filterDescription._listenersAttached = true;
  }

  console.log('✅ Filtres ADP initialisés');
}

/**
 * Initialise le formulaire ADP
 */
function initAdpForm() {
  const btnAjouter = document.getElementById('adp-btn-ajouter');
  const modal = document.getElementById('modal-adp');
  const formAdp = document.getElementById('form-adp');
  const btnAnnuler = document.getElementById('adp-btn-annuler');
  const modalClose = document.querySelector('#modal-adp .adp-modal-close');
  
  if (!btnAjouter || !modal || !formAdp) {
    console.warn('⚠️ Éléments formulaire ADP non trouvés');
    return;
  }
  
  /**
   * Obtient la date à utiliser par défaut
   */
  function getDateParDefaut() {
    const maintenant = new Date();
    const heures = maintenant.getHours();
    
    if (heures >= 0 && heures < 3) {
      maintenant.setDate(maintenant.getDate() - 1);
    }
    
    return maintenant.toISOString().split('T')[0];
  }
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    formAdp.reset();
    delete modal.dataset.editId;
    delete modal.dataset.personneId;
    
    // Cacher le bouton de suppression en mode création
    const btnSupprimer = document.getElementById('btn-supprimer-adp');
    if (btnSupprimer) btnSupprimer.style.display = 'none';
    
    // RESTAURER les boutons Annuler et Enregistrer (pourraient être cachés par mode consultation)
    const btnAnnulerModal = document.getElementById('adp-btn-annuler');
    if (btnAnnulerModal) btnAnnulerModal.style.display = '';
    const btnEnregistrer = modal.querySelector('button[type="submit"]');
    if (btnEnregistrer) btnEnregistrer.style.display = '';
    
    // Retirer le bouton Fermer si présent (depuis mode consultation)
    const btnFermerConsultation = modal.querySelector('.btn-fermer-consultation');
    if (btnFermerConsultation) btnFermerConsultation.remove();
    
    // Cacher le navigateur de dates en mode création et réinitialiser le titre
    if (window.resetModalTitle) window.resetModalTitle('adp');
    
    const dateAdp = document.getElementById('adp-date');
    if (dateAdp && !dateAdp.value) {
      dateAdp.value = getDateParDefaut();
      console.log('📅 Date ADP initialisée à:', dateAdp.value);
    }
    
    modal.classList.add('show');
    
    // Scroll vers le haut du formulaire (sans replier la section pour Ajouter)
    setTimeout(() => {
      const modalBody = modal.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      // Réinitialiser les gestionnaires de collapse
      if (window.initSectionCollapse) {
        window.initSectionCollapse();
      }
      // S'assurer que la section Informations Personnelles est dépliée pour Ajouter
      setTimeout(() => {
        // Nettoyer tout style inline qui pourrait bloquer l'affichage
        const gridInfoPerso = document.getElementById('adp-grid-info-perso');
        if (gridInfoPerso) {
          gridInfoPerso.style.display = '';
          gridInfoPerso.classList.remove('collapsed');
        }
        const toggleIcon = document.querySelector('#adp-section-info-perso .collapse-toggle');
        if (toggleIcon) {
          toggleIcon.classList.remove('collapsed');
        }
        console.log('📂 Section Informations Personnelles dépliée pour Ajouter (ADP)');
      }, 50);
    }, 100);
  });
  
  // Fermer la modal
  const closeModal = () => {
    // Utiliser la fonction unifiée de fermeture
    window.closeModalSafely(modal, formAdp, {
      focusTarget: document.getElementById('adp-date')
    });
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Initialiser l'auto-complétion de la typologie
  if (typeof window.initTypologieAutocomplete === 'function') {
    window.initTypologieAutocomplete();
    console.log('✅ Auto-complétion typologie initialisée pour ADP');
  }
  
  // Event listener pour le bouton "Supprimer la transmission"
  const btnSupprimer = document.getElementById('btn-supprimer-adp');
  if (btnSupprimer) {
    btnSupprimer.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const editId = modal.dataset.editId;
      if (!editId) {
        console.warn('Aucune ADP à supprimer');
        return;
      }
      
      const confirmation = await window.customConfirm('Êtes-vous sûr de vouloir supprimer cette ADP ? Cette action est irréversible.', 'Supprimer');
      if (!confirmation) return;
      
      try {
        console.log('🗑️ Suppression de l\'ADP ID:', editId);
        await window.deleteIntervention(parseInt(editId));
        window.showToast('ADP supprimée avec succès', 'success');
        
        // Fermer le modal
        closeModal();
        
        // Rafraîchir la liste des ADP
        if (window.afficherToutesLesPersonnesADP) {
          await window.afficherToutesLesPersonnesADP();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        await window.customAlert('Erreur lors de la suppression de la transmission', 'error');
      }
    });
  }
  
  // Soumettre le formulaire
  formAdp.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = modal.dataset.editId;
    const personneId = modal.dataset.personneId ? parseInt(modal.dataset.personneId) : null;
    // IMPORTANT : Utiliser le sélecteur de date INTERNE à la modale (select-date-adp)
    // et non celui de l'onglet (adp-date)
    const selectedDate = document.getElementById('select-date-adp')?.value 
                      || document.getElementById('adp-date')?.value 
                      || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire ADP - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    try {
      // Données de la personne
      const personneData = {
        nom: document.getElementById('adp-form-nom').value,
        prenom: document.getElementById('adp-form-prenom').value,
        dateNaissance: document.getElementById('adp-form-ddn').value,
        descriptionPhysique: document.getElementById('adp-form-description').value,
        inconnu: document.getElementById('adp-form-inconnu').checked
        // NOTE: departement, typologie, nbPersonnes, mineurs sont gérés via infoHistorique
      };
      
      // Données de l'intervention ADP
      const interventionData = {
      typeTransmission: document.getElementById('adp-form-type-transmission').value,
        lieu: document.getElementById('adp-form-adresse').value,
      ville: document.getElementById('adp-form-ville').value,
      signalement: document.getElementById('adp-form-signalement').value,
        observations: document.getElementById('adp-form-transmission').value,
        date: selectedDate,
        type: 'adp',
        attention: document.getElementById('adp-form-attention')?.checked || false,
      orly: {
          premierContact: document.getElementById('adp-form-premier-contact')?.checked || false,
        personnePresente: document.getElementById('adp-form-personne-presente')?.checked || false,
        pnt: document.getElementById('adp-form-pnt')?.checked || false,
        maraude: document.getElementById('adp-form-maraude')?.checked || false,
        veille: document.getElementById('adp-form-veille')?.checked || false,
        refusContact: document.getElementById('adp-form-refus-contact')?.checked || false
      },
      accompagnement: {
        hygiene: document.getElementById('adp-form-accomp-hygiene')?.checked || false,
        accueilJour: document.getElementById('adp-form-accomp-accueil-jour')?.checked || false,
        admin: document.getElementById('adp-form-accomp-admin')?.checked || false,
        hebergement: document.getElementById('adp-form-accomp-hebergement')?.checked || false,
        medical: document.getElementById('adp-form-accomp-medical')?.checked || false
      },
      distribution: {
        boisson: document.getElementById('adp-form-distrib-boisson')?.checked || false,
        alimentaire: document.getElementById('adp-form-distrib-alimentaire')?.checked || false,
        duvet: document.getElementById('adp-form-distrib-duvet')?.checked || false,
        couvertureSurvie: document.getElementById('adp-form-distrib-couverture-survie')?.checked || false,
        bonnetsGants: document.getElementById('adp-form-distrib-bonnets-gants')?.checked || false,
        sousVetements: document.getElementById('adp-form-distrib-sous-vetements')?.checked || false,
        kitsHygiene: document.getElementById('adp-form-distrib-kits-hygiene')?.checked || false
      }
    };
    
      let finalPersonneId = personneId;
      
      if (personneId) {
        // Charger la personne existante pour gérer l'historisation
        const personneExistante = await window.getPersonneById(personneId);
        
        // Détecter si les infos historisées ont changé
        if (window.ajouterVersionInfos && personneExistante) {
          const nouvellesInfos = {
            departement: document.getElementById('adp-form-departement').value || '',
            typologie: document.getElementById('adp-form-typologie').value,
            nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
            mineurs: document.getElementById('adp-form-mineurs').value
          };
          
          // Ajouter une version dans l'historique si changement détecté
          const historiqueMAJ = window.ajouterVersionInfos(
            personneExistante, 
            selectedDate, 
            nouvellesInfos
          );
          
          console.log('📋 Historique mis à jour:', historiqueMAJ);
          
          // Mettre à jour UNIQUEMENT l'historique
          personneData.infoHistorique = historiqueMAJ;
        }
        
        // Mettre à jour la personne existante
        await window.updatePersonne(personneId, personneData);
        console.log('✅ Personne mise à jour, ID:', personneId);
      } else {
        // Créer ou récupérer la personne
        finalPersonneId = await window.creerOuRecupererPersonne(personneData);
        console.log('✅ Personne créée/récupérée, ID:', finalPersonneId);
        
        // Initialiser l'historique pour une nouvelle personne
        if (window.ajouterVersionInfos) {
          const personneCreee = await window.getPersonneById(finalPersonneId);
          if (personneCreee) {
            const infosInitiales = {
              departement: document.getElementById('adp-form-departement').value || '',
              typologie: document.getElementById('adp-form-typologie').value,
              nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
              mineurs: document.getElementById('adp-form-mineurs').value
            };
            const historiqueInit = window.ajouterVersionInfos(
              personneCreee,
              selectedDate,
              infosInitiales
            );
            await window.updatePersonne(finalPersonneId, { infoHistorique: historiqueInit });
            console.log('📋 Historique initialisé pour nouvelle personne');
          }
        }
      }
      
      // Ajouter personneId à l'intervention
      interventionData.personneId = finalPersonneId;
      
      if (editId) {
        // Mettre à jour l'intervention existante
        await window.updateIntervention(parseInt(editId), interventionData);
        console.log('✅ Intervention ADP mise à jour, ID:', editId);
      } else {
        // Vérifier si une ADP existe déjà avec ce typeTransmission pour cette date
        const existingForType = await findAdpByPersonDateAndType(
          finalPersonneId, 
          selectedDate, 
          interventionData.typeTransmission
        );
        
        if (existingForType) {
          // Mettre à jour l'existante au lieu d'en créer une nouvelle
          await window.updateIntervention(existingForType.id, interventionData);
          console.log('✅ Intervention ADP mise à jour (existante), ID:', existingForType.id);
        } else {
          // Créer une nouvelle intervention
          const interventionId = await window.ajouterIntervention(interventionData);
          console.log('✅ Nouvelle intervention ADP créée, ID:', interventionId);
        }
      }
      
      // Fermer la modal et rafraîchir
      closeModal();
      await window.afficherToutesLesPersonnesADP();
      console.log('✅ ADP enregistrée avec succès');
      
      // Rafraîchir le navigateur de dates pour mettre à jour les onglets
      if (typeof window.refreshNavigator === 'function') {
        await window.refreshNavigator('adp');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      await window.customAlert('Erreur lors de l\'enregistrement : ' + error.message, 'error');
    }
  });
  
  // Initialiser tous les boutons d'historique des infos personnelles
  if (typeof window.initTousBoutonsHistorique === 'function') {
    window.initTousBoutonsHistorique(formAdp);
  }
  
  // Initialiser les boutons d'historique par section
  const btnsHistSection = formAdp.querySelectorAll('.btn-hist-section');
  btnsHistSection.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const section = btn.dataset.section;
      const personneId = formAdp.dataset.personneId;
      
      console.log('🔍 ADP - Clic sur bouton historique section:', section);
      console.log('🔍 ADP - PersonneId trouvé dans formAdp.dataset:', personneId);
      console.log('🔍 ADP - Type de personneId:', typeof personneId);
      console.log('🔍 ADP - Fonction afficherHistoriqueInterventions existe?', typeof window.afficherHistoriqueInterventions);
      
      if (personneId && typeof window.afficherHistoriqueInterventions === 'function') {
        console.log('✅ ADP - Appel de afficherHistoriqueInterventions avec:', parseInt(personneId), section);
        await window.afficherHistoriqueInterventions(parseInt(personneId), section);
        console.log('✅ ADP - afficherHistoriqueInterventions terminé');
      } else {
        console.error('❌ ADP - Conditions non remplies:', { personneId, fnExists: typeof window.afficherHistoriqueInterventions });
        await window.customAlert('Veuillez d\'abord sélectionner ou créer une personne.', 'warning');
      }
    });
  });
  
  console.log('✅ Formulaire ADP initialisé (Base Unifiée)');
}

// Exposer les fonctions globalement
  window.editTransmissionAdp = editTransmissionAdp;
  window.initAdpForm = initAdpForm;
  window.initAdpFilters = initAdpFilters;

console.log('✅ Module ADP chargé (Base Unifiée)');
