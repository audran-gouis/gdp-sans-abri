/**
 * Code métier ADP - Ajout personne complète
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS D'AFFICHAGE ADP (APPLICATION) ====================

/**
 * Formate une date
 */
function formatDateAdp(dateString) {
  if (!dateString) return 'Non spécifiée';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Regroupe les transmissions ADP par personne
 */
function groupTransmissionsByPersonAdp(transmissions) {
  const personsMap = new Map();
  
  transmissions.forEach(transmission => {
    const personId = transmission.personId || transmission.id;
    
    if (!personsMap.has(personId)) {
      personsMap.set(personId, {
        personId: personId,
        nom: transmission.nom,
        prenom: transmission.prenom,
        dateNaissance: transmission.dateNaissance,
        descriptionPhysique: transmission.descriptionPhysique,
        inconnu: transmission.inconnu,
        departementOrigine: transmission.departementOrigine,
        typologie: transmission.typologie,
        nbPersonnes: transmission.nbPersonnes,
        mineurs: transmission.mineurs,
        transmissions: []
      });
    }
    
    personsMap.get(personId).transmissions.push(transmission);
  });
  
  return Array.from(personsMap.values());
}

/**
 * Crée une carte HTML pour une personne ADP
 */
function createPersonCardAdp(person, selectedDate, handlers) {
  const card = document.createElement('div');
  card.className = 'transmission-card';
  card.dataset.personId = person.personId;
  
  const transmissionForDate = person.transmissions.find(t => 
    t.dateTransmission === selectedDate
  );
  
  const transmissionsCount = person.transmissions.length;
  const displayData = transmissionForDate || person;
  
  const displayName = displayData.inconnu ? 
    'Inconnu' : 
    `${displayData.prenom || ''} ${displayData.nom || ''}`.trim() || 'Inconnu';
  
  let transmissionContent = '';
  if (transmissionForDate) {
    let badges = '';
    if (transmissionForDate.pointAccueil) {
      badges += '<span class="badge">Point Accueil</span>';
    }
    if (transmissionForDate.orly) {
      if (transmissionForDate.orly.premierContact) badges += '<span class="badge">1er contact</span>';
    }
    
    transmissionContent = `
      ${transmissionForDate.typeTransmission ? `
        <div class="card-info">
          <span class="card-label">Transmission :</span>
          <span class="card-value">${transmissionForDate.typeTransmission}</span>
        </div>
      ` : ''}
      ${transmissionForDate.ville ? `
        <div class="card-info">
          <span class="card-label">Ville :</span>
          <span class="card-value">${transmissionForDate.ville}</span>
        </div>
      ` : ''}
      ${badges ? `<div class="card-badges">${badges}</div>` : ''}
    `;
  } else if (person.transmissions && person.transmissions.length > 0) {
    const lastTransmission = person.transmissions[person.transmissions.length - 1];
    let badges = '';
    if (lastTransmission.pointAccueil) {
      badges += '<span class="badge">Point Accueil</span>';
    }
    if (lastTransmission.orly && lastTransmission.orly.premierContact) {
      badges += '<span class="badge">1er contact</span>';
    }
    
    transmissionContent = `
      ${lastTransmission.typeTransmission ? `
        <div class="card-info">
          <span class="card-label">Transmission :</span>
          <span class="card-value">${lastTransmission.typeTransmission}</span>
        </div>
      ` : ''}
      ${lastTransmission.ville ? `
        <div class="card-info">
          <span class="card-label">Ville :</span>
          <span class="card-value">${lastTransmission.ville}</span>
        </div>
      ` : ''}
      ${badges ? `<div class="card-badges">${badges}</div>` : ''}
    `;
  }
  
  // Indicateur si pas de transmission pour ce jour
  const noTransmissionToday = !transmissionForDate;
  
  card.innerHTML = `
    <div class="card-header">
      <h3>${displayName}</h3>
      <span class="transmissions-count">${transmissionsCount} transmission${transmissionsCount > 1 ? 's' : ''}</span>
    </div>
    ${noTransmissionToday ? `
      <div class="no-transmission-badge" style="background: #fff3cd; color: #856404; padding: 0.5rem 1rem; margin: 0.5rem 1rem; border-radius: 4px; font-weight: 600; text-align: center; border: 1px solid #ffc107;">
        ⚠️ Pas de passage ce jour
      </div>
    ` : ''}
    <div class="card-body">
      ${displayData.dateNaissance && !displayData.inconnu ? `
        <div class="card-info">
          <span class="card-label">Date de naissance :</span>
          <span class="card-value">${formatDateAdp(displayData.dateNaissance)}</span>
        </div>
      ` : ''}
      ${displayData.descriptionPhysique ? `
        <div class="card-info">
          <span class="card-label">Description :</span>
          <span class="card-value">${displayData.descriptionPhysique}</span>
        </div>
      ` : ''}
      ${displayData.departementOrigine ? `
        <div class="card-info">
          <span class="card-label">Département :</span>
          <span class="card-value">${displayData.departementOrigine}</span>
        </div>
      ` : ''}
      ${transmissionContent}
    </div>
    <div class="card-actions">
      <button class="btn-card btn-edit" data-person-id="${person.personId}">Compléter</button>
      <button class="btn-card btn-delete" data-person-id="${person.personId}">Supprimer</button>
    </div>
  `;
  
  if (handlers) {
    const btnEdit = card.querySelector('.btn-edit');
    const btnDelete = card.querySelector('.btn-delete');
    
    if (btnEdit && handlers.onEdit) {
      btnEdit.addEventListener('click', () => handlers.onEdit(person.transmissions[0].id));
    }
    
    if (btnDelete && handlers.onDelete) {
      btnDelete.addEventListener('click', () => handlers.onDelete(person.personId));
    }
  }
  
  return card;
}

/**
 * Affiche les cartes ADP dans un conteneur
 */
function displayCardsAdp(persons, selectedDate, containerId, handlers) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('Conteneur #' + containerId + ' introuvable');
    return;
  }
  
  if (persons.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>Aucune personne ADP enregistrée</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  persons.forEach(person => {
    const card = createPersonCardAdp(person, selectedDate, handlers);
    container.appendChild(card);
  });
}

