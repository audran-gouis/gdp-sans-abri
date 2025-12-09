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
 * Applique les filtres ADP sur la liste des personnes
 */
function applyAdpFilters(persons) {
  let filtered = persons;
  
  // Filtre par nom
  const filterNom = document.getElementById('adp-filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(person => person.nom?.toLowerCase().includes(filterNom));
  }
  
  // Filtre par prénom
  const filterPrenom = document.getElementById('adp-filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(person => person.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  // Filtre par date de naissance
  const filterDdn = document.getElementById('adp-filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(person => person.dateNaissance === filterDdn);
  }
  
  // Filtre par inconnu
  const filterInconnu = document.getElementById('adp-filter-inconnu')?.checked;
  if (filterInconnu) {
    filtered = filtered.filter(person => person.inconnu === true);
  }
  
  // Filtre par description physique
  const filterDescription = document.getElementById('adp-filter-description')?.value?.toLowerCase();
  if (filterDescription) {
    filtered = filtered.filter(person => person.descriptionPhysique?.toLowerCase().includes(filterDescription));
  }
  
  return filtered;
}

/**
 * Initialise les écouteurs d'événements pour les filtres ADP
 */
function initAdpFilters() {
  const filterIds = ['adp-filter-nom', 'adp-filter-prenom', 'adp-filter-ddn', 'adp-filter-inconnu', 'adp-filter-description'];
  
  const rechargerFiches = () => {
    if (typeof window.afficherToutesLesPersonnesADP === 'function') {
      window.afficherToutesLesPersonnesADP();
    }
  };
  
  filterIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const eventType = element.type === 'checkbox' ? 'change' : 'input';
      element.addEventListener(eventType, rechargerFiches);
    }
  });
  
  console.log('Filtres ADP initialisés');
}

/**
 * Charge les transmissions ADP depuis IndexedDB et les affiche
 */
async function loadAndDisplayCardsAdp() {
  try {
    const selectedDate = document.getElementById('adp-date')?.value || new Date().toISOString().split('T')[0];
    
    const transmissions = await window.getAllTransmissionsAdp();
    console.log(transmissions.length + ' transmission(s) ADP chargée(s)');
    
    let persons = groupTransmissionsByPersonAdp(transmissions);
    
    // Appliquer les filtres
    persons = applyAdpFilters(persons);
    
    displayCardsAdp(persons, selectedDate, 'adp-list', {
      onEdit: editTransmissionAdp,
      onDelete: deletePersonCardAdp
    });
    
    console.log(persons.length + ' personne(s) ADP affichée(s) (après filtrage)');
  } catch (error) {
    console.error('Erreur lors du chargement des cartes ADP:', error);
  }
}

/**
 * Trouve une transmission ADP par personneId et date
 */
async function findTransmissionAdpByPersonAndDate(personneId, dateTransmission) {
  const allTransmissions = await window.getAllTransmissionsAdp();
  console.log('🔍 Recherche transmission ADP pour personneId:', personneId, 'date:', dateTransmission);
  const found = allTransmissions.find(t => 
    t.personneId === personneId && t.dateTransmission === dateTransmission
  );
  console.log('🔍 Transmission ADP trouvée:', found ? `ID ${found.id}` : 'Aucune');
  return found;
}

/**
 * Édite une transmission ADP pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB centrale
 */
