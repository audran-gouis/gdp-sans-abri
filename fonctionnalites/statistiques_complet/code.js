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

// Variable globale pour stocker la date de fin de la plage
let currentDateFin = null;

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
    
    // Récupérer la date de fin de la plage pour l'historisation
    const dateFin = getDateFinPlage();
    currentDateFin = dateFin; // Stocker globalement pour utilisation dans showFilteredCards
    console.log('📅 Date de fin de la plage:', dateFin);
    
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
    const interventionsFiltrees = applyDetailedFilters(interventionsEnrichies, dateFin);
    console.log('📋 Après filtres détaillés:', interventionsFiltrees.length);
    
    // Stocker les données filtrées pour affichage des cartes
    window.filteredStatsData = interventionsFiltrees;
    
    // Calculer et afficher les statistiques
    displayStatistics(interventionsFiltrees, source, dateFin);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des filtres:', error);
    document.getElementById('stats-content').innerHTML = '<p style="color: red;">Erreur lors du chargement des données.</p>';
  }
}

/**
 * Récupère la date de fin de la plage sélectionnée
 */
function getDateFinPlage() {
  const periodType = document.getElementById('stats-period-type')?.value || 'day';
  
  if (periodType === 'day') {
    return document.getElementById('stats-date')?.value || new Date().toISOString().split('T')[0];
  } else if (periodType === 'range') {
    return document.getElementById('stats-end-date')?.value || new Date().toISOString().split('T')[0];
  } else if (periodType === 'month') {
    const monthValue = document.getElementById('stats-month')?.value;
    if (monthValue) {
      const [year, month] = monthValue.split('-');
      const lastDay = new Date(year, month, 0).getDate();
      return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    }
  }
  return new Date().toISOString().split('T')[0];
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
function applyDetailedFilters(interventions, dateFin) {
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
  
  // Filtre Attention (checkbox)
  const filterAttention = document.getElementById('stats-filter-attention')?.checked;
  if (filterAttention) {
    console.log('🔍 Filtre Attention activé - items avant:', filtered.length);
    filtered = filtered.filter(item => {
      // Vérifier le champ attention de l'intervention
      const hasAttention = item.attention === true;
      return hasAttention;
    });
    console.log('🔍 Filtre Attention - items après:', filtered.length);
  }
  
  // === FILTRES SITUATION ===
  
  // Filtre par département (Select Multiple)
  const filterDepartementSelect = document.getElementById('stats-filter-departement');
  if (filterDepartementSelect) {
    const selectedValues = Array.from(filterDepartementSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        const infos = window.getInfosALaDate ? window.getInfosALaDate(item.personne, dateFin) : item.personne;
        return selectedValues.includes(infos?.departement || item.personne?.departement);
      });
    }
  }
  
  // Filtre par typologie (Select Multiple)
  const filterTypologieSelect = document.getElementById('stats-filter-typologie');
  if (filterTypologieSelect) {
    const selectedValues = Array.from(filterTypologieSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        const infos = window.getInfosALaDate ? window.getInfosALaDate(item.personne, dateFin) : item.personne;
        return selectedValues.includes(infos?.typologie || item.personne?.typologie);
      });
    }
  }
  
  // Filtre par nombre de personnes (Select Multiple)
  const filterNbPersonnesSelect = document.getElementById('stats-filter-nb-personnes');
  if (filterNbPersonnesSelect) {
    const selectedValues = Array.from(filterNbPersonnesSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        const infos = window.getInfosALaDate ? window.getInfosALaDate(item.personne, dateFin) : item.personne;
        return selectedValues.includes(infos?.nbPersonnes || item.personne?.nbPersonnes);
      });
    }
  }
  
  // Filtre par nombre de mineurs (Select Multiple)
  const filterMineursSelect = document.getElementById('stats-filter-mineurs');
  if (filterMineursSelect) {
    const selectedValues = Array.from(filterMineursSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => {
        const infos = window.getInfosALaDate ? window.getInfosALaDate(item.personne, dateFin) : item.personne;
        return selectedValues.includes(infos?.mineurs || item.personne?.mineurs);
      });
    }
  }
  
  // === FILTRES DONNÉES DE TRANSMISSION ===
  
  // Filtre par type de transmission (Select Multiple)
  const filterTypeTransmissionSelect = document.getElementById('stats-filter-type-transmission');
  if (filterTypeTransmissionSelect) {
    const selectedValues = Array.from(filterTypeTransmissionSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => selectedValues.includes(item.typeTransmission));
    }
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
  
  // Filtre par signalement (Select Multiple)
  const filterSignalementSelect = document.getElementById('stats-filter-signalement');
  if (filterSignalementSelect) {
    const selectedValues = Array.from(filterSignalementSelect.selectedOptions).map(opt => opt.value);
    if (selectedValues.length > 0) {
      filtered = filtered.filter(item => selectedValues.includes(item.signalement));
    }
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
function displayStatistics(interventions, source, dateFin) {
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
        _types: new Set([intervention.type])
      });
    } else {
      const existing = uniquePersonsMap.get(personneId);
      existing.interventions.push(intervention);
      existing._passages++;
      
      if (!existing._dates.includes(intervention.date)) {
        existing._dates.push(intervention.date);
      }
      existing._types.add(intervention.type);
    }
  });
  
  // Le nombre total de passages = nombre total d'interventions
  // Chaque transmission (Jour, Nuit, Coordo) compte comme un passage distinct
  const totalPassages = interventions.length;
  
  // Stocker les personnes distinctes pour l'affichage des cartes
  window.filteredStatsPersons = Array.from(uniquePersonsMap.values());
  
  const totalPersonnesDistinctes = uniquePersonsMap.size;
  
  // Compter le nombre total de personnes et mineurs basé sur personnes DISTINCTES
  let totalNbPersonnes = 0;
  let totalMineurs = 0;
  
  uniquePersonsMap.forEach(entry => {
    const personne = entry.personne;
    
    // Utiliser les informations à la date de fin de la plage
    const infosALaDate = window.getInfosALaDate ? window.getInfosALaDate(personne, dateFin) : {
      nbPersonnes: personne.nbPersonnes || '1',
      mineurs: personne.mineurs || '0',
      typologie: personne.typologie || '',
      departement: personne.departement || ''
    };
    
    let nbStr = String(infosALaDate.nbPersonnes || '1').replace('+', '');
    const nbPersonnes = parseInt(nbStr) || 1;
    totalNbPersonnes += nbPersonnes;
    
    let minStr = String(infosALaDate.mineurs || '0').replace('+', '');
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
  let accompStats = { hygiene: 0, accueilJour: 0, admin: 0, hebergement: 0, medical: 0, autre: 0 };
  interventions.forEach(item => {
    if (item.accompagnement) {
      Object.keys(accompStats).forEach(key => {
        if (item.accompagnement[key]) accompStats[key]++;
      });
      // Compatibilité avec anciennes données
      if (item.accompagnement.ecoute) accompStats.hygiene++;
      if (item.accompagnement.orientation) accompStats.accueilJour++;
    }
  });
  
  // Compter les distributions
  let distribStats = { boisson: 0, alimentaire: 0, duvet: 0, couvertureSurvie: 0, bonnetsGants: 0, sousVetements: 0, kitsHygiene: 0, autre: 0 };
  interventions.forEach(item => {
    if (item.distribution) {
      Object.keys(distribStats).forEach(key => {
        if (item.distribution[key]) distribStats[key]++;
      });
      // Compatibilité avec anciennes données
      if (item.distribution.vestimentaire) distribStats.bonnetsGants++;
      if (item.distribution.hygiene) distribStats.kitsHygiene++;
      if (item.distribution.couvertures) distribStats.couvertureSurvie++;
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
    
    // Utiliser les informations à la date de fin de la plage
    const infosALaDate = window.getInfosALaDate ? window.getInfosALaDate(personne, dateFin) : {
      nbPersonnes: personne.nbPersonnes || '1',
      typologie: personne.typologie || 'non-renseigne'
    };
    
    const typo = infosALaDate.typologie || 'non-renseigne';
    let nbStr = String(infosALaDate.nbPersonnes || '1').replace('+', '');
    const nbPersonnes = parseInt(nbStr) || 1;
    typologieStats[typo] = (typologieStats[typo] || 0) + nbPersonnes;
  });
  
  // Compter les familles avec enfants (ménages et personnes)
  const typologiesAvecEnfants = [
    'femme-seule-avec-enfants',
    'homme-seul-avec-enfants',
    'groupe-adultes-avec-enfants'
  ];
  
  let nbMenagesAvecEnfants = 0;
  let nbPersonnesAvecEnfants = 0;
  
  uniquePersonsMap.forEach(entry => {
    const personne = entry.personne;
    
    // Utiliser les informations à la date de fin de la plage
    const infosALaDate = window.getInfosALaDate ? window.getInfosALaDate(personne, dateFin) : {
      nbPersonnes: personne.nbPersonnes || '1',
      typologie: personne.typologie || 'non-renseigne'
    };
    
    const typo = infosALaDate.typologie || 'non-renseigne';
    
    if (typologiesAvecEnfants.includes(typo)) {
      nbMenagesAvecEnfants++;
      let nbStr = String(infosALaDate.nbPersonnes || '1').replace('+', '');
      const nbPersonnes = parseInt(nbStr) || 1;
      nbPersonnesAvecEnfants += nbPersonnes;
    }
  });
  
  // Compter les signalements (ménages et personnes)
  let nbMenagesSignalement115 = 0;
  let nbPersonnesSignalement115 = 0;
  let nbMenagesSignalementPartenaires = 0;
  let nbPersonnesSignalementPartenaires = 0;
  
  uniquePersonsMap.forEach(entry => {
    const personne = entry.personne;
    // Vérifier si au moins une intervention a un signalement
    const hasSignalement115 = entry.interventions.some(interv => interv.signalement === '115');
    const hasSignalementPartenaires = entry.interventions.some(interv => interv.signalement === 'partenaires');
    
    if (hasSignalement115) {
      nbMenagesSignalement115++;
      let nbStr = String(personne.nbPersonnes || '1').replace('+', '');
      const nbPersonnes = parseInt(nbStr) || 1;
      nbPersonnesSignalement115 += nbPersonnes;
    }
    
    if (hasSignalementPartenaires) {
      nbMenagesSignalementPartenaires++;
      let nbStr = String(personne.nbPersonnes || '1').replace('+', '');
      const nbPersonnes = parseInt(nbStr) || 1;
      nbPersonnesSignalementPartenaires += nbPersonnes;
    }
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
            <div>Ménage${totalPersonnesDistinctes > 1 ? 's' : ''}</div>
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
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
          <div style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.9;">Dont famille${nbMenagesAvecEnfants > 1 ? 's' : ''} avec enfant${nbMenagesAvecEnfants > 1 ? 's' : ''}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold;">${nbMenagesAvecEnfants}</div>
              <div style="font-size: 0.85rem;">Ménage${nbMenagesAvecEnfants > 1 ? 's' : ''}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold;">${nbPersonnesAvecEnfants}</div>
              <div style="font-size: 0.85rem;">Personne${nbPersonnesAvecEnfants > 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
          <div style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.9;">Dont Signalement 115</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold;">${nbMenagesSignalement115}</div>
              <div style="font-size: 0.85rem;">Ménage${nbMenagesSignalement115 > 1 ? 's' : ''}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold;">${nbPersonnesSignalement115}</div>
              <div style="font-size: 0.85rem;">Personne${nbPersonnesSignalement115 > 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
          <div style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.9;">Dont Signalement Partenaires</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold;">${nbMenagesSignalementPartenaires}</div>
              <div style="font-size: 0.85rem;">Ménage${nbMenagesSignalementPartenaires > 1 ? 's' : ''}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: bold;">${nbPersonnesSignalementPartenaires}</div>
              <div style="font-size: 0.85rem;">Personne${nbPersonnesSignalementPartenaires > 1 ? 's' : ''}</div>
            </div>
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
            <li>Hygiène: <strong>${accompStats.hygiene}</strong></li>
            <li>Accueil de jour: <strong>${accompStats.accueilJour}</strong></li>
            <li>Administratif: <strong>${accompStats.admin}</strong></li>
            <li>Hébergement (CHU + LHSS): <strong>${accompStats.hebergement}</strong></li>
            <li>Médical: <strong>${accompStats.medical}</strong></li>
            <li>Autre: <strong>${accompStats.autre}</strong></li>
          </ul>
        </div>
        
        <div class="stats-card" style="background: white; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #d97706; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <h4 style="margin: 0 0 0.5rem 0; color: #b45309;">Distribution</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>Boisson (Eau, Café, Thé): <strong>${distribStats.boisson}</strong></li>
            <li>Alimentaire: <strong>${distribStats.alimentaire}</strong></li>
            <li>Duvets: <strong>${distribStats.duvet}</strong></li>
            <li>Couverture de survie: <strong>${distribStats.couvertureSurvie}</strong></li>
            <li>Bonnets/Gants/Tour de Cou: <strong>${distribStats.bonnetsGants}</strong></li>
            <li>Sous-vêtements: <strong>${distribStats.sousVetements}</strong></li>
            <li>Kits d'hygiène: <strong>${distribStats.kitsHygiene}</strong></li>
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
    'stats-filter-adresse',
    'stats-filter-ville'
  ];
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  // Réinitialiser tous les selects simples (ceux qui restent en single)
  const selectFields = [
    'stats-filter-inconnu'
  ];
  selectFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  
  // Réinitialiser la checkbox Attention
  const checkboxAttention = document.getElementById('stats-filter-attention');
  if (checkboxAttention) checkboxAttention.checked = false;
  
  // Réinitialiser les selects multiples
  const multiSelectFields = [
    'stats-filter-departement',
    'stats-filter-typologie',
    'stats-filter-nb-personnes',
    'stats-filter-mineurs',
    'stats-filter-type-transmission',
    'stats-filter-signalement',
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
    
    // Vérifier si la personne a l'option Attention cochée
    const hasAttention = personEntry.interventions.some(intervention => intervention.attention === true);
    card.className = hasAttention ? 'transmission-card has-attention' : 'transmission-card';
    
    // Badge Attention
    const badgeAttention = hasAttention ? '<span class="badge badge-attention" title="Attention requise">⚠️ ATTENTION</span>' : '';
    
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
    
    // Nombre de passages (chaque intervention compte comme un passage)
    const passages = personEntry._passages || 1;
    const passagesLabel = passages > 1 ? `${passages} passages` : '1 passage';
    
    // Liste des dates de passage
    const datesHtml = personEntry._dates && personEntry._dates.length > 0 
      ? personEntry._dates.map(d => formatDateDisplay(d)).join(', ')
      : '';
    
    // Utiliser les informations à la date de fin de la plage pour l'affichage
    const infosALaDate = window.getInfosALaDate ? window.getInfosALaDate(personne, currentDateFin) : {
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || '',
      typologie: personne.typologie || '',
      departement: personne.departement || ''
    };
    
    // Déterminer le type principal (pour savoir quel onglet/formulaire ouvrir)
    const mainType = personEntry._types[0] || 'transmissions';
    
    // Trouver la dernière date disponible dans la plage
    const lastDate = personEntry._dates && personEntry._dates.length > 0 
      ? personEntry._dates[personEntry._dates.length - 1] 
      : currentDateFin;
    
    card.innerHTML = `
      <div class="card-header">
        <h3>${displayName}</h3>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          ${badgeAttention}
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
        ${infosALaDate.typologie ? `
          <div class="card-info">
            <span class="card-label">Typologie :</span>
            <span class="card-value">${infosALaDate.typologie}</span>
          </div>
        ` : ''}
        ${infosALaDate.nbPersonnes ? `
          <div class="card-info">
            <span class="card-label">Nb personnes :</span>
            <span class="card-value">${infosALaDate.nbPersonnes}</span>
          </div>
        ` : ''}
        ${infosALaDate.mineurs ? `
          <div class="card-info">
            <span class="card-label">Dont mineurs :</span>
            <span class="card-value">${infosALaDate.mineurs}</span>
          </div>
        ` : ''}
        ${personne.descriptionPhysique ? `
          <div class="card-info">
            <span class="card-label">Description :</span>
            <span class="card-value">${personne.descriptionPhysique}</span>
          </div>
        ` : ''}
        ${infosALaDate.departement ? `
          <div class="card-info">
            <span class="card-label">Département :</span>
            <span class="card-value">${infosALaDate.departement}</span>
          </div>
        ` : ''}
      </div>
    `;
    
    // Ajouter un style de curseur pour indiquer que c'est cliquable
    card.style.cursor = 'pointer';
    
    // Ajouter un gestionnaire de clic pour ouvrir le formulaire
    card.addEventListener('click', () => {
      openPersonForm(personne.id, mainType, lastDate, personEntry._types);
    });
    
    container.appendChild(card);
  });
  
  section.style.display = 'block';
  console.log('✅ ' + persons.length + ' personne(s) distincte(s) affichée(s)');
}

/**
 * Désactive tous les champs du formulaire pour le mode consultation
 * @param {string} modalId - L'ID du modal
 */
function disableFormFieldsForConsultation(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Désactiver tous les champs du formulaire pour lecture seule
  // SAUF le sélecteur de dates et les boutons de navigation de dates
  const formInputs = modal.querySelectorAll('input:not([id*="select-date"]):not([class*="btn-nav-date"]):not(.transmission-tab), textarea, select:not([id*="select-date"])');
  console.log('🔒 Désactivation de', formInputs.length, 'champs dans', modalId);
  formInputs.forEach(input => {
    input.disabled = true;
    input.style.opacity = '0.7';
  });
  
  console.log('🔒 Champs désactivés pour consultation dans', modalId);
}

/**
 * Enregistre le modal actuel en mode consultation
 */
let currentConsultationModal = null;

/**
 * Active le mode consultation pour un modal
 * @param {string} modalId - L'ID du modal
 */
function setConsultationMode(modalId) {
  currentConsultationModal = modalId;
  console.log('👁️ Mode consultation activé pour', modalId);
}

/**
 * Désactive le mode consultation
 */
function clearConsultationMode() {
  currentConsultationModal = null;
  console.log('✅ Mode consultation désactivé');
}

/**
 * Ouvre le formulaire de la personne en mode CONSULTATION (depuis Statistiques)
 * @param {number} personneId - ID de la personne
 * @param {string} mainType - Type principal (transmissions, adp, pointAccueil)
 * @param {string} date - Date à utiliser
 * @param {Array} allTypes - Tous les types disponibles pour cette personne
 */
function openPersonForm(personneId, mainType, date, allTypes) {
  console.log('🔗 Ouverture du formulaire en CONSULTATION:', { personneId, mainType, date, allTypes });
  
  // Mapping des types vers les onglets, fonctions d'édition et IDs des modals
  const typeConfig = {
    'transmissions': {
      tabId: 'transmissions-tab',
      dateInputId: 'transmissions-date',
      editFunction: 'editTransmission',
      modalId: 'modal-ajout',
      btnSupprimer: 'btn-supprimer-transmission',
      btnAnnuler: 'btn-annuler',
      btnEnregistrer: null, // C'est le submit button
      addContainerId: 'add-transmission-container'
    },
    'adp': {
      tabId: 'adp-tab',
      dateInputId: 'adp-date',
      editFunction: 'editTransmissionAdp',
      modalId: 'modal-adp',
      btnSupprimer: 'btn-supprimer-adp',
      btnAnnuler: 'adp-btn-annuler',
      btnEnregistrer: null,
      addContainerId: 'adp-add-transmission-container'
    },
    'pointAccueil': {
      tabId: 'pointaccueil-tab',
      dateInputId: 'pa-date',
      editFunction: 'modifierFichePA',
      modalId: 'modal-point-accueil',
      btnSupprimer: 'btn-supprimer-pa',
      btnAnnuler: 'pa-btn-annuler',
      btnEnregistrer: null,
      addContainerId: 'pa-add-transmission-container'
    }
  };
  
  const config = typeConfig[mainType];
  if (!config) {
    console.error('Type inconnu:', mainType);
    return;
  }
  
  // 1. Naviguer vers l'onglet approprié
  const tab = document.getElementById(config.tabId);
  if (tab) {
    tab.click();
    console.log('📑 Navigation vers l\'onglet:', config.tabId);
  }
  
  // 2. Mettre à jour la date dans le sélecteur de l'onglet
  setTimeout(() => {
    const dateInput = document.getElementById(config.dateInputId);
    if (dateInput && date) {
      dateInput.value = date;
      console.log('📅 Date mise à jour:', date);
      
      // Déclencher l'événement change pour rafraîchir la liste
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 3. Ouvrir le formulaire d'édition en MODE CONSULTATION
    setTimeout(() => {
      const editFn = window[config.editFunction];
      if (typeof editFn === 'function') {
        // Activer le mode consultation pour ce modal
        setConsultationMode(config.modalId);
        
        // Passer consultationMode = true pour ne pas afficher la date du jour dans le sélecteur
        editFn(personneId, date, true);
        console.log('📝 Formulaire ouvert en mode consultation pour la personne:', personneId);
        
        // 4. Mettre le formulaire en mode CONSULTATION (cacher les boutons d'action)
        setTimeout(() => {
          const modal = document.getElementById(config.modalId);
          if (modal) {
            // Cacher le bouton Supprimer
            const btnSupprimer = document.getElementById(config.btnSupprimer);
            if (btnSupprimer) btnSupprimer.style.display = 'none';
            
            // Cacher le bouton Annuler
            const btnAnnuler = document.getElementById(config.btnAnnuler);
            if (btnAnnuler) btnAnnuler.style.display = 'none';
            
            // Cacher le bouton Enregistrer (submit)
            const btnEnregistrer = modal.querySelector('button[type="submit"]');
            if (btnEnregistrer) btnEnregistrer.style.display = 'none';
            
            // Cacher le bouton d'ajout de nouvelle transmission
            const addContainer = document.getElementById(config.addContainerId);
            if (addContainer) addContainer.style.display = 'none';
            
            // NOTE: La désactivation des champs est gérée par disableFormFieldsForConsultation
            // qui est appelé APRÈS le chargement des données dans loadTransmissionDataForDate
            
            // Ajouter un bouton "Fermer" à la place
            const footer = modal.querySelector('.modal-footer');
            if (footer && !footer.querySelector('.btn-fermer-consultation')) {
              const btnFermer = document.createElement('button');
              btnFermer.type = 'button';
              btnFermer.className = 'btn-primary btn-fermer-consultation';
              btnFermer.textContent = 'Fermer';
              btnFermer.style.marginLeft = 'auto';
              btnFermer.addEventListener('click', () => {
                // Désactiver le mode consultation
                clearConsultationMode();
                
                // Fermer le modal
                modal.classList.remove('show');
                modal.style.display = 'none';
                
                // Restaurer les boutons pour la prochaine utilisation normale
                if (btnSupprimer) btnSupprimer.style.display = '';
                if (btnAnnuler) btnAnnuler.style.display = '';
                if (btnEnregistrer) btnEnregistrer.style.display = '';
                if (addContainer) addContainer.style.display = '';
                
                // Réactiver tous les champs du formulaire
                const formInputs = modal.querySelectorAll('input, textarea, select');
                formInputs.forEach(input => {
                  input.disabled = false;
                  input.style.opacity = '';
                });
                
                btnFermer.remove();
                
                // Retourner à l'onglet Statistiques
                const statsTab = document.getElementById('statistiques-tab');
                if (statsTab) statsTab.click();
              });
              footer.appendChild(btnFermer);
            }
            
            console.log('👁️ Mode consultation activé - boutons d\'action cachés');
          }
        }, 300);
        
      } else {
        console.warn('Fonction d\'édition non trouvée:', config.editFunction);
        if (mainType === 'transmissions' && typeof window.editTransmission === 'function') {
          window.editTransmission(personneId);
        }
      }
    }, 200);
  }, 100);
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
  window.disableFormFieldsForConsultation = disableFormFieldsForConsultation;
  window.setConsultationMode = setConsultationMode;
  window.clearConsultationMode = clearConsultationMode;
}