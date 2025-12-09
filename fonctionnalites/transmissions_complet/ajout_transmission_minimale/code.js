/**
 * Code métier - Transmissions : Formulaire avec base centralisée
 * NOUVELLE VERSION - Compatible avec database-personnes.js
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Trouve une transmission par personneId et date
 */
async function findTransmissionByPersonAndDate(personneId, dateTransmission) {
  const allTransmissions = await window.getAllTransmissions();
  console.log('🔍 Recherche transmission pour personneId:', personneId, 'date:', dateTransmission);
  const found = allTransmissions.find(t => 
    t.personneId === personneId && t.dateTransmission === dateTransmission
  );
  console.log('🔍 Transmission trouvée:', found ? `ID ${found.id}` : 'Aucune');
  return found;
}

/**
 * Édite une transmission pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB centrale
 */
async function editTransmission(personneId) {
  console.log('📝 Compléter la transmission pour personne ID:', personneId);
  
  try {
    // Charger la personne depuis la DB centrale
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      alert('Erreur lors du chargement des données');
      return;
    }
    
    console.log('✅ Personne trouvée:', personne);
    const selectedDate = document.getElementById('transmissions-date')?.value;
    console.log('📅 Date sélectionnée:', selectedDate);
    
    // Chercher si une transmission existe pour cette personne à cette date
    const existingTransmission = await findTransmissionByPersonAndDate(personneId, selectedDate);
    
    console.log('📋 Transmission existante:', existingTransmission ? `ID ${existingTransmission.id}` : 'Aucune');
    
    // Remplir les champs avec les infos de la personne
    document.getElementById('form-nom').value = personne.nom || '';
    document.getElementById('form-prenom').value = personne.prenom || '';
    document.getElementById('form-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-typologie').value = personne.typologie || '';
    document.getElementById('form-nb-personnes').value = personne.nbPersonnes || '';
    document.getElementById('form-mineurs').value = personne.mineurs || '';
    
    if (existingTransmission) {
      // MODE ÉDITION : charger toutes les données de la transmission
      console.log('✅ Transmission existante pour cette date - MODE ÉDITION');
      document.getElementById('form-type-transmission').value = existingTransmission.typeTransmission || '';
      document.getElementById('form-adresse').value = existingTransmission.adresse || '';
      document.getElementById('form-ville').value = existingTransmission.ville || '';
      document.getElementById('form-signalement').value = existingTransmission.signalement || '';
      document.getElementById('form-transmission').value = existingTransmission.transmission || '';
      
      // Checkboxes Orly
      if (existingTransmission.orly) {
        document.getElementById('form-premier-contact').checked = existingTransmission.orly.premierContact || false;
        document.getElementById('form-personne-presente').checked = existingTransmission.orly.personnePresente || false;
        document.getElementById('form-pnt').checked = existingTransmission.orly.pnt || false;
        document.getElementById('form-maraude').checked = existingTransmission.orly.maraude || false;
        document.getElementById('form-veille').checked = existingTransmission.orly.veille || false;
        document.getElementById('form-refus-contact').checked = existingTransmission.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingTransmission.accompagnement) {
        document.getElementById('form-accomp-ecoute').checked = existingTransmission.accompagnement.ecoute || false;
        document.getElementById('form-accomp-orientation').checked = existingTransmission.accompagnement.orientation || false;
        document.getElementById('form-accomp-admin').checked = existingTransmission.accompagnement.admin || false;
        document.getElementById('form-accomp-medical').checked = existingTransmission.accompagnement.medical || false;
        document.getElementById('form-accomp-hebergement').checked = existingTransmission.accompagnement.hebergement || false;
        document.getElementById('form-accomp-autre').checked = existingTransmission.accompagnement.autre || false;
      }
      
      // Checkboxes Distribution
      if (existingTransmission.distribution) {
        document.getElementById('form-distrib-alimentaire').checked = existingTransmission.distribution.alimentaire || false;
        document.getElementById('form-distrib-vestimentaire').checked = existingTransmission.distribution.vestimentaire || false;
        document.getElementById('form-distrib-hygiene').checked = existingTransmission.distribution.hygiene || false;
        document.getElementById('form-distrib-couvertures').checked = existingTransmission.distribution.couvertures || false;
        document.getElementById('form-distrib-duvet').checked = existingTransmission.distribution.duvet || false;
        document.getElementById('form-distrib-autre').checked = existingTransmission.distribution.autre || false;
      }
      
      document.getElementById('form-modal-transmission').dataset.editId = existingTransmission.id;
      console.log('🔖 editId défini à:', existingTransmission.id);
    } else {
      // MODE CRÉATION : réinitialiser les champs de transmission
      console.log('➕ Pas de transmission pour cette date - MODE CRÉATION');
      document.getElementById('form-type-transmission').value = '';
      document.getElementById('form-adresse').value = '';
      document.getElementById('form-ville').value = '';
      document.getElementById('form-signalement').value = '';
      document.getElementById('form-transmission').value = '';
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-ajout input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('form-modal-transmission').dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle transmission');
    }
    
    document.getElementById('form-modal-transmission').dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-ajout');
    if (modal) {
      modal.classList.add('show');
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    alert('Erreur lors du chargement des données');
  }
}

