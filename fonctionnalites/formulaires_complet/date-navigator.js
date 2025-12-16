/**
 * Gestion du navigateur de dates et des onglets de type de transmission
 * Les onglets n'apparaissent que quand plusieurs transmissions existent pour UN MÊME JOUR
 */

// Configuration active pour chaque type de formulaire
let activeNavigatorConfigs = {};

/**
 * Initialise le navigateur de dates et les onglets pour un formulaire
 * @param {Object} config - Configuration
 * @param {string} config.type - Type de formulaire (transmissions, adp, pointAccueil)
 * @param {number} config.personneId - ID de la personne
 * @param {string} config.currentDate - Date courante
 * @param {string} config.currentTypeTransmission - Type de transmission actuel
 * @param {Function} config.onDateChange - Callback appelé quand la date change
 * @param {boolean} config.hideToday - Si true, ne pas afficher la date du jour (mode consultation)
 */
async function initDateNavigator(config) {
  const { type, personneId, currentDate, currentTypeTransmission, onDateChange, hideToday } = config;
  
  const typeConfig = {
    'transmissions': {
      navigatorId: 'date-navigator-transmissions',
      tabsId: 'transmission-tabs',
      dateInputId: 'select-date-transmission',
      prevBtnId: 'btn-date-prev',
      nextBtnId: 'btn-date-next',
      titleId: 'modal-titre-personne',
      interventionType: 'transmissions',
      addContainerId: 'add-transmission-container',
      addBtnId: 'btn-add-transmission-transmissions',
      addDropdownId: 'add-transmission-dropdown-transmissions'
    },
    'adp': {
      navigatorId: 'date-navigator-adp',
      tabsId: 'adp-transmission-tabs',
      dateInputId: 'select-date-adp',
      prevBtnId: 'adp-btn-date-prev',
      nextBtnId: 'adp-btn-date-next',
      titleId: 'adp-modal-titre-personne',
      interventionType: 'adp',
      addContainerId: 'adp-add-transmission-container',
      addBtnId: 'btn-add-transmission-adp',
      addDropdownId: 'add-transmission-dropdown-adp'
    },
    'pointAccueil': {
      navigatorId: 'date-navigator-pa',
      tabsId: 'pa-transmission-tabs',
      dateInputId: 'select-date-pa',
      prevBtnId: 'pa-btn-date-prev',
      nextBtnId: 'pa-btn-date-next',
      titleId: 'pa-modal-titre-personne',
      interventionType: 'pointAccueil',
      addContainerId: 'pa-add-transmission-container',
      addBtnId: 'btn-add-transmission-pa',
      addDropdownId: 'add-transmission-dropdown-pa'
    }
  };
  
  const cfg = typeConfig[type];
  if (!cfg) {
    console.error('Type de formulaire inconnu:', type);
    return;
  }
  
  const navigator = document.getElementById(cfg.navigatorId);
  const tabs = document.getElementById(cfg.tabsId);
  const dateInput = document.getElementById(cfg.dateInputId);
  const prevBtn = document.getElementById(cfg.prevBtnId);
  const nextBtn = document.getElementById(cfg.nextBtnId);
  const title = document.getElementById(cfg.titleId);
  
  if (!navigator || !dateInput) {
    console.warn('Navigateur de dates non trouvé pour:', type);
    return;
  }
  
  // Charger la personne pour afficher son nom
  const personne = await window.getPersonneById(personneId);
  if (personne && title) {
    const displayName = personne.inconnu ? 'Personne inconnue' : 
      `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Personne';
    title.textContent = displayName;
  }
  
  // Charger toutes les interventions de cette personne
  // S'assurer que personneId est un nombre pour la comparaison
  const numericPersonneId = typeof personneId === 'string' ? parseInt(personneId, 10) : personneId;
  
  const allInterventions = await window.getAllInterventions();
  console.log('📅 Total interventions en BDD:', allInterventions.length);
  console.log('📅 Recherche pour personneId:', numericPersonneId, '(type:', typeof numericPersonneId, ')');
  
  const personInterventions = allInterventions
    .filter(i => {
      // Convertir aussi l'ID de l'intervention en nombre pour comparaison
      const iPersonneId = typeof i.personneId === 'string' ? parseInt(i.personneId, 10) : i.personneId;
      return iPersonneId === numericPersonneId && i.type === cfg.interventionType;
    });
  
  console.log('📅 Interventions trouvées pour', type, ':', personInterventions.length);
  if (personInterventions.length > 0) {
    console.log('📅 Dates des interventions:', personInterventions.map(i => i.date).join(', '));
  }
  
  // Stocker les données pour les recherches rapides
  const interventionsMap = new Map();
  const uniqueDates = new Set();
  
  personInterventions.forEach(i => {
    // Normaliser le typeTransmission (anciennes données peuvent ne pas en avoir)
    const typeT = i.typeTransmission || 'Jour'; // Par défaut 'Jour' si non défini
    const key = `${i.date}|${typeT}`;
    interventionsMap.set(key, i);
    uniqueDates.add(i.date);
    console.log('📊 Stocké intervention:', key, 'ID:', i.id);
  });
  
  // Trier les dates (plus récente en premier)
  const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
  
  // Ajouter la date du jour si elle n'existe pas
  const today = new Date().toISOString().split('T')[0];
  const todayExists = sortedDates.includes(today);
  
  // Remplir le select avec les dates (sans la date du jour si hideToday est true)
  populateDateSelect(dateInput, sortedDates, today, currentDate, hideToday);
  
  // Initialiser la date
  const initialDate = currentDate || (sortedDates.length > 0 ? sortedDates[0] : today);
  dateInput.value = initialDate;
  
  // Trouver les transmissions pour la date initiale
  const transmissionsForDate = getTransmissionsForDate(interventionsMap, initialDate);
  
  console.log('📊 Transmissions pour cette date:', transmissionsForDate.length, transmissionsForDate);
  
  // Stocker la configuration
  activeNavigatorConfigs[type] = {
    personneId,
    interventionsMap,
    sortedDates,
    currentDate: initialDate,
    currentTypeTransmission: currentTypeTransmission || null,
    onDateChange,
    cfg,
    hideToday: hideToday || false
  };
  
  // Afficher le navigateur
  navigator.style.display = 'flex';
  
  // Mettre à jour l'interface (onglets et bouton)
  updateTabsDisplay(type, initialDate, transmissionsForDate, currentTypeTransmission);
  updateAddButtonState(type, initialDate, transmissionsForDate);
  
  // Mettre à jour l'état des boutons de navigation
  updateNavButtonsState(type, sortedDates, initialDate, prevBtn, nextBtn);
  
  // Gestionnaire de changement de date
  dateInput.onchange = async () => {
    const newDate = dateInput.value;
    console.log('📅 ===== CHANGEMENT DE DATE =====');
    console.log('📅 Nouvelle date sélectionnée:', newDate);
    console.log('📅 Type de formulaire:', type);
    console.log('📅 onDateChange défini:', !!onDateChange);
    
    activeNavigatorConfigs[type].currentDate = newDate;
    
    // Mettre à jour l'état des boutons
    updateNavButtonsState(type, activeNavigatorConfigs[type].sortedDates, newDate, prevBtn, nextBtn);
    
    // Récupérer les transmissions pour cette nouvelle date depuis le cache
    const newTransmissions = getTransmissionsForDate(interventionsMap, newDate);
    console.log('📅 Transmissions trouvées dans le cache pour cette date:', newTransmissions.length);
    
    // Mettre à jour l'interface
    updateTabsDisplay(type, newDate, newTransmissions);
    updateAddButtonState(type, newDate, newTransmissions);
    
    // TOUJOURS appeler onDateChange pour charger les données depuis la BDD
    // Que des transmissions existent dans le cache ou non
    if (onDateChange) {
      const activeType = newTransmissions.length > 0 ? newTransmissions[0].typeTransmission : null;
      activeNavigatorConfigs[type].currentTypeTransmission = activeType;
      console.log('📅 Appel de onDateChange avec:', { newDate, activeType });
      await onDateChange(newDate, activeType);
      console.log('📅 onDateChange terminé');
    } else {
      console.warn('📅 ⚠️ onDateChange non défini !');
    }
  };
  
  // Gestionnaires pour les boutons de navigation (naviguer entre dates existantes)
  if (prevBtn) {
    prevBtn.onclick = () => {
      const config = activeNavigatorConfigs[type];
      const dates = config.sortedDates;
      const currentIdx = dates.indexOf(dateInput.value);
      // Dates triées du plus récent au plus ancien, donc "précédent" = date plus ancienne = index + 1
      if (currentIdx < dates.length - 1) {
        dateInput.value = dates[currentIdx + 1];
        dateInput.dispatchEvent(new Event('change'));
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.onclick = () => {
      const config = activeNavigatorConfigs[type];
      const dates = config.sortedDates;
      const currentIdx = dates.indexOf(dateInput.value);
      // Dates triées du plus récent au plus ancien, donc "suivant" = date plus récente = index - 1
      if (currentIdx > 0) {
        dateInput.value = dates[currentIdx - 1];
        dateInput.dispatchEvent(new Event('change'));
      }
    };
  }
  
  // Configurer le bouton d'ajout
  setupAddButton(type, cfg, dateInput, onDateChange);
  
  // Configurer les gestionnaires de clic sur les onglets
  setupTabClickHandlers(type, onDateChange);
  
  console.log('✅ Navigateur de dates initialisé pour', type);
  
  return {
    currentDate: initialDate,
    currentTypeTransmission: transmissionsForDate[0]?.typeTransmission || null
  };
}

/**
 * Met à jour l'état des boutons de navigation (désactivés aux extrémités)
 */
function updateNavButtonsState(type, sortedDates, currentDate, prevBtn, nextBtn) {
  const currentIdx = sortedDates.indexOf(currentDate);
  
  if (prevBtn) {
    // Désactiver "précédent" si on est à la date la plus ancienne
    const isAtOldest = currentIdx === sortedDates.length - 1 || currentIdx === -1;
    prevBtn.disabled = isAtOldest;
    prevBtn.style.opacity = isAtOldest ? '0.3' : '1';
    prevBtn.style.cursor = isAtOldest ? 'not-allowed' : 'pointer';
  }
  
  if (nextBtn) {
    // Désactiver "suivant" si on est à la date la plus récente
    const isAtNewest = currentIdx === 0 || currentIdx === -1;
    nextBtn.disabled = isAtNewest;
    nextBtn.style.opacity = isAtNewest ? '0.3' : '1';
    nextBtn.style.cursor = isAtNewest ? 'not-allowed' : 'pointer';
  }
}

/**
 * Formate une date pour l'affichage dans le select
 */
function formatDateForDisplay(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  const formatted = date.toLocaleDateString('fr-FR', options);
  
  // Vérifier si c'est aujourd'hui
  const dateOnly = new Date(dateStr);
  dateOnly.setHours(0, 0, 0, 0);
  
  if (dateOnly.getTime() === today.getTime()) {
    return `📍 ${formatted} (Aujourd'hui)`;
  }
  
  return formatted;
}

/**
 * Remplit le select avec les dates des transmissions existantes
 * @param {HTMLSelectElement} selectElement - L'élément select
 * @param {Array} sortedDates - Les dates triées
 * @param {string} today - La date du jour
 * @param {string} currentDate - La date à sélectionner
 * @param {boolean} hideToday - Si true, ne pas ajouter la date du jour (mode consultation)
 */
function populateDateSelect(selectElement, sortedDates, today, currentDate, hideToday = false) {
  // Vider le select
  selectElement.innerHTML = '';
  
  // Si aucune date et hideToday est activé, afficher un message
  if (sortedDates.length === 0 && hideToday) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Aucune transmission';
    option.disabled = true;
    selectElement.appendChild(option);
    return;
  }
  
  // Si aucune date et hideToday n'est pas activé, ajouter aujourd'hui
  if (sortedDates.length === 0) {
    const option = document.createElement('option');
    option.value = today;
    option.textContent = formatDateForDisplay(today) + ' (Nouvelle)';
    option.className = 'option-today option-new';
    selectElement.appendChild(option);
    return;
  }
  
  // Ajouter les dates existantes
  sortedDates.forEach(date => {
    const option = document.createElement('option');
    option.value = date;
    option.textContent = formatDateForDisplay(date);
    
    if (date === today) {
      option.className = 'option-today';
    }
    
    selectElement.appendChild(option);
  });
  
  // Ajouter "Aujourd'hui" si pas présent ET si hideToday n'est pas activé
  if (!hideToday && !sortedDates.includes(today)) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '────────────';
    selectElement.appendChild(separator);
    
    const todayOption = document.createElement('option');
    todayOption.value = today;
    todayOption.textContent = formatDateForDisplay(today) + ' (Nouvelle)';
    todayOption.className = 'option-today option-new';
    selectElement.appendChild(todayOption);
  }
  
  // Sélectionner la date courante ou la plus récente
  if (currentDate && sortedDates.includes(currentDate)) {
    selectElement.value = currentDate;
  } else if (sortedDates.length > 0) {
    selectElement.value = sortedDates[0];
  } else if (!hideToday) {
    selectElement.value = today;
  }
}

