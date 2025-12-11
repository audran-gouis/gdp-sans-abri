/**
 * Gestionnaire centralisé des personnes - BASE UNIFIÉE
 * Charge les personnes et leurs interventions depuis la nouvelle base unifiée
 */

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {number} - Distance de Levenshtein
 */
function levenshteinDistance(str1, str2) {
  if (!str1 || !str2) return Math.max(str1?.length || 0, str2?.length || 0);
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Créer une matrice
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  // Initialiser la première ligne et colonne
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Remplir la matrice
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Suppression
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calcule un score de similarité entre 0 et 1 (1 = identique, 0 = complètement différent)
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {number} - Score de similarité entre 0 et 1
 */
function similarityScore(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
}

/**
 * Vérifie si une chaîne correspond à une recherche avec tolérance aux fautes
 * @param {string} text - Texte à rechercher dans
 * @param {string} searchTerm - Terme de recherche
 * @param {number} threshold - Seuil de similarité (0-1), par défaut 0.6 (60% de similarité)
 * @returns {boolean} - true si le texte correspond
 */
function fuzzyMatch(text, searchTerm, threshold = 0.6) {
  if (!text || !searchTerm) return false;
  
  const textLower = text.toLowerCase().trim();
  const searchLower = searchTerm.toLowerCase().trim();
  
  // Si la recherche est vide, tout correspond
  if (searchLower.length === 0) return true;
  
  // Si le texte contient exactement le terme de recherche, c'est une correspondance parfaite
  if (textLower.includes(searchLower)) return true;
  
  // Si le terme de recherche est très court (1-2 caractères), utiliser une recherche exacte
  if (searchLower.length <= 2) {
    return textLower.includes(searchLower);
  }
  
  // Pour les termes plus longs, utiliser la similarité
  // Vérifier aussi si le terme de recherche est contenu dans le texte (même avec des caractères manquants)
  const words = textLower.split(/\s+/);
  const searchWords = searchLower.split(/\s+/);
  
  // Vérifier si tous les mots de recherche sont présents (avec tolérance)
  for (const searchWord of searchWords) {
    let found = false;
    
    // D'abord vérifier une correspondance exacte dans un mot
    for (const word of words) {
      if (word.includes(searchWord)) {
        found = true;
        break;
      }
    }
    
    // Si pas trouvé exactement, vérifier la similarité
    if (!found) {
      for (const word of words) {
        const similarity = similarityScore(word, searchWord);
        if (similarity >= threshold) {
          found = true;
          break;
        }
      }
    }
    
    // Si un mot de recherche n'est pas trouvé, la recherche échoue
    if (!found) {
      // Dernière chance : vérifier la similarité globale
      const globalSimilarity = similarityScore(textLower, searchLower);
      if (globalSimilarity >= threshold) {
        return true;
      }
      return false;
    }
  }
  
  return true;
}

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
  
  const filterNom = document.getElementById('filter-nom')?.value;
  if (filterNom) {
    filtered = filtered.filter(p => fuzzyMatch(p.nom || '', filterNom));
  }
  
  const filterPrenom = document.getElementById('filter-prenom')?.value;
  if (filterPrenom) {
    filtered = filtered.filter(p => fuzzyMatch(p.prenom || '', filterPrenom));
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
  
  const filterDescription = document.getElementById('filter-description')?.value;
  if (filterDescription) {
    filtered = filtered.filter(p => fuzzyMatch(p.descriptionPhysique || '', filterDescription));
  }
  
  return filtered;
}

/**
 * Applique les filtres sur les personnes pour ADP
 */
function applyAdpFilters(personnes) {
  let filtered = personnes;
  
  const filterNom = document.getElementById('adp-filter-nom')?.value;
  if (filterNom) {
    filtered = filtered.filter(p => fuzzyMatch(p.nom || '', filterNom));
  }
  
  const filterPrenom = document.getElementById('adp-filter-prenom')?.value;
  if (filterPrenom) {
    filtered = filtered.filter(p => fuzzyMatch(p.prenom || '', filterPrenom));
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
  
  const filterDescription = document.getElementById('adp-filter-description')?.value;
  if (filterDescription) {
    filtered = filtered.filter(p => fuzzyMatch(p.descriptionPhysique || '', filterDescription));
  }
  
  return filtered;
}

/**
 * Applique les filtres sur les personnes pour Point Accueil
 */
function applyPAFilters(personnes) {
  let filtered = personnes;
  
  const filterNom = document.getElementById('pa-filter-nom')?.value;
  if (filterNom) {
    filtered = filtered.filter(p => fuzzyMatch(p.nom || '', filterNom));
  }
  
  const filterPrenom = document.getElementById('pa-filter-prenom')?.value;
  if (filterPrenom) {
    filtered = filtered.filter(p => fuzzyMatch(p.prenom || '', filterPrenom));
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
  
  const filterDescription = document.getElementById('pa-filter-description')?.value;
  if (filterDescription) {
    filtered = filtered.filter(p => fuzzyMatch(p.descriptionPhysique || '', filterDescription));
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
    const transmissionToday = personne.transmissions && personne.transmissions.find(i => i.date === selectedDate);
    const hasTransmissionToday = !!transmissionToday;
    const btnText = hasTransmissionToday ? 'Modifier' : 'Compléter';
    const btnClass = hasTransmissionToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';
    const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';

    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${personneNom}</h3>
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
          ${hasTransmissionToday && transmissionToday ? `<button class="btn-card btn-deplacer" data-intervention-id="${transmissionToday.id}" data-type="transmissions" data-personne-nom="${personneNom}" title="Déplacer vers un autre type">Déplacer</button>` : ''}
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
  
  // Ajouter les événements aux boutons de déplacement
  container.querySelectorAll('.btn-deplacer[data-type="transmissions"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const interventionId = parseInt(btn.dataset.interventionId);
      const typeActuel = btn.dataset.type;
      const personneNom = btn.dataset.personneNom;
      if (interventionId && typeof window.afficherModaleDeplacement === 'function') {
        window.afficherModaleDeplacement(interventionId, typeActuel, personneNom);
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
    const adpToday = personne.adp && personne.adp.find(i => i.date === selectedDate);
    const hasAdpToday = !!adpToday;
    const btnText = hasAdpToday ? 'Modifier' : 'Compléter';
    const btnClass = hasAdpToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';
    const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';

    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${personneNom}</h3>
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
          ${hasAdpToday && adpToday ? `<button class="btn-card btn-deplacer" data-intervention-id="${adpToday.id}" data-type="adp" data-personne-nom="${personneNom}" title="Déplacer vers un autre type">Déplacer</button>` : ''}
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
  
  // Ajouter les événements aux boutons de déplacement
  container.querySelectorAll('.btn-deplacer[data-type="adp"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const interventionId = parseInt(btn.dataset.interventionId);
      const typeActuel = btn.dataset.type;
      const personneNom = btn.dataset.personneNom;
      if (interventionId && typeof window.afficherModaleDeplacement === 'function') {
        window.afficherModaleDeplacement(interventionId, typeActuel, personneNom);
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
    const paToday = personne.pointAccueil && personne.pointAccueil.find(i => i.date === selectedDate);
    const hasPAToday = !!paToday;
    const btnText = hasPAToday ? 'Modifier' : 'Compléter';
    const btnClass = hasPAToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';
    const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';

    return `
      <div class="transmission-card">
        <div class="card-header">
          <h3>${personneNom}</h3>
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
          ${hasPAToday && paToday ? `<button class="btn-card btn-deplacer" data-intervention-id="${paToday.id}" data-type="pointAccueil" data-personne-nom="${personneNom}" title="Déplacer vers un autre type">Déplacer</button>` : ''}
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
  
  // Ajouter les événements aux boutons de déplacement
  container.querySelectorAll('.btn-deplacer[data-type="pointAccueil"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const interventionId = parseInt(btn.dataset.interventionId);
      const typeActuel = btn.dataset.type;
      const personneNom = btn.dataset.personneNom;
      if (interventionId && typeof window.afficherModaleDeplacement === 'function') {
        window.afficherModaleDeplacement(interventionId, typeActuel, personneNom);
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