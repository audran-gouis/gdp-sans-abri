/**
 * Code métier - Transmissions : Ajout transmission minimale
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Trouve une transmission par personId et date (retourne la première trouvée)
 */
async function findTransmissionByPersonAndDate(personneId, date) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  console.log('🔍 Recherche transmission pour personneId:', pid, 'date:', date);
  
  try {
    if (typeof window.getInterventionsByPersonneIdAndDateAndType === 'function') {
      const interventions = await window.getInterventionsByPersonneIdAndDateAndType(
        pid,
        date,
        'transmissions'
      );
      // Retourne le premier résultat (peut y en avoir plusieurs maintenant)
      const intervention = Array.isArray(interventions) ? interventions[0] : interventions;
      console.log('🔍 Résultat:', intervention ? `ID ${intervention.id}` : 'Aucune');
      return intervention;
    }
    // Fallback vers l'ancienne méthode
    const allTransmissions = await window.getAllTransmissions();
    const found = allTransmissions.find(t => 
      (t.personId === pid || t.personneId === pid) && 
      (t.dateTransmission === date || t.date === date)
    );
    console.log('🔍 Résultat via fallback:', found ? `ID ${found.id}` : 'Aucune');
    return found;
  } catch (error) {
    console.error('Erreur lors de la recherche de transmission:', error);
    return null;
  }
}

/**
 * Trouve une transmission par personId, date ET typeTransmission
 */
async function findTransmissionByPersonDateAndType(personneId, date, typeTransmission) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  // Vérifier que les paramètres requis sont valides
  if (!pid || !date) {
    console.warn('🔍 Paramètres invalides pour findTransmissionByPersonDateAndType:', { pid, date, typeTransmission });
    return null;
  }
  
  // Si typeTransmission est vide, utiliser findTransmissionByPersonAndDate
  if (!typeTransmission || (typeof typeTransmission === 'string' && typeTransmission.trim() === '')) {
    console.log('🔍 typeTransmission vide, utilisation de findTransmissionByPersonAndDate');
    return await findTransmissionByPersonAndDate(pid, date);
  }
  
  console.log('🔍 Recherche transmission pour personneId:', pid, 'date:', date, 'typeTransmission:', typeTransmission);
  
  try {
    // DEBUG : Afficher toutes les interventions de cette personne à cette date
    const allInterventionsDebug = await window.getInterventionsByPersonneAndDate(pid, date);
    const transmissionsDebug = allInterventionsDebug ? allInterventionsDebug.filter(i => i.type === 'transmissions') : [];
    console.log('🔍 DEBUG - Toutes les transmissions pour cette date:', transmissionsDebug.length);
    transmissionsDebug.forEach(t => {
      console.log('   - ID:', t.id, 'typeTransmission:', `"${t.typeTransmission}"`, 'type:', t.type);
    });
    
    // Utiliser la nouvelle fonction si disponible
    if (typeof window.getInterventionByFullKey === 'function') {
      const intervention = await window.getInterventionByFullKey(
        pid,
        date,
        'transmissions',
        typeTransmission
      );
      console.log('🔍 Résultat via getInterventionByFullKey:', intervention ? `ID ${intervention.id}` : 'Aucune');
      
      // Si pas trouvé, essayer le fallback avec recherche insensible à la casse
      if (!intervention) {
        console.log('🔍 Tentative de recherche insensible à la casse...');
        const found = transmissionsDebug.find(t => t.typeTransmission && t.typeTransmission.toLowerCase() === typeTransmission.toLowerCase());
        if (found) {
          console.log('🔍 ✅ Transmission trouvée via recherche insensible à la casse! ID:', found.id);
          return found;
        }
      }
      
      return intervention;
    }
    
    // Fallback : chercher parmi toutes les transmissions
    if (typeof window.getInterventionsByPersonneIdAndDateAndType === 'function') {
      const interventions = await window.getInterventionsByPersonneIdAndDateAndType(pid, date, 'transmissions');
      const list = Array.isArray(interventions) ? interventions : (interventions ? [interventions] : []);
      // Recherche insensible à la casse
      const found = list.find(i => i.typeTransmission && i.typeTransmission.toLowerCase() === typeTransmission.toLowerCase());
      console.log('🔍 Résultat via filtrage:', found ? `ID ${found.id}` : 'Aucune');
      return found;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche de transmission:', error);
    return null;
  }
}

/**
 * Récupère la dernière adresse utilisée pour une personne
 * @param {number} personneId - L'ID de la personne
 * @returns {Object|null} - Objet avec adresse et ville, ou null
 */