/**
 * Récupère les transmissions pour une date donnée
 */
function getTransmissionsForDate(interventionsMap, date) {
  console.log('🔍 Recherche transmissions pour date:', date);
  
  const transmissions = [];
  const keysInCache = Array.from(interventionsMap.keys());
  console.log('🔍 Clés dans le cache:', keysInCache);
  
  // Parcourir toutes les clés du cache et trouver celles qui correspondent à la date
  keysInCache.forEach(key => {
    // La clé est au format "date|typeTransmission"
    const [keyDate, keyType] = key.split('|');
    
    if (keyDate === date) {
      const intervention = interventionsMap.get(key);
      const typeTransmission = keyType || intervention.typeTransmission || 'Jour';
      const capitalizedType = typeTransmission.charAt(0).toUpperCase() + typeTransmission.slice(1).toLowerCase();
      
      // Éviter les doublons
      if (!transmissions.find(t => t.typeTransmission.toLowerCase() === capitalizedType.toLowerCase())) {
        transmissions.push({
          typeTransmission: capitalizedType,
          data: intervention
        });
        console.log('🔍 Trouvé:', capitalizedType, 'pour date', date);
      }
    }
  });
  
  // Si aucune transmission trouvée avec la méthode par clé, essayer une recherche directe
  if (transmissions.length === 0) {
    console.log('🔍 Recherche alternative dans le cache...');
    interventionsMap.forEach((intervention, key) => {
      if (intervention.date === date) {
        const typeTransmission = intervention.typeTransmission || 'Jour';
        const capitalizedType = typeTransmission.charAt(0).toUpperCase() + typeTransmission.slice(1).toLowerCase();
        
        if (!transmissions.find(t => t.typeTransmission.toLowerCase() === capitalizedType.toLowerCase())) {
          transmissions.push({
            typeTransmission: capitalizedType,
            data: intervention
          });
          console.log('🔍 Trouvé (alt):', capitalizedType, 'pour date', date);
        }
      }
    });
  }
  
  console.log('🔍 Transmissions trouvées:', transmissions.length, transmissions.map(t => t.typeTransmission));
  return transmissions;
}

