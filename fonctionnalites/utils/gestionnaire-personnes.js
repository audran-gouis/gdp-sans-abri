/**
 * Gestionnaire centralisé des personnes - BASE UNIFIÉE
 * Charge les personnes et leurs interventions depuis la nouvelle base unifiée
 */

/**
 * Vérifie si une personne a l'option Attention cochée dans au moins une intervention
 */
function personneAAttention(personne) {
  if (!personne) return false;
  
  // Vérifier dans toutes les interventions de la personne
  const toutesInterventions = [
    ...(personne.transmissions || []),
    ...(personne.adp || []),
    ...(personne.pointAccueil || [])
  ];
  
  return toutesInterventions.some(intervention => intervention.attention === true);
}

/**
 * Génère le badge Attention HTML si nécessaire
 */
function genererBadgeAttention(personne) {
  if (personneAAttention(personne)) {
    return '<span class="badge badge-attention" title="Attention requise">⚠️ ATTENTION</span>';
  }
  return '';
}

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
 * TOUS DISPOSITIFS CONFONDUS : Si la personne a une transmission dans plusieurs onglets,
 * chaque dispositif compte comme un passage distinct
 */
function compterInterventionsParDate(personne, selectedDate, source) {
  if (!selectedDate) return { count: 0, hasToday: false };

  // Compter le nombre total de passages TOUS DISPOSITIFS CONFONDUS
  let totalPassages = 0;
  const dates = [];

  // Compter les transmissions Maraudes Départementales (chaque type compte comme un passage)
  if (personne.transmissions) {
    const trans = personne.transmissions.filter(i => i.date === selectedDate);
    totalPassages += trans.length;
    dates.push(...trans.map(i => i.date));
  }

  // Compter les ADP (chaque type compte comme un passage)
  if (personne.adp) {
    const adp = personne.adp.filter(i => i.date === selectedDate);
    totalPassages += adp.length;
    dates.push(...adp.map(i => i.date));
  }

  // Compter les Point Accueil (chaque type compte comme un passage)
  if (personne.pointAccueil) {
    const pa = personne.pointAccueil.filter(i => i.date === selectedDate);
    totalPassages += pa.length;
    dates.push(...pa.map(i => i.date));
  }

  const hasToday = totalPassages > 0;

  return {
    count: totalPassages, // Nombre total de passages TOUS DISPOSITIFS CONFONDUS
    hasToday,
    dates: dates.filter(Boolean)
  };
}

/**
 * Génère le badge du compteur d'interventions/passages
 */