async function getDerniereAdresse(personneId) {
  try {
    // Récupérer toutes les interventions de la personne
    const toutesInterventions = await window.getAllInterventions();
    const interventionsPersonne = toutesInterventions
      .filter(i => i.personneId === personneId && (i.adresse || i.lieu))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Plus récent en premier
    
    if (interventionsPersonne.length === 0) {
      return null;
    }
    
    // Récupérer la première intervention avec une adresse
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
 * Réinitialise les champs du formulaire pour une nouvelle transmission
 * @param {string} date - La date au format YYYY-MM-DD
 * @param {string} typeTransmission - Le type de transmission (Jour/Nuit/Coordo)
 */
function resetFormFieldsForNewTransmission(date, typeTransmission) {
  console.log('🔄 Réinitialisation du formulaire pour nouvelle transmission');
  
  // Réinitialiser l'ID d'édition
  const editIdField = document.getElementById('edit-transmission-id');
  if (editIdField) editIdField.value = '';
  
  // Mettre à jour la date et le type de transmission
  const dateField = document.getElementById('form-dateTransmission');
  if (dateField) dateField.value = date;
  
  const typeField = document.getElementById('form-type-transmission');
  if (typeField) typeField.value = typeTransmission;
  
  // Réinitialiser les champs de transmission (garder les infos personnelles)
  const fieldsToReset = [
    'form-lieu-intervention',
    'form-aller-vers',
    'form-commentaires'
  ];
  
  fieldsToReset.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = '';
  });
  
  // Réinitialiser les checkboxes d'accompagnement
  const accompCheckboxes = document.querySelectorAll('input[name="accompagnement"]');
  accompCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser les checkboxes de distribution
  const distribCheckboxes = document.querySelectorAll('input[name="distribution"]');
  distribCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser les checkboxes de motif intervention
  const motifCheckboxes = document.querySelectorAll('input[name="motifIntervention"]');
  motifCheckboxes.forEach(cb => cb.checked = false);
  
  // Réinitialiser le checkbox Attention
  const attentionCheckbox = document.getElementById('form-attention');
  if (attentionCheckbox) attentionCheckbox.checked = false;
  
  console.log('✅ Formulaire réinitialisé pour nouvelle transmission');
}

/**
 * Charge les données de transmission pour une date et un type donnés
 * @param {number} personneId - L'ID de la personne
 * @param {string} date - La date au format YYYY-MM-DD
 * @param {string} typeTransmission - Le type de transmission (Jour/Nuit/Coordo) - peut être null
 */
