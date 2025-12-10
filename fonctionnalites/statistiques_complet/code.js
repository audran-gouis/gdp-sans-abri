/**
 * Code métier - Statistiques
 * Gestion des filtres et affichage des statistiques
 * Utilise la BASE DE DONNÉES UNIFIÉE
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
  
  console.log('Module Statistiques initialisé (Base Unifiée)');
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
  console.log('=== APPLICATION DES FILTRES (BASE UNIFIÉE) ===');
  
  try {
    // Récupérer la source de données
    const source = document.getElementById('stats-source')?.value || 'all';
    console.log('Source sélectionnée:', source);
    
    // S'assurer que la base de données est initialisée
    if (typeof window.initDatabaseUnified === 'function') {
      await window.initDatabaseUnified();
    } else {
      throw new Error('Base de données unifiée non disponible');
    }
    
    // Charger toutes les personnes
    const personnes = await window.getAllPersonnes();
    console.log('📋 Personnes chargées:', personnes.length);
    
    // Charger toutes les interventions
    let interventions = await window.getAllInterventions();
    console.log('📋 Interventions chargées:', interventions.length);
    
    // Filtrer les interventions par source si nécessaire
    if (source !== 'all') {
      const sourceMap = {
        'transmissions': 'transmissions',
        'adp': 'adp',
        'pointAccueil': 'pointAccueil'
      };
      interventions = interventions.filter(i => i.type === sourceMap[source]);
      console.log(`📋 Interventions filtrées par source ${source}:`, interventions.length);
    }
    
    // Filtrer les interventions par période
    interventions = filterByPeriod(interventions);
    console.log('📋 Après filtre période:', interventions.length);
    
    // Créer un Map des personnes par ID
    const personnesMap = new Map();
    personnes.forEach(p => personnesMap.set(p.id, p));
    
    // Enrichir les interventions avec les infos des personnes
    const interventionsEnrichies = interventions.map(intervention => {
      const personne = personnesMap.get(intervention.personneId);
      return {
        ...intervention,
        personne: personne || {}
      };
    }).filter(i => i.personne.id); // Ne garder que celles avec une personne valide
    
    console.log('📋 Interventions enrichies:', interventionsEnrichies.length);
    
    // Appliquer les filtres détaillés
    const interventionsFiltrees = applyDetailedFilters(interventionsEnrichies);
    console.log('📋 Après filtres détaillés:', interventionsFiltrees.length);
    
    // Stocker les données filtrées pour affichage des cartes
    window.filteredStatsData = interventionsFiltrees;
    
    // Calculer et afficher les statistiques
    displayStatistics(interventionsFiltrees, source);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des filtres:', error);
    document.getElementById('stats-content').innerHTML = '<p style="color: red;">Erreur lors du chargement des données.</p>';
  }
}

/**
 * Filtre les données par période
 */