async function editTransmissionAdp(personneId) {
  console.log('📝 Compléter la transmission ADP pour personne ID:', personneId);
  
  try {
    // Charger la personne depuis la DB centrale
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      alert('Erreur lors du chargement des données');
      return;
    }
    
    console.log('✅ Personne trouvée:', personne);
    const selectedDate = document.getElementById('adp-date')?.value;
    console.log('📅 Date sélectionnée:', selectedDate);
    
    // Chercher si une transmission ADP existe pour cette personne à cette date
    const existingTransmission = await findTransmissionAdpByPersonAndDate(personneId, selectedDate);
    
    console.log('📋 Transmission ADP existante:', existingTransmission ? `ID ${existingTransmission.id}` : 'Aucune');
    
    const modal = document.getElementById('modal-adp');
    const formAdp = document.getElementById('form-adp');
    
    if (!modal || !formAdp) {
      console.error('Modal ADP non trouvée');
      return;
    }
    
    // Remplir le formulaire avec les infos de la personne
    document.getElementById('adp-form-nom').value = personne.nom || '';
    document.getElementById('adp-form-prenom').value = personne.prenom || '';
    document.getElementById('adp-form-ddn').value = personne.dateNaissance || '';
    document.getElementById('adp-form-description').value = personne.descriptionPhysique || '';
    document.getElementById('adp-form-inconnu').checked = personne.inconnu || false;
    document.getElementById('adp-form-departement').value = personne.departement || '';
    document.getElementById('adp-form-typologie').value = personne.typologie || '';
    document.getElementById('adp-form-nb-personnes').value = personne.nbPersonnes || '';
    document.getElementById('adp-form-mineurs').value = personne.mineurs || '';
    
    if (existingTransmission) {
      // MODE ÉDITION : charger toutes les données de la transmission
      console.log('✅ Transmission existante pour cette date - MODE ÉDITION');
      document.getElementById('adp-form-type-transmission').value = existingTransmission.typeTransmission || '';
      document.getElementById('adp-form-point-accueil').checked = existingTransmission.pointAccueil || false;
      document.getElementById('adp-form-adresse').value = existingTransmission.adresse || '';
      document.getElementById('adp-form-ville').value = existingTransmission.ville || '';
      document.getElementById('adp-form-signalement').value = existingTransmission.signalement || '';
      document.getElementById('adp-form-transmission').value = existingTransmission.transmission || '';
      
      // Remplir les checkboxes Orly
      if (existingTransmission.orly) {
        const orlyFields = ['premiercontact', 'personnepresente', 'pnt', 'maraude', 'veille', 'refuscontact'];
        orlyFields.forEach(field => {
          const el = document.getElementById(`adp-form-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
          if (el) el.checked = existingTransmission.orly[field] || false;
        });
      }
      
      // Remplir les checkboxes Accompagnement
      if (existingTransmission.accompagnement) {
        const accompFields = ['ecoute', 'orientation', 'admin', 'medical', 'hebergement', 'autre'];
        accompFields.forEach(field => {
          const el = document.getElementById('adp-form-accomp-' + field);
          if (el) el.checked = existingTransmission.accompagnement[field] || false;
        });
      }
      
      // Remplir les checkboxes Distribution
      if (existingTransmission.distribution) {
        const distribFields = ['alimentaire', 'vestimentaire', 'hygiene', 'couvertures', 'duvet', 'autre'];
        distribFields.forEach(field => {
          const el = document.getElementById('adp-form-distrib-' + field);
          if (el) el.checked = existingTransmission.distribution[field] || false;
        });
      }
      
      formAdp.dataset.editId = existingTransmission.id;
      console.log('🔖 editId défini à:', existingTransmission.id);
    } else {
      // MODE CRÉATION : réinitialiser les champs de transmission
      console.log('➕ Pas de transmission pour cette date - MODE CRÉATION');
      document.getElementById('adp-form-type-transmission').value = '';
      document.getElementById('adp-form-point-accueil').checked = false;
      document.getElementById('adp-form-adresse').value = '';
      document.getElementById('adp-form-ville').value = '';
      document.getElementById('adp-form-signalement').value = '';
      document.getElementById('adp-form-transmission').value = '';
      
      // Décocher toutes les checkboxes sauf inconnu
      document.querySelectorAll('#modal-adp input[type="checkbox"]:not(#adp-form-inconnu)').forEach(cb => cb.checked = false);
      
      delete formAdp.dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle transmission');
    }
    
    formAdp.dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
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
    
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        await window.afficherToutesLesPersonnesADP();
      }
      console.log('Personne ADP supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }
}

// ==================== INITIALISATION FORMULAIRE ADP ====================

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
    
    // Initialiser la date par défaut (date du jour ou veille si avant 3h)
    const dateFields = ['adp-form-date-transmission'];
    dateFields.forEach(fieldId => {
      const dateInput = document.getElementById(fieldId);
      if (dateInput) {
        dateInput.value = getDateParDefaut();
        console.log('Date ADP initialisée à:', dateInput.value);
      }
    });
    
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
  
  // Initialiser l'auto-complétion de la typologie
  if (typeof window.initTypologieAutoComplete === 'function') {
    window.initTypologieAutoComplete('adp-form-typologie', 'adp-form-nb-personnes', 'adp-form-mineurs');
    console.log('✅ Auto-complétion typologie initialisée pour ADP');
  }
  
  formAdp.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = formAdp.dataset.editId;
    const personneId = formAdp.dataset.personneId;
    const selectedDate = document.getElementById('adp-date')?.value || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire ADP - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    // Données de la personne
    const personneData = {
      nom: document.getElementById('adp-form-nom').value,
      prenom: document.getElementById('adp-form-prenom').value,
      dateNaissance: document.getElementById('adp-form-ddn').value,
      descriptionPhysique: document.getElementById('adp-form-description').value,
      inconnu: document.getElementById('adp-form-inconnu').checked,
      departement: document.getElementById('adp-form-departement').value,
      typologie: document.getElementById('adp-form-typologie').value,
      nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
      mineurs: document.getElementById('adp-form-mineurs').value
    };
    
    // Données de la transmission ADP
    const transmissionData = {
      typeTransmission: document.getElementById('adp-form-type-transmission').value,
      pointAccueil: document.getElementById('adp-form-point-accueil').checked,
      adresse: document.getElementById('adp-form-adresse').value,
      ville: document.getElementById('adp-form-ville').value,
      signalement: document.getElementById('adp-form-signalement').value,
      dateTransmission: selectedDate,
      transmission: document.getElementById('adp-form-transmission').value,
      orly: {
        premierContact: document.getElementById('adp-form-premier-contact')?.checked || false,
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
        // Mise à jour de la transmission ADP existante
        console.log('🔄 Mise à jour transmission ADP existante ID:', editId);
        transmissionData.id = parseInt(editId);
        await window.updateTransmissionAdp(transmissionData);
        console.log('✅ Transmission ADP mise à jour');
      } else {
        // Nouvelle transmission ADP
        console.log('➕ Création nouvelle transmission ADP pour personne ID:', finalPersonneId);
        await window.addTransmissionAdp(transmissionData);
        console.log('✅ Nouvelle transmission ADP ajoutée');
      }
      
      closeModal();
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        await window.afficherToutesLesPersonnesADP();
      }
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
    findTransmissionAdpByPersonAndDate,
    editTransmissionAdp,
    deletePersonCardAdp,
    initAdpForm,
    initAdpFilters,
    applyAdpFilters,
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
  window.findTransmissionAdpByPersonAndDate = findTransmissionAdpByPersonAndDate;
  window.editTransmissionAdp = editTransmissionAdp;
  window.deletePersonCardAdp = deletePersonCardAdp;
  window.initAdpForm = initAdpForm;
  window.initAdpFilters = initAdpFilters;
  window.applyAdpFilters = applyAdpFilters;
}
