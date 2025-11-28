/**
 * Code métier - Transmissions : Ajout transmission minimale
 * Fonctions pour tests ET application (incluant gestion formulaire)
 */

// ==================== FONCTIONS APPLICATION - GESTION FORMULAIRE ====================

/**
 * Trouve une transmission par personId et date
 */
async function findTransmissionByPersonAndDate(personId, dateTransmission) {
  // Utilise getAllTransmissions du module database.js
  const allTransmissions = await getAllTransmissions();
  return allTransmissions.find(t => 
    t.personId === personId && t.dateTransmission === dateTransmission
  );
}

/**
 * Édite une transmission existante
 */
async function editTransmission(id) {
  console.log('Compléter la transmission pour ID:', id);
  
  try {
    const allTransmissions = await getAllTransmissions();
    const baseTransmission = allTransmissions.find(t => t.id === id);
    
    if (!baseTransmission) {
      console.error('Transmission non trouvée');
      alert('Erreur lors du chargement des données');
      return;
    }
    
    const selectedDate = document.getElementById('transmissions-date').value;
    const existingTransmissionForDate = await findTransmissionByPersonAndDate(
      baseTransmission.personId || id,
      selectedDate
    );
    
    const transmission = existingTransmissionForDate || baseTransmission;
    
    // Remplir le formulaire
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
      
      if (transmission.orly) {
        document.getElementById('form-premier-contact').checked = transmission.orly.premierContact || false;
        document.getElementById('form-personne-presente').checked = transmission.orly.personnePresente || false;
        document.getElementById('form-pnt').checked = transmission.orly.pnt || false;
        document.getElementById('form-maraude').checked = transmission.orly.maraude || false;
        document.getElementById('form-veille').checked = transmission.orly.veille || false;
        document.getElementById('form-refus-contact').checked = transmission.orly.refusContact || false;
      }
      
      if (transmission.accompagnement) {
        document.getElementById('form-accomp-ecoute').checked = transmission.accompagnement.ecoute || false;
        document.getElementById('form-accomp-orientation').checked = transmission.accompagnement.orientation || false;
        document.getElementById('form-accomp-admin').checked = transmission.accompagnement.admin || false;
        document.getElementById('form-accomp-medical').checked = transmission.accompagnement.medical || false;
        document.getElementById('form-accomp-hebergement').checked = transmission.accompagnement.hebergement || false;
        document.getElementById('form-accomp-autre').checked = transmission.accompagnement.autre || false;
      }
      
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
      // Réinitialiser les champs
      document.getElementById('form-type-transmission').value = '';
      document.getElementById('form-adresse').value = '';
      document.getElementById('form-ville').value = '';
      document.getElementById('form-signalement').value = '';
      document.getElementById('form-transmission').value = '';
      
      document.querySelectorAll('#modal-ajout input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('form-modal-transmission').dataset.editId;
    }
    
    document.getElementById('form-modal-transmission').dataset.personId = baseTransmission.personId || id;
    
    // Replier la section Informations Personnelles
    const infoPersoGrid = document.getElementById('grid-info-perso');
    const infoPersoToggle = document.querySelector('#section-info-perso .collapse-toggle');
    if (infoPersoGrid && infoPersoToggle) {
      infoPersoGrid.classList.add('collapsed');
      infoPersoToggle.classList.add('collapsed');
    }
    
    const modal = document.getElementById('modal-ajout');
    modal.classList.add('show');
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors du chargement des données');
  }
}

/**
 * Supprime une personne et toutes ses transmissions
 */
async function deletePersonCard(personId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses transmissions ?')) {
    try {
      const allTransmissions = await getAllTransmissions();
      const personTransmissions = allTransmissions.filter(t => 
        (t.personId || t.id) === personId
      );
      
      for (const transmission of personTransmissions) {
        await deleteTransmission(transmission.id);
      }
      
      // Recharger l'affichage (fonction dans affichage_page/code.js)
      if (typeof loadAndDisplayCards === 'function') {
        await loadAndDisplayCards();
      }
      
      console.log('✅ Personne et ses transmissions supprimées');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }
}

/**
 * Initialise le formulaire des transmissions
 */
