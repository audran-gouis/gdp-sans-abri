/**
 * Code métier - Statistiques
 * Gestion des filtres et affichage des statistiques
 */

/**
 * Initialise le module Statistiques
 */
function initStatistiques() {
  // Sélecteur de type de période
  const periodTypeSelect = document.getElementById('stats-period-type');
  if (periodTypeSelect) {
    periodTypeSelect.addEventListener('change', handlePeriodTypeChange);
  }
  
  // Bouton Appliquer
  const btnApply = document.getElementById('stats-apply-filter');
  if (btnApply) {
    btnApply.addEventListener('click', applyFilters);
  }
  
  // Bouton Réinitialiser
  const btnReset = document.getElementById('stats-reset-filters');
  if (btnReset) {
    btnReset.addEventListener('click', resetFilters);
  }
  
  // Bouton Afficher les cartes
  const btnShowCards = document.getElementById('stats-show-cards');
  if (btnShowCards) {
    btnShowCards.addEventListener('click', showFilteredCards);
  }
  
  // Bouton Masquer les cartes
  const btnHideCards = document.getElementById('stats-hide-cards');
  if (btnHideCards) {
    btnHideCards.addEventListener('click', hideCards);
  }
  
  // Initialiser les dates par défaut
  const today = new Date().toISOString().split('T')[0];
  const specificDay = document.getElementById('stats-specific-day');
  if (specificDay) specificDay.value = today;
  
  const dateStart = document.getElementById('stats-date-start');
  if (dateStart) dateStart.value = today;
  
  const dateEnd = document.getElementById('stats-date-end');
  if (dateEnd) dateEnd.value = today;
  
  console.log('Module Statistiques initialisé');
}

/**
 * Gère le changement de type de période
 */
function handlePeriodTypeChange() {
  const periodType = document.getElementById('stats-period-type').value;
  
  // Masquer tous les sélecteurs
  document.querySelectorAll('.stats-date-option').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  
  // Afficher le sélecteur approprié
  const selectorMap = {
    'day': 'stats-day-selector',
    'month': 'stats-month-selector',
    'year': 'stats-year-selector',
    'range': 'stats-range-selector'
  };
  
  const selector = document.getElementById(selectorMap[periodType]);
  if (selector) {
    selector.classList.add('active');
    selector.style.display = 'flex';
  }
}

/**
 * Applique les filtres et affiche les statistiques
 */
async function applyFilters() {
  console.log('=== APPLICATION DES FILTRES ===');
  
  try {
    // Récupérer la source de données
    const source = document.getElementById('stats-source')?.value || 'all';
    console.log('Source sélectionnée:', source);
    
    // S'assurer que les bases de données sont initialisées
    if (typeof window.initDB === 'function') {
      await window.initDB();
    }
    if (typeof window.initDBADP === 'function') {
      await window.initDBADP();
    }
    
    // Récupérer les données selon la source
    let transmissionsRaw = [];
    let adpDataRaw = [];
    
    if (source === 'all' || source === 'transmissions') {
      if (typeof window.getAllTransmissions === 'function') {
        transmissionsRaw = await window.getAllTransmissions();
        console.log('Transmissions brutes récupérées:', transmissionsRaw.length);
      }
    }
    
    if (source === 'all' || source === 'adp') {
      if (typeof window.getAllTransmissionsAdp === 'function') {
        adpDataRaw = await window.getAllTransmissionsAdp();
        console.log('ADP brutes récupérées:', adpDataRaw.length);
      }
    }
    
    // 1. D'ABORD filtrer par période
    let transmissionsFiltered = filterByPeriod(transmissionsRaw);
    let adpFiltered = filterByPeriod(adpDataRaw);
    
    console.log('Après filtre période - Transmissions:', transmissionsFiltered.length, 'ADP:', adpFiltered.length);
    
    // 2. ENSUITE dédoublonner : 1 seule entrée par personne par date par source
    // Marquer la source pour chaque entrée
    transmissionsFiltered = transmissionsFiltered.map(t => ({ ...t, _source: 'transmissions' }));
    adpFiltered = adpFiltered.map(t => ({ ...t, _source: 'adp' }));
    
    let transmissions = deduplicateByPersonDate(transmissionsFiltered);
    let adpData = deduplicateByPersonDate(adpFiltered);
    
    console.log('Après dédoublonnage - Transmissions:', transmissions.length, 'ADP:', adpData.length);
    
    // 3. Combiner les données
    let allData = [...transmissions, ...adpData];
    
    // 4. Appliquer les autres filtres détaillés
    allData = applyDetailedFilters(allData);
    
    console.log('Total après tous les filtres:', allData.length);
    
    // Stocker les données filtrées pour affichage des cartes
    window.filteredStatsData = allData;
    
    // Calculer et afficher les statistiques
    // Passer les comptages séparés
    displayStatistics(allData, source, transmissions.length, adpData.length);
    
  } catch (error) {
    console.error('Erreur lors de l\'application des filtres:', error);
    document.getElementById('stats-content').innerHTML = '<p style="color: red;">Erreur lors du chargement des données.</p>';
  }
}