function genererBadgeInterventions(stats, selectedDate) {
  if (!selectedDate || stats.count === 0) {
    return '<span class="badge badge-no-transmission" title="Aucun passage ce jour">0</span>';
  }

  if (stats.hasToday) {
    const pluriel = stats.count > 1 ? 's' : '';
    return `<span class="badge badge-has-today" title="${stats.count} passage${pluriel} ce jour">${stats.count}</span>`;
  }

  return '<span class="badge badge-no-transmission" title="Aucun passage ce jour">0</span>';
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

  // Filtrer les personnes archivées
  const personnesNonArchivees = personnes.filter(p => !p.archive);

  // Appliquer les filtres
  const personnesFiltrees = applyTransmissionsFilters(personnesNonArchivees);

  if (personnesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune personne pour le moment</p>';
    return;
  }

  // Trier : personnes AVEC transmission pour la date sélectionnée en premier
  const personnesTriees = personnesFiltrees.sort((a, b) => {
    const aHasTransmission = a.transmissions && a.transmissions.some(i => i.date === selectedDate);
    const bHasTransmission = b.transmissions && b.transmissions.some(i => i.date === selectedDate);
    
    if (aHasTransmission && !bHasTransmission) return -1;
    if (!aHasTransmission && bHasTransmission) return 1;
    return 0; // Garder l'ordre original si les deux ont ou n'ont pas de transmission
  });

  container.innerHTML = personnesTriees.map(personne => {
    const badges = genererBadgesSourcesParDate(personne, selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'transmissions');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    const badgeAttention = genererBadgeAttention(personne);
    const hasAttention = personneAAttention(personne);
    
    // Récupérer les infos historiques valides pour cette date
    const infosALaDate = window.getInfosALaDate ? 
      window.getInfosALaDate(personne, selectedDate) : 
      {
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      };
    
    // Vérifier si une transmission existe pour cette date
    const transmissionToday = personne.transmissions && personne.transmissions.find(i => i.date === selectedDate);
    const hasTransmissionToday = !!transmissionToday;
    const btnText = hasTransmissionToday ? 'Voir/Modifier' : 'Compléter';
    const btnClass = hasTransmissionToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';
    const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';
    
    // Compter les types de transmissions existantes pour ce jour
    const transmissionsToday = personne.transmissions ? personne.transmissions.filter(i => i.date === selectedDate) : [];
    const existingTypes = new Set(transmissionsToday.map(t => (t.typeTransmission || '').toLowerCase()));
    const allTypes = ['jour', 'nuit', 'coordo'];
    const availableTypes = allTypes.filter(t => !existingTypes.has(t));
    const canAddMore = hasTransmissionToday && availableTypes.length > 0;

    return `
      <div class="transmission-card ${hasAttention ? 'has-attention' : ''}" data-personne-id="${personne.id}">
        <div class="card-header">
          <h3>${personneNom}</h3>
          <div class="card-badges">
            ${badgeAttention}
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
          ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${infosALaDate.departement ? `<p><strong>Département:</strong> ${infosALaDate.departement}</p>` : ''}
          ${infosALaDate.typologie ? `<p><strong>Typologie:</strong> ${infosALaDate.typologie}</p>` : ''}
          ${!hasTransmissionToday && selectedDate ? '<p class="no-transmission-notice">Pas de maraude départementale pour ce jour</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card ${btnClass}" data-personne-id="${personne.id}" data-type="transmissions">${btnText}</button>
          ${hasTransmissionToday && transmissionsToday.length > 0 ? `<button class="btn-card btn-deplacer" data-personne-id="${personne.id}" data-interventions='${JSON.stringify(transmissionsToday.map(t => ({id: t.id, typeTransmission: t.typeTransmission})))}' data-type="transmissions" data-personne-nom="${personneNom}" data-date="${selectedDate}" title="Déplacer vers un autre type">Déplacer</button>` : ''}
          ${canAddMore ? `<button class="btn-card btn-nouvelle-transmission" data-personne-id="${personne.id}" data-type="transmissions" data-available-types="${availableTypes.join(',')}" title="Ajouter une autre transmission pour ce jour">+ Nouvelle transmission</button>` : ''}
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
      const typeActuel = btn.dataset.type;
      const personneNom = btn.dataset.personneNom;
      const personneId = parseInt(btn.dataset.personneId);
      const date = btn.dataset.date;
      let interventions = [];
      try {
        interventions = JSON.parse(btn.dataset.interventions || '[]');
      } catch (e) {
        console.error('Erreur parsing interventions:', e);
      }
      if (interventions.length > 0 && typeof window.afficherModaleDeplacementMultiple === 'function') {
        window.afficherModaleDeplacementMultiple(interventions, typeActuel, personneNom, personneId, date);
      }
    });
  });
  
  // Ajouter les événements aux boutons "Nouvelle transmission"
  container.querySelectorAll('.btn-nouvelle-transmission[data-type="transmissions"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const personneId = parseInt(btn.dataset.personneId);
      const availableTypes = btn.dataset.availableTypes.split(',');
      if (personneId && typeof window.showNewTransmissionDropdown === 'function') {
        window.showNewTransmissionDropdown(btn, personneId, availableTypes, 'transmissions');
      }
    });
  });
  
  // Attacher le menu contextuel aux nouvelles cartes
  if (typeof window.attachContextMenuToAllCards === 'function') {
    window.attachContextMenuToAllCards();
  }
}

/**
 * Affiche toutes les personnes pour ADP avec badges
 */
async function afficherToutesLesPersonnesADP() {
  const container = document.getElementById('adp-list');
  if (!container) return;

  const personnes = await chargerToutesLesPersonnesAvecInterventions();

  // Filtrer les personnes archivées
  const personnesNonArchivees = personnes.filter(p => !p.archive);

  // Appliquer les filtres
  const personnesFiltrees = applyAdpFilters(personnesNonArchivees);

  if (personnesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune personne pour le moment</p>';
    return;
  }

  const selectedDate = document.getElementById('adp-date')?.value;

  // Trier : personnes AVEC ADP pour la date sélectionnée en premier
  const personnesTriees = personnesFiltrees.sort((a, b) => {
    const aHasAdp = a.adp && a.adp.some(i => i.date === selectedDate);
    const bHasAdp = b.adp && b.adp.some(i => i.date === selectedDate);
    
    if (aHasAdp && !bHasAdp) return -1;
    if (!aHasAdp && bHasAdp) return 1;
    return 0; // Garder l'ordre original si les deux ont ou n'ont pas d'ADP
  });

  container.innerHTML = personnesTriees.map(personne => {
    const badges = genererBadgesSourcesParDate(personne, selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'adp');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    const badgeAttention = genererBadgeAttention(personne);
    const hasAttention = personneAAttention(personne);
    
    // Récupérer les infos historiques valides pour cette date
    const infosALaDate = window.getInfosALaDate ? 
      window.getInfosALaDate(personne, selectedDate) : 
      {
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      };
    
    // Vérifier si une ADP existe pour cette date
    const adpToday = personne.adp && personne.adp.find(i => i.date === selectedDate);
    const hasAdpToday = !!adpToday;
    const btnText = hasAdpToday ? 'Voir/Modifier' : 'Compléter';
    const btnClass = hasAdpToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';
    const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';
    
    // Compter les types d'ADP existantes pour ce jour
    const adpsToday = personne.adp ? personne.adp.filter(i => i.date === selectedDate) : [];
    const existingAdpTypes = new Set(adpsToday.map(t => (t.typeTransmission || '').toLowerCase()));
    const allTypes = ['jour', 'nuit', 'coordo'];
    const availableAdpTypes = allTypes.filter(t => !existingAdpTypes.has(t));
    const canAddMoreAdp = hasAdpToday && availableAdpTypes.length > 0;

    return `
      <div class="transmission-card ${hasAttention ? 'has-attention' : ''}" data-personne-id="${personne.id}">
        <div class="card-header">
          <h3>${personneNom}</h3>
          <div class="card-badges">
            ${badgeAttention}
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
          ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${infosALaDate.departement ? `<p><strong>Département:</strong> ${infosALaDate.departement}</p>` : ''}
          ${infosALaDate.typologie ? `<p><strong>Typologie:</strong> ${infosALaDate.typologie}</p>` : ''}
          ${!hasAdpToday && selectedDate ? '<p class="no-transmission-notice">Pas de maraude ADP pour ce jour</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card ${btnClass}" data-personne-id="${personne.id}" data-type="adp">${btnText}</button>
          ${hasAdpToday && adpsToday.length > 0 ? `<button class="btn-card btn-deplacer" data-personne-id="${personne.id}" data-interventions='${JSON.stringify(adpsToday.map(t => ({id: t.id, typeTransmission: t.typeTransmission})))}' data-type="adp" data-personne-nom="${personneNom}" data-date="${selectedDate}" title="Déplacer vers un autre type">Déplacer</button>` : ''}
          ${canAddMoreAdp ? `<button class="btn-card btn-nouvelle-transmission" data-personne-id="${personne.id}" data-type="adp" data-available-types="${availableAdpTypes.join(',')}" title="Ajouter une autre transmission ADP pour ce jour">+ Nouvelle ADP</button>` : ''}
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
      const typeActuel = btn.dataset.type;
      const personneNom = btn.dataset.personneNom;
      const personneId = parseInt(btn.dataset.personneId);
      const date = btn.dataset.date;
      let interventions = [];
      try {
        interventions = JSON.parse(btn.dataset.interventions || '[]');
      } catch (e) {
        console.error('Erreur parsing interventions:', e);
      }
      if (interventions.length > 0 && typeof window.afficherModaleDeplacementMultiple === 'function') {
        window.afficherModaleDeplacementMultiple(interventions, typeActuel, personneNom, personneId, date);
      }
    });
  });
  
  // Ajouter les événements aux boutons "Nouvelle transmission ADP"
  container.querySelectorAll('.btn-nouvelle-transmission[data-type="adp"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const personneId = parseInt(btn.dataset.personneId);
      const availableTypes = btn.dataset.availableTypes.split(',');
      if (personneId && typeof window.showNewTransmissionDropdown === 'function') {
        window.showNewTransmissionDropdown(btn, personneId, availableTypes, 'adp');
      }
    });
  });
  
  // Attacher le menu contextuel aux nouvelles cartes
  if (typeof window.attachContextMenuToAllCards === 'function') {
    window.attachContextMenuToAllCards();
  }
}

