/**
 * Gestionnaire centralisé des personnes avec base unique
 * Charge les personnes depuis la DB centrale et leurs interventions depuis les 3 sources
 */

/**
 * Charge toutes les personnes avec leurs interventions
 */
async function chargerToutesLesPersonnesAvecInterventions() {
  try {
    // Charger toutes les personnes
    const personnes = await window.getAllPersonnes();
    console.log(`📋 ${personnes.length} personnes chargées`);
    
    // Charger toutes les interventions
    const [transmissions, adp, pa] = await Promise.all([
      typeof window.getAllTransmissions === 'function' ? window.getAllTransmissions() : [],
      typeof window.getAllTransmissionsAdp === 'function' ? window.getAllTransmissionsAdp() : [],
      typeof recupererFichesPA === 'function' ? recupererFichesPA() : []
    ]);
    
    console.log(`📋 Interventions: ${transmissions.length} Transmissions, ${adp.length} ADP, ${pa.length} PA`);
    
    // Enrichir chaque personne avec ses interventions
    const personnesEnrichies = personnes.map(personne => {
      const sources = new Set();
      const interventions = {
        transmissions: [],
        adp: [],
        pointAccueil: []
      };
      
      // Trouver les transmissions de cette personne
      const transPersonne = transmissions.filter(t => t.personneId === personne.id);
      if (transPersonne.length > 0) {
        sources.add('transmissions');
        interventions.transmissions = transPersonne;
      }
      
      // Trouver les ADP de cette personne
      const adpPersonne = adp.filter(a => a.personneId === personne.id);
      if (adpPersonne.length > 0) {
        sources.add('adp');
        interventions.adp = adpPersonne;
      }
      
      // Trouver les PA de cette personne
      const paPersonne = pa.filter(p => p.personneId === personne.id);
      if (paPersonne.length > 0) {
        sources.add('pointAccueil');
        interventions.pointAccueil = paPersonne;
      }
      
      return {
        ...personne,
        sources,
        ...interventions
      };
    });
    
    return personnesEnrichies;
  } catch (error) {
    console.error('Erreur lors du chargement des personnes:', error);
    return [];
  }
}

/**
 * Génère le HTML des badges sources
 */
function genererBadgesSources(sources) {
  let html = '';
  
  if (sources.has('transmissions')) {
    html += '<span class="badge badge-transmissions" title="Présent dans Transmissions">T</span>';
  }
  if (sources.has('adp')) {
    html += '<span class="badge badge-adp" title="Présent dans ADP">ADP</span>';
  }
  if (sources.has('pointAccueil')) {
    html += '<span class="badge badge-pa" title="Présent dans Point Accueil">PA</span>';
  }
  
  return html;
}

/**
 * Applique les filtres sur les personnes pour Transmissions
 */