/**
 * Met à jour l'affichage des onglets
 * Les onglets ne sont affichés que s'il y a 2+ transmissions pour ce jour
 */
function updateTabsDisplay(type, date, transmissionsForDate, activeType = null) {
  const config = activeNavigatorConfigs[type];
  if (!config) return;
  
  const { cfg } = config;
  const tabs = document.getElementById(cfg.tabsId);
  
  if (!tabs) return;
  
  const tabButtons = tabs.querySelectorAll('.transmission-tab');
  
  // Masquer tous les onglets si moins de 2 transmissions
  if (transmissionsForDate.length < 2) {
    tabs.style.display = 'none';
    console.log('🚫 Onglets masqués - moins de 2 transmissions pour ce jour');
    return;
  }
  
  // Afficher les onglets
  tabs.style.display = 'flex';
  
  // N'afficher que les onglets qui ont des données
  const existingTypes = new Set(transmissionsForDate.map(t => t.typeTransmission.toLowerCase()));
  
  tabButtons.forEach(tab => {
    const tabType = tab.dataset.type.toLowerCase();
    if (existingTypes.has(tabType)) {
      tab.style.display = 'inline-flex';
      // Mettre à jour le libellé avec le type de transmission
      const label = tab.querySelector('.tab-label');
      if (label) {
        const transmission = transmissionsForDate.find(t => t.typeTransmission.toLowerCase() === tabType);
        if (transmission) {
          label.textContent = transmission.typeTransmission;
        }
      }
    } else {
      tab.style.display = 'none';
    }
  });
  
  // Activer le bon onglet
  const typeToActivate = activeType || transmissionsForDate[0]?.typeTransmission;
  if (typeToActivate) {
    activateTab(type, typeToActivate);
  }
  
  console.log('✅ Onglets affichés:', transmissionsForDate.map(t => t.typeTransmission).join(', '));
}