// ==================== CHARGEMENT ET AFFICHAGE ====================

/**
 * Charge les transmissions ADP depuis IndexedDB et les affiche
 */
async function loadAndDisplayCardsAdp() {
  try {
    const selectedDate = document.getElementById('adp-date')?.value || new Date().toISOString().split('T')[0];
    
    const transmissions = await window.getAllTransmissionsAdp();
    console.log(transmissions.length + ' transmission(s) ADP chargée(s)');
    
    const persons = groupTransmissionsByPersonAdp(transmissions);
    
    displayCardsAdp(persons, selectedDate, 'adp-list', {
      onEdit: editTransmissionAdp,
      onDelete: deletePersonCardAdp
    });
    
    console.log(persons.length + ' personne(s) ADP affichée(s)');
  } catch (error) {
    console.error('Erreur lors du chargement des cartes ADP:', error);
  }
}

/**
 * Fonction pour éditer une transmission ADP
 */
async function editTransmissionAdp(id) {
  console.log('Compléter la transmission ADP pour ID:', id, 'type:', typeof id);
  
  try {
    const allTransmissions = await window.getAllTransmissionsAdp();
    console.log('Transmissions ADP trouvées:', allTransmissions.length);
    
    // Comparaison robuste (convertir en string pour éviter les problèmes de type)
    const baseTransmission = allTransmissions.find(t => String(t.id) === String(id));
    
    if (!baseTransmission) {
      console.error('Transmission ADP non trouvée');
      alert('Erreur lors du chargement des données');
      return;
    }
    
    const modal = document.getElementById('modal-adp');
    const formAdp = document.getElementById('form-adp');
    
    if (!modal || !formAdp) {
      console.error('Modal ADP non trouvée');
      return;
    }
    
    // Remplir le formulaire avec les données existantes
    document.getElementById('adp-form-nom').value = baseTransmission.nom || '';
    document.getElementById('adp-form-prenom').value = baseTransmission.prenom || '';
    document.getElementById('adp-form-ddn').value = baseTransmission.dateNaissance || '';
    document.getElementById('adp-form-description').value = baseTransmission.descriptionPhysique || '';
    document.getElementById('adp-form-inconnu').checked = baseTransmission.inconnu || false;
    document.getElementById('adp-form-departement').value = baseTransmission.departementOrigine || '';
    document.getElementById('adp-form-typologie').value = baseTransmission.typologie || '';
    document.getElementById('adp-form-nb-personnes').value = baseTransmission.nbPersonnes || '';
    document.getElementById('adp-form-mineurs').value = baseTransmission.mineurs || '';
    document.getElementById('adp-form-type-transmission').value = baseTransmission.typeTransmission || '';
    document.getElementById('adp-form-point-accueil').checked = baseTransmission.pointAccueil || false;
    document.getElementById('adp-form-adresse').value = baseTransmission.adresse || '';
    document.getElementById('adp-form-ville').value = baseTransmission.ville || '';
    document.getElementById('adp-form-signalement').value = baseTransmission.signalement || '';
    document.getElementById('adp-form-transmission').value = baseTransmission.transmission || '';
    
    // Remplir les checkboxes Orly
    if (baseTransmission.orly) {
      const orlyFields = ['premier-contact', 'personne-presente', 'pnt', 'maraude', 'veille', 'refus-contact'];
      orlyFields.forEach(field => {
        const el = document.getElementById('adp-form-' + field);
        if (el) el.checked = baseTransmission.orly[field.replace(/-/g, '')] || false;
      });
    }
    
    // Remplir les checkboxes Accompagnement
    if (baseTransmission.accompagnement) {
      const accompFields = ['ecoute', 'orientation', 'admin', 'medical', 'hebergement', 'autre'];
      accompFields.forEach(field => {
        const el = document.getElementById('adp-form-accomp-' + field);
        if (el) el.checked = baseTransmission.accompagnement[field] || false;
      });
    }
    
    // Remplir les checkboxes Distribution
    if (baseTransmission.distribution) {
      const distribFields = ['alimentaire', 'vestimentaire', 'hygiene', 'couvertures', 'duvet', 'autre'];
      distribFields.forEach(field => {
        const el = document.getElementById('adp-form-distrib-' + field);
        if (el) el.checked = baseTransmission.distribution[field] || false;
      });
    }
    
    // Stocker l'ID pour la mise à jour
    formAdp.dataset.editId = baseTransmission.id;
    formAdp.dataset.personId = baseTransmission.personId || baseTransmission.id;
    
    // Ouvrir le modal
    modal.classList.add('show');
    
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    alert('Erreur lors du chargement des données');
  }
}

