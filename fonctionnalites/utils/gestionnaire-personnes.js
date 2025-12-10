/**
 * Gestionnaire centralisé des personnes - BASE UNIFIÉE
 * Charge les personnes et leurs interventions depuis la nouvelle base unifiée
 */

/**
 * Charge toutes les personnes avec leurs interventions
 */
async function chargerToutesLesPersonnesAvecInterventions() {
  try {
    // Initialiser la base de données unifiée
    if (typeof window.initDatabaseUnified === 'function') {
      await window.initDatabaseUnified();
    }
    
    // Charger toutes les personnes avec leurs interventions
    const personnesAvecInterventions = await window.getPersonnesAvecInterventions();
    console.log(`📋 ${personnesAvecInterventions.length} personnes chargées avec leurs interventions`);
    
    // Enrichir les personnes avec les sources
    const personnesEnrichies = personnesAvecInterventions.map(personne => {
      const sources = new Set();
      const interventions = {
        transmissions: [],
        adp: [],
        pointAccueil: []
      };
      
      // Grouper les interventions par type
      if (personne.interventions && personne.interventions.length > 0) {
        personne.interventions.forEach(intervention => {
          if (intervention.type === 'transmissions') {
            sources.add('transmissions');
            interventions.transmissions.push(intervention);
          } else if (intervention.type === 'adp') {
            sources.add('adp');
            interventions.adp.push(intervention);
          } else if (intervention.type === 'pointAccueil') {
            sources.add('pointAccueil');
            interventions.pointAccueil.push(intervention);
          }
        });
      }
      
      return {
        ...personne,
        sources,
        transmissions: interventions.transmissions,
        adp: interventions.adp,
        pointAccueil: interventions.pointAccueil
      };
    });
    
    return personnesEnrichies;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des personnes:', error);
    return [];
  }
}

/**
 * Génère le HTML des badges sources POUR UNE DATE DONNÉE
 */
function genererBadgesSourcesParDate(personne, selectedDate) {
  let html = '';
  
  if (!selectedDate) {
    // Si pas de date sélectionnée, afficher tous les badges
    return genererBadgesSources(personne.sources);
  }
  
  // Vérifier si la personne a des interventions pour cette date
  const hasTransmissions = personne.transmissions && personne.transmissions.some(i => i.date === selectedDate);
  const hasAdp = personne.adp && personne.adp.some(i => i.date === selectedDate);
  const hasPA = personne.pointAccueil && personne.pointAccueil.some(i => i.date === selectedDate);
  
  if (hasTransmissions) {
    html += '<span class="badge badge-transmissions" title="Maraudes Départementales">MD</span>';
  }
  if (hasAdp) {
    html += '<span class="badge badge-adp" title="ADP">ADP</span>';
  }
  if (hasPA) {
    html += '<span class="badge badge-pa" title="Point Accueil">PA</span>';
  }
  
  return html;
}

/**
 * Génère le HTML des badges sources (tous types, toutes dates)
 */
function genererBadgesSources(sources) {
  let html = '';
  
  if (sources.has('transmissions')) {
    html += '<span class="badge badge-transmissions" title="Maraudes Départementales">MD</span>';
  }
  if (sources.has('adp')) {
    html += '<span class="badge badge-adp" title="ADP">ADP</span>';
  }
  if (sources.has('pointAccueil')) {
    html += '<span class="badge badge-pa" title="Point Accueil">PA</span>';
  }
  
  return html;
}

/**
 * Compte le nombre d'interventions pour une personne sur une date donnée
 * Option B améliorée : Total tous modules confondus pour la date sélectionnée
 * Maximum 1 intervention par type par jour (évite les doublons)
 */
function compterInterventionsParDate(personne, selectedDate, source) {
  if (!selectedDate) return { count: 0, hasToday: false };

  // Utiliser un Set pour compter les types d'interventions uniques
  const typesPresents = new Set();
  const dates = [];

  // Vérifier les transmissions
  if (personne.transmissions) {
    const trans = personne.transmissions.filter(i => i.date === selectedDate);
    if (trans.length > 0) {
      typesPresents.add('transmissions');
      dates.push(...trans.map(i => i.date));
    }
  }

  // Vérifier les ADP
  if (personne.adp) {
    const adp = personne.adp.filter(i => i.date === selectedDate);
    if (adp.length > 0) {
      typesPresents.add('adp');
      dates.push(...adp.map(i => i.date));
    }
  }

  // Vérifier les Point Accueil
  if (personne.pointAccueil) {
    const pa = personne.pointAccueil.filter(i => i.date === selectedDate);
    if (pa.length > 0) {
      typesPresents.add('pointAccueil');
      dates.push(...pa.map(i => i.date));
    }
  }

  const count = typesPresents.size; // Nombre de types différents (max 3)
  const hasToday = count > 0;

  return {
    count,
    hasToday,
    dates: dates.filter(Boolean)
  };
}

/**
 * Génère le badge du compteur d'interventions
 */
