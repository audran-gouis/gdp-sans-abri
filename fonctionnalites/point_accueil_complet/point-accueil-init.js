/**
 * Code métier Point Accueil - BASE UNIFIÉE
 * Utilise database-unified.js
 */

// ==================== FONCTIONS UTILITAIRES ====================

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

/**
 * Trouve une intervention Point Accueil par personneId et date
 */
async function findPAByPersonAndDate(personneId, date) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  const interventions = await window.getInterventionsByPersonneAndDate(pid, date);
  console.log('🔍 Recherche PA pour personneId:', pid, 'date:', date, '- trouvé:', interventions?.length || 0, 'interventions');
  const found = interventions.find(i => i.type === 'pointAccueil');
  console.log('🔍 PA trouvée:', found ? `ID ${found.id}` : 'Aucune');
  return found;
}

/**
 * Trouve une intervention Point Accueil par personneId, date ET typeTransmission
 */
async function findPAByPersonDateAndType(personneId, date, typeTransmission) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  // Vérifier que les paramètres requis sont valides
  if (!pid || !date) {
    console.warn('🔍 Paramètres invalides pour findPAByPersonDateAndType:', { pid, date, typeTransmission });
    return null;
  }
  
  // Si typeTransmission est vide, utiliser findPAByPersonAndDate
  if (!typeTransmission || (typeof typeTransmission === 'string' && typeTransmission.trim() === '')) {
    console.log('🔍 typeTransmission vide, utilisation de findPAByPersonAndDate');
    return await findPAByPersonAndDate(pid, date);
  }
  
  console.log('🔍 Recherche PA pour personneId:', pid, 'date:', date, 'typeTransmission:', typeTransmission);
  
  try {
    // Utiliser la nouvelle fonction si disponible
    if (typeof window.getInterventionByFullKey === 'function') {
      const intervention = await window.getInterventionByFullKey(pid, date, 'pointAccueil', typeTransmission);
      console.log('🔍 Résultat via getInterventionByFullKey:', intervention ? `ID ${intervention.id}` : 'Aucune');
      
      // Si pas trouvé, essayer avec recherche insensible à la casse
      if (!intervention) {
        const allInterventions = await window.getInterventionsByPersonneAndDate(pid, date);
        const found = allInterventions.find(i => i.type === 'pointAccueil' && i.typeTransmission && i.typeTransmission.toLowerCase() === typeTransmission.toLowerCase());
        if (found) {
          console.log('🔍 ✅ PA trouvée via recherche insensible à la casse! ID:', found.id);
          return found;
        }
      }
      
      return intervention;
    }
    
    // Fallback : chercher parmi toutes les interventions de cette date
    const interventions = await window.getInterventionsByPersonneAndDate(pid, date);
    const found = interventions.find(i => i.type === 'pointAccueil' && i.typeTransmission && i.typeTransmission.toLowerCase() === typeTransmission.toLowerCase());
    console.log('🔍 Résultat via filtrage:', found ? `ID ${found.id}` : 'Aucune');
    return found;
  } catch (error) {
    console.error('Erreur lors de la recherche PA:', error);
    return null;
  }
}

/**
 * Récupère la dernière adresse utilisée pour une personne
 * @param {number} personneId - L'ID de la personne
 * @returns {Object|null} - Objet avec adresse et ville, ou null
 */
async function getDerniereAdressePA(personneId) {
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
 * Réinitialise les champs du formulaire PA pour une nouvelle transmission
 * @param {string} date - La date au format YYYY-MM-DD
 * @param {string} typeTransmission - Le type de transmission (Jour/Nuit/Coordo)
 */
function resetPAFormFieldsForNewTransmission(date, typeTransmission) {
  console.log('🔄 Réinitialisation du formulaire PA pour nouvelle transmission');
  
  // Réinitialiser l'ID d'édition
  const editIdField = document.getElementById('edit-pa-id');
  if (editIdField) editIdField.value = '';
  
  // Mettre à jour la date et le type de transmission
  const dateField = document.getElementById('form-pa-date');
  if (dateField) dateField.value = date;
  
  const typeField = document.getElementById('form-pa-type-transmission');
  if (typeField) typeField.value = typeTransmission;
  
  // Réinitialiser les champs de transmission (garder les infos personnelles)
  const fieldsToReset = [
    'form-pa-lieu-rencontre',
    'form-pa-aller-vers',
    'form-pa-commentaires'
  ];
  
  fieldsToReset.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = '';
  });
  
  // Réinitialiser les checkboxes d'accompagnement
  const accompCheckboxes = document.querySelectorAll('#modal-point-accueil input[name="accompagnement"]');
  accompCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser les checkboxes de distribution
  const distribCheckboxes = document.querySelectorAll('#modal-point-accueil input[name="distribution"]');
  distribCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser les checkboxes de motif intervention
  const motifCheckboxes = document.querySelectorAll('#modal-point-accueil input[name="motifIntervention"]');
  motifCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser le checkbox Attention
  const attentionCheckbox = document.getElementById('form-pa-attention');
  if (attentionCheckbox) attentionCheckbox.checked = false;
  
  console.log('✅ Formulaire PA réinitialisé pour nouvelle transmission');
}