/**
 * Supprime une personne (toutes ses transmissions)
 */
async function deletePersonCard(personneId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses transmissions ?')) {
    return;
  }
  
  try {
    const allTransmissions = await window.getAllTransmissions();
    const personTransmissions = allTransmissions.filter(t => t.personneId === personneId);
    
    for (const transmission of personTransmissions) {
      await window.deleteTransmission(transmission.id);
    }
    
    await window.deletePersonne(personneId);
    await window.afficherToutesLesPersonnesTransmissions();
    console.log('Personne supprimée');
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression');
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
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personneId;
    
    const dateTransmission = document.getElementById('transmissions-date');
    if (dateTransmission && !dateTransmission.value) {
      dateTransmission.value = getDateParDefaut();
      console.log('Date Transmissions initialisée à:', dateTransmission.value);
    }
    
    modal.classList.add('show');
  });
  
  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personneId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Soumettre le formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = form.dataset.editId;
    const personneId = form.dataset.personneId;
    const selectedDate = document.getElementById('transmissions-date')?.value || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    // Données de la personne
    const personneData = {
      nom: document.getElementById('form-nom').value,
      prenom: document.getElementById('form-prenom').value,
      dateNaissance: document.getElementById('form-ddn').value,
      typologie: document.getElementById('form-typologie').value,
      nbPersonnes: document.getElementById('form-nb-personnes').value,
      mineurs: document.getElementById('form-mineurs').value
    };
    
    // Données de la transmission
    const transmissionData = {
      typeTransmission: document.getElementById('form-type-transmission').value,
      adresse: document.getElementById('form-adresse').value,
      ville: document.getElementById('form-ville').value,
      signalement: document.getElementById('form-signalement').value,
      transmission: document.getElementById('form-transmission').value,
      dateTransmission: selectedDate,
      orly: {
        premierContact: document.getElementById('form-premier-contact')?.checked || false,
        personnePresente: document.getElementById('form-personne-presente')?.checked || false,
        pnt: document.getElementById('form-pnt')?.checked || false,
        maraude: document.getElementById('form-maraude')?.checked || false,
        veille: document.getElementById('form-veille')?.checked || false,
        refusContact: document.getElementById('form-refus-contact')?.checked || false
      },
      accompagnement: {
        ecoute: document.getElementById('form-accomp-ecoute')?.checked || false,
        orientation: document.getElementById('form-accomp-orientation')?.checked || false,
        admin: document.getElementById('form-accomp-admin')?.checked || false,
        medical: document.getElementById('form-accomp-medical')?.checked || false,
        hebergement: document.getElementById('form-accomp-hebergement')?.checked || false,
        autre: document.getElementById('form-accomp-autre')?.checked || false
      },
      distribution: {
        alimentaire: document.getElementById('form-distrib-alimentaire')?.checked || false,
        vestimentaire: document.getElementById('form-distrib-vestimentaire')?.checked || false,
        hygiene: document.getElementById('form-distrib-hygiene')?.checked || false,
        couvertures: document.getElementById('form-distrib-couvertures')?.checked || false,
        duvet: document.getElementById('form-distrib-duvet')?.checked || false,
        autre: document.getElementById('form-distrib-autre')?.checked || false
      }
    };
    
    try {
      let finalPersonneId = personneId;
      
      // Créer ou récupérer la personne dans la DB centrale
      if (!personneId) {
        finalPersonneId = await window.creerOuRecupererPersonne(personneData);
        console.log('✅ Personne créée/récupérée, ID:', finalPersonneId);
      } else {
        // Mettre à jour les infos de la personne si elles ont changé
        await window.updatePersonne(parseInt(personneId), personneData);
        finalPersonneId = parseInt(personneId);
        console.log('✅ Infos personne mises à jour');
      }
      
      // Ajouter le personneId à la transmission
      transmissionData.personneId = finalPersonneId;
      
      if (editId) {
        // Mise à jour de la transmission existante
        console.log('🔄 Mise à jour transmission existante ID:', editId);
        transmissionData.id = parseInt(editId);
        await window.updateTransmission(transmissionData);
        console.log('✅ Transmission mise à jour');
      } else {
        // Nouvelle transmission
        console.log('➕ Création nouvelle transmission pour personne ID:', finalPersonneId);
        await window.addTransmission(transmissionData);
        console.log('✅ Nouvelle transmission ajoutée');
      }
      
      closeModal();
      if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
        await window.afficherToutesLesPersonnesTransmissions();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement');
    }
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

console.log('✅ Module ajout_transmission_minimale chargé (base centralisée)');