/**
 * Dédoublonne les données : 1 seule entrée par personne par date
 * Une personne est identifiée par personId (ou id si pas de personId)
 */
function deduplicateByPersonDate(data) {
  const seen = new Map();
  
  data.forEach(item => {
    // Créer une clé unique pour la personne
    // Utiliser personId si disponible, sinon utiliser id
    const personKey = item.personId ? String(item.personId) : String(item.id);
    
    // Créer une clé unique personne + date
    const dateKey = item.dateTransmission || 'no-date';
    const uniqueKey = `${personKey}_${dateKey}`;
    
    // Ne garder que la première occurrence (évite les doublons)
    if (!seen.has(uniqueKey)) {
      seen.set(uniqueKey, item);
    }
  });
  
  return Array.from(seen.values());
}

/**
 * Filtre les données par période
 */
function filterByPeriod(data) {
  const periodType = document.getElementById('stats-period-type')?.value || 'day';
  
  return data.filter(item => {
    const itemDate = item.dateTransmission;
    if (!itemDate) return false;
    
    switch (periodType) {
      case 'day':
        const selectedDay = document.getElementById('stats-specific-day')?.value;
        return itemDate === selectedDay;
        
      case 'month':
        const selectedMonth = document.getElementById('stats-month')?.value;
        return itemDate && itemDate.startsWith(selectedMonth);
        
      case 'year':
        const selectedYear = document.getElementById('stats-year')?.value;
        return itemDate && itemDate.startsWith(selectedYear);
        
      case 'range':
        const startDate = document.getElementById('stats-date-start')?.value;
        const endDate = document.getElementById('stats-date-end')?.value;
        return itemDate >= startDate && itemDate <= endDate;
        
      default:
        return true;
    }
  });
}

/**
 * Applique les filtres détaillés
 */