/**
 * Met à jour l'état du bouton d'ajout
 * Le bouton n'apparaît que si au moins une transmission existe pour ce jour
 * ET qu'il reste des types disponibles
 */
function updateAddButtonState(type, date, transmissionsForDate) {
  const config = activeNavigatorConfigs[type];
  if (!config) return;
  
  const { cfg } = config;
  const addContainer = document.getElementById(cfg.addContainerId);
  const addDropdown = document.getElementById(cfg.addDropdownId);
  
  if (!addContainer) return;
  
  const existingCount = transmissionsForDate.length;
  const maxTypes = 3; // Jour, Nuit, Coordo
  
  // Afficher le bouton seulement si :
  // - Au moins une transmission existe pour ce jour
  // - Il reste des types disponibles (pas les 3 déjà utilisés)
  if (existingCount >= 1 && existingCount < maxTypes) {
    addContainer.style.display = 'inline-block';
    
    // Mettre à jour le dropdown pour désactiver les types existants
    if (addDropdown) {
      const existingTypes = new Set(transmissionsForDate.map(t => t.typeTransmission.toLowerCase()));
      const items = addDropdown.querySelectorAll('.dropdown-item');
      items.forEach(item => {
        const itemType = item.dataset.type.toLowerCase();
        item.disabled = existingTypes.has(itemType);
      });
    }
    
    console.log('✅ Bouton ajouter affiché - transmissions existantes:', existingCount);
  } else {
    addContainer.style.display = 'none';
    console.log('🚫 Bouton ajouter masqué - transmissions:', existingCount);
  }
}