function genererBadgeInterventions(stats, selectedDate) {
  if (!selectedDate || stats.count === 0) {
    return '<span class="badge badge-no-transmission" title="Aucune intervention">0</span>';
  }

  if (stats.hasToday) {
    return `<span class="badge badge-has-today" title="${stats.count} intervention(s) sur la période">${stats.count}</span>`;
  }

  return '<span class="badge badge-no-transmission" title="Aucune intervention">0</span>';
}

/**
 * Applique les filtres sur les personnes pour Transmissions
 */
function applyTransmissionsFilters(personnes) {
  let filtered = personnes;
  
  const filterNom = document.getElementById('filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(p => p.nom?.toLowerCase().includes(filterNom));
  }
  
  const filterPrenom = document.getElementById('filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(p => p.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  const filterDdn = document.getElementById('filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(p => p.dateNaissance === filterDdn);
  }
  
  const filterInconnu = document.getElementById('filter-inconnu')?.value;
  if (filterInconnu === 'connus') {
    filtered = filtered.filter(p => p.inconnu === false || !p.inconnu);
  } else if (filterInconnu === 'inconnus') {
    filtered = filtered.filter(p => p.inconnu === true);
  }
  
  const filterDescription = document.getElementById('filter-description')?.value?.toLowerCase();
  if (filterDescription) {
    filtered = filtered.filter(p => p.descriptionPhysique?.toLowerCase().includes(filterDescription));
  }
  
  return filtered;
}

/**
 * Applique les filtres sur les personnes pour ADP
 */
function applyAdpFilters(personnes) {
  let filtered = personnes;
  
  const filterNom = document.getElementById('adp-filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(p => p.nom?.toLowerCase().includes(filterNom));
  }
  
  const filterPrenom = document.getElementById('adp-filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(p => p.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  const filterDdn = document.getElementById('adp-filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(p => p.dateNaissance === filterDdn);
  }
  
  const filterInconnu = document.getElementById('adp-filter-inconnu')?.value;
  if (filterInconnu === 'connus') {
    filtered = filtered.filter(p => p.inconnu === false || !p.inconnu);
  } else if (filterInconnu === 'inconnus') {
    filtered = filtered.filter(p => p.inconnu === true);
  }
  
  const filterDescription = document.getElementById('adp-filter-description')?.value?.toLowerCase();
  if (filterDescription) {
    filtered = filtered.filter(p => p.descriptionPhysique?.toLowerCase().includes(filterDescription));
  }
  
  return filtered;
}

/**
 * Applique les filtres sur les personnes pour Point Accueil
 */
function applyPAFilters(personnes) {
  let filtered = personnes;
  
  const filterNom = document.getElementById('pa-filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(p => p.nom?.toLowerCase().includes(filterNom));
  }
  
  const filterPrenom = document.getElementById('pa-filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(p => p.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  const filterDdn = document.getElementById('pa-filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(p => p.dateNaissance === filterDdn);
  }
  
  const filterInconnu = document.getElementById('pa-filter-inconnu')?.value;
  if (filterInconnu === 'connus') {
    filtered = filtered.filter(p => p.inconnu === false || !p.inconnu);
  } else if (filterInconnu === 'inconnus') {
    filtered = filtered.filter(p => p.inconnu === true);
  }
  
  const filterDescription = document.getElementById('pa-filter-description')?.value?.toLowerCase();
  if (filterDescription) {
    filtered = filtered.filter(p => p.descriptionPhysique?.toLowerCase().includes(filterDescription));
  }
  
  return filtered;
}

/**
 * Affiche toutes les personnes pour Transmissions avec badges
 */