function applyDetailedFilters(data) {
  let filtered = data;
  
  // Filtre par nom
  const filterNom = document.getElementById('stats-filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(item => item.nom?.toLowerCase().includes(filterNom));
  }
  
  // Filtre par prénom
  const filterPrenom = document.getElementById('stats-filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(item => item.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  // Filtre par ville
  const filterVille = document.getElementById('stats-filter-ville')?.value?.toLowerCase();
  if (filterVille) {
    filtered = filtered.filter(item => item.ville?.toLowerCase().includes(filterVille));
  }
  
  // Filtres checkboxes - Type d'intervention
  const interventionFilters = [
    { id: 'stats-filter-premier-contact', field: 'orly.premierContact' },
    { id: 'stats-filter-personne-presente', field: 'orly.personnePresente' },
    { id: 'stats-filter-pnt', field: 'orly.pnt' },
    { id: 'stats-filter-maraude', field: 'orly.maraude' },
    { id: 'stats-filter-veille', field: 'orly.veille' },
    { id: 'stats-filter-refus-contact', field: 'orly.refusContact' }
  ];
  
  interventionFilters.forEach(filter => {
    const checkbox = document.getElementById(filter.id);
    if (checkbox?.checked) {
      filtered = filtered.filter(item => {
        const [obj, prop] = filter.field.split('.');
        return item[obj]?.[prop] === true;
      });
    }
  });
  
  // Filtres checkboxes - Accompagnement
  const accompFilters = ['ecoute', 'orientation', 'admin', 'medical', 'hebergement', 'autre'];
  accompFilters.forEach(field => {
    const checkbox = document.getElementById('stats-filter-accomp-' + field);
    if (checkbox?.checked) {
      filtered = filtered.filter(item => item.accompagnement?.[field] === true);
    }
  });
  
  // Filtres checkboxes - Distribution
  const distribFilters = ['alimentaire', 'vestimentaire', 'hygiene', 'couvertures', 'duvet', 'autre'];
  distribFilters.forEach(field => {
    const checkbox = document.getElementById('stats-filter-distrib-' + field);
    if (checkbox?.checked) {
      filtered = filtered.filter(item => item.distribution?.[field] === true);
    }
  });
  
  return filtered;
}

/**
 * Affiche les statistiques calculées
 */
function displayStatistics(data, source, transmissionsCount = 0, adpCount = 0) {
  const container = document.getElementById('stats-content');
  if (!container) return;
  
  // Regrouper par personne DISTINCTE (source + personId)
  // Chaque personne a un compteur de passages (nombre de dates différentes)
  const uniquePersonsMap = new Map();
  data.forEach(d => {
    const personKey = d.personId ? String(d.personId) : String(d.id);
    const sourceKey = d._source || 'unknown';
    const fullKey = `${sourceKey}_${personKey}`;
    
    if (!uniquePersonsMap.has(fullKey)) {
      uniquePersonsMap.set(fullKey, {
        ...d,
        _passages: 1,
        _dates: [d.dateTransmission]
      });
    } else {
      const existing = uniquePersonsMap.get(fullKey);
      existing._passages++;
      if (d.dateTransmission && !existing._dates.includes(d.dateTransmission)) {
        existing._dates.push(d.dateTransmission);
      }
    }
  });
  
  // Stocker les personnes distinctes pour l'affichage des cartes
  window.filteredStatsPersons = Array.from(uniquePersonsMap.values());
  
  const totalPersonnesDistinctes = uniquePersonsMap.size;
  
  // Nombre de passages = nombre total de transmissions (1 par personne par date)
  const totalPassages = data.length;
  
  // Compter les types d'intervention
  let premierContact = 0, personnePresente = 0, pnt = 0, maraude = 0, veille = 0, refusContact = 0;
  
  data.forEach(item => {
    if (item.orly) {
      if (item.orly.premierContact) premierContact++;
      if (item.orly.personnePresente) personnePresente++;
      if (item.orly.pnt) pnt++;
      if (item.orly.maraude) maraude++;
      if (item.orly.veille) veille++;
      if (item.orly.refusContact) refusContact++;
    }
  });
  
  // Compter les accompagnements
  let accompStats = { ecoute: 0, orientation: 0, admin: 0, medical: 0, hebergement: 0, autre: 0 };
  data.forEach(item => {
    if (item.accompagnement) {
      Object.keys(accompStats).forEach(key => {
        if (item.accompagnement[key]) accompStats[key]++;
      });
    }
  });
  
  // Compter les distributions
  let distribStats = { alimentaire: 0, vestimentaire: 0, hygiene: 0, couvertures: 0, duvet: 0, autre: 0 };
  data.forEach(item => {
    if (item.distribution) {
      Object.keys(distribStats).forEach(key => {
        if (item.distribution[key]) distribStats[key]++;
      });
    }
  });
  
  // Compter par typologie de ménages basé sur les PERSONNES DISTINCTES
  const typologieStats = {};
  const typologieLabels = {
    'homme-seul': 'Homme seul',
    'femme-seule': 'Femme seule',
    'femme-seule-avec-enfants': 'Femme seule avec enfant(s)',
    'homme-seul-avec-enfants': 'Homme seul avec enfant(s)',
    'groupe-adultes-avec-enfants': 'Groupe adultes avec enfant(s)',
    'groupe-adultes-sans-enfant': 'Groupe adultes sans enfant'
  };
  
  // Compter le nombre total de personnes (nbPersonnes) et mineurs basé sur personnes DISTINCTES
  let totalNbPersonnes = 0;
  let totalMineurs = 0;
  
  uniquePersonsMap.forEach(person => {
    const typo = person.typologie || 'non-renseigne';
    // Compter le nombre de personnes pour cette typologie
    let nbStr = String(person.nbPersonnes || '1').replace('+', '');
    const nbPersonnes = parseInt(nbStr) || 1;
    typologieStats[typo] = (typologieStats[typo] || 0) + nbPersonnes;
    
    // Total personnes et mineurs
    let minStr = String(person.mineurs || '0').replace('+', '');
    const mineurs = parseInt(minStr) || 0;
    totalNbPersonnes += nbPersonnes;
    totalMineurs += mineurs;
  });
  
  const sourceLabel = source === 'all' ? 'Toutes sources' : source === 'transmissions' ? 'Transmissions' : 'ADP';
  
  // Compter par source (personnes distinctes)
  const transmissionsPersons = Array.from(uniquePersonsMap.values()).filter(d => d._source === 'transmissions');
  const adpPersons = Array.from(uniquePersonsMap.values()).filter(d => d._source === 'adp');
  
  const detailBySource = source === 'all' ? `
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
        <div>Transmissions: <strong>${transmissionsPersons.length}</strong> personne(s)</div>
        <div>ADP: <strong>${adpPersons.length}</strong> personne(s)</div>
      </div>
    </div>
  ` : '';
  
  // Générer la liste des typologies
  let typologieHtml = '';
  Object.keys(typologieLabels).forEach(key => {
    const count = typologieStats[key] || 0;
    if (count > 0) {
      typologieHtml += `<li>${typologieLabels[key]}: <strong>${count}</strong></li>`;
    }
  });
  if (typologieStats['non-renseigne']) {
    typologieHtml += `<li>Non renseigné: <strong>${typologieStats['non-renseigne']}</strong></li>`;
  }
  if (!typologieHtml) {
    typologieHtml = '<li>Aucune donnée</li>';
  }

  container.innerHTML = `
    <div class="stats-results" style="display: grid; gap: 1.5rem;">
      <div class="stats-summary" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px;">
        <h3 style="margin: 0 0 1rem 0;">Résumé (${sourceLabel})</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">${totalPersonnesDistinctes}</div>
            <div>Fiche${totalPersonnesDistinctes > 1 ? 's' : ''} distincte${totalPersonnesDistinctes > 1 ? 's' : ''}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">${totalNbPersonnes}</div>
            <div>Personne${totalNbPersonnes > 1 ? 's' : ''}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">${totalMineurs}</div>
            <div>Mineur${totalMineurs > 1 ? 's' : ''}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold;">${totalPassages}</div>
            <div>Passage${totalPassages > 1 ? 's' : ''}</div>
          </div>
        </div>
        ${detailBySource}
      </div>
      
      <div class="stats-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <div class="stats-card" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #e91e63;">
          <h4 style="margin: 0 0 0.5rem 0; color: #e91e63;">Typologie de ménages</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${typologieHtml}
          </ul>
        </div>
        
        <div class="stats-card" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #667eea;">
          <h4 style="margin: 0 0 0.5rem 0; color: #667eea;">Type d'intervention</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>1er contact: <strong>${premierContact}</strong></li>
            <li>Personne présente: <strong>${personnePresente}</strong></li>
            <li>PNT: <strong>${pnt}</strong></li>
            <li>Maraude: <strong>${maraude}</strong></li>
            <li>Veille: <strong>${veille}</strong></li>
            <li>Refus de contact: <strong>${refusContact}</strong></li>
          </ul>
        </div>
        
        <div class="stats-card" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #28a745;">
          <h4 style="margin: 0 0 0.5rem 0; color: #28a745;">Accompagnement</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>Écoute: <strong>${accompStats.ecoute}</strong></li>
            <li>Orientation: <strong>${accompStats.orientation}</strong></li>
            <li>Démarche admin: <strong>${accompStats.admin}</strong></li>
            <li>Médical: <strong>${accompStats.medical}</strong></li>
            <li>Hébergement: <strong>${accompStats.hebergement}</strong></li>
            <li>Autre: <strong>${accompStats.autre}</strong></li>
          </ul>
        </div>
        
        <div class="stats-card" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #ffc107;">
          <h4 style="margin: 0 0 0.5rem 0; color: #d39e00;">Distribution</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>Alimentaire: <strong>${distribStats.alimentaire}</strong></li>
            <li>Vestimentaire: <strong>${distribStats.vestimentaire}</strong></li>
            <li>Hygiène: <strong>${distribStats.hygiene}</strong></li>
            <li>Couvertures: <strong>${distribStats.couvertures}</strong></li>
            <li>Duvet: <strong>${distribStats.duvet}</strong></li>
            <li>Autre: <strong>${distribStats.autre}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  `;
  
  console.log('Statistiques affichées: ' + totalPersonnesDistinctes + ' personnes distinctes, ' + totalPassages + ' passages');
}

/**
 * Réinitialise tous les filtres
 */
function resetFilters() {
  // Réinitialiser le type de période
  const periodType = document.getElementById('stats-period-type');
  if (periodType) periodType.value = 'day';
  handlePeriodTypeChange();
  
  // Réinitialiser les dates
  const today = new Date().toISOString().split('T')[0];
  const dateFields = ['stats-specific-day', 'stats-date-start', 'stats-date-end'];
  dateFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });
  
  // Réinitialiser les champs texte
  const textFields = ['stats-filter-nom', 'stats-filter-prenom', 'stats-filter-ville', 'stats-filter-adresse'];
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  // Réinitialiser les checkboxes
  document.querySelectorAll('.stats-filters input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Réinitialiser l'affichage
  document.getElementById('stats-content').innerHTML = '<p>Sélectionnez une période et des filtres pour afficher les statistiques.</p>';
  
  // Masquer les cartes
  hideCards();
  
  console.log('Filtres réinitialisés');
}

