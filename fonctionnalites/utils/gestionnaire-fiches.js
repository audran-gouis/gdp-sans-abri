/**
 * Gestionnaire centralisé des personnes
 * Permet de voir toutes les fiches dans tous les onglets avec badges
 */

/**
 * Génère un identifiant unique pour une personne basé sur ses infos
 */
function genererPersonId(personne) {
  if (personne.inconnu) {
    // Pour les inconnus, utiliser la description physique comme identifiant
    return `inconnu_${(personne.descriptionPhysique || '').substring(0, 50)}`;
  }
  
  const nom = (personne.nom || '').toLowerCase().trim();
  const prenom = (personne.prenom || '').toLowerCase().trim();
  const ddn = personne.dateNaissance || '';
  
  return `${nom}_${prenom}_${ddn}`;
}

/**
 * Charge toutes les fiches de toutes les bases de données
 */
async function chargerToutesFiches() {
  const fichesParPersonne = new Map();
  
  try {
    // Charger Transmissions
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      transmissions.forEach(t => {
        const personId = genererPersonId(t);
        if (!fichesParPersonne.has(personId)) {
          fichesParPersonne.set(personId, {
            personId,
            nom: t.nom,
            prenom: t.prenom,
            dateNaissance: t.dateNaissance,
            descriptionPhysique: t.descriptionPhysique,
            inconnu: t.inconnu,
            typologie: t.typologie,
            nbPersonnes: t.nbPersonnes,
            mineurs: t.mineurs,
            sources: new Set(),
            transmissions: [],
            adp: [],
            pointAccueil: []
          });
        }
        fichesParPersonne.get(personId).sources.add('transmissions');
        fichesParPersonne.get(personId).transmissions.push(t);
      });
    }
    
    // Charger ADP
    if (typeof window.getAllTransmissionsAdp === 'function') {
      const adp = await window.getAllTransmissionsAdp();
      adp.forEach(a => {
        const personId = genererPersonId(a);
        if (!fichesParPersonne.has(personId)) {
          fichesParPersonne.set(personId, {
            personId,
            nom: a.nom,
            prenom: a.prenom,
            dateNaissance: a.dateNaissance,
            descriptionPhysique: a.descriptionPhysique,
            inconnu: a.inconnu,
            typologie: a.typologie,
            nbPersonnes: a.nbPersonnes,
            mineurs: a.mineurs,
            sources: new Set(),
            transmissions: [],
            adp: [],
            pointAccueil: []
          });
        }
        fichesParPersonne.get(personId).sources.add('adp');
        fichesParPersonne.get(personId).adp.push(a);
      });
    }
    
    // Charger Point Accueil
    if (typeof recupererFichesPA === 'function') {
      const pa = await recupererFichesPA();
      pa.forEach(p => {
        const personId = genererPersonId(p);
        if (!fichesParPersonne.has(personId)) {
          fichesParPersonne.set(personId, {
            personId,
            nom: p.nom,
            prenom: p.prenom,
            dateNaissance: p.dateNaissance,
            descriptionPhysique: p.descriptionPhysique,
            inconnu: p.inconnu,
            typologie: p.typologie,
            nbPersonnes: p.nbPersonnes,
            mineurs: p.mineurs,
            sources: new Set(),
            transmissions: [],
            adp: [],
            pointAccueil: []
          });
        }
        fichesParPersonne.get(personId).sources.add('pointAccueil');
        fichesParPersonne.get(personId).pointAccueil.push(p);
      });
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des fiches:', error);
  }
  
  return Array.from(fichesParPersonne.values());
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
 * Applique les filtres sur les fiches pour Transmissions
 */
function applyTransmissionsFilters(fiches) {
  let filtered = fiches;
  
  // Filtre par nom
  const filterNom = document.getElementById('filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(fiche => fiche.nom?.toLowerCase().includes(filterNom));
  }
  
  // Filtre par prénom
  const filterPrenom = document.getElementById('filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(fiche => fiche.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  // Filtre par date de naissance
  const filterDdn = document.getElementById('filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(fiche => fiche.dateNaissance === filterDdn);
  }
  
  return filtered;
}

/**
 * Compte le nombre de transmissions pour une personne sur une date donnée
 */
function compterTransmissionsParDate(fiche, selectedDate, source) {
  if (!selectedDate) return { count: 0, hasToday: false };
  
  let transmissions = [];
  
  if (source === 'transmissions' || source === 'all') {
    transmissions = transmissions.concat(fiche.transmissions || []);
  }
  if (source === 'adp' || source === 'all') {
    transmissions = transmissions.concat(fiche.adp || []);
  }
  if (source === 'pointAccueil' || source === 'all') {
    transmissions = transmissions.concat(fiche.pointAccueil || []);
  }
  
  const hasToday = transmissions.some(t => {
    const tDate = t.dateTransmission || t.date;
    return tDate === selectedDate;
  });
  
  return {
    count: transmissions.length,
    hasToday,
    dates: transmissions.map(t => t.dateTransmission || t.date).filter(Boolean)
  };
}

/**
 * Génère le badge du compteur de transmissions
 */
function genererBadgeTransmissions(stats, selectedDate) {
  if (!selectedDate || stats.count === 0) {
    return '<span class="badge badge-no-transmission" title="Aucune transmission">0</span>';
  }
  
  if (stats.hasToday) {
    return `<span class="badge badge-has-today" title="Transmission pour cette date">\u2714 ${stats.count}</span>`;
  }
  
  return `<span class="badge badge-other-dates" title="${stats.count} transmission(s) à d'autres dates">${stats.count}</span>`;
}

/**
 * Affiche toutes les fiches pour Transmissions avec badges
 */
async function afficherToutesFichesTransmissions() {
  const container = document.getElementById('transmissions-list');
  if (!container) return;
  
  const fiches = await chargerToutesFiches();
  const selectedDate = document.getElementById('transmissions-date')?.value;
  
  // Appliquer les filtres
  const fichesFiltrees = applyTransmissionsFilters(fiches);
  
  if (fichesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune fiche pour le moment</p>';
    return;
  }
  
  container.innerHTML = fichesFiltrees.map(fiche => {
    const badges = genererBadgesSources(fiche.sources);
    const transmission = fiche.transmissions.find(t => t.dateTransmission === selectedDate);
    const stats = compterTransmissionsParDate(fiche, selectedDate, 'transmissions');
    const badgeCount = genererBadgeTransmissions(stats, selectedDate);
    
    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${fiche.inconnu ? 'Inconnu' : `${fiche.prenom || ''} ${fiche.nom || ''}`.trim()}</h3>
          <div class="card-badges">
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${fiche.descriptionPhysique ? `<p><strong>Description:</strong> ${fiche.descriptionPhysique}</p>` : ''}
          ${fiche.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(fiche.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${transmission ? `<p>${transmission.transmission || ''}</p>` : 
            stats.hasToday ? '' : '<p class="no-transmission-notice">❌ Aucune transmission pour cette date</p>'}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" onclick="window.editTransmission(${fiche.transmissions[0]?.id || 0})">Compléter</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Affiche toutes les fiches pour ADP avec badges
 */
async function afficherToutesFichesADP() {
  const container = document.getElementById('adp-list');
  if (!container) return;
  
  const fiches = await chargerToutesFiches();
  
  // Appliquer les filtres
  const fichesFiltrees = applyAdpFilters(fiches);
  
  if (fichesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune fiche pour le moment</p>';
    return;
  }
  
  container.innerHTML = fichesFiltrees.map(fiche => {
    const badges = genererBadgesSources(fiche.sources);
    const selectedDate = document.getElementById('adp-date')?.value;
    const stats = compterTransmissionsParDate(fiche, selectedDate, 'adp');
    const badgeCount = genererBadgeTransmissions(stats, selectedDate);
    
    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${fiche.inconnu ? 'Inconnu' : `${fiche.prenom || ''} ${fiche.nom || ''}`.trim()}</h3>
          <div class="card-badges">
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${fiche.descriptionPhysique ? `<p><strong>Description:</strong> ${fiche.descriptionPhysique}</p>` : ''}
          ${fiche.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(fiche.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${fiche.typologie ? `<p><strong>Typologie:</strong> ${fiche.typologie}</p>` : ''}
          ${!stats.hasToday && selectedDate ? '<p class="no-transmission-notice">❌ Aucune transmission pour cette date</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" onclick="window.editTransmissionAdp(${fiche.adp[0]?.id || 0})">Compléter</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Affiche toutes les fiches pour Point Accueil avec badges
 */
async function afficherToutesFichesPA() {
  const container = document.getElementById('point-accueil-list');
  if (!container) return;
  
  const fiches = await chargerToutesFiches();
  
  // Appliquer les filtres
  const fichesFiltrees = applyPAFilters(fiches);
  
  if (fichesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune fiche pour le moment</p>';
    return;
  }
  
  container.innerHTML = fichesFiltrees.map(fiche => {
    const badges = genererBadgesSources(fiche.sources);
    const selectedDate = document.getElementById('pa-date')?.value;
    const stats = compterTransmissionsParDate(fiche, selectedDate, 'pointAccueil');
    const badgeCount = genererBadgeTransmissions(stats, selectedDate);
    
    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${fiche.inconnu ? 'Inconnu' : `${fiche.prenom || ''} ${fiche.nom || ''}`.trim()}</h3>
          <div class="card-badges">
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${fiche.descriptionPhysique ? `<p><strong>Description:</strong> ${fiche.descriptionPhysique}</p>` : ''}
          ${fiche.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(fiche.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${fiche.typologie ? `<p><strong>Typologie:</strong> ${fiche.typologie}</p>` : ''}
          ${!stats.hasToday && selectedDate ? '<p class="no-transmission-notice">❌ Aucune transmission pour cette date</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" data-id="${fiche.pointAccueil[0]?.id || 0}">Compléter</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Ajouter les événements aux boutons
  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (id && typeof modifierFichePA === 'function') {
        modifierFichePA(id);
      }
    });
  });
}

// Exports
if (typeof window !== 'undefined') {
  window.chargerToutesFiches = chargerToutesFiches;
  window.genererPersonId = genererPersonId;
  window.genererBadgesSources = genererBadgesSources;
  window.compterTransmissionsParDate = compterTransmissionsParDate;
  window.genererBadgeTransmissions = genererBadgeTransmissions;
  window.applyTransmissionsFilters = applyTransmissionsFilters;
  window.afficherToutesFichesTransmissions = afficherToutesFichesTransmissions;
  window.afficherToutesFichesADP = afficherToutesFichesADP;
  window.afficherToutesFichesPA = afficherToutesFichesPA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    chargerToutesFiches,
    genererPersonId,
    genererBadgesSources,
    compterTransmissionsParDate,
    genererBadgeTransmissions,
    applyTransmissionsFilters,
    afficherToutesFichesTransmissions,
    afficherToutesFichesADP,
    afficherToutesFichesPA
  };
}

console.log('✅ Gestionnaire centralisé des fiches chargé');