/**
 * Fonction pour supprimer une carte personne ADP
 */
async function deletePersonCardAdp(personId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) {
    try {
      const transmissions = await window.getAllTransmissionsAdp();
      const personTransmissions = transmissions.filter(t => 
        (t.personId || t.id) === personId
      );
      
      for (const transmission of personTransmissions) {
        await window.deleteTransmissionAdp(transmission.id);
      }
      
      await loadAndDisplayCardsAdp();
      console.log('Personne ADP supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }
}

// ==================== INITIALISATION FORMULAIRE ADP ====================

/**
 * Initialise le formulaire ADP
 */
function initAdpForm() {
  const btnAjouter = document.getElementById('adp-btn-ajouter');
  const modal = document.getElementById('modal-adp');
  const formAdp = document.getElementById('form-adp');
  const btnAnnuler = document.getElementById('adp-btn-annuler');
  const modalClose = document.querySelector('.adp-modal-close');
  
  if (!btnAjouter || !modal || !formAdp) {
    console.warn('Éléments ADP non trouvés');
    return;
  }
  
  btnAjouter.addEventListener('click', () => {
    modal.classList.add('show');
    formAdp.reset();
    delete formAdp.dataset.editId;
    delete formAdp.dataset.personId;
  });
  
  const closeModal = () => {
    modal.classList.remove('show');
    formAdp.reset();
    delete formAdp.dataset.editId;
    delete formAdp.dataset.personId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  formAdp.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      nom: document.getElementById('adp-form-nom').value,
      prenom: document.getElementById('adp-form-prenom').value,
      dateNaissance: document.getElementById('adp-form-ddn').value,
      descriptionPhysique: document.getElementById('adp-form-description').value,
      inconnu: document.getElementById('adp-form-inconnu').checked,
      departementOrigine: document.getElementById('adp-form-departement').value,
      typologie: document.getElementById('adp-form-typologie').value,
      nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
      mineurs: document.getElementById('adp-form-mineurs').value,
      typeTransmission: document.getElementById('adp-form-type-transmission').value,
      pointAccueil: document.getElementById('adp-form-point-accueil').checked,
      adresse: document.getElementById('adp-form-adresse').value,
      ville: document.getElementById('adp-form-ville').value,
      signalement: document.getElementById('adp-form-signalement').value,
      dateTransmission: document.getElementById('adp-date').value,
      transmission: document.getElementById('adp-form-transmission').value,
      orly: {
        premierContact: document.getElementById('adp-form-premier-contact').checked,
        personnePresente: document.getElementById('adp-form-personne-presente')?.checked || false,
        pnt: document.getElementById('adp-form-pnt')?.checked || false,
        maraude: document.getElementById('adp-form-maraude')?.checked || false,
        veille: document.getElementById('adp-form-veille')?.checked || false,
        refusContact: document.getElementById('adp-form-refus-contact')?.checked || false
      },
      accompagnement: {
        ecoute: document.getElementById('adp-form-accomp-ecoute')?.checked || false,
        orientation: document.getElementById('adp-form-accomp-orientation')?.checked || false,
        admin: document.getElementById('adp-form-accomp-admin')?.checked || false,
        medical: document.getElementById('adp-form-accomp-medical')?.checked || false,
        hebergement: document.getElementById('adp-form-accomp-hebergement')?.checked || false,
        autre: document.getElementById('adp-form-accomp-autre')?.checked || false
      },
      distribution: {
        alimentaire: document.getElementById('adp-form-distrib-alimentaire')?.checked || false,
        vestimentaire: document.getElementById('adp-form-distrib-vestimentaire')?.checked || false,
        hygiene: document.getElementById('adp-form-distrib-hygiene')?.checked || false,
        couvertures: document.getElementById('adp-form-distrib-couvertures')?.checked || false,
        duvet: document.getElementById('adp-form-distrib-duvet')?.checked || false,
        autre: document.getElementById('adp-form-distrib-autre')?.checked || false
      }
    };
    
    try {
      const editId = formAdp.dataset.editId;
      const personId = formAdp.dataset.personId;
      
      if (editId) {
        // Mode édition : mettre à jour
        formData.id = parseInt(editId);
        formData.personId = personId ? parseInt(personId) : parseInt(editId);
        await window.updateTransmissionAdp(formData);
        console.log('Personne ADP mise à jour');
      } else {
        // Mode ajout : créer
        const id = await window.addTransmissionAdp(formData);
        // Mettre à jour avec le personId
        formData.id = id;
        formData.personId = id;
        await window.updateTransmissionAdp(formData);
        console.log('Personne ADP enregistrée');
      }
      
      closeModal();
      await loadAndDisplayCardsAdp();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement ADP:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  });
  
  console.log('Formulaire ADP initialisé');
}

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function naviguerVersOnglet(page, onglet) {
  const ongletMap = { 'Transmissions Quotidiennes': 'transmissions', 'ADP': 'adp', 'Statistiques': 'statistiques' };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible' });
}

async function ouvrirFormulaire(page) {
  await page.click('#adp-btn-ajouter');
  await page.waitForSelector('#modal-adp', { state: 'visible' });
}

async function remplirChamp(page, champ, valeur) {
  const champMap = {
    'Nom': '#adp-form-nom',
    'Prénom': '#adp-form-prenom'
  };
  await page.fill(champMap[champ], valeur);
}

async function enregistrer(page) {
  await page.click('#modal-adp button[type="submit"]');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-adp', { state: 'hidden' });
}

async function verifierCarteApparue(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#adp-list > *');
  return cartes.length > 0;
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    formatDateAdp,
    groupTransmissionsByPersonAdp,
    createPersonCardAdp,
    displayCardsAdp,
    loadAndDisplayCardsAdp,
    editTransmissionAdp,
    deletePersonCardAdp,
    initAdpForm,
    naviguerVersOnglet, 
    ouvrirFormulaire, 
    remplirChamp, 
    enregistrer, 
    verifierCarteApparue 
  };
} else {
  window.formatDateAdp = formatDateAdp;
  window.groupTransmissionsByPersonAdp = groupTransmissionsByPersonAdp;
  window.createPersonCardAdp = createPersonCardAdp;
  window.displayCardsAdp = displayCardsAdp;
  window.loadAndDisplayCardsAdp = loadAndDisplayCardsAdp;
  window.editTransmissionAdp = editTransmissionAdp;
  window.deletePersonCardAdp = deletePersonCardAdp;
  window.initAdpForm = initAdpForm;
}