/**
 * Affiche les cartes des personnes filtrées
 */
function showFilteredCards() {
  // Utiliser les personnes distinctes avec leur nombre de passages
  const persons = window.filteredStatsPersons || [];
  const container = document.getElementById('stats-cards-list');
  const section = document.getElementById('stats-cards-section');
  
  if (!container || !section) return;
  
  if (persons.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>Aucune donnée à afficher. Appliquez d'abord des filtres.</p>
      </div>
    `;
    section.style.display = 'block';
    return;
  }
  
  container.innerHTML = '';
  
  // Afficher chaque personne DISTINCTE avec son nombre de passages
  persons.forEach(person => {
    const card = document.createElement('div');
    card.className = 'transmission-card';
    
    // Badge source
    const sourceLabel = person._source === 'transmissions' ? 'Transmissions' : 'ADP';
    const sourceColor = person._source === 'transmissions' ? '#667eea' : '#28a745';
    
    // Nom affiché
    const displayName = person.inconnu ? 'Inconnu' : 
      `${person.prenom || ''} ${person.nom || ''}`.trim() || 'Non renseigné';
    
    // Nombre de passages
    const passages = person._passages || 1;
    const passagesLabel = passages > 1 ? `${passages} passages` : '1 passage';
    
    // Badges pour les interventions
    let badges = '';
    if (person.pointAccueil) badges += '<span class="badge">Point Accueil</span>';
    if (person.orly?.premierContact) badges += '<span class="badge">1er contact</span>';
    if (person.orly?.maraude) badges += '<span class="badge">Maraude</span>';
    if (person.orly?.veille) badges += '<span class="badge">Veille</span>';
    
    // Liste des dates de passage
    const datesHtml = person._dates && person._dates.length > 0 
      ? person._dates.map(d => formatDateDisplay(d)).join(', ')
      : '';
    
    card.innerHTML = `
      <div class="card-header">
        <h3>${displayName}</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="badge" style="background: #dc3545; color: white;">${passagesLabel}</span>
          <span class="badge" style="background: ${sourceColor}; color: white;">${sourceLabel}</span>
        </div>
      </div>
      <div class="card-body">
        ${datesHtml ? `
          <div class="card-info">
            <span class="card-label">Date${person._dates.length > 1 ? 's' : ''} :</span>
            <span class="card-value">${datesHtml}</span>
          </div>
        ` : ''}
        ${person.dateNaissance && !person.inconnu ? `
          <div class="card-info">
            <span class="card-label">Naissance :</span>
            <span class="card-value">${formatDateDisplay(person.dateNaissance)}</span>
          </div>
        ` : ''}
        ${person.typologie ? `
          <div class="card-info">
            <span class="card-label">Typologie :</span>
            <span class="card-value">${person.typologie}</span>
          </div>
        ` : ''}
        ${person.nbPersonnes ? `
          <div class="card-info">
            <span class="card-label">Nb personnes :</span>
            <span class="card-value">${person.nbPersonnes}</span>
          </div>
        ` : ''}
        ${person.mineurs ? `
          <div class="card-info">
            <span class="card-label">Dont mineurs :</span>
            <span class="card-value">${person.mineurs}</span>
          </div>
        ` : ''}
        ${person.descriptionPhysique ? `
          <div class="card-info">
            <span class="card-label">Description :</span>
            <span class="card-value">${person.descriptionPhysique}</span>
          </div>
        ` : ''}
        ${person.ville ? `
          <div class="card-info">
            <span class="card-label">Ville :</span>
            <span class="card-value">${person.ville}</span>
          </div>
        ` : ''}
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
  
  section.style.display = 'block';
  console.log('✅ ' + persons.length + ' personne(s) distincte(s) affichée(s)');
}

/**
 * Formate une date pour l'affichage
 */
function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

/**
 * Masque les cartes
 */
function hideCards() {
  const section = document.getElementById('stats-cards-section');
  if (section) section.style.display = 'none';
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initStatistiques,
    applyFilters,
    resetFilters,
    showFilteredCards,
    hideCards
  };
} else {
  window.initStatistiques = initStatistiques;
  window.applyFilters = applyFilters;
  window.resetFilters = resetFilters;
  window.showFilteredCards = showFilteredCards;
  window.hideCards = hideCards;
}