/**
 * Charge les données Point Accueil pour une date et un type donnés
 * @param {number} personneId - L'ID de la personne
 * @param {string} date - La date au format YYYY-MM-DD
 * @param {string} typeTransmission - Le type de transmission (Jour/Nuit/Coordo)
 */
async function loadPADataForDate(personneId, date, typeTransmission) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  console.log('📅 loadPADataForDate appelé avec:', { personneId: pid, date, typeTransmission });
  
  try {
    // Recharger les informations de la personne pour s'assurer d'avoir les données à jour
    const personne = await window.getPersonneById(pid);
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', pid);
      await window.customAlert('Erreur : personne non trouvée', 'error');
      return;
    }
    
    // S'assurer que le personneId est défini dans le dataset du formulaire pour les boutons historique
    let formPA = document.getElementById('form-point-accueil');
    if (formPA) {
      formPA.dataset.personneId = pid;
      console.log('📝 PersonneId défini dans le dataset PA:', pid);
    }
    
    // Récupérer les DERNIÈRES infos connues
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Recharger les informations personnelles
    console.log('📝 Chargement des infos personnelles PA:', { nom: personne.nom, prenom: personne.prenom });
    document.getElementById('form-pa-nom').value = personne.nom || '';
    document.getElementById('form-pa-prenom').value = personne.prenom || '';
    document.getElementById('form-pa-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-pa-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-pa-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-pa-departement').value = dernieresInfos.departement;
    document.getElementById('form-pa-typologie').value = dernieresInfos.typologie;
    document.getElementById('form-pa-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('form-pa-mineurs').value = dernieresInfos.mineurs;
    
    console.log('✅ Valeurs définies dans les champs:',
      'nom=', document.getElementById('form-pa-nom').value,
      'prenom=', document.getElementById('form-pa-prenom').value,
      'disabled=', document.getElementById('form-pa-nom').disabled
    );
    
    // Chercher si une fiche PA existe pour cette personne à cette date avec ce type
    const existingPA = await findPAByPersonDateAndType(pid, date, typeTransmission);
    
    console.log('📋 PA trouvée:', existingPA ? `ID ${existingPA.id}` : 'Aucune', existingPA);
    
    // Mettre à jour le sélecteur de type de transmission
    const typeSelect = document.getElementById('form-pa-type-transmission');
    if (typeSelect && typeTransmission) {
      typeSelect.value = typeTransmission;
    }
    formPA = document.getElementById('form-point-accueil');
    
    if (existingPA) {
      // Remplir les champs de l'intervention existante
      document.getElementById('form-pa-type-transmission').value = existingPA.typeTransmission || '';
      document.getElementById('form-pa-adresse').value = existingPA.lieu || '';
      document.getElementById('form-pa-ville').value = existingPA.ville || '';
      document.getElementById('form-pa-signalement').value = existingPA.signalement || '';
      document.getElementById('form-pa-transmission').value = existingPA.observations || '';
      
      // Checkbox Attention
      if (document.getElementById('form-pa-attention')) {
        document.getElementById('form-pa-attention').checked = existingPA.attention || false;
      }
      
      // Checkboxes Orly
      if (existingPA.orly) {
        ['form-pa-premier-contact', 'form-pa-personne-presente', 'form-pa-pnt', 'form-pa-maraude', 'form-pa-veille', 'form-pa-refus-contact'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            const key = id.replace('form-pa-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            el.checked = existingPA.orly[key] || false;
          }
        });
      } else {
        ['form-pa-premier-contact', 'form-pa-personne-presente', 'form-pa-pnt', 'form-pa-maraude', 'form-pa-veille', 'form-pa-refus-contact'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      // Checkboxes Accompagnement
      if (existingPA.accompagnement) {
        const accompMap = {
          'form-pa-accomp-hygiene': 'hygiene',
          'form-pa-accomp-accueil-jour': 'accueilJour',
          'form-pa-accomp-admin': 'admin',
          'form-pa-accomp-hebergement': 'hebergement',
          'form-pa-accomp-medical': 'medical'
        };
        Object.entries(accompMap).forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) el.checked = existingPA.accompagnement[key] || false;
        });
      } else {
        ['form-pa-accomp-hygiene', 'form-pa-accomp-accueil-jour', 'form-pa-accomp-admin', 'form-pa-accomp-hebergement', 'form-pa-accomp-medical'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      // Checkboxes Distribution
      if (existingPA.distribution) {
        const distribMap = {
          'form-pa-distrib-boisson': 'boisson',
          'form-pa-distrib-alimentaire': 'alimentaire',
          'form-pa-distrib-duvet': 'duvet',
          'form-pa-distrib-couverture-survie': 'couvertureSurvie',
          'form-pa-distrib-bonnets-gants': 'bonnetsGants',
          'form-pa-distrib-sous-vetements': 'sousVetements',
          'form-pa-distrib-kits-hygiene': 'kitsHygiene'
        };
        Object.entries(distribMap).forEach(([id, key]) => {
          const el = document.getElementById(id);
          if (el) el.checked = existingPA.distribution[key] || false;
        });
      } else {
        ['form-pa-distrib-boisson', 'form-pa-distrib-alimentaire', 'form-pa-distrib-duvet', 'form-pa-distrib-couverture-survie', 'form-pa-distrib-bonnets-gants', 'form-pa-distrib-sous-vetements', 'form-pa-distrib-kits-hygiene'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      formPA.dataset.editId = existingPA.id;
      
      // Afficher le bouton de suppression en mode édition
      const btnSupprimer = document.getElementById('btn-supprimer-pa');
      if (btnSupprimer) btnSupprimer.style.display = 'inline-block';
    } else {
      // Pas de transmission pour cette date - réinitialiser les champs
      document.getElementById('form-pa-type-transmission').value = '';
      document.getElementById('form-pa-signalement').value = '';
      document.getElementById('form-pa-transmission').value = '';
      
      // Cacher le bouton de suppression
      const btnSupprimer = document.getElementById('btn-supprimer-pa');
      if (btnSupprimer) btnSupprimer.style.display = 'none';
      
      // Charger automatiquement la dernière adresse utilisée
      const derniereAdresse = await getDerniereAdressePA(personneId);
      if (derniereAdresse) {
        document.getElementById('form-pa-adresse').value = derniereAdresse.adresse || '';
        document.getElementById('form-pa-ville').value = derniereAdresse.ville || '';
      } else {
        document.getElementById('form-pa-adresse').value = '';
        document.getElementById('form-pa-ville').value = '';
      }
      
      // Décocher toutes les checkboxes de transmission
      document.querySelectorAll('#modal-point-accueil .checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete formPA.dataset.editId;
    }
    
    console.log('✅ Données PA chargées pour date:', date);
    
    // Réinitialiser les event listeners de collapse après chargement des données
    if (window.setupCollapseHandlers) {
      window.setupCollapseHandlers();
      console.log('🔄 Event listeners de collapse réinitialisés (PA)');
    }
    
    // Si on est en mode consultation (depuis les statistiques), redésactiver les champs
    if (window.currentConsultationModal === 'modal-point-accueil') {
      console.log('🔒 Mode consultation détecté, désactivation des champs dans 50ms...');
      setTimeout(() => {
        if (typeof window.disableFormFieldsForConsultation === 'function') {
          console.log('🔒 Appel de disableFormFieldsForConsultation pour modal-point-accueil');
          window.disableFormFieldsForConsultation('modal-point-accueil');
          console.log('🔒 Champs désactivés. Valeur nom:', document.getElementById('form-pa-nom').value);
        }
      }, 50);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données PA pour la date:', error);
  }
}
window.loadPADataForDate = loadPADataForDate;

/**
 * Édite une intervention Point Accueil pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB unifiée
 * @param {string} date - Date optionnelle
 * @param {boolean} consultationMode - Mode consultation
 * @param {string} newTypeTransmission - Type à pré-sélectionner pour une nouvelle PA
 */
async function modifierFichePA(personneId, date = null, consultationMode = false, newTypeTransmission = null) {
  console.log('📝 Compléter le Point Accueil pour personne ID:', personneId, 'newType:', newTypeTransmission);
  
  try {
    // Charger la personne depuis la DB unifiée
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      await window.customAlert('Erreur lors du chargement des données', 'error');
      return;
    }
    
    console.log('Personne trouvée:', personne);
    
    // Définir le personneId dans le dataset du formulaire pour les boutons historique
    const formPA = document.getElementById('form-point-accueil');
    if (formPA) {
      formPA.dataset.personneId = personneId;
      console.log('📝 PersonneId défini dans le dataset PA (modifierFichePA):', personneId);
    }
    
    // Utiliser la date passée en paramètre si fournie, sinon celle de l'input
    const selectedDate = date || document.getElementById('pa-date')?.value;
    console.log('Date sélectionnée:', selectedDate, '(paramètre date:', date, ')');
    
    // Chercher si une fiche PA existe pour cette personne à cette date
    // Si newTypeTransmission est fourni, on cherche pour ce type spécifique
    let existingPA = null;
    if (newTypeTransmission) {
      // Chercher une PA pour le type spécifique demandé
      existingPA = await findPAByPersonDateAndType(personneId, selectedDate, newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1));
      console.log('🆕 Création nouvelle PA type:', newTypeTransmission, '- Existante:', existingPA ? 'oui' : 'non');
    } else {
      // Comportement normal : chercher la première PA pour cette date (tous types)
      existingPA = await findPAByPersonAndDate(personneId, selectedDate);
    }
    
    // Déterminer le type de transmission courant
    let currentTypeTransmission = existingPA?.typeTransmission || (newTypeTransmission ? newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1) : 'Jour');
    
    console.log('📋 PA existante:', existingPA ? `ID ${existingPA.id}` : 'Aucune');
    
    // Récupérer les DERNIÈRES infos connues (pour pré-remplir le formulaire)
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Remplir les champs avec les infos de la personne
    console.log('📝 Remplissage initial des infos PA:', { nom: personne.nom, prenom: personne.prenom, consultationMode });
    document.getElementById('form-pa-nom').value = personne.nom || '';
    document.getElementById('form-pa-prenom').value = personne.prenom || '';
    document.getElementById('form-pa-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-pa-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-pa-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-pa-departement').value = dernieresInfos.departement;
    document.getElementById('form-pa-typologie').value = dernieresInfos.typologie;
    document.getElementById('form-pa-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('form-pa-mineurs').value = dernieresInfos.mineurs;
    
    console.log('✅ Valeurs initiales définies:',
      'nom=', document.getElementById('form-pa-nom').value,
      'prenom=', document.getElementById('form-pa-prenom').value
    );
    
    if (existingPA) {
      // MODE ÉDITION : charger toutes les données de la fiche PA
      console.log('✅ Fiche PA existante pour cette date - MODE ÉDITION');
      document.getElementById('form-pa-type-transmission').value = existingPA.typeTransmission || '';
      document.getElementById('form-pa-adresse').value = existingPA.lieu || '';
      document.getElementById('form-pa-ville').value = existingPA.ville || '';
      document.getElementById('form-pa-signalement').value = existingPA.signalement || '';
      document.getElementById('form-pa-transmission').value = existingPA.observations || '';
      
      // Checkbox Attention
      if (document.getElementById('form-pa-attention')) {
        document.getElementById('form-pa-attention').checked = existingPA.attention || false;
      }
      
      // Checkboxes Orly
      if (existingPA.orly) {
        document.getElementById('form-pa-premier-contact').checked = existingPA.orly.premierContact || false;
        document.getElementById('form-pa-personne-presente').checked = existingPA.orly.personnePresente || false;
        document.getElementById('form-pa-pnt').checked = existingPA.orly.pnt || false;
        document.getElementById('form-pa-maraude').checked = existingPA.orly.maraude || false;
        document.getElementById('form-pa-veille').checked = existingPA.orly.veille || false;
        document.getElementById('form-pa-refus-contact').checked = existingPA.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingPA.accompagnement) {
        const hygieneEl = document.getElementById('form-pa-accomp-hygiene');
        if (hygieneEl) hygieneEl.checked = existingPA.accompagnement.hygiene || false;
        
        const accueilJourEl = document.getElementById('form-pa-accomp-accueil-jour');
        if (accueilJourEl) accueilJourEl.checked = existingPA.accompagnement.accueilJour || false;
        
        const adminEl = document.getElementById('form-pa-accomp-admin');
        if (adminEl) adminEl.checked = existingPA.accompagnement.admin || false;
        
        const hebergementEl = document.getElementById('form-pa-accomp-hebergement');
        if (hebergementEl) hebergementEl.checked = existingPA.accompagnement.hebergement || false;
        
        const medicalEl = document.getElementById('form-pa-accomp-medical');
        if (medicalEl) medicalEl.checked = existingPA.accompagnement.medical || false;
      }
      
      // Checkboxes Distribution
      if (existingPA.distribution) {
        const boissonEl = document.getElementById('form-pa-distrib-boisson');
        if (boissonEl) boissonEl.checked = existingPA.distribution.boisson || false;
        
        const alimentaireEl = document.getElementById('form-pa-distrib-alimentaire');
        if (alimentaireEl) alimentaireEl.checked = existingPA.distribution.alimentaire || false;
        
        const duvetEl = document.getElementById('form-pa-distrib-duvet');
        if (duvetEl) duvetEl.checked = existingPA.distribution.duvet || false;
        
        const couvertureSurvieEl = document.getElementById('form-pa-distrib-couverture-survie');
        if (couvertureSurvieEl) couvertureSurvieEl.checked = existingPA.distribution.couvertureSurvie || false;
        
        const bonnetsGantsEl = document.getElementById('form-pa-distrib-bonnets-gants');
        if (bonnetsGantsEl) bonnetsGantsEl.checked = existingPA.distribution.bonnetsGants || false;
        
        const sousVetementsEl = document.getElementById('form-pa-distrib-sous-vetements');
        if (sousVetementsEl) sousVetementsEl.checked = existingPA.distribution.sousVetements || false;
        
        const kitsHygieneEl = document.getElementById('form-pa-distrib-kits-hygiene');
        if (kitsHygieneEl) kitsHygieneEl.checked = existingPA.distribution.kitsHygiene || false;
      }
      
      formPA.dataset.editId = existingPA.id;
      console.log('🔖 editId défini à:', existingPA.id);
      
      // Afficher le bouton de suppression en mode édition
      const btnSupprimer = document.getElementById('btn-supprimer-pa');
      if (btnSupprimer) btnSupprimer.style.display = 'inline-block';
    } else {
      // MODE CRÉATION : réinitialiser les champs d'intervention
      console.log('➕ Pas de fiche PA pour cette date - MODE CRÉATION');
      // Si un type est pré-sélectionné via newTypeTransmission, l'utiliser
      document.getElementById('form-pa-type-transmission').value = newTypeTransmission ? newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1) : '';
      document.getElementById('form-pa-signalement').value = '';
      document.getElementById('form-pa-transmission').value = '';
      
      // Cacher le bouton de suppression en mode création
      const btnSupprimer = document.getElementById('btn-supprimer-pa');
      if (btnSupprimer) btnSupprimer.style.display = 'none';
      
      // Charger automatiquement la dernière adresse utilisée
      const derniereAdresse = await getDerniereAdressePA(personneId);
      if (derniereAdresse) {
        document.getElementById('form-pa-adresse').value = derniereAdresse.adresse || '';
        document.getElementById('form-pa-ville').value = derniereAdresse.ville || '';
        console.log('📍 Adresse chargée automatiquement:', derniereAdresse);
      } else {
        document.getElementById('form-pa-adresse').value = '';
        document.getElementById('form-pa-ville').value = '';
      }
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-point-accueil input[type="checkbox"]').forEach(cb => {
        if (cb.id !== 'form-pa-inconnu') { // Ne pas décocher "inconnu"
          cb.checked = false;
        }
      });
      
      delete formPA.dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle fiche PA');
    }
    
    formPA.dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
    // Replier automatiquement la section "Informations Personnelles" pour une personne existante
    const gridInfoPerso = document.getElementById('pa-grid-info-perso');
    const toggleIcon = document.querySelector('#pa-section-info-perso .collapse-toggle');
    if (gridInfoPerso && toggleIcon) {
      gridInfoPerso.style.display = 'none';
      toggleIcon.classList.add('collapsed');
      console.log('📁 Section Informations Personnelles repliée automatiquement (PA)');
    }
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-point-accueil');
    if (modal) {
      // S'ASSURER que le modal est COMPLÈTEMENT réactivé
      modal.style.pointerEvents = 'auto';
      modal.style.zIndex = '1000';
      modal.classList.add('show');
      
      // RESTAURER les boutons Annuler et Enregistrer (pourraient être cachés par mode consultation)
      const btnAnnuler = document.getElementById('pa-btn-annuler');
      if (btnAnnuler) btnAnnuler.style.display = '';
      const btnEnregistrer = modal.querySelector('button[type="submit"]');
      if (btnEnregistrer) btnEnregistrer.style.display = '';
      
      // Retirer le bouton Fermer si présent (depuis mode consultation)
      const btnFermerConsultation = modal.querySelector('.btn-fermer-consultation');
      if (btnFermerConsultation) btnFermerConsultation.remove();
      
      // Scroll vers le haut du formulaire et replier la section Informations Personnelles
      setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
        
        // S'assurer que les sections sont bien chargées avant d'initialiser
        let checkAttempts = 0;
        const maxAttempts = 20; // 1 seconde max
        const checkSectionLoaded = setInterval(() => {
          checkAttempts++;
          const section = document.getElementById('pa-section-info-perso');
          if (section && section.querySelector('.form-grid')) {
            clearInterval(checkSectionLoaded);
            
            // Réinitialiser les gestionnaires de collapse directement
            if (window.setupCollapseHandlers) {
              window.setupCollapseHandlers();
            }
            
            // Replier la section après un court délai
            setTimeout(() => {
              if (window.replierSection) {
                window.replierSection('pa-section-info-perso');
              }
            }, 100);
          } else if (checkAttempts >= maxAttempts) {
            clearInterval(checkSectionLoaded);
            console.warn('⚠️ Timeout : section info perso PA non trouvée');
          }
        }, 50);
        
        // Initialiser le navigateur de dates
        if (window.initDateNavigator) {
          window.initDateNavigator({
            type: 'pointAccueil',
            personneId: personneId,
            currentDate: selectedDate,
            currentTypeTransmission: currentTypeTransmission,
            hideToday: consultationMode, // En mode consultation, ne pas afficher la date du jour
            onDateChange: async (newDate, newTypeTransmission, isNewTransmission) => {
              if (isNewTransmission) {
                console.log('➕ Création nouvelle transmission PA:', newTypeTransmission, 'pour', newDate);
                resetPAFormFieldsForNewTransmission(newDate, newTypeTransmission);
              } else {
                await loadPADataForDate(personneId, newDate, newTypeTransmission);
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
window.modifierFichePA = modifierFichePA;

/**
 * Initialise les filtres Point Accueil
 */
function initPAFilters() {
  // Initialiser la date du jour pour le sélecteur
  const dateInput = document.getElementById('pa-date');
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si entre minuit et 3h, utiliser la veille
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    dateInput.value = today.toISOString().split('T')[0];
    console.log('📅 Date PA initialisée à:', dateInput.value);
  }
  
  // Ajouter listener pour rechargement au changement de date
  if (dateInput && !dateInput._listenersAttached) {
    dateInput.addEventListener('change', () => {
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
    dateInput._listenersAttached = true;
  }
  
  const filterNom = document.getElementById('pa-filter-nom');
  const filterPrenom = document.getElementById('pa-filter-prenom');
  const filterDdn = document.getElementById('pa-filter-ddn');
  const filterInconnu = document.getElementById('pa-filter-inconnu');
  const filterDescription = document.getElementById('pa-filter-description');

  const rechargerFiches = () => {
    if (typeof window.afficherToutesLesPersonnesPA === 'function') {
      window.afficherToutesLesPersonnesPA();
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

  console.log('✅ Filtres Point Accueil initialisés');
}

/**
 * Initialise le formulaire Point Accueil
 */
function initPointAccueilForm() {
  const btnAjouter = document.getElementById('btn-ajouter-pa');
  const modal = document.getElementById('modal-point-accueil');
  const formPA = document.getElementById('form-point-accueil');
  const btnAnnuler = document.getElementById('pa-btn-annuler');
  const modalClose = document.querySelector('.pa-modal-close');
  
  if (!btnAjouter || !modal || !formPA) {
    console.warn('⚠️ Éléments formulaire Point Accueil non trouvés');
    return;
  }
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    formPA.reset();
    delete formPA.dataset.editId;
    delete formPA.dataset.personneId;
    
    // Cacher le bouton de suppression en mode création
    const btnSupprimer = document.getElementById('btn-supprimer-pa');
    if (btnSupprimer) btnSupprimer.style.display = 'none';
    
    // RESTAURER les boutons Annuler et Enregistrer (pourraient être cachés par mode consultation)
    const btnAnnulerModal = document.getElementById('pa-btn-annuler');
    if (btnAnnulerModal) btnAnnulerModal.style.display = '';
    const btnEnregistrer = modal.querySelector('button[type="submit"]');
    if (btnEnregistrer) btnEnregistrer.style.display = '';
    
    // Retirer le bouton Fermer si présent (depuis mode consultation)
    const btnFermerConsultation = modal.querySelector('.btn-fermer-consultation');
    if (btnFermerConsultation) btnFermerConsultation.remove();
    
    // Cacher le navigateur de dates en mode création et réinitialiser le titre
    if (window.resetModalTitle) window.resetModalTitle('pointAccueil');
    
    const datePA = document.getElementById('pa-date');
    if (datePA && !datePA.value) {
      datePA.value = getDateParDefaut();
      console.log('📅 Date PA initialisée à:', datePA.value);
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
        if (window.deplierSection) {
          window.deplierSection('pa-section-info-perso');
        }
      }, 50);
    }, 100);
  });
  
  // Fermer la modal
  const closeModal = () => {
    // Utiliser la fonction unifiée de fermeture
    window.closeModalSafely(modal, formPA, {
      focusTarget: document.getElementById('pa-date')
    });
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Initialiser l'auto-complétion de la typologie
  if (typeof window.initTypologieAutocomplete === 'function') {
    window.initTypologieAutocomplete();
    console.log('✅ Auto-complétion typologie initialisée pour Point Accueil');
  }
  
  // Gestion de la case "Inconnu"
  const checkboxInconnu = document.getElementById('form-pa-inconnu');
  const inputNom = document.getElementById('form-pa-nom');
  const inputPrenom = document.getElementById('form-pa-prenom');
  
  if (checkboxInconnu && inputNom && inputPrenom) {
    checkboxInconnu.addEventListener('change', () => {
      if (checkboxInconnu.checked) {
        inputNom.disabled = true;
        inputPrenom.disabled = true;
        inputNom.value = '';
        inputPrenom.value = '';
      } else {
        inputNom.disabled = false;
        inputPrenom.disabled = false;
      }
    });
  }
  
  // Event listener pour le bouton "Supprimer la transmission"
  const btnSupprimer = document.getElementById('btn-supprimer-pa');
  if (btnSupprimer) {
    btnSupprimer.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const editId = formPA.dataset.editId;
      if (!editId) {
        console.warn('Aucune fiche PA à supprimer');
        return;
      }
      
      const confirmation = await window.customConfirm('Êtes-vous sûr de vouloir supprimer cette transmission Point Accueil ? Cette action est irréversible.', 'Supprimer');
      if (!confirmation) return;
      
      try {
        console.log('🗑️ Suppression de la transmission PA ID:', editId);
        await window.deleteIntervention(parseInt(editId));
        window.showToast('Transmission Point Accueil supprimée avec succès', 'success');
        
        // Fermer le modal
        closeModal();
        
        // Rafraîchir la liste des fiches PA
        if (window.afficherToutesLesPersonnesPA) {
          await window.afficherToutesLesPersonnesPA();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        await window.customAlert('Erreur lors de la suppression de la transmission', 'error');
      }
    });
  }
  
  // Soumettre le formulaire
  formPA.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = formPA.dataset.editId;
    const personneId = formPA.dataset.personneId ? parseInt(formPA.dataset.personneId) : null;
    // IMPORTANT : Utiliser le sélecteur de date INTERNE à la modale (select-date-pa)
    // et non celui de l'onglet (pa-date)
    const selectedDate = document.getElementById('select-date-pa')?.value 
                      || document.getElementById('pa-date')?.value 
                      || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire PA - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    try {
      // Données de la personne
      const personneData = {
        nom: document.getElementById('form-pa-nom').value,
        prenom: document.getElementById('form-pa-prenom').value,
        dateNaissance: document.getElementById('form-pa-ddn').value,
        descriptionPhysique: document.getElementById('form-pa-description').value,
        inconnu: document.getElementById('form-pa-inconnu').checked
        // NOTE: departement, typologie, nbPersonnes, mineurs sont gérés via infoHistorique
      };
      
      // Données de l'intervention Point Accueil
      const interventionData = {
        typeTransmission: document.getElementById('form-pa-type-transmission').value,
        lieu: document.getElementById('form-pa-adresse').value,
        ville: document.getElementById('form-pa-ville').value,
        signalement: document.getElementById('form-pa-signalement').value,
        observations: document.getElementById('form-pa-transmission').value,
        date: selectedDate,
        type: 'pointAccueil',
        attention: document.getElementById('form-pa-attention')?.checked || false,
        orly: {
          premierContact: document.getElementById('form-pa-premier-contact')?.checked || false,
          personnePresente: document.getElementById('form-pa-personne-presente')?.checked || false,
          pnt: document.getElementById('form-pa-pnt')?.checked || false,
          maraude: document.getElementById('form-pa-maraude')?.checked || false,
          veille: document.getElementById('form-pa-veille')?.checked || false,
          refusContact: document.getElementById('form-pa-refus-contact')?.checked || false
        },
        accompagnement: {
          hygiene: document.getElementById('form-pa-accomp-hygiene')?.checked || false,
          accueilJour: document.getElementById('form-pa-accomp-accueil-jour')?.checked || false,
          admin: document.getElementById('form-pa-accomp-admin')?.checked || false,
          hebergement: document.getElementById('form-pa-accomp-hebergement')?.checked || false,
          medical: document.getElementById('form-pa-accomp-medical')?.checked || false
        },
        distribution: {
          boisson: document.getElementById('form-pa-distrib-boisson')?.checked || false,
          alimentaire: document.getElementById('form-pa-distrib-alimentaire')?.checked || false,
          duvet: document.getElementById('form-pa-distrib-duvet')?.checked || false,
          couvertureSurvie: document.getElementById('form-pa-distrib-couverture-survie')?.checked || false,
          bonnetsGants: document.getElementById('form-pa-distrib-bonnets-gants')?.checked || false,
          sousVetements: document.getElementById('form-pa-distrib-sous-vetements')?.checked || false,
          kitsHygiene: document.getElementById('form-pa-distrib-kits-hygiene')?.checked || false
        }
      };
      
      let finalPersonneId = personneId;
      
      if (personneId) {
        // Charger la personne existante pour gérer l'historisation
        const personneExistante = await window.getPersonneById(personneId);
        
        // Détecter si les infos historisées ont changé
        if (window.ajouterVersionInfos && personneExistante) {
          const nouvellesInfos = {
            departement: document.getElementById('form-pa-departement').value || '',
            typologie: document.getElementById('form-pa-typologie').value,
            nbPersonnes: document.getElementById('form-pa-nb-personnes').value,
            mineurs: document.getElementById('form-pa-mineurs').value
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
              departement: document.getElementById('form-pa-departement').value || '',
              typologie: document.getElementById('form-pa-typologie').value,
              nbPersonnes: document.getElementById('form-pa-nb-personnes').value,
              mineurs: document.getElementById('form-pa-mineurs').value
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
        console.log('✅ Intervention PA mise à jour, ID:', editId);
      } else {
        // Vérifier si une PA existe déjà avec ce typeTransmission pour cette date
        const existingForType = await findPAByPersonDateAndType(
          finalPersonneId, 
          selectedDate, 
          interventionData.typeTransmission
        );
        
        if (existingForType) {
          // Mettre à jour l'existante au lieu d'en créer une nouvelle
          await window.updateIntervention(existingForType.id, interventionData);
          console.log('✅ Intervention PA mise à jour (existante), ID:', existingForType.id);
        } else {
          // Créer une nouvelle intervention
          const interventionId = await window.ajouterIntervention(interventionData);
          console.log('✅ Nouvelle intervention PA créée, ID:', interventionId);
        }
      }
      
      // Fermer la modal et rafraîchir
      closeModal();
      await window.afficherToutesLesPersonnesPA();
      console.log('✅ Point Accueil enregistré avec succès');
      
      // Rafraîchir le navigateur de dates pour mettre à jour les onglets
      if (typeof window.refreshNavigator === 'function') {
        await window.refreshNavigator('pointAccueil');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      await window.customAlert('Erreur lors de l\'enregistrement : ' + error.message, 'error');
    }
  });
  
  // Initialiser tous les boutons d'historique des infos personnelles
  if (typeof window.initTousBoutonsHistorique === 'function') {
    window.initTousBoutonsHistorique(formPA);
  }
  
  // Initialiser les boutons d'historique par section
  const btnsHistSection = formPA.querySelectorAll('.btn-hist-section');
  btnsHistSection.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const section = btn.dataset.section;
      const personneId = formPA.dataset.personneId;
      
      console.log('🔍 PA - Clic sur bouton historique section:', section);
      console.log('🔍 PA - PersonneId trouvé dans formPA.dataset:', personneId);
      console.log('🔍 PA - Type de personneId:', typeof personneId);
      console.log('🔍 PA - Fonction afficherHistoriqueInterventions existe?', typeof window.afficherHistoriqueInterventions);
      
      if (personneId && typeof window.afficherHistoriqueInterventions === 'function') {
        console.log('✅ PA - Appel de afficherHistoriqueInterventions avec:', parseInt(personneId), section);
        await window.afficherHistoriqueInterventions(parseInt(personneId), section);
        console.log('✅ PA - afficherHistoriqueInterventions terminé');
      } else {
        console.error('❌ PA - Conditions non remplies:', { personneId, fnExists: typeof window.afficherHistoriqueInterventions });
        await window.customAlert('Veuillez d\'abord sélectionner ou créer une personne.', 'warning');
      }
    });
  });
  
  console.log('✅ Formulaire Point Accueil initialisé (Base Unifiée)');
}

// Exposer les fonctions globalement
window.modifierFichePA = modifierFichePA;
window.initPointAccueilForm = initPointAccueilForm;
window.initPAFilters = initPAFilters;

console.log('✅ Module Point Accueil chargé (Base Unifiée)');