function initTransmissionsForm() {
  const formTransmission = document.getElementById('form-modal-transmission');
  const modal = document.getElementById('modal-ajout');
  const btnAjouter = document.getElementById('btn-ajouter');
  const btnAnnuler = document.getElementById('btn-annuler');
  const btnClose = modal?.querySelector('.modal-close');
  
  if (!formTransmission || !modal) {
    console.warn('⚠️  Éléments du formulaire Transmissions non trouvés');
    return;
  }
  
  // Ouvrir la modal
  btnAjouter?.addEventListener('click', () => {
    modal.classList.add('show');
    formTransmission.reset();
    delete formTransmission.dataset.editId;
    delete formTransmission.dataset.personId;
    
    // Déplier la section Informations Personnelles
    const infoPersoGrid = document.getElementById('grid-info-perso');
    const infoPersoToggle = document.querySelector('#section-info-perso .collapse-toggle');
    if (infoPersoGrid && infoPersoToggle) {
      infoPersoGrid.classList.remove('collapsed');
      infoPersoToggle.classList.remove('collapsed');
    }
  });
  
  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    formTransmission.reset();
    delete formTransmission.dataset.editId;
    delete formTransmission.dataset.personId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  btnClose?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Toggle section Informations Personnelles
  const sectionHeader = document.querySelector('#section-info-perso .section-header');
  if (sectionHeader) {
    sectionHeader.addEventListener('click', function() {
      const toggle = this.querySelector('.collapse-toggle');
      const grid = this.nextElementSibling;
      
      if (grid && toggle) {
        grid.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
      }
    });
  }
  
  // Soumettre le formulaire
  formTransmission.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = formTransmission.dataset.editId;
    const personId = formTransmission.dataset.personId;
    
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
      orly: {
        premierContact: document.getElementById('form-premier-contact').checked,
        personnePresente: document.getElementById('form-personne-presente').checked,
        pnt: document.getElementById('form-pnt').checked,
        maraude: document.getElementById('form-maraude').checked,
        veille: document.getElementById('form-veille').checked,
        refusContact: document.getElementById('form-refus-contact').checked
      },
      accompagnement: {
        ecoute: document.getElementById('form-accomp-ecoute').checked,
        orientation: document.getElementById('form-accomp-orientation').checked,
        admin: document.getElementById('form-accomp-admin').checked,
        medical: document.getElementById('form-accomp-medical').checked,
        hebergement: document.getElementById('form-accomp-hebergement').checked,
        autre: document.getElementById('form-accomp-autre').checked
      },
      distribution: {
        alimentaire: document.getElementById('form-distrib-alimentaire').checked,
        vestimentaire: document.getElementById('form-distrib-vestimentaire').checked,
        hygiene: document.getElementById('form-distrib-hygiene').checked,
        couvertures: document.getElementById('form-distrib-couvertures').checked,
        duvet: document.getElementById('form-distrib-duvet').checked,
        autre: document.getElementById('form-distrib-autre').checked
      },
      transmission: document.getElementById('form-transmission').value
    };
    
    try {
      if (personId) {
        formData.personId = parseInt(personId);
      }
      
      if (editId) {
        formData.id = parseInt(editId);
        formData.dateTransmission = document.getElementById('transmissions-date').value;
        await updateTransmission(formData);
        delete formTransmission.dataset.editId;
      } else {
        formData.dateTransmission = document.getElementById('transmissions-date')?.value || new Date().toISOString().split('T')[0];
        
        const id = await addTransmission(formData);
        
        if (!personId) {
          formData.id = id;
          formData.personId = id;
          await updateTransmission(formData);
        }
      }
      
      // Recharger l'affichage
      if (typeof loadAndDisplayCards === 'function') {
        await loadAndDisplayCards();
      }
      
      closeModal();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  });
  
  console.log('✅ Formulaire Transmissions initialisé');
}

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function ouvrirFormulaire(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function remplirChamp(page, champ, valeur) {
  const champMap = {
    'Nom': '#form-nom',
    'Prénom': '#form-prenom'
  };
  await page.fill(champMap[champ], valeur);
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
}

async function verifierModaleFermee(page) {
  return await page.isHidden('#modal-ajout');
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findTransmissionByPersonAndDate,
    editTransmission,
    deletePersonCard,
    initTransmissionsForm,
    ouvrirFormulaire,
    remplirChamp,
    enregistrer,
    verifierModaleFermee
  };
} else {
  // Rendre les fonctions disponibles globalement dans le navigateur
  window.findTransmissionByPersonAndDate = findTransmissionByPersonAndDate;
  window.editTransmission = editTransmission;
  window.deletePersonCard = deletePersonCard;
  window.initTransmissionsForm = initTransmissionsForm;
}
