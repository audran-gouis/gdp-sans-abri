// Script du processus de rendu
document.addEventListener('DOMContentLoaded', () => {
  // ==================== INDEXEDDB POUR TRANSMISSIONS ====================
  let db;
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2; // Augmenter la version pour migration
  const STORE_NAME = 'transmissions';

  // Initialiser IndexedDB
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erreur lors de l\'ouverture de la base de données');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('Base de données ouverte avec succès');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        // Créer l'object store pour les transmissions
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Créer des index pour faciliter les recherches
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('ville', 'ville', { unique: false });
          objectStore.createIndex('dateCreation', 'dateCreation', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          
          console.log('Object store créé avec succès');
        } else {
          // Migration : Ajouter l'index dateTransmission si nécessaire
          const transaction = event.target.transaction;
          const objectStore = transaction.objectStore(STORE_NAME);
          
          if (!objectStore.indexNames.contains('dateTransmission')) {
            objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
            console.log('Index dateTransmission ajouté');
          }
        }
      };
    });
  };

  // Ajouter une transmission dans la base de données
  const addTransmission = (data) => {
    return new Promise((resolve, reject) => {
      // Ajouter la date de création et la date de transmission sélectionnée
      data.dateCreation = new Date().toISOString();
      data.dateTransmission = document.getElementById('transmissions-date').value || new Date().toISOString().split('T')[0];
      
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.add(data);

      request.onsuccess = () => {
        console.log('Transmission ajoutée avec succès, ID:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erreur lors de l\'ajout de la transmission');
        reject(request.error);
      };
    });
  };

  // Récupérer toutes les transmissions
  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Supprimer une transmission
  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Transmission supprimée avec succès');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Mettre à jour une transmission
  const updateTransmission = (data) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(data);

      request.onsuccess = () => {
        console.log('Transmission mise à jour avec succès');
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Initialiser la base de données au chargement
  initDB().then(() => {
    // Charger et afficher les cartes au démarrage
    loadAndDisplayCards();
  }).catch(error => {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  });

  // ==================== AFFICHAGE DES CARTES ====================
  
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Fonction pour regrouper les transmissions par personne
  const groupTransmissionsByPerson = (transmissions) => {
    const personsMap = new Map();
    
    console.log('=== REGROUPEMENT DES TRANSMISSIONS ===');
    console.log('Nombre total de transmissions:', transmissions.length);
    
    transmissions.forEach(transmission => {
      const personId = transmission.personId || transmission.id;
      
      console.log('Transmission ID:', transmission.id, '| personId:', transmission.personId, '| Utilisé:', personId);
      
      if (!personsMap.has(personId)) {
        // Première transmission de cette personne - utiliser comme référence
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
        console.log('  -> Nouvelle personne créée avec personId:', personId);
      } else {
        console.log('  -> Ajout à la personne existante avec personId:', personId);
      }
      
      // Ajouter cette transmission à la liste
      personsMap.get(personId).transmissions.push(transmission);
    });
    
    console.log('Nombre de personnes uniques:', personsMap.size);
    
    return Array.from(personsMap.values());
  };

  // Fonction pour créer une carte HTML pour une personne avec données de la date sélectionnée
  const createPersonCard = (person, selectedDate) => {
    const card = document.createElement('div');
    card.className = 'transmission-card';
    card.dataset.personId = person.personId;

    // Chercher la transmission correspondant à la date sélectionnée
    const transmissionForDate = person.transmissions.find(t => 
      t.dateTransmission === selectedDate
    );

    // Nombre total de transmissions
    const transmissionsCount = person.transmissions.length;

    // Utiliser les données de la transmission pour la date ou celles de la personne par défaut
    const displayData = transmissionForDate || person;

    // Si une transmission existe pour cette date, afficher ses détails
    let transmissionContent = '';
    if (transmissionForDate) {
      // Construire les badges pour les interventions
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
        ${transmissionForDate.transmission ? `
          <div class="card-info">
            <span class="card-label">Commentaire :</span>
            <span class="card-value">${transmissionForDate.transmission}</span>
          </div>
        ` : ''}
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      `;
    } else {
      transmissionContent = `
        <div class="card-info empty-transmission">
          <span class="card-value">Aucune transmission pour cette date</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${displayData.nom || 'Nom inconnu'} ${displayData.prenom || ''}</h3>
        <span class="card-date">${transmissionsCount} transmission${transmissionsCount > 1 ? 's' : ''}</span>
      </div>
      <div class="card-content">
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
        ${displayData.nbPersonnes ? `
          <div class="card-info">
            <span class="card-label">Nombre :</span>
            <span class="card-value">${displayData.nbPersonnes} personne${displayData.nbPersonnes > 1 ? 's' : ''}</span>
          </div>
        ` : ''}
        ${displayData.mineurs && displayData.mineurs !== '0' ? `
          <div class="card-info">
            <span class="card-label">dont Mineurs :</span>
            <span class="card-value">${displayData.mineurs}</span>
          </div>
        ` : ''}
        <div class="card-separator"></div>
        <div class="card-transmission-data">
          <h4 class="transmission-title">Transmission du ${formatDate(selectedDate)}</h4>
          ${transmissionContent}
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-card btn-edit" data-person-id="${person.personId}">Compléter</button>
        <button class="btn-card btn-delete" data-person-id="${person.personId}">Supprimer</button>
      </div>
    `;

    // Ajouter les event listeners aux boutons
    const btnEdit = card.querySelector('.btn-edit');
    const btnDelete = card.querySelector('.btn-delete');
    
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        // Utiliser l'ID de la première transmission pour charger les infos de base
        const firstTransmissionId = person.transmissions[0].id;
        editTransmission(firstTransmissionId);
      });
    }
    
    if (btnDelete) {
      btnDelete.addEventListener('click', () => deletePersonCard(person.personId));
    }

    return card;
  };

  // Fonction pour afficher toutes les cartes
  const displayCards = (transmissions) => {
    const container = document.getElementById('transmissions-list');
    const selectedDate = document.getElementById('transmissions-date').value;
    
    if (!transmissions || transmissions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>Aucune transmission enregistrée</p>
        </div>
      `;
      return;
    }

    // Regrouper les transmissions par personne
    const persons = groupTransmissionsByPerson(transmissions);

    container.innerHTML = '';
    persons.forEach(person => {
      const card = createPersonCard(person, selectedDate);
      container.appendChild(card);
    });
  };

  // Fonction pour charger et afficher les cartes
  const loadAndDisplayCards = async () => {
    try {
      const transmissions = await getAllTransmissions();
      applyFiltersAndDisplay(transmissions);
    } catch (error) {
      console.error('Erreur lors du chargement des transmissions:', error);
    }
  };

  // Fonction pour filtrer et afficher les cartes
  const applyFiltersAndDisplay = (transmissions) => {
    const filterNom = document.getElementById('filter-nom').value.toLowerCase().trim();
    const filterPrenom = document.getElementById('filter-prenom').value.toLowerCase().trim();
    const filterDdn = document.getElementById('filter-ddn').value;

    // Filtrer les transmissions
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

    displayCards(filteredTransmissions);
  };

  // Fonction globale pour supprimer une transmission
  window.deleteTransmissionCard = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transmission ?')) {
      try {
        await deleteTransmission(id);
        await loadAndDisplayCards();
        console.log('Transmission supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la transmission');
      }
    }
  };

  // Fonction globale pour supprimer une personne et toutes ses transmissions
  window.deletePersonCard = async (personId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses transmissions ?')) {
      try {
        // Récupérer toutes les transmissions
        const allTransmissions = await getAllTransmissions();
        
        // Filtrer les transmissions de cette personne
        const personTransmissions = allTransmissions.filter(t => 
          (t.personId || t.id) === personId
        );
        
        // Supprimer toutes les transmissions de cette personne
        for (const transmission of personTransmissions) {
          await deleteTransmission(transmission.id);
        }
        
        await loadAndDisplayCards();
        console.log('Personne et ses transmissions supprimées avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la personne');
      }
    }
  };

  // Fonction pour trouver une transmission pour une personne à une date donnée
  const findTransmissionByPersonAndDate = async (personId, dateTransmission) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const transmissions = request.result;
        // Chercher une transmission avec la même personne (via personId) et la même date
        const found = transmissions.find(t => 
          t.personId === personId && t.dateTransmission === dateTransmission
        );
        resolve(found);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Fonction pour s'assurer que tous les champs de transmission sont éditables
  const enableTransmissionFields = () => {
    // Réactiver TOUS les champs du formulaire (transmission ET informations personnelles)
    const allInputs = [
      'form-nom',
      'form-prenom',
      'form-ddn',
      'form-typologie',
      'form-nb-personnes',
      'form-mineurs',
      'form-type-transmission',
      'form-adresse',
      'form-ville',
      'form-signalement',
      'form-transmission'
    ];
    
    allInputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.disabled = false;
        element.readOnly = false;
      }
    });
    
    // Réactiver toutes les checkboxes
    const formTransmission = document.getElementById('form-transmission');
    if (formTransmission) {
      const checkboxes = formTransmission.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
      });
    }
  };

  // Fonction pour s'assurer que tous les champs de transmission ADP sont éditables
  const enableTransmissionFieldsAdp = () => {
    // Réactiver TOUS les champs du formulaire ADP (transmission ET informations personnelles)
    const allInputs = [
      'adp-form-nom',
      'adp-form-prenom',
      'adp-form-ddn',
      'adp-form-description',
      'adp-form-departement',
      'adp-form-typologie',
      'adp-form-nb-personnes',
      'adp-form-mineurs',
      'adp-form-type-transmission',
      'adp-form-adresse',
      'adp-form-ville',
      'adp-form-signalement',
      'adp-form-transmission'
    ];
    
    allInputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.disabled = false;
        element.readOnly = false;
      }
    });
    
    // Réactiver toutes les checkboxes
    const formAdp = document.getElementById('form-adp');
    if (formAdp) {
      const checkboxes = formAdp.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
      });
    }
  };

  // Fonction globale pour éditer une transmission (à implémenter)
  window.editTransmission = async (id) => {
    console.log('Compléter la transmission pour ID:', id);
    
    try {
      // Récupérer la transmission de base depuis IndexedDB
      const baseTransmission = await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (!baseTransmission) {
        console.error('Transmission non trouvée');
        alert('Erreur lors du chargement des données');
        return;
      }
      
      // Obtenir la date sélectionnée
      const selectedDate = document.getElementById('transmissions-date').value;
      
      // Chercher si une transmission existe pour cette personne à cette date
      const existingTransmissionForDate = await findTransmissionByPersonAndDate(
        baseTransmission.personId || id,
        selectedDate
      );
      
      // Utiliser la transmission existante pour cette date, sinon utiliser la base
      const transmission = existingTransmissionForDate || baseTransmission;
      
      // Remplir les informations personnelles depuis la transmission correspondante
      // (existante pour la date OU transmission de base si première saisie pour cette date)
      document.getElementById('form-nom').value = transmission.nom || '';
      document.getElementById('form-prenom').value = transmission.prenom || '';
      document.getElementById('form-ddn').value = transmission.dateNaissance || '';
      document.getElementById('form-typologie').value = transmission.typologie || '';
      document.getElementById('form-nb-personnes').value = transmission.nbPersonnes || '';
      document.getElementById('form-mineurs').value = transmission.mineurs || '';
      
      // Si on a une transmission pour cette date, charger ses données de transmission
      // Sinon, laisser vide
      if (existingTransmissionForDate) {
        document.getElementById('form-type-transmission').value = transmission.typeTransmission || '';
        document.getElementById('form-adresse').value = transmission.adresse || '';
        document.getElementById('form-ville').value = transmission.ville || '';
        document.getElementById('form-signalement').value = transmission.signalement || '';
        document.getElementById('form-transmission').value = transmission.transmission || '';
        
        // Cases à cocher Type d'intervention
        if (transmission.orly) {
          document.getElementById('form-premier-contact').checked = transmission.orly.premierContact || false;
          document.getElementById('form-personne-presente').checked = transmission.orly.personnePresente || false;
          document.getElementById('form-pnt').checked = transmission.orly.pnt || false;
          document.getElementById('form-maraude').checked = transmission.orly.maraude || false;
          document.getElementById('form-veille').checked = transmission.orly.veille || false;
          document.getElementById('form-refus-contact').checked = transmission.orly.refusContact || false;
        }
        
        // Cases à cocher Accompagnement
        if (transmission.accompagnement) {
          document.getElementById('form-accomp-ecoute').checked = transmission.accompagnement.ecoute || false;
          document.getElementById('form-accomp-orientation').checked = transmission.accompagnement.orientation || false;
          document.getElementById('form-accomp-admin').checked = transmission.accompagnement.admin || false;
          document.getElementById('form-accomp-medical').checked = transmission.accompagnement.medical || false;
          document.getElementById('form-accomp-hebergement').checked = transmission.accompagnement.hebergement || false;
          document.getElementById('form-accomp-autre').checked = transmission.accompagnement.autre || false;
        }
        
        // Cases à cocher Distribution
        if (transmission.distribution) {
          document.getElementById('form-distrib-alimentaire').checked = transmission.distribution.alimentaire || false;
          document.getElementById('form-distrib-vestimentaire').checked = transmission.distribution.vestimentaire || false;
          document.getElementById('form-distrib-hygiene').checked = transmission.distribution.hygiene || false;
          document.getElementById('form-distrib-couvertures').checked = transmission.distribution.couvertures || false;
          document.getElementById('form-distrib-duvet').checked = transmission.distribution.duvet || false;
          document.getElementById('form-distrib-autre').checked = transmission.distribution.autre || false;
        }
        
        // Stocker l'ID pour la mise à jour
        formTransmission.dataset.editId = transmission.id;
      } else {
        // Pas de transmission pour cette date, réinitialiser les champs de transmission
        document.getElementById('form-type-transmission').value = '';
        document.getElementById('form-adresse').value = '';
        document.getElementById('form-ville').value = '';
        document.getElementById('form-signalement').value = '';
        document.getElementById('form-transmission').value = '';
        
        // Décocher toutes les cases
        document.getElementById('form-premier-contact').checked = false;
        document.getElementById('form-personne-presente').checked = false;
        document.getElementById('form-pnt').checked = false;
        document.getElementById('form-maraude').checked = false;
        document.getElementById('form-veille').checked = false;
        document.getElementById('form-refus-contact').checked = false;
        
        document.getElementById('form-accomp-ecoute').checked = false;
        document.getElementById('form-accomp-orientation').checked = false;
        document.getElementById('form-accomp-admin').checked = false;
        document.getElementById('form-accomp-medical').checked = false;
        document.getElementById('form-accomp-hebergement').checked = false;
        document.getElementById('form-accomp-autre').checked = false;
        
        document.getElementById('form-distrib-alimentaire').checked = false;
        document.getElementById('form-distrib-vestimentaire').checked = false;
        document.getElementById('form-distrib-hygiene').checked = false;
        document.getElementById('form-distrib-couvertures').checked = false;
        document.getElementById('form-distrib-duvet').checked = false;
        document.getElementById('form-distrib-autre').checked = false;
        
        // Pas d'ID d'édition = création d'une nouvelle transmission
        delete formTransmission.dataset.editId;
      }
      
      // Stocker le personId pour lier les transmissions
      formTransmission.dataset.personId = baseTransmission.personId || id;
      
      // Replier la section Informations Personnelles
      const infoPersoGrid = document.getElementById('grid-info-perso');
      const infoPersoToggle = document.querySelector('#section-info-perso .collapse-toggle');
      if (infoPersoGrid && infoPersoToggle) {
        infoPersoGrid.classList.add('collapsed');
        infoPersoToggle.classList.add('collapsed');
      }
      
      // S'assurer que tous les champs de transmission sont éditables
      enableTransmissionFields();
      
      // Ouvrir la modal
      modal.classList.add('show');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  // ==================== FIN AFFICHAGE DES CARTES ====================

  // ==================== FIN INDEXEDDB ====================

  // Initialiser le sélecteur de date à la date du jour
  // Si entre minuit et 3h, utiliser la veille
  const dateInput = document.getElementById('transmissions-date');
  if (dateInput) {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si entre 0h et 3h (minuit à 3h du matin), utiliser la veille
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;
    
    // Ajouter des écouteurs sur les filtres
    const filterNom = document.getElementById('filter-nom');
    const filterPrenom = document.getElementById('filter-prenom');
    const filterDdn = document.getElementById('filter-ddn');
    
    if (filterNom) {
      filterNom.addEventListener('input', () => loadAndDisplayCards());
    }
    
    if (filterPrenom) {
      filterPrenom.addEventListener('input', () => loadAndDisplayCards());
    }
    
    if (filterDdn) {
      filterDdn.addEventListener('change', () => loadAndDisplayCards());
    }
    
    // Écouter les changements de date
    dateInput.addEventListener('change', () => {
      console.log('Date changée:', dateInput.value);
      
      // Recharger les cartes avec les données de la nouvelle date
      loadAndDisplayCards();
      
      // Si le formulaire est ouvert en mode édition, réinitialiser les champs de transmission
      if (formTransmission.dataset.editId && modal.classList.contains('show')) {
        // Réinitialiser les champs de transmission
        document.getElementById('form-type-transmission').value = '';
        document.getElementById('form-transmission').value = '';
        
        // Décocher toutes les cases Type d'intervention
        document.getElementById('form-premier-contact').checked = false;
        document.getElementById('form-personne-presente').checked = false;
        document.getElementById('form-pnt').checked = false;
        document.getElementById('form-maraude').checked = false;
        document.getElementById('form-veille').checked = false;
        document.getElementById('form-refus-contact').checked = false;
        
        // Décocher toutes les cases Accompagnement
        document.getElementById('form-accomp-ecoute').checked = false;
        document.getElementById('form-accomp-orientation').checked = false;
        document.getElementById('form-accomp-admin').checked = false;
        document.getElementById('form-accomp-medical').checked = false;
        document.getElementById('form-accomp-hebergement').checked = false;
        document.getElementById('form-accomp-autre').checked = false;
        
        // Décocher toutes les cases Distribution
        document.getElementById('form-distrib-alimentaire').checked = false;
        document.getElementById('form-distrib-vestimentaire').checked = false;
        document.getElementById('form-distrib-hygiene').checked = false;
        document.getElementById('form-distrib-couvertures').checked = false;
        document.getElementById('form-distrib-duvet').checked = false;
        document.getElementById('form-distrib-autre').checked = false;
        
        // Supprimer l'ID d'édition pour créer une nouvelle transmission
        delete formTransmission.dataset.editId;
        
        console.log('Champs de transmission réinitialisés pour la nouvelle date');
      }
    });
  }

  // Gestion des onglets
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Désactiver tous les onglets et boutons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Activer l'onglet sélectionné
      button.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });

  // Gestion de la modal
  const modal = document.getElementById('modal-ajout');
  const btnAjouter = document.getElementById('btn-ajouter');
  const btnAnnuler = document.getElementById('btn-annuler');
  const modalClose = document.querySelector('.modal-close');
  const btnExpand = document.getElementById('btn-expand');
  const modalContent = document.querySelector('.modal-content');
  const formTransmission = document.getElementById('form-transmission');

  // Ouvrir la modal
  btnAjouter.addEventListener('click', () => {
    // S'assurer que tous les champs de transmission sont éditables
    enableTransmissionFields();
    modal.classList.add('show');
  });

  // Ajouter l'event listener pour replier/déplier la section Informations Personnelles
  const sectionHeader = document.querySelector('#section-info-perso .section-header');
  if (sectionHeader) {
    sectionHeader.addEventListener('click', function() {
      const toggle = this.querySelector('.collapse-toggle');
      const grid = this.nextElementSibling;
      
      if (grid && toggle) {
        grid.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
      }
    });
  }

  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    modalContent.classList.remove('fullscreen');
    btnExpand.textContent = '⛶';
    btnExpand.title = 'Agrandir';
    formTransmission.reset();
    
    // Supprimer l'ID d'édition et le personId si présent
    delete formTransmission.dataset.editId;
    delete formTransmission.dataset.personId;
    
    // Réinitialiser l'état des sections (déplier)
    const infoPersoGrid = document.getElementById('grid-info-perso');
    const infoPersoToggle = document.querySelector('#section-info-perso .collapse-toggle');
    if (infoPersoGrid && infoPersoToggle) {
      infoPersoGrid.classList.remove('collapsed');
      infoPersoToggle.classList.remove('collapsed');
    }
  };

  // Basculer plein écran
  btnExpand.addEventListener('click', () => {
    modalContent.classList.toggle('fullscreen');
    if (modalContent.classList.contains('fullscreen')) {
      btnExpand.textContent = '⛉';
      btnExpand.title = 'Réduire';
    } else {
      btnExpand.textContent = '⛶';
      btnExpand.title = 'Agrandir';
    }
  });

  btnAnnuler.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // Fermer en cliquant sur le fond
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Soumettre le formulaire
  formTransmission.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      nom: document.getElementById('form-nom').value,
      prenom: document.getElementById('form-prenom').value,
      dateNaissance: document.getElementById('form-ddn').value,
      typologie: document.getElementById('form-typologie').value,
      nbPersonnes: document.getElementById('form-nb-personnes').value,
      mineurs: document.getElementById('form-mineurs').value,
      typeTransmission: document.getElementById('form-type-transmission').value,
      adresse: document.getElementById('form-adresse').value,
      ville: document.getElementById('form-ville').value,
      signalement: document.getElementById('form-signalement').value,
      orly: {
        premierContact: document.getElementById('form-premier-contact').checked,
        personnePresente: document.getElementById('form-personne-presente').checked,
        pnt: document.getElementById('form-pnt').checked,
        maraude: document.getElementById('form-maraude').checked,
        veille: document.getElementById('form-veille').checked,
        refusContact: document.getElementById('form-refus-contact').checked
      },
      accompagnement: {
        ecoute: document.getElementById('form-accomp-ecoute').checked,
        orientation: document.getElementById('form-accomp-orientation').checked,
        admin: document.getElementById('form-accomp-admin').checked,
        medical: document.getElementById('form-accomp-medical').checked,
        hebergement: document.getElementById('form-accomp-hebergement').checked,
        autre: document.getElementById('form-accomp-autre').checked
      },
      distribution: {
        alimentaire: document.getElementById('form-distrib-alimentaire').checked,
        vestimentaire: document.getElementById('form-distrib-vestimentaire').checked,
        hygiene: document.getElementById('form-distrib-hygiene').checked,
        couvertures: document.getElementById('form-distrib-couvertures').checked,
        duvet: document.getElementById('form-distrib-duvet').checked,
        autre: document.getElementById('form-distrib-autre').checked
      },
      transmission: document.getElementById('form-transmission').value
    };

    try {
      // Vérifier si on est en mode édition
      const editId = formTransmission.dataset.editId;
      const personId = formTransmission.dataset.personId;
      
      console.log('=== SOUMISSION FORMULAIRE ===');
      console.log('editId:', editId);
      console.log('personId:', personId);
      
      // Ajouter le personId pour lier les transmissions de la même personne
      if (personId) {
        formData.personId = parseInt(personId);
      }
      
      console.log('formData.personId:', formData.personId);
      
      if (editId) {
        // Mode mise à jour - mettre à jour l'enregistrement existant
        formData.id = parseInt(editId);
        formData.dateTransmission = document.getElementById('transmissions-date').value;
        await updateTransmission(formData);
        console.log('Transmission mise à jour avec succès, ID:', editId);
        delete formTransmission.dataset.editId;
      } else {
        // Mode ajout - créer une nouvelle transmission
        const id = await addTransmission(formData);
        console.log('Nouvelle transmission créée, ID:', id, 'personId:', formData.personId);
        
        // Si c'est une nouvelle personne (pas de personId), utiliser l'ID comme personId
        if (!personId) {
          formData.id = id;
          formData.personId = id;
          await updateTransmission(formData);
          console.log('Nouvelle personne, personId défini à:', id);
        }
        
        console.log('Données du formulaire sauvegardées avec succès, ID:', id);
      }
      
      // Recharger et afficher les cartes
      await loadAndDisplayCards();
    
    closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement de la transmission');
    }
  });

  // Gestion automatique des valeurs selon la typologie de ménage (sans désactivation)
  const typologieSelect = document.getElementById('form-typologie');
  const nbPersonnesSelect = document.getElementById('form-nb-personnes');
  const mineursSelect = document.getElementById('form-mineurs');

  if (typologieSelect) {
  typologieSelect.addEventListener('change', () => {
    const typologie = typologieSelect.value;

    if (typologie === 'homme-seul' || typologie === 'femme-seule') {
        // Pour homme seul ou femme seule : suggérer 1 personne, 0 mineur (mais laisser éditable)
        if (!nbPersonnesSelect.value || nbPersonnesSelect.value === '') {
      nbPersonnesSelect.value = '1';
        }
        if (!mineursSelect.value || mineursSelect.value === '') {
      mineursSelect.value = '0';
        }
      } else if (typologie === 'groupe-adultes-sans-enfant') {
        // Pour groupe sans enfant : suggérer 0 mineur (mais laisser éditable)
        if (!mineursSelect.value || mineursSelect.value === '') {
      mineursSelect.value = '0';
        }
      }
      // Les champs restent toujours éditables
    });
  }

  // ==================== INDEXEDDB POUR ADP (INDÉPENDANT) ====================
  let dbAdp;
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';

  // Initialiser IndexedDB pour ADP
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME_ADP, DB_VERSION_ADP);

      request.onerror = () => {
        console.error('Erreur lors de l\'ouverture de la base de données ADP');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        dbAdp = event.target.result;
        console.log('Base de données ADP ouverte avec succès');
        resolve(dbAdp);
      };

      request.onupgradeneeded = (event) => {
        dbAdp = event.target.result;
        
        if (!dbAdp.objectStoreNames.contains(STORE_NAME_ADP)) {
          const objectStore = dbAdp.createObjectStore(STORE_NAME_ADP, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('descriptionPhysique', 'descriptionPhysique', { unique: false });
          objectStore.createIndex('ville', 'ville', { unique: false });
          objectStore.createIndex('dateCreation', 'dateCreation', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          
          console.log('Object store ADP créé avec succès');
        }
      };
    });
  };

  // Ajouter une transmission ADP
  const addTransmissionAdp = (data) => {
    return new Promise((resolve, reject) => {
      data.dateCreation = new Date().toISOString();
      data.dateTransmission = document.getElementById('adp-date').value || new Date().toISOString().split('T')[0];
      
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.add(data);

      request.onsuccess = () => {
        console.log('Transmission ADP ajoutée avec succès, ID:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erreur lors de l\'ajout de la transmission ADP');
        reject(request.error);
      };
    });
  };

  // Récupérer toutes les transmissions ADP
  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Supprimer une transmission ADP
  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('Transmission ADP supprimée avec succès');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Mettre à jour une transmission ADP
  const updateTransmissionAdp = (data) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.put(data);

      request.onsuccess = () => {
        console.log('Transmission ADP mise à jour avec succès');
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Initialiser la base de données ADP
  initDBAdp().then(() => {
    loadAndDisplayCardsAdp();
  }).catch(error => {
    console.error('Erreur lors de l\'initialisation de la base de données ADP:', error);
  });

  // ==================== AFFICHAGE DES CARTES ADP ====================
  
  // Fonction pour regrouper les transmissions ADP par personne
  const groupTransmissionsByPersonAdp = (transmissions) => {
    const personsMap = new Map();
    
    console.log('=== REGROUPEMENT DES TRANSMISSIONS ADP ===');
    console.log('Nombre total de transmissions ADP:', transmissions.length);
    
    transmissions.forEach(transmission => {
      const personId = transmission.personId || transmission.id;
      
      console.log('Transmission ADP ID:', transmission.id, '| personId:', transmission.personId, '| Utilisé:', personId);
      
      if (!personsMap.has(personId)) {
        personsMap.set(personId, {
          personId: personId,
          nom: transmission.nom,
          prenom: transmission.prenom,
          dateNaissance: transmission.dateNaissance,
          descriptionPhysique: transmission.descriptionPhysique,
          inconnu: transmission.inconnu,
          departementOrigine: transmission.departementOrigine,
          typologie: transmission.typologie,
          nbPersonnes: transmission.nbPersonnes,
          mineurs: transmission.mineurs,
          transmissions: []
        });
        console.log('  -> Nouvelle personne ADP créée avec personId:', personId);
    } else {
        console.log('  -> Ajout à la personne ADP existante avec personId:', personId);
      }
      
      personsMap.get(personId).transmissions.push(transmission);
    });
    
    console.log('Nombre de personnes uniques ADP:', personsMap.size);
    
    return Array.from(personsMap.values());
  };

  // Fonction pour créer une carte HTML pour une personne ADP
  const createPersonCardAdp = (person, selectedDate) => {
    const card = document.createElement('div');
    card.className = 'transmission-card';
    card.dataset.personId = person.personId;

    const transmissionForDate = person.transmissions.find(t => 
      t.dateTransmission === selectedDate
    );

    const transmissionsCount = person.transmissions.length;

    // Utiliser les données de la transmission pour la date ou celles de la personne par défaut
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
        ${transmissionForDate.pointAccueil ? `
          <div class="card-info">
            <span class="card-label">Point Accueil :</span>
            <span class="card-value">Oui</span>
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
        ${transmissionForDate.transmission ? `
          <div class="card-info">
            <span class="card-label">Commentaire :</span>
            <span class="card-value">${transmissionForDate.transmission}</span>
          </div>
        ` : ''}
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      `;
    } else {
      transmissionContent = `
        <div class="card-info empty-transmission">
          <span class="card-value">Aucune transmission pour cette date</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${displayData.nom || 'Nom inconnu'} ${displayData.prenom || ''}</h3>
        <span class="card-date">${transmissionsCount} transmission${transmissionsCount > 1 ? 's' : ''}</span>
      </div>
      <div class="card-content">
        ${displayData.dateNaissance ? `
          <div class="card-info">
            <span class="card-label">Date de naissance :</span>
            <span class="card-value">${formatDate(displayData.dateNaissance)}</span>
          </div>
        ` : ''}
        ${displayData.descriptionPhysique ? `
          <div class="card-info">
            <span class="card-label">Description :</span>
            <span class="card-value">${displayData.descriptionPhysique}</span>
          </div>
        ` : ''}
        ${displayData.inconnu ? `
          <div class="card-info">
            <span class="card-label">Inconnu :</span>
            <span class="card-value">Oui</span>
          </div>
        ` : ''}
        ${displayData.departementOrigine ? `
          <div class="card-info">
            <span class="card-label">Département d'origine :</span>
            <span class="card-value">${displayData.departementOrigine}</span>
          </div>
        ` : ''}
        ${displayData.typologie ? `
          <div class="card-info">
            <span class="card-label">Typologie :</span>
            <span class="card-value">${displayData.typologie}</span>
          </div>
        ` : ''}
        ${displayData.nbPersonnes ? `
          <div class="card-info">
            <span class="card-label">Nombre :</span>
            <span class="card-value">${displayData.nbPersonnes} personne${displayData.nbPersonnes > 1 ? 's' : ''}</span>
          </div>
        ` : ''}
        ${displayData.mineurs && displayData.mineurs !== '0' ? `
          <div class="card-info">
            <span class="card-label">dont Mineurs :</span>
            <span class="card-value">${displayData.mineurs}</span>
          </div>
        ` : ''}
        <div class="card-separator"></div>
        <div class="card-transmission-data">
          <h4 class="transmission-title">Transmission du ${formatDate(selectedDate)}</h4>
          ${transmissionContent}
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-card btn-edit" data-person-id="${person.personId}">Compléter</button>
        <button class="btn-card btn-delete" data-person-id="${person.personId}">Supprimer</button>
      </div>
    `;

    const btnEdit = card.querySelector('.btn-edit');
    const btnDelete = card.querySelector('.btn-delete');
    
    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        const firstTransmissionId = person.transmissions[0].id;
        editTransmissionAdp(firstTransmissionId);
      });
    }
    
    if (btnDelete) {
      btnDelete.addEventListener('click', () => deletePersonCardAdp(person.personId));
    }

    return card;
  };

  // Fonction pour afficher toutes les cartes ADP
  const displayCardsAdp = (transmissions) => {
    const container = document.getElementById('adp-list');
    const selectedDate = document.getElementById('adp-date').value;
    
    if (!transmissions || transmissions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>Aucune transmission ADP enregistrée</p>
        </div>
      `;
      return;
    }

    const persons = groupTransmissionsByPersonAdp(transmissions);

    container.innerHTML = '';
    persons.forEach(person => {
      const card = createPersonCardAdp(person, selectedDate);
      container.appendChild(card);
    });
  };

  // Fonction pour charger et afficher les cartes ADP
  const loadAndDisplayCardsAdp = async () => {
    try {
      const transmissions = await getAllTransmissionsAdp();
      applyFiltersAndDisplayAdp(transmissions);
    } catch (error) {
      console.error('Erreur lors du chargement des transmissions ADP:', error);
    }
  };

  // Fonction pour filtrer et afficher les cartes ADP
  const applyFiltersAndDisplayAdp = (transmissions) => {
    const filterNom = document.getElementById('adp-filter-nom').value.toLowerCase().trim();
    const filterPrenom = document.getElementById('adp-filter-prenom').value.toLowerCase().trim();
    const filterDdn = document.getElementById('adp-filter-ddn').value;
    const filterDescription = document.getElementById('adp-filter-description').value.toLowerCase().trim();
    const filterInconnu = document.getElementById('adp-filter-inconnu').value;

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

    if (filterDescription) {
      filteredTransmissions = filteredTransmissions.filter(t => 
        t.descriptionPhysique && t.descriptionPhysique.toLowerCase().includes(filterDescription)
      );
    }

    if (filterInconnu) {
      const isInconnu = filterInconnu === 'Oui';
      filteredTransmissions = filteredTransmissions.filter(t => 
        t.inconnu === isInconnu
      );
    }

    displayCardsAdp(filteredTransmissions);
  };

  // Fonction pour trouver une transmission ADP pour une personne à une date donnée
  const findTransmissionByPersonAndDateAdp = async (personId, dateTransmission) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const transmissions = request.result;
        const found = transmissions.find(t => 
          t.personId === personId && t.dateTransmission === dateTransmission
        );
        resolve(found);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  // Fonction pour supprimer toutes les transmissions d'une personne ADP
  window.deletePersonCardAdp = async (personId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses transmissions ?')) {
      try {
        const transmissions = await getAllTransmissionsAdp();
        const personTransmissions = transmissions.filter(t => 
          (t.personId || t.id) === personId
        );

        for (const transmission of personTransmissions) {
          await deleteTransmissionAdp(transmission.id);
        }

        console.log('Personne ADP et ses transmissions supprimées');
        alert('Personne supprimée avec succès !');
        await loadAndDisplayCardsAdp();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Fonction globale pour éditer une transmission ADP
  window.editTransmissionAdp = async (id) => {
    console.log('Compléter la transmission ADP pour ID:', id);
    
    try {
      // Récupérer la transmission de base depuis IndexedDB
      const baseTransmission = await new Promise((resolve, reject) => {
        const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME_ADP);
        const request = objectStore.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (!baseTransmission) {
        console.error('Transmission ADP non trouvée');
        alert('Erreur lors du chargement des données');
        return;
      }
      
      const selectedDate = document.getElementById('adp-date').value;
      
      const existingTransmissionForDate = await findTransmissionByPersonAndDateAdp(
        baseTransmission.personId || id,
        selectedDate
      );
      
      const transmission = existingTransmissionForDate || baseTransmission;
      
      // Remplir les informations personnelles depuis la transmission correspondante
      // (existante pour la date OU transmission de base si première saisie pour cette date)
      document.getElementById('adp-form-nom').value = transmission.nom || '';
      document.getElementById('adp-form-prenom').value = transmission.prenom || '';
      document.getElementById('adp-form-ddn').value = transmission.dateNaissance || '';
      document.getElementById('adp-form-description').value = transmission.descriptionPhysique || '';
      document.getElementById('adp-form-inconnu').checked = transmission.inconnu || false;
      document.getElementById('adp-form-departement').value = transmission.departementOrigine || '';
      document.getElementById('adp-form-typologie').value = transmission.typologie || '';
      document.getElementById('adp-form-nb-personnes').value = transmission.nbPersonnes || '';
      document.getElementById('adp-form-mineurs').value = transmission.mineurs || '';
      
      if (existingTransmissionForDate) {
        document.getElementById('adp-form-type-transmission').value = transmission.typeTransmission || '';
        document.getElementById('adp-form-point-accueil').checked = transmission.pointAccueil || false;
        document.getElementById('adp-form-adresse').value = transmission.adresse || '';
        document.getElementById('adp-form-ville').value = transmission.ville || '';
        document.getElementById('adp-form-signalement').value = transmission.signalement || '';
        document.getElementById('adp-form-transmission').value = transmission.transmission || '';
        
        if (transmission.orly) {
          document.getElementById('adp-form-premier-contact').checked = transmission.orly.premierContact || false;
          document.getElementById('adp-form-personne-presente').checked = transmission.orly.personnePresente || false;
          document.getElementById('adp-form-pnt').checked = transmission.orly.pnt || false;
          document.getElementById('adp-form-maraude').checked = transmission.orly.maraude || false;
          document.getElementById('adp-form-veille').checked = transmission.orly.veille || false;
          document.getElementById('adp-form-refus-contact').checked = transmission.orly.refusContact || false;
        }
        
        if (transmission.accompagnement) {
          document.getElementById('adp-form-accomp-ecoute').checked = transmission.accompagnement.ecoute || false;
          document.getElementById('adp-form-accomp-orientation').checked = transmission.accompagnement.orientation || false;
          document.getElementById('adp-form-accomp-admin').checked = transmission.accompagnement.admin || false;
          document.getElementById('adp-form-accomp-medical').checked = transmission.accompagnement.medical || false;
          document.getElementById('adp-form-accomp-hebergement').checked = transmission.accompagnement.hebergement || false;
          document.getElementById('adp-form-accomp-autre').checked = transmission.accompagnement.autre || false;
        }

        if (transmission.distribution) {
          document.getElementById('adp-form-distrib-alimentaire').checked = transmission.distribution.alimentaire || false;
          document.getElementById('adp-form-distrib-vestimentaire').checked = transmission.distribution.vestimentaire || false;
          document.getElementById('adp-form-distrib-hygiene').checked = transmission.distribution.hygiene || false;
          document.getElementById('adp-form-distrib-couvertures').checked = transmission.distribution.couvertures || false;
          document.getElementById('adp-form-distrib-duvet').checked = transmission.distribution.duvet || false;
          document.getElementById('adp-form-distrib-autre').checked = transmission.distribution.autre || false;
        }
        
        formAdp.dataset.editId = transmission.id;
      } else {
        // Pas de transmission pour cette date, réinitialiser les champs de transmission
        document.getElementById('adp-form-type-transmission').value = '';
        document.getElementById('adp-form-point-accueil').checked = false;
        document.getElementById('adp-form-adresse').value = '';
        document.getElementById('adp-form-ville').value = '';
        document.getElementById('adp-form-signalement').value = '';
        document.getElementById('adp-form-transmission').value = '';
        
        document.getElementById('adp-form-premier-contact').checked = false;
        document.getElementById('adp-form-personne-presente').checked = false;
        document.getElementById('adp-form-pnt').checked = false;
        document.getElementById('adp-form-maraude').checked = false;
        document.getElementById('adp-form-veille').checked = false;
        document.getElementById('adp-form-refus-contact').checked = false;
        
        document.getElementById('adp-form-accomp-ecoute').checked = false;
        document.getElementById('adp-form-accomp-orientation').checked = false;
        document.getElementById('adp-form-accomp-admin').checked = false;
        document.getElementById('adp-form-accomp-medical').checked = false;
        document.getElementById('adp-form-accomp-hebergement').checked = false;
        document.getElementById('adp-form-accomp-autre').checked = false;
        
        document.getElementById('adp-form-distrib-alimentaire').checked = false;
        document.getElementById('adp-form-distrib-vestimentaire').checked = false;
        document.getElementById('adp-form-distrib-hygiene').checked = false;
        document.getElementById('adp-form-distrib-couvertures').checked = false;
        document.getElementById('adp-form-distrib-duvet').checked = false;
        document.getElementById('adp-form-distrib-autre').checked = false;
        
        delete formAdp.dataset.editId;
      }
      
      formAdp.dataset.personId = baseTransmission.personId || id;
      
      // S'assurer que tous les champs de transmission ADP sont éditables
      enableTransmissionFieldsAdp();
      
      modalAdp.classList.add('show');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  // ==================== GESTION MODAL ADP (INDÉPENDANTE) ====================
  
  // Initialiser la date pour ADP
  const adpDateInput = document.getElementById('adp-date');
  if (adpDateInput) {
    const today = new Date();
    const currentHour = today.getHours();
    
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    const formattedDate = today.toISOString().split('T')[0];
    adpDateInput.value = formattedDate;
    
    // Ajouter des écouteurs sur les filtres ADP
    const adpFilterNom = document.getElementById('adp-filter-nom');
    const adpFilterPrenom = document.getElementById('adp-filter-prenom');
    const adpFilterDdn = document.getElementById('adp-filter-ddn');
    const adpFilterDescription = document.getElementById('adp-filter-description');
    const adpFilterInconnu = document.getElementById('adp-filter-inconnu');
    
    if (adpFilterNom) {
      adpFilterNom.addEventListener('input', () => loadAndDisplayCardsAdp());
    }
    
    if (adpFilterPrenom) {
      adpFilterPrenom.addEventListener('input', () => loadAndDisplayCardsAdp());
    }
    
    if (adpFilterDdn) {
      adpFilterDdn.addEventListener('change', () => loadAndDisplayCardsAdp());
    }
    
    if (adpFilterDescription) {
      adpFilterDescription.addEventListener('input', () => loadAndDisplayCardsAdp());
    }
    
    if (adpFilterInconnu) {
      adpFilterInconnu.addEventListener('change', () => loadAndDisplayCardsAdp());
    }
    
    // Écouter les changements de date ADP
    adpDateInput.addEventListener('change', () => {
      console.log('Date ADP changée:', adpDateInput.value);
      
      // Recharger les cartes avec les données de la nouvelle date
      loadAndDisplayCardsAdp();
      
      // Si le formulaire est ouvert en mode édition, réinitialiser les champs de transmission
      if (formAdp.dataset.editId && modalAdp.classList.contains('show')) {
        document.getElementById('adp-form-type-transmission').value = '';
        document.getElementById('adp-form-point-accueil').checked = false;
        document.getElementById('adp-form-transmission').value = '';
        
        document.getElementById('adp-form-premier-contact').checked = false;
        document.getElementById('adp-form-personne-presente').checked = false;
        document.getElementById('adp-form-pnt').checked = false;
        document.getElementById('adp-form-maraude').checked = false;
        document.getElementById('adp-form-veille').checked = false;
        document.getElementById('adp-form-refus-contact').checked = false;
        
        document.getElementById('adp-form-accomp-ecoute').checked = false;
        document.getElementById('adp-form-accomp-orientation').checked = false;
        document.getElementById('adp-form-accomp-admin').checked = false;
        document.getElementById('adp-form-accomp-medical').checked = false;
        document.getElementById('adp-form-accomp-hebergement').checked = false;
        document.getElementById('adp-form-accomp-autre').checked = false;
        
        document.getElementById('adp-form-distrib-alimentaire').checked = false;
        document.getElementById('adp-form-distrib-vestimentaire').checked = false;
        document.getElementById('adp-form-distrib-hygiene').checked = false;
        document.getElementById('adp-form-distrib-couvertures').checked = false;
        document.getElementById('adp-form-distrib-duvet').checked = false;
        document.getElementById('adp-form-distrib-autre').checked = false;
        
        delete formAdp.dataset.editId;
      }
    });
  }

  // Gestion de la modal ADP
  const modalAdp = document.getElementById('modal-adp');
  const adpBtnAjouter = document.getElementById('adp-btn-ajouter');
  const adpBtnAnnuler = document.getElementById('adp-btn-annuler');
  const adpModalClose = document.querySelector('.adp-modal-close');
  const adpBtnExpand = document.getElementById('adp-btn-expand');
  const adpModalContent = modalAdp.querySelector('.modal-content');
  const formAdp = document.getElementById('form-adp');

  // Ouvrir la modal ADP
  adpBtnAjouter.addEventListener('click', () => {
    // S'assurer que tous les champs de transmission ADP sont éditables
    enableTransmissionFieldsAdp();
    modalAdp.classList.add('show');
  });

  // Fermer la modal ADP
  const closeModalAdp = () => {
    modalAdp.classList.remove('show');
    adpModalContent.classList.remove('fullscreen');
    adpBtnExpand.textContent = '⛶';
    adpBtnExpand.title = 'Agrandir';
    formAdp.reset();
    
    // Supprimer l'ID d'édition et le personId si présent
    delete formAdp.dataset.editId;
    delete formAdp.dataset.personId;
  };

  // Basculer plein écran ADP
  adpBtnExpand.addEventListener('click', () => {
    adpModalContent.classList.toggle('fullscreen');
    if (adpModalContent.classList.contains('fullscreen')) {
      adpBtnExpand.textContent = '⛉';
      adpBtnExpand.title = 'Réduire';
    } else {
      adpBtnExpand.textContent = '⛶';
      adpBtnExpand.title = 'Agrandir';
    }
  });

  adpBtnAnnuler.addEventListener('click', closeModalAdp);
  adpModalClose.addEventListener('click', closeModalAdp);

  // Fermer en cliquant sur le fond
  modalAdp.addEventListener('click', (e) => {
    if (e.target === modalAdp) {
      closeModalAdp();
    }
  });

  // Soumettre le formulaire ADP
  formAdp.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      nom: document.getElementById('adp-form-nom').value,
      prenom: document.getElementById('adp-form-prenom').value,
      dateNaissance: document.getElementById('adp-form-ddn').value,
      descriptionPhysique: document.getElementById('adp-form-description').value,
      inconnu: document.getElementById('adp-form-inconnu').checked,
      departementOrigine: document.getElementById('adp-form-departement').value,
      typologie: document.getElementById('adp-form-typologie').value,
      nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
      mineurs: document.getElementById('adp-form-mineurs').value,
      typeTransmission: document.getElementById('adp-form-type-transmission').value,
      pointAccueil: document.getElementById('adp-form-point-accueil').checked,
      adresse: document.getElementById('adp-form-adresse').value,
      ville: document.getElementById('adp-form-ville').value,
      signalement: document.getElementById('adp-form-signalement').value,
      orly: {
        premierContact: document.getElementById('adp-form-premier-contact').checked,
        personnePresente: document.getElementById('adp-form-personne-presente').checked,
        pnt: document.getElementById('adp-form-pnt').checked,
        maraude: document.getElementById('adp-form-maraude').checked,
        veille: document.getElementById('adp-form-veille').checked,
        refusContact: document.getElementById('adp-form-refus-contact').checked
      },
      accompagnement: {
        ecoute: document.getElementById('adp-form-accomp-ecoute').checked,
        orientation: document.getElementById('adp-form-accomp-orientation').checked,
        admin: document.getElementById('adp-form-accomp-admin').checked,
        medical: document.getElementById('adp-form-accomp-medical').checked,
        hebergement: document.getElementById('adp-form-accomp-hebergement').checked,
        autre: document.getElementById('adp-form-accomp-autre').checked
      },
      distribution: {
        alimentaire: document.getElementById('adp-form-distrib-alimentaire').checked,
        vestimentaire: document.getElementById('adp-form-distrib-vestimentaire').checked,
        hygiene: document.getElementById('adp-form-distrib-hygiene').checked,
        couvertures: document.getElementById('adp-form-distrib-couvertures').checked,
        duvet: document.getElementById('adp-form-distrib-duvet').checked,
        autre: document.getElementById('adp-form-distrib-autre').checked
      },
      transmission: document.getElementById('adp-form-transmission').value
    };

    try {
      const editId = formAdp.dataset.editId;
      const personId = formAdp.dataset.personId;
      
      console.log('=== SOUMISSION FORMULAIRE ADP ===');
      console.log('editId:', editId);
      console.log('personId:', personId);
      
      if (personId) {
        formData.personId = parseInt(personId);
      }
      
      console.log('formData.personId:', formData.personId);
      
      if (editId) {
        formData.id = parseInt(editId);
        formData.dateTransmission = document.getElementById('adp-date').value;
        await updateTransmissionAdp(formData);
        console.log('Transmission ADP mise à jour avec succès, ID:', editId);
        delete formAdp.dataset.editId;
      } else {
        const id = await addTransmissionAdp(formData);
        console.log('Nouvelle transmission ADP créée, ID:', id, 'personId:', formData.personId);
        
        if (!personId) {
          formData.id = id;
          formData.personId = id;
          await updateTransmissionAdp(formData);
          console.log('Nouvelle personne ADP, personId défini à:', id);
        }
        
        console.log('Données du formulaire ADP sauvegardées avec succès, ID:', id);
      }
      
      await loadAndDisplayCardsAdp();
      closeModalAdp();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde ADP:', error);
      alert('Erreur lors de l\'enregistrement de la transmission ADP');
    }
  });

  // Gestion automatique des valeurs selon la typologie de ménage ADP (sans désactivation)
  const adpTypologieSelect = document.getElementById('adp-form-typologie');
  const adpNbPersonnesSelect = document.getElementById('adp-form-nb-personnes');
  const adpMineursSelect = document.getElementById('adp-form-mineurs');

  if (adpTypologieSelect) {
    adpTypologieSelect.addEventListener('change', () => {
      const typologie = adpTypologieSelect.value;

      if (typologie === 'homme-seul' || typologie === 'femme-seule') {
        // Pour homme seul ou femme seule : suggérer 1 personne, 0 mineur (mais laisser éditable)
        if (!adpNbPersonnesSelect.value || adpNbPersonnesSelect.value === '') {
          adpNbPersonnesSelect.value = '1';
        }
        if (!adpMineursSelect.value || adpMineursSelect.value === '') {
          adpMineursSelect.value = '0';
        }
      } else if (typologie === 'groupe-adultes-sans-enfant') {
        // Pour groupe sans enfant : suggérer 0 mineur (mais laisser éditable)
        if (!adpMineursSelect.value || adpMineursSelect.value === '') {
          adpMineursSelect.value = '0';
        }
      }
      // Les champs restent toujours éditables
    });
  }

  // Exemple d'utilisation de l'API Electron (si disponible)
  if (window.electronAPI) {
    console.log('API Electron disponible');
  }
});

