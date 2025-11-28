/**
 * Code métier - Transmissions : Ajout transmission minimale
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Trouve une transmission par personId et date
 */
async function findTransmissionByPersonAndDate(personId, dateTransmission) {
  const allTransmissions = await window.getAllTransmissions();
  return allTransmissions.find(t => 
    String(t.personId) === String(personId) && t.dateTransmission === dateTransmission
  );
}

/**
 * Édite une transmission existante
 */
async function editTransmission(id) {
  console.log('Compléter la transmission pour ID:', id);
  
  try {
    const allTransmissions = await window.getAllTransmissions();
    const baseTransmission = allTransmissions.find(t => String(t.id) === String(id));
    
    if (!baseTransmission) {
      console.error('Transmission non trouvée pour ID:', id);
      alert('Erreur lors du chargement des données');
      return;
    }
    
    const selectedDate = document.getElementById('transmissions-date')?.value;
    const existingTransmissionForDate = await findTransmissionByPersonAndDate(
      baseTransmission.personId || id,
      selectedDate
    );
    
    const transmission = existingTransmissionForDate || baseTransmission;
    
    // Remplir les champs du formulaire
    document.getElementById('form-nom').value = transmission.nom || '';
    document.getElementById('form-prenom').value = transmission.prenom || '';
    document.getElementById('form-ddn').value = transmission.dateNaissance || '';
    document.getElementById('form-typologie').value = transmission.typologie || '';
    document.getElementById('form-nb-personnes').value = transmission.nbPersonnes || '';
    document.getElementById('form-mineurs').value = transmission.mineurs || '';
    
    if (existingTransmissionForDate) {
      document.getElementById('form-type-transmission').value = transmission.typeTransmission || '';
      document.getElementById('form-adresse').value = transmission.adresse || '';
      document.getElementById('form-ville').value = transmission.ville || '';
      document.getElementById('form-signalement').value = transmission.signalement || '';
      document.getElementById('form-transmission').value = transmission.transmission || '';
      
      // Checkboxes Orly
      if (transmission.orly) {
        document.getElementById('form-premier-contact').checked = transmission.orly.premierContact || false;
        document.getElementById('form-personne-presente').checked = transmission.orly.personnePresente || false;
        document.getElementById('form-pnt').checked = transmission.orly.pnt || false;
        document.getElementById('form-maraude').checked = transmission.orly.maraude || false;
        document.getElementById('form-veille').checked = transmission.orly.veille || false;
        document.getElementById('form-refus-contact').checked = transmission.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (transmission.accompagnement) {
        document.getElementById('form-accomp-ecoute').checked = transmission.accompagnement.ecoute || false;
        document.getElementById('form-accomp-orientation').checked = transmission.accompagnement.orientation || false;
        document.getElementById('form-accomp-admin').checked = transmission.accompagnement.admin || false;
        document.getElementById('form-accomp-medical').checked = transmission.accompagnement.medical || false;
        document.getElementById('form-accomp-hebergement').checked = transmission.accompagnement.hebergement || false;
        document.getElementById('form-accomp-autre').checked = transmission.accompagnement.autre || false;
      }
      
      // Checkboxes Distribution
      if (transmission.distribution) {
        document.getElementById('form-distrib-alimentaire').checked = transmission.distribution.alimentaire || false;
        document.getElementById('form-distrib-vestimentaire').checked = transmission.distribution.vestimentaire || false;
        document.getElementById('form-distrib-hygiene').checked = transmission.distribution.hygiene || false;
        document.getElementById('form-distrib-couvertures').checked = transmission.distribution.couvertures || false;
        document.getElementById('form-distrib-duvet').checked = transmission.distribution.duvet || false;
        document.getElementById('form-distrib-autre').checked = transmission.distribution.autre || false;
      }
      
      document.getElementById('form-modal-transmission').dataset.editId = transmission.id;
    } else {
      // Nouvelle transmission pour cette date - réinitialiser les champs de transmission
      document.getElementById('form-type-transmission').value = '';
      document.getElementById('form-adresse').value = '';
      document.getElementById('form-ville').value = '';
      document.getElementById('form-signalement').value = '';
      document.getElementById('form-transmission').value = '';
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-ajout input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('form-modal-transmission').dataset.editId;
    }
    
    document.getElementById('form-modal-transmission').dataset.personId = baseTransmission.personId || id;
    
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
async function deletePersonCard(personId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses transmissions ?')) {
    return;
  }
  
  try {
    const allTransmissions = await window.getAllTransmissions();
    const personTransmissions = allTransmissions.filter(t => 
      String(t.personId || t.id) === String(personId)
    );
    
    for (const transmission of personTransmissions) {
      await window.deleteTransmission(transmission.id);
}

    await window.loadAndDisplayCards();
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
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personId;
    modal.classList.add('show');
  });
  
  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Soumettre le formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = form.dataset.editId;
    const personId = form.dataset.personId;
    const selectedDate = document.getElementById('transmissions-date')?.value || new Date().toISOString().split('T')[0];
    
    const formData = {
      nom: document.getElementById('form-nom').value,
      prenom: document.getElementById('form-prenom').value,
      dateNaissance: document.getElementById('form-ddn').value,
      typologie: document.getElementById('form-typologie').value,
      nbPersonnes: document.getElementById('form-nb-personnes').value,
      mineurs: document.getElementById('form-mineurs').value,
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
      if (editId) {
        // Mise à jour
        formData.id = parseInt(editId);
        formData.personId = parseInt(personId);
        await window.updateTransmission(formData);
        console.log('Transmission mise à jour');
      } else if (personId) {
        // Nouvelle transmission pour une personne existante
        formData.personId = parseInt(personId);
        await window.addTransmission(formData);
        console.log('Nouvelle transmission ajoutée pour personne existante');
      } else {
        // Nouvelle personne
        const newId = await window.addTransmission(formData);
        // Mettre à jour avec le personId
        formData.id = newId;
        formData.personId = newId;
        await window.updateTransmission(formData);
        console.log('Nouvelle personne créée');
      }
      
      closeModal();
      await window.loadAndDisplayCards();
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

console.log('✅ Module ajout_transmission_minimale chargé');
