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

  // ==================== GESTION DES STATISTIQUES ====================
  
  const statsSource = document.getElementById('stats-source');
  const statsPeriodType = document.getElementById('stats-period-type');
  const statsDaySelector = document.getElementById('stats-day-selector');
  const statsMonthSelector = document.getElementById('stats-month-selector');
  const statsYearSelector = document.getElementById('stats-year-selector');
  const statsRangeSelector = document.getElementById('stats-range-selector');
  const statsApplyFilter = document.getElementById('stats-apply-filter');
  const statsResetFilters = document.getElementById('stats-reset-filters');
  
  // Fonction pour extraire les options d'un select
  const extractSelectOptions = (selectId) => {
    const select = document.getElementById(selectId);
    if (!select) return [];
    
    const options = [];
    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      if (option.value) { // Ignorer les options vides
        options.push({
          value: option.value,
          text: option.text
        });
      }
    }
    return options;
  };
  
  // Fonction pour combiner les options uniques de plusieurs selects
  const combineSelectOptions = (selectIds) => {
    const allOptions = [];
    const seenValues = new Set();
    
    selectIds.forEach(selectId => {
      const options = extractSelectOptions(selectId);
      options.forEach(option => {
        if (!seenValues.has(option.value)) {
          seenValues.add(option.value);
          allOptions.push(option);
        }
      });
    });
    
    return allOptions;
  };
  
  // Fonction pour remplir un select avec des options
  const populateSelect = (selectId, options) => {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Garder seulement l'option "Tous" ou l'option vide
    const firstOption = select.options[0];
    select.innerHTML = '';
    if (firstOption) {
      select.appendChild(firstOption);
    }
    
    // Ajouter les nouvelles options
    options.forEach(option => {
      const optElement = document.createElement('option');
      optElement.value = option.value;
      optElement.text = option.text;
      select.appendChild(optElement);
    });
  };
  
  // Fonction pour mettre à jour les selects des statistiques selon la source
  const updateStatsSelects = (source) => {
    let typologieOptions = [];
    let transmissionOptions = [];
    let signalementOptions = [];
    let departementOptions = [];
    
    switch (source) {
      case 'all':
        // Combiner les options des deux sources
        typologieOptions = combineSelectOptions(['form-typologie', 'adp-form-typologie']);
        transmissionOptions = combineSelectOptions(['form-type-transmission', 'adp-form-type-transmission']);
        signalementOptions = combineSelectOptions(['form-signalement', 'adp-form-signalement']);
        departementOptions = extractSelectOptions('adp-form-departement'); // Seulement ADP a les départements
        break;
      
      case 'transmissions':
        // Utiliser uniquement les options de Transmissions Quotidiennes
        typologieOptions = extractSelectOptions('form-typologie');
        transmissionOptions = extractSelectOptions('form-type-transmission');
        signalementOptions = extractSelectOptions('form-signalement');
        departementOptions = []; // Pas de département pour Transmissions Quotidiennes
        break;
      
      case 'adp':
        // Utiliser uniquement les options d'ADP
        typologieOptions = extractSelectOptions('adp-form-typologie');
        transmissionOptions = extractSelectOptions('adp-form-type-transmission');
        signalementOptions = extractSelectOptions('adp-form-signalement');
        departementOptions = extractSelectOptions('adp-form-departement');
        break;
    }
    
    // Mettre à jour les selects
    populateSelect('stats-filter-typologie', typologieOptions);
    populateSelect('stats-filter-transmission-type', transmissionOptions);
    populateSelect('stats-filter-signalement', signalementOptions);
    populateSelect('stats-filter-departement', departementOptions);
  };
  
  // Initialiser les selects au chargement
  updateStatsSelects('all');
  
  // Initialiser la date du jour pour le sélecteur de jour précis
  const statsSpecificDay = document.getElementById('stats-specific-day');
  if (statsSpecificDay) {
    statsSpecificDay.value = new Date().toISOString().split('T')[0];
  }
  
  // Initialiser le mois actuel
  const statsMonth = document.getElementById('stats-month');
  if (statsMonth) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    statsMonth.value = `${year}-${month}`;
  }
  
  // Initialiser l'année actuelle
  const statsYear = document.getElementById('stats-year');
  if (statsYear) {
    statsYear.value = new Date().getFullYear();
  }
  
  // Gérer le changement de source de données
  if (statsSource) {
    statsSource.addEventListener('change', (e) => {
      const selectedSource = e.target.value;
      const adpOnlyFields = document.querySelectorAll('.adp-only');
      
      // Afficher/masquer les champs spécifiques à ADP
      adpOnlyFields.forEach(field => {
        if (selectedSource === 'all' || selectedSource === 'adp') {
          field.classList.add('active');
        } else {
          field.classList.remove('active');
        }
      });
      
      // Mettre à jour les selects selon la source
      updateStatsSelects(selectedSource);
    });
  }
  
  // Gérer le changement de type de période
  if (statsPeriodType) {
    statsPeriodType.addEventListener('change', (e) => {
      const selectedType = e.target.value;
      
      // Masquer toutes les options
      [statsDaySelector, statsMonthSelector, statsYearSelector, statsRangeSelector].forEach(selector => {
        if (selector) selector.classList.remove('active');
      });
      
      // Afficher l'option sélectionnée
      switch (selectedType) {
        case 'day':
          if (statsDaySelector) statsDaySelector.classList.add('active');
          break;
        case 'month':
          if (statsMonthSelector) statsMonthSelector.classList.add('active');
          break;
        case 'year':
          if (statsYearSelector) statsYearSelector.classList.add('active');
          break;
        case 'range':
          if (statsRangeSelector) statsRangeSelector.classList.add('active');
          break;
      }
    });
  }
  
  // Fonction pour collecter tous les filtres
  const collectStatsFilters = () => {
    const filters = {
      // Source de données
      source: document.getElementById('stats-source').value,
      
      // Période
      periodType: statsPeriodType.value,
      
      // Pas de passage
      pasDePassage: document.getElementById('stats-filter-pas-passage').checked,
      
      // Informations personnelles
      nom: document.getElementById('stats-filter-nom').value,
      prenom: document.getElementById('stats-filter-prenom').value,
      dateNaissance: document.getElementById('stats-filter-ddn').value,
      typologie: document.getElementById('stats-filter-typologie').value,
      nbPersonnes: document.getElementById('stats-filter-nb-personnes').value,
      mineurs: document.getElementById('stats-filter-mineurs').value,
      
      // Champs spécifiques ADP
      descriptionPhysique: document.getElementById('stats-filter-description').value,
      inconnu: document.getElementById('stats-filter-inconnu').value,
      departement: document.getElementById('stats-filter-departement').value,
      
      // Données de transmission
      typeTransmission: document.getElementById('stats-filter-transmission-type').value,
      ville: document.getElementById('stats-filter-ville').value,
      adresse: document.getElementById('stats-filter-adresse').value,
      signalement: document.getElementById('stats-filter-signalement').value,
      pointAccueil: document.getElementById('stats-filter-point-accueil').value,
      
      // Type d'intervention
      orly: {
        premierContact: document.getElementById('stats-filter-premier-contact').checked,
        personnePresente: document.getElementById('stats-filter-personne-presente').checked,
        pnt: document.getElementById('stats-filter-pnt').checked,
        maraude: document.getElementById('stats-filter-maraude').checked,
        veille: document.getElementById('stats-filter-veille').checked,
        refusContact: document.getElementById('stats-filter-refus-contact').checked
      },
      
      // Accompagnement
      accompagnement: {
        ecoute: document.getElementById('stats-filter-accomp-ecoute').checked,
        orientation: document.getElementById('stats-filter-accomp-orientation').checked,
        admin: document.getElementById('stats-filter-accomp-admin').checked,
        medical: document.getElementById('stats-filter-accomp-medical').checked,
        hebergement: document.getElementById('stats-filter-accomp-hebergement').checked,
        autre: document.getElementById('stats-filter-accomp-autre').checked
      },
      
      // Distribution
      distribution: {
        alimentaire: document.getElementById('stats-filter-distrib-alimentaire').checked,
        vestimentaire: document.getElementById('stats-filter-distrib-vestimentaire').checked,
        hygiene: document.getElementById('stats-filter-distrib-hygiene').checked,
        couvertures: document.getElementById('stats-filter-distrib-couvertures').checked,
        duvet: document.getElementById('stats-filter-distrib-duvet').checked,
        autre: document.getElementById('stats-filter-distrib-autre').checked
      }
    };
    
    // Ajouter les dates selon le type de période
    switch (filters.periodType) {
      case 'day':
        filters.date = document.getElementById('stats-specific-day').value;
        break;
      case 'month':
        filters.month = document.getElementById('stats-month').value;
        break;
      case 'year':
        filters.year = document.getElementById('stats-year').value;
        break;
      case 'range':
        filters.startDate = document.getElementById('stats-date-start').value;
        filters.endDate = document.getElementById('stats-date-end').value;
        break;
    }
    
    return filters;
  };
  
  // Fonction pour réinitialiser tous les filtres
  const resetStatsFilters = () => {
    // Réinitialiser les inputs texte
    document.getElementById('stats-filter-nom').value = '';
    document.getElementById('stats-filter-prenom').value = '';
    document.getElementById('stats-filter-ddn').value = '';
    document.getElementById('stats-filter-nb-personnes').value = '';
    document.getElementById('stats-filter-mineurs').value = '';
    document.getElementById('stats-filter-description').value = '';
    document.getElementById('stats-filter-ville').value = '';
    document.getElementById('stats-filter-adresse').value = '';
    
    // Réinitialiser les selects
    document.getElementById('stats-filter-typologie').value = '';
    document.getElementById('stats-filter-inconnu').value = '';
    document.getElementById('stats-filter-departement').value = '';
    document.getElementById('stats-filter-transmission-type').value = '';
    document.getElementById('stats-filter-signalement').value = '';
    document.getElementById('stats-filter-point-accueil').value = '';
    
    // Décocher toutes les cases (y compris "pas de passage")
    document.querySelectorAll('.stats-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    document.getElementById('stats-filter-pas-passage').checked = false;
  };
  
  // Gérer le clic sur le bouton Réinitialiser
  if (statsResetFilters) {
    statsResetFilters.addEventListener('click', () => {
      resetStatsFilters();
      console.log('Filtres réinitialisés');
    });
  }
  
  // Gérer le clic sur le bouton Appliquer
  if (statsApplyFilter) {
    statsApplyFilter.addEventListener('click', () => {
      const filters = collectStatsFilters();
      console.log('Filtres statistiques appliqués:', filters);
      generateStatistics(filters);
    });
  }
  
  // Fonction pour générer les statistiques
  const generateStatistics = async (filters) => {
    const statsContent = document.getElementById('stats-content');
    
    if (!statsContent) return;
    
    // Récupérer les données selon la source
    let transmissionsData = [];
    let adpData = [];
    
    if (filters.source === 'all' || filters.source === 'transmissions') {
      transmissionsData = await getAllTransmissions();
    }
    
    if (filters.source === 'all' || filters.source === 'adp') {
      adpData = await getAllTransmissionsAdp();
    }
    
    // Filtrer les données par période
    const filteredTransmissions = filterByPeriod(transmissionsData, filters);
    const filteredAdp = filterByPeriod(adpData, filters);
    
    // Si "Pas de passage" est coché, on doit trouver les personnes sans transmission pour cette période
    if (filters.pasDePassage) {
      // Récupérer toutes les personnes (toutes les transmissions)
      const allTransmissions = filters.source === 'adp' ? adpData : 
                               filters.source === 'transmissions' ? transmissionsData :
                               [...transmissionsData, ...adpData];
      
      // Identifier les personId qui ONT des transmissions pour la période
      const personIdsWithTransmission = new Set();
      [...filteredTransmissions, ...filteredAdp].forEach(t => {
        const personId = t.personId || t.id;
        personIdsWithTransmission.add(personId);
      });
      
      // Filtrer pour ne garder que les personnes SANS transmission pour la période
      const personsWithoutTransmission = [];
      const seenPersons = new Set();
      
      allTransmissions.forEach(t => {
        const personId = t.personId || t.id;
        if (!personIdsWithTransmission.has(personId) && !seenPersons.has(personId)) {
          seenPersons.add(personId);
          personsWithoutTransmission.push(t);
        }
      });
      
      // Appliquer TOUS les filtres (y compris les filtres de transmission) sur les données historiques
      // Ces filtres sont appliqués sur n'importe quelle transmission de la personne, pas seulement pour la période
      const filteredPersons = applyDetailedFilters(personsWithoutTransmission, filters);
      
      // Remplacer les données filtrées par les personnes sans passage
      if (filters.source === 'all') {
        // Séparer selon la source d'origine
        const finalTransmissions = filteredPersons.filter(t => 
          transmissionsData.some(td => (td.personId || td.id) === (t.personId || t.id))
        );
        const finalAdp = filteredPersons.filter(t => 
          adpData.some(ad => (ad.personId || ad.id) === (t.personId || t.id))
        );
        
        const statsTransmissions = calculateStats(finalTransmissions);
        const statsAdpTotal = calculateStats(finalAdp);
        const statsAdpWithPoint = { menages: 0, personnes: 0, mineurs: 0 };
        const statsAdpWithoutPoint = { menages: 0, personnes: 0, mineurs: 0 };
        
        const allData = [...finalTransmissions, ...finalAdp];
        const statsTotal = calculateStats(allData);
        
        displayStatsResults(filters, statsTotal, statsTransmissions, statsAdpTotal, statsAdpWithPoint, statsAdpWithoutPoint);
      } else if (filters.source === 'transmissions') {
        const stats = calculateStats(filteredPersons);
        displayStatsResults(filters, stats, stats, { menages: 0, personnes: 0, mineurs: 0 }, 
                          { menages: 0, personnes: 0, mineurs: 0 }, { menages: 0, personnes: 0, mineurs: 0 });
      } else { // adp
        const stats = calculateStats(filteredPersons);
        displayStatsResults(filters, stats, { menages: 0, personnes: 0, mineurs: 0 }, stats, 
                          { menages: 0, personnes: 0, mineurs: 0 }, { menages: 0, personnes: 0, mineurs: 0 });
      }
      
      return;
    }
    
    // Comportement normal (avec passage)
    // Appliquer les filtres détaillés
    const finalTransmissions = applyDetailedFilters(filteredTransmissions, filters);
    const finalAdp = applyDetailedFilters(filteredAdp, filters);
    
    // Séparer ADP avec et sans point accueil
    const adpWithPointAccueil = finalAdp.filter(t => t.pointAccueil === true);
    const adpWithoutPointAccueil = finalAdp.filter(t => !t.pointAccueil);
    
    // Calculer les statistiques pour chaque source
    const statsTransmissions = calculateStats(finalTransmissions);
    const statsAdpWithPoint = calculateStats(adpWithPointAccueil);
    const statsAdpWithoutPoint = calculateStats(adpWithoutPointAccueil);
    const statsAdpTotal = calculateStats(finalAdp);
    
    // Calculer le total global
    const allData = [...finalTransmissions, ...finalAdp];
    const statsTotal = calculateStats(allData);
    
    displayStatsResults(filters, statsTotal, statsTransmissions, statsAdpTotal, statsAdpWithPoint, statsAdpWithoutPoint);
  };
  
  // Fonction pour afficher les résultats des statistiques
  const displayStatsResults = (filters, statsTotal, statsTransmissions, statsAdpTotal, statsAdpWithPoint, statsAdpWithoutPoint) => {
    const statsContent = document.getElementById('stats-content');
    if (!statsContent) return;
    // Construire le texte de la période
    let periodText = '';
    switch (filters.periodType) {
      case 'day':
        periodText = `Statistiques pour le ${formatDate(filters.date)}`;
        break;
      case 'month':
        const [year, month] = filters.month.split('-');
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        periodText = `Statistiques pour ${monthNames[parseInt(month) - 1]} ${year}`;
        break;
      case 'year':
        periodText = `Statistiques pour l'année ${filters.year}`;
        break;
      case 'range':
        periodText = `Statistiques du ${formatDate(filters.startDate)} au ${formatDate(filters.endDate)}`;
        break;
    }
    
    // Déterminer la source
    let sourceText = '';
    switch (filters.source) {
      case 'all':
        sourceText = 'Toutes les sources';
        break;
      case 'transmissions':
        sourceText = 'Transmissions Quotidiennes';
        break;
      case 'adp':
        sourceText = 'ADP (Orly)';
        break;
    }
    
    // Générer l'HTML des statistiques
    let statsHTML = `
      <h3 style="color: #667eea; margin-bottom: 1rem;">${periodText}</h3>
      <p style="color: #764ba2; font-weight: 600; margin-bottom: 2rem;">Source : ${sourceText}</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
    `;
    
    // Total global (si "Tous" est sélectionné)
    if (filters.source === 'all') {
      statsHTML += `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          <h4 style="margin: 0 0 1rem 0; font-size: 1.2rem; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 0.5rem;">TOTAL GÉNÉRAL</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem;">
              <span>Nombre de ménages :</span>
              <strong style="font-size: 1.3rem;">${statsTotal.menages}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem;">
              <span>Nombre de personnes :</span>
              <strong style="font-size: 1.3rem;">${statsTotal.personnes}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem;">
              <span>dont Mineurs :</span>
              <strong style="font-size: 1.3rem;">${statsTotal.mineurs}</strong>
            </div>
          </div>
        </div>
      `;
    }
    
    // Transmissions Quotidiennes
    if (filters.source === 'all' || filters.source === 'transmissions') {
      statsHTML += `
        <div style="background: white; border: 2px solid #667eea; padding: 1.5rem; border-radius: 10px;">
          <h4 style="margin: 0 0 1rem 0; color: #667eea; font-size: 1.1rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.5rem;">Transmissions Quotidiennes</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">Nombre de ménages :</span>
              <strong style="color: #667eea; font-size: 1.2rem;">${statsTransmissions.menages}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">Nombre de personnes :</span>
              <strong style="color: #667eea; font-size: 1.2rem;">${statsTransmissions.personnes}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">dont Mineurs :</span>
              <strong style="color: #667eea; font-size: 1.2rem;">${statsTransmissions.mineurs}</strong>
            </div>
          </div>
        </div>
      `;
    }
    
    // ADP Total
    if (filters.source === 'all' || filters.source === 'adp') {
      statsHTML += `
        <div style="background: white; border: 2px solid #764ba2; padding: 1.5rem; border-radius: 10px;">
          <h4 style="margin: 0 0 1rem 0; color: #764ba2; font-size: 1.1rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.5rem;">ADP (Orly) - TOTAL</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">Nombre de ménages :</span>
              <strong style="color: #764ba2; font-size: 1.2rem;">${statsAdpTotal.menages}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">Nombre de personnes :</span>
              <strong style="color: #764ba2; font-size: 1.2rem;">${statsAdpTotal.personnes}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555;">dont Mineurs :</span>
              <strong style="color: #764ba2; font-size: 1.2rem;">${statsAdpTotal.mineurs}</strong>
            </div>
          </div>
        </div>
      `;
      
      // ADP avec Point Accueil
      statsHTML += `
        <div style="background: #f8f9fa; border: 2px solid #764ba2; padding: 1.5rem; border-radius: 10px;">
          <h4 style="margin: 0 0 1rem 0; color: #764ba2; font-size: 1rem; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.5rem;">ADP - Avec Point Accueil</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555; font-size: 0.9rem;">Nombre de ménages :</span>
              <strong style="color: #764ba2;">${statsAdpWithPoint.menages}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555; font-size: 0.9rem;">Nombre de personnes :</span>
              <strong style="color: #764ba2;">${statsAdpWithPoint.personnes}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555; font-size: 0.9rem;">dont Mineurs :</span>
              <strong style="color: #764ba2;">${statsAdpWithPoint.mineurs}</strong>
            </div>
          </div>
        </div>
      `;
      
      // ADP sans Point Accueil
      statsHTML += `
        <div style="background: #f8f9fa; border: 2px solid #764ba2; padding: 1.5rem; border-radius: 10px;">
          <h4 style="margin: 0 0 1rem 0; color: #764ba2; font-size: 1rem; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.5rem;">ADP - Sans Point Accueil</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555; font-size: 0.9rem;">Nombre de ménages :</span>
              <strong style="color: #764ba2;">${statsAdpWithoutPoint.menages}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555; font-size: 0.9rem;">Nombre de personnes :</span>
              <strong style="color: #764ba2;">${statsAdpWithoutPoint.personnes}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #555; font-size: 0.9rem;">dont Mineurs :</span>
              <strong style="color: #764ba2;">${statsAdpWithoutPoint.mineurs}</strong>
            </div>
          </div>
        </div>
      `;
    }
    
    statsHTML += `</div>`;
    
    statsContent.innerHTML = statsHTML;
  };
  
  // Fonction pour filtrer par période
  const filterByPeriod = (data, filters) => {
    return data.filter(item => {
      const itemDate = item.dateTransmission;
      if (!itemDate) return false;
      
      switch (filters.periodType) {
        case 'day':
          return itemDate === filters.date;
        
        case 'month':
          return itemDate.startsWith(filters.month);
        
        case 'year':
          return itemDate.startsWith(filters.year);
        
        case 'range':
          return itemDate >= filters.startDate && itemDate <= filters.endDate;
        
        default:
          return true;
      }
    });
  };
  
  // Fonction pour appliquer les filtres détaillés
  const applyDetailedFilters = (data, filters) => {
    return data.filter(item => {
      // Filtres texte
      if (filters.nom && !item.nom?.toLowerCase().includes(filters.nom.toLowerCase())) return false;
      if (filters.prenom && !item.prenom?.toLowerCase().includes(filters.prenom.toLowerCase())) return false;
      if (filters.dateNaissance && item.dateNaissance !== filters.dateNaissance) return false;
      if (filters.ville && !item.ville?.toLowerCase().includes(filters.ville.toLowerCase())) return false;
      if (filters.adresse && !item.adresse?.toLowerCase().includes(filters.adresse.toLowerCase())) return false;
      if (filters.descriptionPhysique && !item.descriptionPhysique?.toLowerCase().includes(filters.descriptionPhysique.toLowerCase())) return false;
      
      // Filtres select
      if (filters.typologie && item.typologie !== filters.typologie) return false;
      if (filters.typeTransmission && item.typeTransmission !== filters.typeTransmission) return false;
      if (filters.signalement && item.signalement !== filters.signalement) return false;
      if (filters.departement && item.departementOrigine !== filters.departement) return false;
      
      // Filtres numériques
      if (filters.nbPersonnes && item.nbPersonnes !== filters.nbPersonnes) return false;
      if (filters.mineurs && item.mineurs !== filters.mineurs) return false;
      
      // Filtres booléens
      if (filters.inconnu) {
        const isInconnu = filters.inconnu === 'true';
        if (item.inconnu !== isInconnu) return false;
      }
      
      if (filters.pointAccueil) {
        const hasPointAccueil = filters.pointAccueil === 'true';
        if (item.pointAccueil !== hasPointAccueil) return false;
      }
      
      // Filtres checkboxes - Type d'intervention
      if (filters.orly.premierContact && !item.orly?.premierContact) return false;
      if (filters.orly.personnePresente && !item.orly?.personnePresente) return false;
      if (filters.orly.pnt && !item.orly?.pnt) return false;
      if (filters.orly.maraude && !item.orly?.maraude) return false;
      if (filters.orly.veille && !item.orly?.veille) return false;
      if (filters.orly.refusContact && !item.orly?.refusContact) return false;
      
      // Filtres checkboxes - Accompagnement
      if (filters.accompagnement.ecoute && !item.accompagnement?.ecoute) return false;
      if (filters.accompagnement.orientation && !item.accompagnement?.orientation) return false;
      if (filters.accompagnement.admin && !item.accompagnement?.admin) return false;
      if (filters.accompagnement.medical && !item.accompagnement?.medical) return false;
      if (filters.accompagnement.hebergement && !item.accompagnement?.hebergement) return false;
      if (filters.accompagnement.autre && !item.accompagnement?.autre) return false;
      
      // Filtres checkboxes - Distribution
      if (filters.distribution.alimentaire && !item.distribution?.alimentaire) return false;
      if (filters.distribution.vestimentaire && !item.distribution?.vestimentaire) return false;
      if (filters.distribution.hygiene && !item.distribution?.hygiene) return false;
      if (filters.distribution.couvertures && !item.distribution?.couvertures) return false;
      if (filters.distribution.duvet && !item.distribution?.duvet) return false;
      if (filters.distribution.autre && !item.distribution?.autre) return false;
      
      return true;
    });
  };
  
  // Fonction pour calculer les statistiques
  const calculateStats = (data) => {
    // Regrouper par personId pour compter les ménages
    const menagesMap = new Map();
    let totalPersonnes = 0;
    let totalMineurs = 0;
    
    data.forEach(item => {
      const personId = item.personId || item.id;
      
      // Si c'est un nouveau ménage, l'ajouter
      if (!menagesMap.has(personId)) {
        menagesMap.set(personId, item);
        
        // Ajouter le nombre de personnes (si spécifié, sinon 1)
        const nbPersonnes = parseInt(item.nbPersonnes) || 1;
        totalPersonnes += nbPersonnes;
        
        // Ajouter le nombre de mineurs
        const nbMineurs = parseInt(item.mineurs) || 0;
        totalMineurs += nbMineurs;
      }
    });
    
    return {
      menages: menagesMap.size,
      personnes: totalPersonnes,
      mineurs: totalMineurs
    };
  };



  // Exemple d'utilisation de l'API Electron (si disponible)
  if (window.electronAPI) {
    console.log('API Electron disponible');
  }
});