/**
 * Configure le bouton d'ajout de nouvelle transmission
 */
function setupAddButton(type, cfg, dateInput, onDateChange) {
  const addContainer = document.getElementById(cfg.addContainerId);
  const addBtn = document.getElementById(cfg.addBtnId);
  const addDropdown = document.getElementById(cfg.addDropdownId);
  
  if (!addContainer || !addBtn || !addDropdown) return;
  
  // Masquer par défaut
  addContainer.style.display = 'none';
  
  // Toggle du dropdown
  addBtn.onclick = (e) => {
    e.stopPropagation();
    const isVisible = addDropdown.style.display === 'block';
    addDropdown.style.display = isVisible ? 'none' : 'block';
  };
  
  // Gestionnaires pour chaque option du dropdown
  const dropdownItems = addDropdown.querySelectorAll('.dropdown-item');
  dropdownItems.forEach(item => {
    item.onclick = async (e) => {
      e.stopPropagation();
      
      if (item.disabled) return;
      
      const newTypeTransmission = item.dataset.type;
      console.log('➕ Création nouvelle transmission:', newTypeTransmission);
      
      // Fermer le dropdown
      addDropdown.style.display = 'none';
      
      // Activer l'onglet correspondant (sera créé si nécessaire)
      activeNavigatorConfigs[type].currentTypeTransmission = newTypeTransmission;
      
      // Appeler le callback avec isNew = true pour réinitialiser le formulaire
      const currentDate = dateInput.value;
      if (onDateChange) {
        await onDateChange(currentDate, newTypeTransmission, true);
      }
    };
  });
  
  // Fermer le dropdown en cliquant ailleurs
  document.addEventListener('click', (e) => {
    if (!addContainer.contains(e.target)) {
      addDropdown.style.display = 'none';
    }
  });
}

/**
 * Active un onglet spécifique
 */