function filterByPeriod(interventions) {
  const periodType = document.getElementById('stats-period-type')?.value || 'day';
  
  return interventions.filter(intervention => {
    const itemDate = intervention.date;
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
function applyDetailedFilters(interventions) {
  let filtered = interventions;
  
  // === FILTRES INFORMATIONS PERSONNELLES ===
  
  // Filtre par nom
  const filterNom = document.getElementById('stats-filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(item => item.personne?.nom?.toLowerCase().includes(filterNom));
  }
  
  // Filtre par prénom
  const filterPrenom = document.getElementById('stats-filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(item => item.personne?.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  // Filtre par date de naissance
  const filterDdn = document.getElementById('stats-filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(item => item.personne?.dateNaissance === filterDdn);
  }
  
  // Filtre par description physique
  const filterDescription = document.getElementById('stats-filter-description')?.value?.toLowerCase();
  if (filterDescription) {
    filtered = filtered.filter(item => item.personne?.descriptionPhysique?.toLowerCase().includes(filterDescription));
  }
  
  // Filtre inconnu (select: tous/connus/inconnus)
  const filterInconnu = document.getElementById('stats-filter-inconnu')?.value;
  if (filterInconnu === 'connus') {
    filtered = filtered.filter(item => item.personne?.inconnu === false || !item.personne?.inconnu);
  } else if (filterInconnu === 'inconnus') {
    filtered = filtered.filter(item => item.personne?.inconnu === true);
  }
  // Si filterInconnu est vide ou "tous", on ne filtre pas
  
  // === FILTRES SITUATION ===
  
  // Filtre par département
  const filterDepartement = document.getElementById('stats-filter-departement')?.value;
  if (filterDepartement) {
    filtered = filtered.filter(item => item.personne?.departement?.includes(filterDepartement));
  }
  
  // Filtre par typologie
  const filterTypologie = document.getElementById('stats-filter-typologie')?.value;
  if (filterTypologie) {
    filtered = filtered.filter(item => item.personne?.typologie === filterTypologie);
  }
  
  // Filtre par nombre de personnes
  const filterNbPersonnes = document.getElementById('stats-filter-nb-personnes')?.value;
  if (filterNbPersonnes) {
    filtered = filtered.filter(item => item.personne?.nbPersonnes === filterNbPersonnes);
  }
  
  // Filtre par nombre de mineurs
  const filterMineurs = document.getElementById('stats-filter-mineurs')?.value;
  if (filterMineurs) {
    filtered = filtered.filter(item => item.personne?.mineurs === filterMineurs);
  }
  
  // === FILTRES DONNÉES DE TRANSMISSION ===
  
  // Filtre par type de transmission
  const filterTypeTransmission = document.getElementById('stats-filter-type-transmission')?.value;
  if (filterTypeTransmission) {
    filtered = filtered.filter(item => item.typeTransmission === filterTypeTransmission);
  }
  
  // Filtre par adresse
  const filterAdresse = document.getElementById('stats-filter-adresse')?.value?.toLowerCase();
  if (filterAdresse) {
    filtered = filtered.filter(item => item.adresse?.toLowerCase().includes(filterAdresse));
  }
  
  // Filtre par ville
  const filterVille = document.getElementById('stats-filter-ville')?.value?.toLowerCase();
  if (filterVille) {
    filtered = filtered.filter(item => item.ville?.toLowerCase().includes(filterVille));
  }
  
  // Filtre par signalement
  const filterSignalement = document.getElementById('stats-filter-signalement')?.value;
  if (filterSignalement) {
    filtered = filtered.filter(item => item.signalement === filterSignalement);
  }
  
  // === FILTRES TYPE D'INTERVENTION (Select Multiple) ===
  const typeInterventionSelect = document.getElementById('stats-filter-type-intervention');
  if (typeInterventionSelect) {
    const selectedValues = Array.from(typeInterventionSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.orly) return false;
        // Mapper les valeurs du select aux champs de la base de données
        const mapping = {
          'premier-contact': 'premierContact',
          'personne-presente': 'personnePresente',
          'pnt': 'pnt',
          'maraude': 'maraude',
          'veille': 'veille',
          'refus-contact': 'refusContact'
        };
        // Vérifier si au moins un des types sélectionnés est vrai
        return selectedValues.some(value => item.orly[mapping[value]] === true);
      });
    }
  }
  
  // === FILTRES ACCOMPAGNEMENT (Select Multiple) ===
  const accompagnementSelect = document.getElementById('stats-filter-accompagnement');
  if (accompagnementSelect) {
    const selectedValues = Array.from(accompagnementSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.accompagnement) return false;
        // Vérifier si au moins un des accompagnements sélectionnés est vrai
        return selectedValues.some(value => item.accompagnement[value] === true);
      });
    }
  }
  
  // === FILTRES DISTRIBUTION (Select Multiple) ===
  const distributionSelect = document.getElementById('stats-filter-distribution');
  if (distributionSelect) {
    const selectedValues = Array.from(distributionSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.distribution) return false;
        // Vérifier si au moins une des distributions sélectionnées est vraie
        return selectedValues.some(value => item.distribution[value] === true);
      });
    }
  }
  
  return filtered;
}

/**
 * Affiche les statistiques calculées
 */