/**
 * Affiche toutes les personnes pour Point Accueil avec badges
 */
async function afficherToutesLesPersonnesPA() {
  const container = document.getElementById('point-accueil-list');
  if (!container) return;

  const personnes = await chargerToutesLesPersonnesAvecInterventions();

  // Filtrer les personnes archivées
  const personnesNonArchivees = personnes.filter(p => !p.archive);

  // Appliquer les filtres
  const personnesFiltrees = applyPAFilters(personnesNonArchivees);

  if (personnesFiltrees.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune personne pour le moment</p>';
    return;
  }

  const selectedDate = document.getElementById('pa-date')?.value;

  // Trier : personnes AVEC fiche Point Accueil pour la date sélectionnée en premier
  const personnesTriees = personnesFiltrees.sort((a, b) => {
    const aHasPA = a.pointAccueil && a.pointAccueil.some(i => i.date === selectedDate);
    const bHasPA = b.pointAccueil && b.pointAccueil.some(i => i.date === selectedDate);
    
    if (aHasPA && !bHasPA) return -1;
    if (!aHasPA && bHasPA) return 1;
    return 0; // Garder l'ordre original si les deux ont ou n'ont pas de fiche PA
  });

  container.innerHTML = personnesTriees.map(personne => {
    const badges = genererBadgesSourcesParDate(personne, selectedDate);
    const stats = compterInterventionsParDate(personne, selectedDate, 'pointAccueil');
    const badgeCount = genererBadgeInterventions(stats, selectedDate);
    const badgeAttention = genererBadgeAttention(personne);
    const hasAttention = personneAAttention(personne);
    
    // Récupérer les infos historiques valides pour cette date
    const infosALaDate = window.getInfosALaDate ? 
      window.getInfosALaDate(personne, selectedDate) : 
      {
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      };
    
    // Vérifier si une fiche Point Accueil existe pour cette date
    const paToday = personne.pointAccueil && personne.pointAccueil.find(i => i.date === selectedDate);
    const hasPAToday = !!paToday;
    const btnText = hasPAToday ? 'Voir/Modifier' : 'Compléter';
    const btnClass = hasPAToday ? 'btn-edit btn-modifier' : 'btn-edit btn-completer';
    const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';
    
    // Compter les types de Point Accueil existants pour ce jour
    const pasToday = personne.pointAccueil ? personne.pointAccueil.filter(i => i.date === selectedDate) : [];
    const existingPATypes = new Set(pasToday.map(t => (t.typeTransmission || '').toLowerCase()));
    const allTypes = ['jour', 'nuit', 'coordo'];
    const availablePATypes = allTypes.filter(t => !existingPATypes.has(t));
    const canAddMorePA = hasPAToday && availablePATypes.length > 0;

    return `
      <div class="transmission-card ${hasAttention ? 'has-attention' : ''}" data-personne-id="${personne.id}">
        <div class="card-header">
          <h3>${personneNom}</h3>
          <div class="card-badges">
            ${badgeAttention}
            ${badgeCount}
            ${badges}
          </div>
        </div>
        <div class="card-body">
          ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
          ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
          ${infosALaDate.departement ? `<p><strong>Département:</strong> ${infosALaDate.departement}</p>` : ''}
          ${infosALaDate.typologie ? `<p><strong>Typologie:</strong> ${infosALaDate.typologie}</p>` : ''}
          ${!hasPAToday && selectedDate ? '<p class="no-transmission-notice">Pas de point accueil pour ce jour</p>' : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card ${btnClass}" data-personne-id="${personne.id}" data-type="pointAccueil">${btnText}</button>
          ${hasPAToday && pasToday.length > 0 ? `<button class="btn-card btn-deplacer" data-personne-id="${personne.id}" data-interventions='${JSON.stringify(pasToday.map(t => ({id: t.id, typeTransmission: t.typeTransmission})))}' data-type="pointAccueil" data-personne-nom="${personneNom}" data-date="${selectedDate}" title="Déplacer vers un autre type">Déplacer</button>` : ''}
          ${canAddMorePA ? `<button class="btn-card btn-nouvelle-transmission" data-personne-id="${personne.id}" data-type="pointAccueil" data-available-types="${availablePATypes.join(',')}" title="Ajouter une autre transmission Point Accueil pour ce jour">+ Nouvelle PA</button>` : ''}
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
      const typeActuel = btn.dataset.type;
      const personneNom = btn.dataset.personneNom;
      const personneId = parseInt(btn.dataset.personneId);
      const date = btn.dataset.date;
      let interventions = [];
      try {
        interventions = JSON.parse(btn.dataset.interventions || '[]');
      } catch (e) {
        console.error('Erreur parsing interventions:', e);
      }
      if (interventions.length > 0 && typeof window.afficherModaleDeplacementMultiple === 'function') {
        window.afficherModaleDeplacementMultiple(interventions, typeActuel, personneNom, personneId, date);
      }
    });
  });
  
  // Ajouter les événements aux boutons "Nouvelle transmission Point Accueil"
  container.querySelectorAll('.btn-nouvelle-transmission[data-type="pointAccueil"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const personneId = parseInt(btn.dataset.personneId);
      const availableTypes = btn.dataset.availableTypes.split(',');
      if (personneId && typeof window.showNewTransmissionDropdown === 'function') {
        window.showNewTransmissionDropdown(btn, personneId, availableTypes, 'pointAccueil');
      }
    });
  });
  
  // Attacher le menu contextuel aux nouvelles cartes
  if (typeof window.attachContextMenuToAllCards === 'function') {
    window.attachContextMenuToAllCards();
  }
}

/**
 * Affiche un dropdown pour choisir le type de nouvelle transmission
 */
function showNewTransmissionDropdown(btn, personneId, availableTypes, interventionType) {
  // Fermer tout dropdown existant
  const existingDropdown = document.querySelector('.new-transmission-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }
  
  // Créer le dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'new-transmission-dropdown';
  dropdown.innerHTML = availableTypes.map(type => 
    `<button class="dropdown-option" data-type="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</button>`
  ).join('');
  
  // Positionner le dropdown sous le bouton
  const rect = btn.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = `${rect.bottom + 5}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.zIndex = '10000';
  
  document.body.appendChild(dropdown);
  
  // Gestionnaire de clic sur les options
  dropdown.querySelectorAll('.dropdown-option').forEach(option => {
    option.addEventListener('click', async () => {
      const selectedType = option.dataset.type;
      dropdown.remove();
      
      // Ouvrir le formulaire correspondant avec le type pré-sélectionné
      if (interventionType === 'transmissions') {
        if (typeof window.editTransmission === 'function') {
          await window.editTransmission(personneId, null, false, selectedType);
        }
      } else if (interventionType === 'adp') {
        if (typeof window.editTransmissionAdp === 'function') {
          await window.editTransmissionAdp(personneId, null, false, selectedType);
        }
      } else if (interventionType === 'pointAccueil') {
        if (typeof window.modifierFichePA === 'function') {
          await window.modifierFichePA(personneId, null, false, selectedType);
        }
      }
    });
  });
  
  // Fermer le dropdown en cliquant ailleurs
  const closeHandler = (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

// Exports
if (typeof window !== 'undefined') {
  window.fuzzyMatch = fuzzyMatch;
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
  window.showNewTransmissionDropdown = showNewTransmissionDropdown;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fuzzyMatch,
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