async function afficherToutesLesPersonnesTransmissions() {
  const container = document.getElementById('transmissions-list');
  if (!container) return;

  const personnes = await chargerToutesLesPersonnesAvecInterventions();
  const selectedDate = document.getElementById('transmissions-date')?.value;

  // Appliquer les filtres
  const personnesFiltrees = applyTransmissionsFilters(personnes);

  if (personnesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune personne pour le moment</p>';
    return;
  }

  container.innerHTML = personnesFiltrees.map(personne => {
    const badges = genererBadgesSourcesParDate(personne, selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'transmissions');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    
    // Vérifier si une transmission existe pour cette date
    const hasTransmissionToday = personne.transmissions && personne.transmissions.some(i => i.date === selectedDate);
    const btnText = hasTransmissionToday ? 'Modifier' : 'Compléter';
    const btnClass = hasTransmissionToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';

    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim()}</h3>
          <div class="card-badges">
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
          ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${personne.departement ? `<p><strong>Département:</strong> ${personne.departement}</p>` : ''}
          ${personne.typologie ? `<p><strong>Typologie:</strong> ${personne.typologie}</p>` : ''}
          ${!hasTransmissionToday && selectedDate ? '<p class="no-transmission-notice">Pas de maraude départementale pour ce jour</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card ${btnClass}" data-personne-id="${personne.id}" data-type="transmissions">${btnText}</button>
        </div>
      </div>
    `;
  }).join('');

  // Ajouter les événements aux boutons
  container.querySelectorAll('.btn-edit[data-type="transmissions"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const personneId = parseInt(btn.dataset.personneId);
      if (personneId && typeof window.editTransmission === 'function') {
        window.editTransmission(personneId);
      }
    });
  });
}

/**
 * Affiche toutes les personnes pour ADP avec badges
 */
async function afficherToutesLesPersonnesADP() {
  const container = document.getElementById('adp-list');
  if (!container) return;

  const personnes = await chargerToutesLesPersonnesAvecInterventions();

  // Appliquer les filtres
  const personnesFiltrees = applyAdpFilters(personnes);

  if (personnesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune personne pour le moment</p>';
    return;
  }

  container.innerHTML = personnesFiltrees.map(personne => {
    const selectedDate = document.getElementById('adp-date')?.value;
    const badges = genererBadgesSourcesParDate(personne, selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'adp');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    
    // Vérifier si une ADP existe pour cette date
    const hasAdpToday = personne.adp && personne.adp.some(i => i.date === selectedDate);
    const btnText = hasAdpToday ? 'Modifier' : 'Compléter';
    const btnClass = hasAdpToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';

    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim()}</h3>
          <div class="card-badges">
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
          ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${personne.departement ? `<p><strong>Département:</strong> ${personne.departement}</p>` : ''}
          ${personne.typologie ? `<p><strong>Typologie:</strong> ${personne.typologie}</p>` : ''}
          ${!hasAdpToday && selectedDate ? '<p class="no-transmission-notice">Pas de maraude ADP pour ce jour</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card ${btnClass}" data-personne-id="${personne.id}" data-type="adp">${btnText}</button>
        </div>
      </div>
    `;
  }).join('');

  // Ajouter les événements aux boutons
  container.querySelectorAll('.btn-edit[data-type="adp"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const personneId = parseInt(btn.dataset.personneId);
      if (personneId && typeof window.editTransmissionAdp === 'function') {
        window.editTransmissionAdp(personneId);
      }
    });
  });
}

/**
 * Affiche toutes les personnes pour Point Accueil avec badges
 */
async function afficherToutesLesPersonnesPA() {
  const container = document.getElementById('point-accueil-list');
  if (!container) return;

  const personnes = await chargerToutesLesPersonnesAvecInterventions();

  // Appliquer les filtres
  const personnesFiltrees = applyPAFilters(personnes);

  if (personnesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune personne pour le moment</p>';
    return;
  }

  container.innerHTML = personnesFiltrees.map(personne => {
    const selectedDate = document.getElementById('pa-date')?.value;
    const badges = genererBadgesSourcesParDate(personne, selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'pointAccueil');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    
    // Vérifier si une fiche Point Accueil existe pour cette date
    const hasPAToday = personne.pointAccueil && personne.pointAccueil.some(i => i.date === selectedDate);
    const btnText = hasPAToday ? 'Modifier' : 'Compléter';
    const btnClass = hasPAToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';

    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim()}</h3>
          <div class="card-badges">
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
          ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${personne.departement ? `<p><strong>Département:</strong> ${personne.departement}</p>` : ''}
          ${personne.typologie ? `<p><strong>Typologie:</strong> ${personne.typologie}</p>` : ''}
          ${!hasPAToday && selectedDate ? '<p class="no-transmission-notice">Pas de point accueil pour ce jour</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card ${btnClass}" data-personne-id="${personne.id}" data-type="pointAccueil">${btnText}</button>
        </div>
      </div>
    `;
  }).join('');

  // Ajouter les événements aux boutons
  container.querySelectorAll('.btn-edit[data-type="pointAccueil"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const personneId = parseInt(btn.dataset.personneId);
      if (personneId && typeof window.modifierFichePA === 'function') {
        window.modifierFichePA(personneId);
      }
    });
  });
}

// Exports
if (typeof window !== 'undefined') {
  window.chargerToutesLesPersonnesAvecInterventions = chargerToutesLesPersonnesAvecInterventions;
  window.genererBadgesSources = genererBadgesSources;
  window.genererBadgesSourcesParDate = genererBadgesSourcesParDate;
  window.compterInterventionsParDate = compterInterventionsParDate;
  window.genererBadgeInterventions = genererBadgeInterventions;
  window.applyTransmissionsFilters = applyTransmissionsFilters;
  window.applyAdpFilters = applyAdpFilters;
  window.applyPAFilters = applyPAFilters;
  window.afficherToutesLesPersonnesTransmissions = afficherToutesLesPersonnesTransmissions;
  window.afficherToutesLesPersonnesADP = afficherToutesLesPersonnesADP;
  window.afficherToutesLesPersonnesPA = afficherToutesLesPersonnesPA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    chargerToutesLesPersonnesAvecInterventions,
    genererBadgesSources,
    genererBadgesSourcesParDate,
    compterInterventionsParDate,
    genererBadgeInterventions,
    applyTransmissionsFilters,
    applyAdpFilters,
    applyPAFilters,
    afficherToutesLesPersonnesTransmissions,
    afficherToutesLesPersonnesADP,
    afficherToutesLesPersonnesPA
  };
}

console.log('✅ Gestionnaire centralisé des personnes chargé (Base Unifiée)');