function applyTransmissionsFilters(personnes) {
  let filtered = personnes;
  
  // Filtre par nom
  const filterNom = document.getElementById('filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(p => p.nom?.toLowerCase().includes(filterNom));
  }
  
  // Filtre par prénom
  const filterPrenom = document.getElementById('filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(p => p.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  // Filtre par date de naissance
  const filterDdn = document.getElementById('filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(p => p.dateNaissance === filterDdn);
  }
  
  return filtered;
}

/**
 * Applique les filtres ADP
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
  
  const filterInconnu = document.getElementById('adp-filter-inconnu')?.checked;
  if (filterInconnu) {
    filtered = filtered.filter(p => p.inconnu === true);
  }
  
  return filtered;
}

/**
 * Applique les filtres Point Accueil
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
  
  const filterInconnu = document.getElementById('pa-filter-inconnu')?.checked;
  if (filterInconnu) {
    filtered = filtered.filter(p => p.inconnu === true);
  }
  
  return filtered;
}

/**
 * Compte le nombre d'interventions pour une personne sur une date donnée
 */
function compterInterventionsParDate(personne, selectedDate, source) {
  if (!selectedDate) return { count: 0, hasToday: false };
  
  let interventions = [];
  
  if (source === 'transmissions' || source === 'all') {
    interventions = interventions.concat(personne.transmissions || []);
  }
  if (source === 'adp' || source === 'all') {
    interventions = interventions.concat(personne.adp || []);
  }
  if (source === 'pointAccueil' || source === 'all') {
    interventions = interventions.concat(personne.pointAccueil || []);
  }
  
  const interventionsFiltered = interventions.filter(i => {
    const iDate = i.dateTransmission || i.date;
    return iDate === selectedDate;
  });
  
  return {
    count: interventionsFiltered.length,
    hasToday: interventionsFiltered.length > 0,
    dates: interventionsFiltered.map(i => i.dateTransmission || i.date).filter(Boolean)
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
    const badges = genererBadgesSources(personne.sources);
    const intervention = personne.transmissions.find(t => t.dateTransmission === selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'transmissions');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    
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
          ${intervention ? `<p>${intervention.transmission || ''}</p>` : 
            stats.hasToday ? '' : '<p class="no-transmission-notice">❌ Aucune transmission pour cette date</p>'}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" data-personne-id="${personne.id}" data-type="transmissions">Compléter</button>
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
    const badges = genererBadgesSources(personne.sources);
    const selectedDate = document.getElementById('adp-date')?.value;
    const stats = compterInterventionsParDate(personne, selectedDate, 'adp');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    
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
          ${personne.typologie ? `<p><strong>Typologie:</strong> ${personne.typologie}</p>` : ''}
          ${!stats.hasToday && selectedDate ? '<p class="no-transmission-notice">❌ Aucune transmission pour cette date</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" data-personne-id="${personne.id}" data-type="adp">Compléter</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Ajouter les événements aux boutons
  container.querySelectorAll('.btn-edit[data-type="adp"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const personneId = parseInt(btn.dataset.personneId);
      console.log('🖱️ Clic sur bouton ADP - personneId:', personneId);
      console.log('🔍 window.editTransmissionAdp existe?', typeof window.editTransmissionAdp);
      if (personneId && typeof window.editTransmissionAdp === 'function') {
        console.log('✅ Appel de editTransmissionAdp avec ID:', personneId);
        window.editTransmissionAdp(personneId);
      } else {
        console.error('❌ Impossible d\'appeler editTransmissionAdp:', {
          personneId,
          functionExists: typeof window.editTransmissionAdp
        });
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
    const badges = genererBadgesSources(personne.sources);
    const selectedDate = document.getElementById('pa-date')?.value;
    const stats = compterInterventionsParDate(personne, selectedDate, 'pointAccueil');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    
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
          ${personne.typologie ? `<p><strong>Typologie:</strong> ${personne.typologie}</p>` : ''}
          ${!stats.hasToday && selectedDate ? '<p class="no-transmission-notice">❌ Aucune transmission pour cette date</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" data-personne-id="${personne.id}">Compléter</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Ajouter les événements aux boutons
  container.querySelectorAll('.btn-edit').forEach(btn => {
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
  window.compterInterventionsParDate = compterInterventionsParDate;
  window.genererBadgeInterventions = genererBadgeInterventions;
  window.applyTransmissionsFilters = applyTransmissionsFilters;
  window.applyAdpFilters = applyAdpFilters;
  window.applyPAFilters = applyPAFilters;
  window.afficherToutesLesPersonnesTransmissions = afficherToutesLesPersonnesTransmissions;
  window.afficherToutesLesPersonnesADP = afficherToutesLesPersonnesADP;
  window.afficherToutesLesPersonnesPA = afficherToutesLesPersonnesPA;
  
  // Alias pour compatibilité
  window.afficherToutesFichesTransmissions = afficherToutesLesPersonnesTransmissions;
  window.afficherToutesFichesADP = afficherToutesLesPersonnesADP;
  window.afficherToutesFichesPA = afficherToutesLesPersonnesPA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    chargerToutesLesPersonnesAvecInterventions,
    genererBadgesSources,
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

console.log('✅ Gestionnaire centralisé des personnes chargé');

