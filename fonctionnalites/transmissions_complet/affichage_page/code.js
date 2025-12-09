/**
 * Code métier pour l'affichage de la page transmissions
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS D'AFFICHAGE (APPLICATION) ====================

/**
 * Formate une date
 */
function formatDate(dateString) {
  if (!dateString) return 'Non spécifiée';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Regroupe les transmissions par personne
 */
function groupTransmissionsByPerson(transmissions) {
  const personsMap = new Map();
  
  transmissions.forEach(transmission => {
    const personId = transmission.personId || transmission.id;
    
    if (!personsMap.has(personId)) {
      personsMap.set(personId, {
        personId: personId,
        nom: transmission.nom,
        prenom: transmission.prenom,
        dateNaissance: transmission.dateNaissance,
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
 * Crée une carte HTML pour une personne
 */
function createPersonCard(person, selectedDate, handlers) {
  const card = document.createElement('div');
  card.className = 'transmission-card';
  card.dataset.personId = person.personId;
  
  const transmissionForDate = person.transmissions.find(t => 
    t.dateTransmission === selectedDate
  );
  
  const transmissionsCount = person.transmissions.length;
  const displayData = transmissionForDate || person;
  
  let transmissionContent = '';
  if (transmissionForDate) {
    let badges = '';
    if (transmissionForDate.orly) {
      if (transmissionForDate.orly.premierContact) badges += '<span class="badge">1er contact</span>';
      if (transmissionForDate.orly.personnePresente) badges += '<span class="badge">Personne présente</span>';
      if (transmissionForDate.orly.pnt) badges += '<span class="badge">PNT</span>';
      if (transmissionForDate.orly.maraude) badges += '<span class="badge secondary">Maraude</span>';
      if (transmissionForDate.orly.veille) badges += '<span class="badge secondary">Veille</span>';
      if (transmissionForDate.orly.refusContact) badges += '<span class="badge secondary">Refus de contact</span>';
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
      ${transmissionForDate.adresse ? `
        <div class="card-info">
          <span class="card-label">Adresse :</span>
          <span class="card-value">${transmissionForDate.adresse}</span>
        </div>
      ` : ''}
      ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      ${transmissionForDate.transmission ? `
        <div class="card-info">
          <span class="card-label">Contenu :</span>
          <span class="card-value">${transmissionForDate.transmission}</span>
        </div>
      ` : ''}
    `;
  }
  
  // Indicateur si pas de transmission pour ce jour
  const noTransmissionToday = !transmissionForDate;
  
  card.innerHTML = `
    <div class="card-header">
      <h3>${displayData.prenom || ''} ${displayData.nom || 'Inconnu'}</h3>
      <span class="transmissions-count">${transmissionsCount} transmission${transmissionsCount > 1 ? 's' : ''}</span>
    </div>
    ${noTransmissionToday ? `
      <div class="no-transmission-badge" style="background: #fff3cd; color: #856404; padding: 0.5rem 1rem; margin: 0.5rem 1rem; border-radius: 4px; font-weight: 600; text-align: center; border: 1px solid #ffc107;">
        ⚠️ Pas de passage ce jour
      </div>
    ` : ''}
    <div class="card-body">
      ${displayData.dateNaissance ? `
        <div class="card-info">
          <span class="card-label">Date de naissance :</span>
          <span class="card-value">${formatDate(displayData.dateNaissance)}</span>
        </div>
      ` : ''}
      ${displayData.typologie ? `
        <div class="card-info">
          <span class="card-label">Typologie :</span>
          <span class="card-value">${displayData.typologie}</span>
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
 * Affiche les cartes dans un conteneur
 */
function displayCards(persons, selectedDate, containerId, handlers) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('Conteneur #' + containerId + ' introuvable');
    return;
  }
  
  if (persons.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>Aucune transmission enregistrée</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  persons.forEach(person => {
    const card = createPersonCard(person, selectedDate, handlers);
    container.appendChild(card);
  });
}

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function naviguerVersOnglet(page, onglet) {
  const ongletMap = { 
    'Transmissions Quotidiennes': 'transmissions', 
    'ADP': 'adp', 
    'Statistiques': 'statistiques' 
  };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible' });
}

async function selecteurDateVisible(page) {
  return await page.isVisible('#transmissions-date');
}

async function filtresRechercheVisible(page) {
  const nomVisible = await page.isVisible('#filter-nom');
  const prenomVisible = await page.isVisible('#filter-prenom');
  const ddnVisible = await page.isVisible('#filter-ddn');
  return { nomVisible, prenomVisible, ddnVisible };
}

async function boutonVisible(page, texte) {
  const button = await page.locator(`button:has-text("${texte}")`).first();
  return await button.isVisible();
}

async function listeTransmissionsVisible(page) {
  return await page.isVisible('#transmissions-list');
}

/**
 * Charge et affiche les cartes avec filtres
 */
async function loadAndDisplayCards() {
  try {
    const getAllTransmissionsFn = window.getAllTransmissions || getAllTransmissions;
    const transmissions = await getAllTransmissionsFn();
    const selectedDate = document.getElementById('transmissions-date')?.value || new Date().toISOString().split('T')[0];
    
    const filterNom = document.getElementById('filter-nom')?.value.toLowerCase() || '';
    const filterPrenom = document.getElementById('filter-prenom')?.value.toLowerCase() || '';
    const filterDdn = document.getElementById('filter-ddn')?.value || '';
    
    let filteredTransmissions = transmissions;
    
    if (filterNom) {
      filteredTransmissions = filteredTransmissions.filter(t => 
        t.nom && t.nom.toLowerCase().includes(filterNom)
      );
    }
    
    if (filterPrenom) {
      filteredTransmissions = filteredTransmissions.filter(t => 
        t.prenom && t.prenom.toLowerCase().includes(filterPrenom)
      );
    }
    
    if (filterDdn) {
      filteredTransmissions = filteredTransmissions.filter(t => 
        t.dateNaissance === filterDdn
      );
    }
    
    const persons = groupTransmissionsByPerson(filteredTransmissions);
    
    const handlers = {
      onEdit: window.editTransmission || function() {},
      onDelete: window.deletePersonCard || function() {}
    };
    
    displayCards(persons, selectedDate, 'transmissions-list', handlers);
  } catch (error) {
    console.error('Erreur lors du chargement des transmissions:', error);
  }
}

/**
 * Initialise les sélecteurs de date et filtres
 */
function initDateSelectors() {
  const dateInput = document.getElementById('transmissions-date');
  if (dateInput) {
    const today = new Date();
    const currentHour = today.getHours();
    
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    dateInput.value = today.toISOString().split('T')[0];
    
    // Utiliser la nouvelle fonction d'affichage centralisée
    const rechargerFiches = () => {
      if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
        window.afficherToutesLesPersonnesTransmissions();
      }
    };
    
    dateInput.addEventListener('change', rechargerFiches);
    
    document.getElementById('filter-nom')?.addEventListener('input', rechargerFiches);
    document.getElementById('filter-prenom')?.addEventListener('input', rechargerFiches);
    document.getElementById('filter-ddn')?.addEventListener('change', rechargerFiches);
  }
  
  console.log('Sélecteurs de date initialisés');
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    groupTransmissionsByPerson,
    createPersonCard,
    displayCards,
    loadAndDisplayCards,
    initDateSelectors,
    naviguerVersOnglet,
    selecteurDateVisible,
    filtresRechercheVisible,
    boutonVisible,
    listeTransmissionsVisible
  };
} else {
  window.formatDate = formatDate;
  window.groupTransmissionsByPerson = groupTransmissionsByPerson;
  window.createPersonCard = createPersonCard;
  window.displayCards = displayCards;
  window.loadAndDisplayCards = loadAndDisplayCards;
  window.initDateSelectors = initDateSelectors;
}