function displayStatistics(interventions, source) {
  const container = document.getElementById('stats-content');
  if (!container) return;
  
  // Regrouper par personne DISTINCTE
  const uniquePersonsMap = new Map();
  interventions.forEach(intervention => {
    const personneId = intervention.personneId;
    
    if (!uniquePersonsMap.has(personneId)) {
      uniquePersonsMap.set(personneId, {
        personne: intervention.personne,
        interventions: [intervention],
        _passages: 1,
        _dates: [intervention.date],
        _types: new Set([intervention.type]),
        _typesParDate: new Map([[intervention.date, new Set([intervention.type])]])
      });
    } else {
      const existing = uniquePersonsMap.get(personneId);
      existing.interventions.push(intervention);
      
      // Compter les passages : max 1 par type par date
      if (!existing._typesParDate.has(intervention.date)) {
        existing._typesParDate.set(intervention.date, new Set([intervention.type]));
      } else {
        existing._typesParDate.get(intervention.date).add(intervention.type);
      }
      
      if (!existing._dates.includes(intervention.date)) {
        existing._dates.push(intervention.date);
      }
      existing._types.add(intervention.type);
    }
  });
  
  // Calculer le nombre total de passages (max 1 par type par date par personne)
  let totalPassages = 0;
  uniquePersonsMap.forEach(entry => {
    entry._typesParDate.forEach(typesSet => {
      totalPassages += typesSet.size; // Nombre de types différents pour cette date
    });
  });
  
  // Stocker les personnes distinctes pour l'affichage des cartes
  window.filteredStatsPersons = Array.from(uniquePersonsMap.values());
  
  const totalPersonnesDistinctes = uniquePersonsMap.size;
  
  // Compter le nombre total de personnes et mineurs basé sur personnes DISTINCTES
  let totalNbPersonnes = 0;
  let totalMineurs = 0;
  
  uniquePersonsMap.forEach(entry => {
    const personne = entry.personne;
    let nbStr = String(personne.nbPersonnes || '1').replace('+', '');
    const nbPersonnes = parseInt(nbStr) || 1;
    totalNbPersonnes += nbPersonnes;
    
    let minStr = String(personne.mineurs || '0').replace('+', '');
    const mineurs = parseInt(minStr) || 0;
    totalMineurs += mineurs;
  });
  
  // Compter les types d'intervention
  let premierContact = 0, personnePresente = 0, pnt = 0, maraude = 0, veille = 0, refusContact = 0;
  
  interventions.forEach(item => {
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
  interventions.forEach(item => {
    if (item.accompagnement) {
      Object.keys(accompStats).forEach(key => {
        if (item.accompagnement[key]) accompStats[key]++;
      });
    }
  });
  
  // Compter les distributions
  let distribStats = { alimentaire: 0, vestimentaire: 0, hygiene: 0, couvertures: 0, duvet: 0, autre: 0 };
  interventions.forEach(item => {
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
  
  uniquePersonsMap.forEach(entry => {
    const personne = entry.personne;
    const typo = personne.typologie || 'non-renseigne';
    let nbStr = String(personne.nbPersonnes || '1').replace('+', '');
    const nbPersonnes = parseInt(nbStr) || 1;
    typologieStats[typo] = (typologieStats[typo] || 0) + nbPersonnes;
  });
  
  const sourceLabel = source === 'all' ? 'Toutes sources' : 
                      source === 'transmissions' ? 'Transmissions' : 
                      source === 'adp' ? 'ADP' : 'Point Accueil';
  
  // Compter par source (personnes distinctes)
  const transmissionsPersons = Array.from(uniquePersonsMap.values()).filter(entry => entry._types.has('transmissions'));
  const adpPersons = Array.from(uniquePersonsMap.values()).filter(entry => entry._types.has('adp'));
  const paPersons = Array.from(uniquePersonsMap.values()).filter(entry => entry._types.has('pointAccueil'));
  
  const detailBySource = source === 'all' ? `
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
        <div>Transmissions: <strong>${transmissionsPersons.length}</strong> personne(s)</div>
        <div>ADP: <strong>${adpPersons.length}</strong> personne(s)</div>
        <div>Point Accueil: <strong>${paPersons.length}</strong> personne(s)</div>
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
      <div class="stats-summary" style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
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
        <div class="stats-card" style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #dc2626; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: #dc2626;">Typologie de ménages</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${typologieHtml}
          </ul>
        </div>
        
        <div class="stats-card" style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #2563eb; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: #2563eb;">Type d'intervention</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>1er contact: <strong>${premierContact}</strong></li>
            <li>Personne présente: <strong>${personnePresente}</strong></li>
            <li>PNT: <strong>${pnt}</strong></li>
            <li>Maraude: <strong>${maraude}</strong></li>
            <li>Veille: <strong>${veille}</strong></li>
            <li>Refus de contact: <strong>${refusContact}</strong></li>
          </ul>
        </div>
        
        <div class="stats-card" style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #059669; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: #059669;">Accompagnement</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>Écoute: <strong>${accompStats.ecoute}</strong></li>
            <li>Orientation: <strong>${accompStats.orientation}</strong></li>
            <li>Démarche admin: <strong>${accompStats.admin}</strong></li>
            <li>Médical: <strong>${accompStats.medical}</strong></li>
            <li>Hébergement: <strong>${accompStats.hebergement}</strong></li>
            <li>Autre: <strong>${accompStats.autre}</strong></li>
          </ul>
        </div>
        
        <div class="stats-card" style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #d97706; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: #b45309;">Distribution</h4>
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
  
  console.log('✅ Statistiques affichées: ' + totalPersonnesDistinctes + ' personnes distinctes, ' + totalPassages + ' passages');
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
  
  // Réinitialiser tous les champs texte
  const textFields = [
    'stats-filter-nom', 
    'stats-filter-prenom', 
    'stats-filter-ddn',
    'stats-filter-description',
    'stats-filter-departement',
    'stats-filter-adresse',
    'stats-filter-ville'
  ];
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  // Réinitialiser tous les selects
  const selectFields = [
    'stats-filter-inconnu',
    'stats-filter-typologie',
    'stats-filter-nb-personnes',
    'stats-filter-mineurs',
    'stats-filter-type-transmission',
    'stats-filter-signalement'
  ];
  selectFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  // Réinitialiser les selects multiples
  const multiSelectFields = [
    'stats-filter-type-intervention',
    'stats-filter-accompagnement',
    'stats-filter-distribution'
  ];
  multiSelectFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // Désélectionner toutes les options
      Array.from(el.options).forEach(option => option.selected = false);
    }
  });
  
  // Réinitialiser toutes les checkboxes (s'il en reste)
  document.querySelectorAll('.stats-filters-complete input[type="checkbox"]').forEach(cb => {
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
  persons.forEach(personEntry => {
    const personne = personEntry.personne;
    const card = document.createElement('div');
    card.className = 'transmission-card';
    
    // Badges pour les types d'intervention - Couleurs neutres
    let typeBadges = '';
    const typeMap = {
      'transmissions': { label: 'MD', color: '#2563eb', title: 'Maraudes Départementales' },
      'adp': { label: 'ADP', color: '#059669', title: 'ADP' },
      'pointAccueil': { label: 'PA', color: '#0891b2', title: 'Point Accueil' }
    };
    
    personEntry._types.forEach(type => {
      const info = typeMap[type];
      if (info) {
        typeBadges += `<span class="badge" style="background: ${info.color}; color: white;" title="${info.title}">${info.label}</span>`;
      }
    });
    
    // Nom affiché
    const displayName = personne.inconnu ? 'Inconnu' : 
      `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';
    
    // Nombre de passages (max 1 par type par date)
    let passages = 0;
    if (personEntry._typesParDate) {
      personEntry._typesParDate.forEach(typesSet => {
        passages += typesSet.size; // Nombre de types différents pour cette date
      });
    } else {
      passages = 1; // Fallback
    }
    const passagesLabel = passages > 1 ? `${passages} passages` : '1 passage';
    
    // Liste des dates de passage
    const datesHtml = personEntry._dates && personEntry._dates.length > 0 
      ? personEntry._dates.map(d => formatDateDisplay(d)).join(', ')
      : '';
    
    card.innerHTML = `
      <div class="card-header">
        <h3>${displayName}</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="badge" style="background: #dc3545; color: white;">${passagesLabel}</span>
          ${typeBadges}
        </div>
      </div>
      <div class="card-body">
        ${datesHtml ? `
          <div class="card-info">
            <span class="card-label">Date${personEntry._dates.length > 1 ? 's' : ''} :</span>
            <span class="card-value">${datesHtml}</span>
          </div>
        ` : ''}
        ${personne.dateNaissance && !personne.inconnu ? `
          <div class="card-info">
            <span class="card-label">Naissance :</span>
            <span class="card-value">${formatDateDisplay(personne.dateNaissance)}</span>
          </div>
        ` : ''}
        ${personne.typologie ? `
          <div class="card-info">
            <span class="card-label">Typologie :</span>
            <span class="card-value">${personne.typologie}</span>
          </div>
        ` : ''}
        ${personne.nbPersonnes ? `
          <div class="card-info">
            <span class="card-label">Nb personnes :</span>
            <span class="card-value">${personne.nbPersonnes}</span>
          </div>
        ` : ''}
        ${personne.mineurs ? `
          <div class="card-info">
            <span class="card-label">Dont mineurs :</span>
            <span class="card-value">${personne.mineurs}</span>
          </div>
        ` : ''}
        ${personne.descriptionPhysique ? `
          <div class="card-info">
            <span class="card-label">Description :</span>
            <span class="card-value">${personne.descriptionPhysique}</span>
          </div>
        ` : ''}
        ${personne.departement ? `
          <div class="card-info">
            <span class="card-label">Département :</span>
            <span class="card-value">${personne.departement}</span>
          </div>
        ` : ''}
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