async function loadTransmissionDataForDate(personneId, date, typeTransmission) {
  // S'assurer que personneId est un nombre
  const pid = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  console.log('📅 ===== CHARGEMENT TRANSMISSION =====');
  console.log('📅 loadTransmissionDataForDate appelé avec:', { personneId: pid, date, typeTransmission });
  
  try {
    // Recharger les informations de la personne pour s'assurer d'avoir les données à jour
    const personne = await window.getPersonneById(pid);
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', pid);
      await window.customAlert('Erreur : personne non trouvée', 'error');
      return;
    }
    
    // Récupérer les DERNIÈRES infos connues
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Recharger les informations personnelles (au cas où elles auraient changé)
    document.getElementById('form-nom').value = personne.nom || '';
    document.getElementById('form-prenom').value = personne.prenom || '';
    document.getElementById('form-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-departement').value = dernieresInfos.departement;
    document.getElementById('form-typologie').value = dernieresInfos.typologie;
    document.getElementById('form-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('form-mineurs').value = dernieresInfos.mineurs;
    
    // Chercher si une transmission existe pour cette personne à cette date
    let existingTransmission = null;
    
    if (typeTransmission && typeTransmission.trim() !== '') {
      // Chercher avec le type spécifique
      console.log('📅 Recherche avec type spécifique:', typeTransmission);
      existingTransmission = await findTransmissionByPersonDateAndType(pid, date, typeTransmission);
    } else {
      // Pas de type spécifié : chercher la première transmission pour cette date
      console.log('📅 Recherche sans type spécifique (première transmission)');
      existingTransmission = await findTransmissionByPersonAndDate(pid, date);
    }
    
    console.log('📋 Transmission trouvée:', existingTransmission ? `ID ${existingTransmission.id}` : 'Aucune');
    if (existingTransmission) {
      console.log('📋 Contenu transmission:', JSON.stringify(existingTransmission, null, 2));
    }
    
    // Mettre à jour le sélecteur de type de transmission
    const typeSelect = document.getElementById('form-type-transmission');
    if (typeSelect && typeTransmission) {
      typeSelect.value = typeTransmission;
    }
    
    if (existingTransmission) {
      // Remplir les champs de l'intervention existante
      console.log('📝 Remplissage des champs avec la transmission ID:', existingTransmission.id);
      console.log('📝 Type:', existingTransmission.typeTransmission, 'Adresse:', existingTransmission.adresse);
      document.getElementById('form-type-transmission').value = existingTransmission.typeTransmission || '';
      document.getElementById('form-adresse').value = existingTransmission.adresse || existingTransmission.lieu || '';
      document.getElementById('form-ville').value = existingTransmission.ville || '';
      document.getElementById('form-signalement').value = existingTransmission.signalement || '';
      document.getElementById('form-transmission').value = existingTransmission.transmission || existingTransmission.observations || '';
      console.log('📝 Valeur dans le champ adresse après remplissage:', document.getElementById('form-adresse').value);
      
      // Checkbox Attention
      if (document.getElementById('form-attention')) {
        document.getElementById('form-attention').checked = existingTransmission.attention || false;
      }
      
      // Checkboxes Orly
      if (existingTransmission.orly) {
        const premierContactEl = document.getElementById('form-premier-contact');
        if (premierContactEl) premierContactEl.checked = existingTransmission.orly.premierContact || false;
        
        const personnePresenteEl = document.getElementById('form-personne-presente');
        if (personnePresenteEl) personnePresenteEl.checked = existingTransmission.orly.personnePresente || false;
        
        const pntEl = document.getElementById('form-pnt');
        if (pntEl) pntEl.checked = existingTransmission.orly.pnt || false;
        
        const maraudeEl = document.getElementById('form-maraude');
        if (maraudeEl) maraudeEl.checked = existingTransmission.orly.maraude || false;
        
        const veilleEl = document.getElementById('form-veille');
        if (veilleEl) veilleEl.checked = existingTransmission.orly.veille || false;
        
        const refusContactEl = document.getElementById('form-refus-contact');
        if (refusContactEl) refusContactEl.checked = existingTransmission.orly.refusContact || false;
      } else {
        // Décocher les checkboxes Orly
        ['form-premier-contact', 'form-personne-presente', 'form-pnt', 'form-maraude', 'form-veille', 'form-refus-contact'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      // Checkboxes Accompagnement
      if (existingTransmission.accompagnement) {
        const hygieneEl = document.getElementById('form-accomp-hygiene');
        if (hygieneEl) hygieneEl.checked = existingTransmission.accompagnement.hygiene || false;
        
        const accueilJourEl = document.getElementById('form-accomp-accueil-jour');
        if (accueilJourEl) accueilJourEl.checked = existingTransmission.accompagnement.accueilJour || false;
        
        const adminEl = document.getElementById('form-accomp-admin');
        if (adminEl) adminEl.checked = existingTransmission.accompagnement.admin || false;
        
        const hebergementEl = document.getElementById('form-accomp-hebergement');
        if (hebergementEl) hebergementEl.checked = existingTransmission.accompagnement.hebergement || false;
        
        const medicalEl = document.getElementById('form-accomp-medical');
        if (medicalEl) medicalEl.checked = existingTransmission.accompagnement.medical || false;
      } else {
        // Décocher les checkboxes Accompagnement
        ['form-accomp-hygiene', 'form-accomp-accueil-jour', 'form-accomp-admin', 'form-accomp-hebergement', 'form-accomp-medical'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      // Checkboxes Distribution
      if (existingTransmission.distribution) {
        const boissonEl = document.getElementById('form-distrib-boisson');
        if (boissonEl) boissonEl.checked = existingTransmission.distribution.boisson || false;
        
        const alimentaireEl = document.getElementById('form-distrib-alimentaire');
        if (alimentaireEl) alimentaireEl.checked = existingTransmission.distribution.alimentaire || false;
        
        const duvetEl = document.getElementById('form-distrib-duvet');
        if (duvetEl) duvetEl.checked = existingTransmission.distribution.duvet || false;
        
        const couvertureSurvieEl = document.getElementById('form-distrib-couverture-survie');
        if (couvertureSurvieEl) couvertureSurvieEl.checked = existingTransmission.distribution.couvertureSurvie || false;
        
        const bonnetsGantsEl = document.getElementById('form-distrib-bonnets-gants');
        if (bonnetsGantsEl) bonnetsGantsEl.checked = existingTransmission.distribution.bonnetsGants || false;
        
        const sousVetementsEl = document.getElementById('form-distrib-sous-vetements');
        if (sousVetementsEl) sousVetementsEl.checked = existingTransmission.distribution.sousVetements || false;
        
        const kitsHygieneEl = document.getElementById('form-distrib-kits-hygiene');
        if (kitsHygieneEl) kitsHygieneEl.checked = existingTransmission.distribution.kitsHygiene || false;
      } else {
        // Décocher les checkboxes Distribution
        ['form-distrib-boisson', 'form-distrib-alimentaire', 'form-distrib-duvet', 'form-distrib-couverture-survie', 
         'form-distrib-bonnets-gants', 'form-distrib-sous-vetements', 'form-distrib-kits-hygiene'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = false;
        });
      }
      
      document.getElementById('form-modal-transmission').dataset.editId = existingTransmission.id;
      
      // Afficher le bouton de suppression en mode édition
      const btnSupprimer = document.getElementById('btn-supprimer-transmission');
      if (btnSupprimer) btnSupprimer.style.display = 'inline-block';
    } else {
      // Pas de transmission pour cette date - réinitialiser les champs
      document.getElementById('form-type-transmission').value = '';
      document.getElementById('form-signalement').value = '';
      document.getElementById('form-transmission').value = '';
      
      // Cacher le bouton de suppression
      const btnSupprimer = document.getElementById('btn-supprimer-transmission');
      if (btnSupprimer) btnSupprimer.style.display = 'none';
      
      // Charger automatiquement la dernière adresse utilisée
      const derniereAdresse = await getDerniereAdresse(personneId);
      if (derniereAdresse) {
        document.getElementById('form-adresse').value = derniereAdresse.adresse || '';
        document.getElementById('form-ville').value = derniereAdresse.ville || '';
      } else {
        document.getElementById('form-adresse').value = '';
        document.getElementById('form-ville').value = '';
      }
      
      // Décocher toutes les checkboxes de transmission
      document.querySelectorAll('#modal-ajout .checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('form-modal-transmission').dataset.editId;
    }
    
    console.log('✅ Données chargées pour date:', date);
    
    // Si on est en mode consultation (depuis les statistiques), redésactiver les champs
    if (window.currentConsultationModal === 'modal-ajout') {
      console.log('🔒 Mode consultation détecté - désactivation des champs dans 50ms');
      setTimeout(() => {
        if (typeof window.disableFormFieldsForConsultation === 'function') {
          window.disableFormFieldsForConsultation('modal-ajout');
          console.log('🔒 Champs désactivés');
        }
      }, 50);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données pour la date:', error);
  }
}
window.loadTransmissionDataForDate = loadTransmissionDataForDate;

/**
 * Édite une transmission existante
 * @param {number} personneId - L'ID de la personne dans la DB unifiée
 * @param {string} date - Date optionnelle (sinon date du filtre)
 * @param {boolean} consultationMode - Mode consultation (sans boutons d'action)
 * @param {string} newTypeTransmission - Type de transmission à pré-sélectionner pour une nouvelle
 */
async function editTransmission(personneId, date = null, consultationMode = false, newTypeTransmission = null) {
  console.log('📝 Compléter la transmission pour personne ID:', personneId, 'newType:', newTypeTransmission);
  
  try {
    // Charger la personne depuis la DB unifiée
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      await window.customAlert('Erreur lors du chargement des données', 'error');
      return;
    }
    
    console.log('Personne trouvée:', personne);
    const selectedDate = document.getElementById('transmissions-date')?.value;
    console.log('Date sélectionnée:', selectedDate);
    
    // Chercher si une transmission existe pour cette personne à cette date
    // Si newTypeTransmission est fourni, on cherche pour ce type spécifique
    let existingTransmission = null;
    if (newTypeTransmission) {
      // Chercher une transmission pour le type spécifique demandé
      existingTransmission = await findTransmissionByPersonDateAndType(personneId, selectedDate, newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1));
      console.log('🆕 Création nouvelle transmission type:', newTypeTransmission, '- Existante:', existingTransmission ? 'oui' : 'non');
    } else {
      // Comportement normal : chercher la première transmission pour cette date
      existingTransmission = await findTransmissionByPersonAndDate(personneId, selectedDate);
    }
    
    console.log('Transmission existante:', existingTransmission ? `ID ${existingTransmission.id}` : 'Aucune');
    
    // Récupérer les DERNIÈRES infos connues (pour pré-remplir le formulaire)
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Remplir les champs avec les infos de la personne
    document.getElementById('form-nom').value = personne.nom || '';
    document.getElementById('form-prenom').value = personne.prenom || '';
    document.getElementById('form-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-departement').value = dernieresInfos.departement;
    document.getElementById('form-typologie').value = dernieresInfos.typologie;
    document.getElementById('form-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('form-mineurs').value = dernieresInfos.mineurs;
    
    // Stocker les valeurs initiales pour détecter les changements
    const form = document.getElementById('form-modal-transmission');
    form.dataset.initialDepartement = dernieresInfos.departement;
    form.dataset.initialTypologie = dernieresInfos.typologie;
    form.dataset.initialNbPersonnes = dernieresInfos.nbPersonnes;
    form.dataset.initialMineurs = dernieresInfos.mineurs;
    
    // Afficher le bouton historique si la personne a un historique
    const btnVoirHistorique = document.getElementById('btn-voir-historique');
    if (btnVoirHistorique && personne.infoHistorique && personne.infoHistorique.length > 0) {
      btnVoirHistorique.style.display = 'inline-block';
    }
    
    if (existingTransmission) {
      // Remplir les champs de l'intervention existante
      document.getElementById('form-type-transmission').value = existingTransmission.typeTransmission || '';
      document.getElementById('form-adresse').value = existingTransmission.adresse || existingTransmission.lieu || '';
      document.getElementById('form-ville').value = existingTransmission.ville || '';
      document.getElementById('form-signalement').value = existingTransmission.signalement || '';
      document.getElementById('form-transmission').value = existingTransmission.transmission || existingTransmission.observations || '';
      
      // Checkbox Attention
      if (document.getElementById('form-attention')) {
        document.getElementById('form-attention').checked = existingTransmission.attention || false;
      }
      
      // Checkboxes Orly
      if (existingTransmission.orly) {
        const premierContactEl = document.getElementById('form-premier-contact');
        if (premierContactEl) premierContactEl.checked = existingTransmission.orly.premierContact || false;
        
        const personnePresenteEl = document.getElementById('form-personne-presente');
        if (personnePresenteEl) personnePresenteEl.checked = existingTransmission.orly.personnePresente || false;
        
        const pntEl = document.getElementById('form-pnt');
        if (pntEl) pntEl.checked = existingTransmission.orly.pnt || false;
        
        const maraudeEl = document.getElementById('form-maraude');
        if (maraudeEl) maraudeEl.checked = existingTransmission.orly.maraude || false;
        
        const veilleEl = document.getElementById('form-veille');
        if (veilleEl) veilleEl.checked = existingTransmission.orly.veille || false;
        
        const refusContactEl = document.getElementById('form-refus-contact');
        if (refusContactEl) refusContactEl.checked = existingTransmission.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingTransmission.accompagnement) {
        const hygieneEl = document.getElementById('form-accomp-hygiene');
        if (hygieneEl) hygieneEl.checked = existingTransmission.accompagnement.hygiene || false;
        
        const accueilJourEl = document.getElementById('form-accomp-accueil-jour');
        if (accueilJourEl) accueilJourEl.checked = existingTransmission.accompagnement.accueilJour || false;
        
        const adminEl = document.getElementById('form-accomp-admin');
        if (adminEl) adminEl.checked = existingTransmission.accompagnement.admin || false;
        
        const hebergementEl = document.getElementById('form-accomp-hebergement');
        if (hebergementEl) hebergementEl.checked = existingTransmission.accompagnement.hebergement || false;
        
        const medicalEl = document.getElementById('form-accomp-medical');
        if (medicalEl) medicalEl.checked = existingTransmission.accompagnement.medical || false;
      }
      
      // Checkboxes Distribution
      if (existingTransmission.distribution) {
        const boissonEl = document.getElementById('form-distrib-boisson');
        if (boissonEl) boissonEl.checked = existingTransmission.distribution.boisson || false;
        
        const alimentaireEl = document.getElementById('form-distrib-alimentaire');
        if (alimentaireEl) alimentaireEl.checked = existingTransmission.distribution.alimentaire || false;
        
        const duvetEl = document.getElementById('form-distrib-duvet');
        if (duvetEl) duvetEl.checked = existingTransmission.distribution.duvet || false;
        
        const couvertureSurvieEl = document.getElementById('form-distrib-couverture-survie');
        if (couvertureSurvieEl) couvertureSurvieEl.checked = existingTransmission.distribution.couvertureSurvie || false;
        
        const bonnetsGantsEl = document.getElementById('form-distrib-bonnets-gants');
        if (bonnetsGantsEl) bonnetsGantsEl.checked = existingTransmission.distribution.bonnetsGants || false;
        
        const sousVetementsEl = document.getElementById('form-distrib-sous-vetements');
        if (sousVetementsEl) sousVetementsEl.checked = existingTransmission.distribution.sousVetements || false;
        
        const kitsHygieneEl = document.getElementById('form-distrib-kits-hygiene');
        if (kitsHygieneEl) kitsHygieneEl.checked = existingTransmission.distribution.kitsHygiene || false;
      }
      
      document.getElementById('form-modal-transmission').dataset.editId = existingTransmission.id;
      
      // Afficher le bouton de suppression en mode édition
      const btnSupprimer = document.getElementById('btn-supprimer-transmission');
      if (btnSupprimer) btnSupprimer.style.display = 'inline-block';
    } else {
      // Nouvelle transmission pour cette date - réinitialiser les champs de transmission
      // Si un type est pré-sélectionné via newTypeTransmission, l'utiliser
      document.getElementById('form-type-transmission').value = newTypeTransmission ? newTypeTransmission.charAt(0).toUpperCase() + newTypeTransmission.slice(1) : '';
      document.getElementById('form-signalement').value = '';
      document.getElementById('form-transmission').value = '';
      
      // Cacher le bouton de suppression en mode création
      const btnSupprimer = document.getElementById('btn-supprimer-transmission');
      if (btnSupprimer) btnSupprimer.style.display = 'none';
      
      // Charger automatiquement la dernière adresse utilisée
      const derniereAdresse = await getDerniereAdresse(personneId);
      if (derniereAdresse) {
        document.getElementById('form-adresse').value = derniereAdresse.adresse || '';
        document.getElementById('form-ville').value = derniereAdresse.ville || '';
        console.log('Adresse chargée automatiquement:', derniereAdresse);
      } else {
        document.getElementById('form-adresse').value = '';
        document.getElementById('form-ville').value = '';
      }
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-ajout input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('form-modal-transmission').dataset.editId;
    }
    
    document.getElementById('form-modal-transmission').dataset.personneId = personneId;
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-ajout');
    if (modal) {
      // S'ASSURER que le modal est COMPLÈTEMENT réactivé
      modal.style.display = '';
      modal.style.zIndex = '1000';
      modal.style.pointerEvents = 'auto';
      modal.classList.add('show');
      
      // RESTAURER les boutons Annuler et Enregistrer (pourraient être cachés par mode consultation)
      const btnAnnuler = document.getElementById('btn-annuler');
      if (btnAnnuler) btnAnnuler.style.display = '';
      const btnEnregistrer = modal.querySelector('button[type="submit"]');
      if (btnEnregistrer) btnEnregistrer.style.display = '';
      
      // Retirer le bouton Fermer si présent (depuis mode consultation)
      const btnFermerConsultation = modal.querySelector('.btn-fermer-consultation');
      if (btnFermerConsultation) btnFermerConsultation.remove();
      
      // Nettoyer les anciens intervalles/timers avant d'en créer de nouveaux
      if (window._transmissionCollapseInterval) {
        clearInterval(window._transmissionCollapseInterval);
        window._transmissionCollapseInterval = null;
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
        window._transmissionCollapseInterval = setInterval(() => {
          checkAttempts++;
          const section = document.getElementById('section-info-perso');
          if (section && section.querySelector('.form-grid')) {
            clearInterval(window._transmissionCollapseInterval);
            window._transmissionCollapseInterval = null;
            
            // Réinitialiser les gestionnaires de collapse (seulement si pas déjà fait)
            if (window.initSectionCollapse) {
              window.initSectionCollapse();
            }
            
            // Replier la section après un court délai
            setTimeout(() => {
              if (window.replierSection) {
                window.replierSection('section-info-perso');
              }
            }, 100);
          } else if (checkAttempts >= maxAttempts) {
            clearInterval(window._transmissionCollapseInterval);
            window._transmissionCollapseInterval = null;
            console.warn('⚠️ Timeout : section info perso non trouvée');
          }
        }, 50);
        
        // Nettoyer l'ancien navigateur de dates s'il existe
        if (window._dateNavigatorCleanup) {
          window._dateNavigatorCleanup();
        }
        
        // Initialiser le navigateur de dates
        if (window.initDateNavigator) {
          const currentTypeTransmission = existingTransmission?.typeTransmission || 
            document.getElementById('form-type-transmission')?.value || '';
          
          window.initDateNavigator({
            type: 'transmissions',
            personneId: personneId,
            currentDate: selectedDate,
            currentTypeTransmission: currentTypeTransmission,
            hideToday: consultationMode, // En mode consultation, ne pas afficher la date du jour
            onDateChange: async (newDate, newTypeTransmission, isNewTransmission) => {
              if (isNewTransmission) {
                // Nouvelle transmission : réinitialiser le formulaire avec des champs vides
                console.log('➕ Création nouvelle transmission:', newTypeTransmission, 'pour', newDate);
                resetFormFieldsForNewTransmission(newDate, newTypeTransmission);
              } else {
                await loadTransmissionDataForDate(personneId, newDate, newTypeTransmission);
              }
            }
          });
        }
      }, 100);
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    await window.customAlert('Erreur lors du chargement des données', 'error');
  }
}

/**
 * Supprime une personne (toutes ses interventions)
 */
async function deletePersonCard(personneId) {
  const confirmation = await window.customConfirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses interventions ?', 'Supprimer');
  if (!confirmation) {
    return;
  }
  
  try {
    // Utiliser la fonction de suppression de la base unifiée qui supprime aussi les interventions
    if (typeof window.deletePersonne === 'function') {
      await window.deletePersonne(personneId);
      console.log('Personne et toutes ses interventions supprimées');
    } else {
      // Fallback : supprimer manuellement
      const allInterventions = await window.getAllInterventions();
      const personInterventions = allInterventions.filter(i => 
        i.personneId === personneId && i.type === 'transmissions'
      );
      
      for (const intervention of personInterventions) {
        await window.deleteIntervention(intervention.id);
      }
      
      await window.deletePersonne(personneId);
    }

    if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
      await window.afficherToutesLesPersonnesTransmissions();
    } else if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
    console.log('✅ Personne supprimée');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    await window.customAlert('Erreur lors de la suppression : ' + error.message, 'error');
  }
}

/**
 * Initialise le formulaire de transmissions
 */
function initTransmissionsForm() {
  const btnAjouter = document.getElementById('btn-ajouter');
  const modal = document.getElementById('modal-ajout');
  const form = document.getElementById('form-modal-transmission');
  const btnAnnuler = document.getElementById('btn-annuler');
  const modalClose = document.querySelector('#modal-ajout .modal-close');
  
  if (!btnAjouter || !modal || !form) {
    console.warn('Éléments formulaire Transmissions non trouvés');
    return;
  }
  
  /**
   * Obtient la date à utiliser par défaut
   * Si on est entre 00h00 et 03h00, on retourne la veille
   * Sinon on retourne la date du jour
   */
  function getDateParDefaut() {
    const maintenant = new Date();
    const heures = maintenant.getHours();
    
    // Si on est entre minuit et 3h du matin, on prend la veille
    if (heures >= 0 && heures < 3) {
      maintenant.setDate(maintenant.getDate() - 1);
    }
    
    // Formater en YYYY-MM-DD pour l'input date
    return maintenant.toISOString().split('T')[0];
  }
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personneId;
    delete form.dataset.initialDepartement;
    delete form.dataset.initialTypologie;
    delete form.dataset.initialNbPersonnes;
    delete form.dataset.initialMineurs;
    
    // Cacher le bouton historique et l'alerte en mode création
    const btnVoirHistorique = document.getElementById('btn-voir-historique');
    if (btnVoirHistorique) btnVoirHistorique.style.display = 'none';
    const alerteModif = document.getElementById('alerte-modification-infos');
    if (alerteModif) alerteModif.style.display = 'none';
    
    // Cacher le bouton de suppression en mode création
    const btnSupprimer = document.getElementById('btn-supprimer-transmission');
    if (btnSupprimer) btnSupprimer.style.display = 'none';
    
    // RESTAURER les boutons Annuler et Enregistrer (pourraient être cachés par mode consultation)
    const btnAnnuler = document.getElementById('btn-annuler');
    if (btnAnnuler) btnAnnuler.style.display = '';
    const btnEnregistrer = modal.querySelector('button[type="submit"]');
    if (btnEnregistrer) btnEnregistrer.style.display = '';
    
    // Retirer le bouton Fermer si présent (depuis mode consultation)
    const btnFermerConsultation = modal.querySelector('.btn-fermer-consultation');
    if (btnFermerConsultation) btnFermerConsultation.remove();
    
    // Cacher le navigateur de dates en mode création et réinitialiser le titre
    if (window.resetModalTitle) window.resetModalTitle('transmissions');
    
    // Initialiser la date du sélecteur de transmission avec la date par défaut
    const dateTransmission = document.getElementById('transmissions-date');
    if (dateTransmission && !dateTransmission.value) {
      dateTransmission.value = getDateParDefaut();
      console.log('Date Transmissions initialisée à:', dateTransmission.value);
    }
    
    // Réinitialiser le style inline pour que le CSS puisse gérer l'affichage
    modal.style.display = '';
    modal.style.zIndex = ''; // Réinitialiser le z-index
    modal.style.pointerEvents = ''; // Réinitialiser pointer-events
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
          window.deplierSection('section-info-perso');
        }
      }, 50);
    }, 100);
  });
  
  // Fermer la modal
  const closeModal = () => {
    // Utiliser la fonction unifiée de fermeture
    window.closeModalSafely(modal, form, {
      focusTarget: document.getElementById('transmissions-date')
    });
    
    // Cacher l'alerte
    const alerteModif = document.getElementById('alerte-modification-infos');
    if (alerteModif) alerteModif.style.display = 'none';
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Détecter les changements sur les champs historisés
  const champsHistorises = [
    'form-departement',
    'form-typologie', 
    'form-nb-personnes',
    'form-mineurs'
  ];
  
  champsHistorises.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => {
        // Vérifier si on est en mode édition (pas création)
        if (!form.dataset.personneId) return;
        
        const alerteModif = document.getElementById('alerte-modification-infos');
        if (!alerteModif) return;
        
        // Vérifier si au moins un champ a changé
        const depChanged = document.getElementById('form-departement').value !== (form.dataset.initialDepartement || '');
        const typoChanged = document.getElementById('form-typologie').value !== (form.dataset.initialTypologie || '');
        const nbChanged = document.getElementById('form-nb-personnes').value !== (form.dataset.initialNbPersonnes || '');
        const minChanged = document.getElementById('form-mineurs').value !== (form.dataset.initialMineurs || '');
        
        if (depChanged || typoChanged || nbChanged || minChanged) {
          alerteModif.style.display = 'block';
          console.log('⚠️ Modification détectée des informations historisées');
        } else {
          alerteModif.style.display = 'none';
        }
      });
    }
  });
  
  // Event listener pour le bouton "Voir l'historique"
  const btnVoirHistorique = document.getElementById('btn-voir-historique');
  if (btnVoirHistorique) {
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
  
  // Event listener pour le bouton "Supprimer la transmission"
  const btnSupprimer = document.getElementById('btn-supprimer-transmission');
  if (btnSupprimer) {
    btnSupprimer.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const editId = form.dataset.editId;
      if (!editId) {
        console.warn('Aucune transmission à supprimer');
        return;
      }
      
      // Créer une modal de confirmation HTML (au lieu de confirm() natif qui perturbe le focus Electron)
      const confirmModal = document.createElement('div');
      confirmModal.className = 'confirm-modal-overlay';
      confirmModal.innerHTML = `
        <div class="confirm-modal">
          <h3>Confirmer la suppression</h3>
          <p>Êtes-vous sûr de vouloir supprimer cette transmission ?<br>Cette action est irréversible.</p>
          <div class="confirm-modal-buttons">
            <button class="btn-secondary" id="btn-confirm-cancel">Annuler</button>
            <button class="btn-danger" id="btn-confirm-ok">Supprimer</button>
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
        max-width: 400px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;
      confirmModal.querySelector('.confirm-modal-buttons').style.cssText = `
        display: flex; gap: 10px; justify-content: center; margin-top: 20px;
      `;
      
      document.body.appendChild(confirmModal);
      
      // Gérer les boutons
      confirmModal.querySelector('#btn-confirm-cancel').addEventListener('click', () => {
        confirmModal.remove();
      });
      
      confirmModal.querySelector('#btn-confirm-ok').addEventListener('click', async () => {
        confirmModal.remove();
        
        try {
          console.log('🗑️ Suppression de la transmission ID:', editId);
          
          // Supprimer de la base de données
          await window.deleteIntervention(parseInt(editId));
          
          // Fermer la modal et rafraîchir (EXACTEMENT comme l'enregistrement)
          closeModal();
          if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
            await window.afficherToutesLesPersonnesTransmissions();
          }
          console.log('✅ Transmission supprimée avec succès');
          
        } catch (error) {
          console.error('❌ Erreur lors de la suppression:', error);
          await window.customAlert('Erreur lors de la suppression de la transmission', 'error');
        }
      });
    });
  }
  
  // Soumettre le formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = form.dataset.editId;
    const personneId = form.dataset.personneId ? parseInt(form.dataset.personneId) : null;
    const selectedDate = document.getElementById('transmissions-date')?.value || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire Transmissions - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    try {
      // Données de la personne
      const personneData = {
        nom: document.getElementById('form-nom').value,
        prenom: document.getElementById('form-prenom').value,
        dateNaissance: document.getElementById('form-ddn').value,
        descriptionPhysique: document.getElementById('form-description')?.value || '',
        inconnu: document.getElementById('form-inconnu')?.checked || false
        // NOTE: departement, typologie, nbPersonnes, mineurs sont gérés via infoHistorique
      };
      
      // Données de l'intervention Transmission
      const interventionData = {
        typeTransmission: document.getElementById('form-type-transmission').value,
        adresse: document.getElementById('form-adresse').value,
        lieu: document.getElementById('form-adresse').value, // Alias pour compatibilité
        ville: document.getElementById('form-ville').value,
        signalement: document.getElementById('form-signalement').value,
        transmission: document.getElementById('form-transmission').value,
        observations: document.getElementById('form-transmission').value, // Alias pour compatibilité
        date: selectedDate,
        type: 'transmissions',
        attention: document.getElementById('form-attention')?.checked || false,
        orly: {
          premierContact: document.getElementById('form-premier-contact')?.checked || false,
          personnePresente: document.getElementById('form-personne-presente')?.checked || false,
          pnt: document.getElementById('form-pnt')?.checked || false,
          maraude: document.getElementById('form-maraude')?.checked || false,
          veille: document.getElementById('form-veille')?.checked || false,
          refusContact: document.getElementById('form-refus-contact')?.checked || false
        },
        accompagnement: {
          hygiene: document.getElementById('form-accomp-hygiene')?.checked || false,
          accueilJour: document.getElementById('form-accomp-accueil-jour')?.checked || false,
          admin: document.getElementById('form-accomp-admin')?.checked || false,
          hebergement: document.getElementById('form-accomp-hebergement')?.checked || false,
          medical: document.getElementById('form-accomp-medical')?.checked || false
        },
        distribution: {
          boisson: document.getElementById('form-distrib-boisson')?.checked || false,
          alimentaire: document.getElementById('form-distrib-alimentaire')?.checked || false,
          duvet: document.getElementById('form-distrib-duvet')?.checked || false,
          couvertureSurvie: document.getElementById('form-distrib-couverture-survie')?.checked || false,
          bonnetsGants: document.getElementById('form-distrib-bonnets-gants')?.checked || false,
          sousVetements: document.getElementById('form-distrib-sous-vetements')?.checked || false,
          kitsHygiene: document.getElementById('form-distrib-kits-hygiene')?.checked || false
        }
      };
      
      let finalPersonneId = personneId;
      
      if (personneId) {
        // Charger la personne existante pour gérer l'historisation
        const personneExistante = await window.getPersonneById(personneId);
        
        // Détecter si les infos historisées ont changé
        if (window.ajouterVersionInfos && personneExistante) {
          const nouvellesInfos = {
            departement: document.getElementById('form-departement')?.value || '',
            typologie: document.getElementById('form-typologie').value,
            nbPersonnes: document.getElementById('form-nb-personnes').value,
            mineurs: document.getElementById('form-mineurs').value
          };
          
          // Si la personne n'a pas d'historique (ancienne donnée), on doit l'initialiser
          // avec la date de la PREMIÈRE intervention, pas la date actuelle
          if (!personneExistante.infoHistorique || personneExistante.infoHistorique.length === 0) {
            console.log('⚠️ Personne sans historique détectée - initialisation nécessaire');
            
            // Récupérer toutes les interventions et filtrer par personneId
            const toutesInterventions = await window.getAllInterventions();
            const interventions = toutesInterventions.filter(i => i.personneId === personneId);
            
            // Trouver la date de la première intervention
            let premiereDateIntervention = selectedDate; // Par défaut, la date actuelle
            if (interventions && interventions.length > 0) {
              const dates = interventions.map(i => i.date).sort();
              premiereDateIntervention = dates[0];
              console.log(`📅 Première intervention trouvée: ${premiereDateIntervention}`);
            }
            
            // Initialiser l'historique avec les ANCIENNES valeurs à la date de la première intervention
            const anciennesInfos = {
              departement: form.dataset.initialDepartement || '',
              typologie: form.dataset.initialTypologie || '',
              nbPersonnes: form.dataset.initialNbPersonnes || '',
              mineurs: form.dataset.initialMineurs || ''
            };
            
            personneExistante.infoHistorique = [{
              dateDebut: premiereDateIntervention,
              departement: anciennesInfos.departement,
              typologie: anciennesInfos.typologie,
              nbPersonnes: anciennesInfos.nbPersonnes,
              mineurs: anciennesInfos.mineurs
            }];
            
            console.log('📦 Historique initialisé avec anciennes valeurs:', personneExistante.infoHistorique);
          }
          
          // Maintenant, ajouter la nouvelle version si différente
          const historiqueMAJ = window.ajouterVersionInfos(
            personneExistante, 
            selectedDate, 
            nouvellesInfos
          );
          
          console.log('📋 Historique mis à jour:', historiqueMAJ);
          
          // Mettre à jour UNIQUEMENT l'historique, pas les champs directs
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
              departement: document.getElementById('form-departement')?.value || '',
              typologie: document.getElementById('form-typologie').value,
              nbPersonnes: document.getElementById('form-nb-personnes').value,
              mineurs: document.getElementById('form-mineurs').value
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
        console.log('✅ Intervention Transmission mise à jour, ID:', editId);
      } else {
        // Vérifier si une transmission existe déjà avec ce typeTransmission pour cette date
        const existingForType = await findTransmissionByPersonDateAndType(
          finalPersonneId, 
          selectedDate, 
          interventionData.typeTransmission
        );
        
        if (existingForType) {
          // Mettre à jour l'existante au lieu d'en créer une nouvelle
          await window.updateIntervention(existingForType.id, interventionData);
          console.log('✅ Intervention Transmission mise à jour (existante), ID:', existingForType.id);
        } else {
          // Créer une nouvelle intervention
          const interventionId = await window.ajouterIntervention(interventionData);
          console.log('✅ Nouvelle intervention Transmission créée, ID:', interventionId);
        }
      }
      
      // Fermer la modal et rafraîchir
      closeModal();
      if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
        await window.afficherToutesLesPersonnesTransmissions();
      } else if (typeof window.afficherToutesFichesTransmissions === 'function') {
        await window.afficherToutesFichesTransmissions();
      } else {
        await window.loadAndDisplayCards();
      }
      console.log('✅ Transmission enregistrée avec succès');
      
      // Rafraîchir le navigateur de dates pour mettre à jour les onglets
      if (typeof window.refreshNavigator === 'function') {
        await window.refreshNavigator('transmissions');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      await window.customAlert('Erreur lors de l\'enregistrement : ' + error.message, 'error');
    }
  });
  
  // Initialiser tous les boutons d'historique des infos personnelles
  if (typeof window.initTousBoutonsHistorique === 'function') {
    window.initTousBoutonsHistorique(form);
  }
  
  // Initialiser les boutons d'historique par section
  const btnsHistSection = form.querySelectorAll('.btn-hist-section');
  btnsHistSection.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const section = btn.dataset.section;
      const personneId = form.dataset.personneId;
      
      if (personneId && typeof window.afficherHistoriqueInterventions === 'function') {
        await window.afficherHistoriqueInterventions(parseInt(personneId), section);
      } else {
        await window.customAlert('Veuillez d\'abord sélectionner ou créer une personne.', 'warning');
      }
    });
  });
  
  console.log('✅ Formulaire Transmissions initialisé');
}

// ==================== EXPORT ====================

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findTransmissionByPersonAndDate,
    editTransmission,
    deletePersonCard,
    initTransmissionsForm
  };
} else {
  // Exposer globalement pour le navigateur
  window.findTransmissionByPersonAndDate = findTransmissionByPersonAndDate;
  window.editTransmission = editTransmission;
  window.deletePersonCard = deletePersonCard;
  window.initTransmissionsForm = initTransmissionsForm;
}

console.log('✅ Module ajout_transmission_minimale chargé');