function activateTab(type, typeTransmission) {
  const config = activeNavigatorConfigs[type];
  if (!config) return;
  
  const { cfg, onDateChange } = config;
  const tabs = document.getElementById(cfg.tabsId);
  
  if (tabs) {
    const tabButtons = tabs.querySelectorAll('.transmission-tab');
    tabButtons.forEach(tab => {
      const tabType = tab.dataset.type;
      if (tabType.toLowerCase() === typeTransmission.toLowerCase()) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }
  
  // Mettre à jour le champ type de transmission dans le formulaire
  const typeFields = {
    'transmissions': 'form-type-transmission',
    'adp': 'adp-form-type-transmission',
    'pointAccueil': 'form-pa-type-transmission'
  };
  
  const typeField = document.getElementById(typeFields[type]);
  if (typeField) {
    // Chercher l'option correspondante (insensible à la casse)
    const options = typeField.querySelectorAll('option');
    options.forEach(opt => {
      if (opt.value.toLowerCase() === typeTransmission.toLowerCase()) {
        typeField.value = opt.value;
      }
    });
  }
}

/**
 * Configure les gestionnaires de clic sur les onglets
 */
function setupTabClickHandlers(type, onDateChange) {
  const config = activeNavigatorConfigs[type];
  if (!config) return;
  
  const { cfg } = config;
  const tabs = document.getElementById(cfg.tabsId);
  
  if (!tabs) return;
  
  const tabButtons = tabs.querySelectorAll('.transmission-tab');
  tabButtons.forEach(tab => {
    tab.onclick = async () => {
      const typeTransmission = tab.dataset.type;
      console.log('📑 Clic sur onglet:', typeTransmission);
      
      activateTab(type, typeTransmission);
      activeNavigatorConfigs[type].currentTypeTransmission = typeTransmission;
      
      const currentDate = config.currentDate;
      if (onDateChange) {
        await onDateChange(currentDate, typeTransmission);
      }
    };
  });
}

/**
 * Cache le navigateur de dates
 */
function hideDateNavigator(type) {
  const navigatorIds = {
    'transmissions': 'date-navigator-transmissions',
    'adp': 'date-navigator-adp',
    'pointAccueil': 'date-navigator-pa'
  };
  
  const tabsIds = {
    'transmissions': 'transmission-tabs',
    'adp': 'adp-transmission-tabs',
    'pointAccueil': 'pa-transmission-tabs'
  };
  
  const addContainerIds = {
    'transmissions': 'add-transmission-container',
    'adp': 'adp-add-transmission-container',
    'pointAccueil': 'pa-add-transmission-container'
  };
  
  const navigator = document.getElementById(navigatorIds[type]);
  const tabs = document.getElementById(tabsIds[type]);
  const addContainer = document.getElementById(addContainerIds[type]);
  
  if (navigator) navigator.style.display = 'none';
  if (tabs) tabs.style.display = 'none';
  if (addContainer) addContainer.style.display = 'none';
  
  // Nettoyer la configuration
  delete activeNavigatorConfigs[type];
}

/**
 * Réinitialise le titre du modal
 */
function resetModalTitle(type, defaultTitle) {
  const titleIds = {
    'transmissions': 'modal-titre-personne',
    'adp': 'adp-modal-titre-personne',
    'pointAccueil': 'pa-modal-titre-personne'
  };
  
  const title = document.getElementById(titleIds[type]);
  if (title) {
    title.textContent = defaultTitle;
  }
}

/**
 * Rafraîchit le navigateur après un enregistrement
 * Doit être appelé après avoir sauvegardé une transmission
 */
async function refreshNavigator(type) {
  const config = activeNavigatorConfigs[type];
  if (!config) return;
  
  const { personneId, currentDate, currentTypeTransmission, onDateChange, cfg, hideToday } = config;
  
  // Recharger les interventions
  const allInterventions = await window.getAllInterventions();
  const personInterventions = allInterventions
    .filter(i => i.personneId === personneId && i.type === cfg.interventionType);
  
  // Mettre à jour la map et les dates
  const interventionsMap = new Map();
  const uniqueDates = new Set();
  
  personInterventions.forEach(i => {
    const typeT = i.typeTransmission || 'Jour';
    const key = `${i.date}|${typeT}`;
    interventionsMap.set(key, i);
    uniqueDates.add(i.date);
  });
  
  // Trier les dates (plus récente en premier)
  const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
  
  config.interventionsMap = interventionsMap;
  config.sortedDates = sortedDates;
  
  // Mettre à jour le select des dates
  const dateInput = document.getElementById(cfg.dateInputId);
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) {
    populateDateSelect(dateInput, sortedDates, today, currentDate, hideToday);
    dateInput.value = currentDate;
  }
  
  // Récupérer les transmissions pour la date actuelle
  const transmissionsForDate = getTransmissionsForDate(interventionsMap, currentDate);
  
  // Mettre à jour l'interface
  updateTabsDisplay(type, currentDate, transmissionsForDate, currentTypeTransmission);
  updateAddButtonState(type, currentDate, transmissionsForDate);
  
  // Configurer les handlers de clic sur les onglets
  setupTabClickHandlers(type, onDateChange);
  
  console.log('🔄 Navigateur rafraîchi pour', type);
}

// Exposer les fonctions globalement
window.initDateNavigator = initDateNavigator;
window.hideDateNavigator = hideDateNavigator;
window.resetModalTitle = resetModalTitle;
window.refreshNavigator = refreshNavigator;
window.activateTab = activateTab;
