// Script du processus de rendu
document.addEventListener('DOMContentLoaded', () => {
  // ==================== INDEXEDDB POUR TRANSMISSIONS ====================
  let db;
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 1;
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
          
          console.log('Object store créé avec succès');
        }
      };
    });
  };

  // Ajouter une transmission dans la base de données
  const addTransmission = (data) => {
    return new Promise((resolve, reject) => {
      // Ajouter la date de création
      data.dateCreation = new Date().toISOString();
      
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

  // Fonction pour créer une carte HTML
  const createCard = (transmission) => {
    const card = document.createElement('div');
    card.className = 'transmission-card';
    card.dataset.id = transmission.id;

    // Construire les badges pour les interventions
    let badges = '';
    
    // Type d'intervention
    if (transmission.orly) {
      if (transmission.orly.premierContact) badges += '<span class="badge">1er contact</span>';
      if (transmission.orly.personnePresente) badges += '<span class="badge">Personne présente</span>';
      if (transmission.orly.pnt) badges += '<span class="badge">PNT</span>';
      if (transmission.orly.maraude) badges += '<span class="badge secondary">Maraude</span>';
      if (transmission.orly.veille) badges += '<span class="badge secondary">Veille</span>';
      if (transmission.orly.refusContact) badges += '<span class="badge secondary">Refus de contact</span>';
    }

    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${transmission.nom || 'Nom inconnu'} ${transmission.prenom || ''}</h3>
        <span class="card-date">${formatDate(transmission.dateCreation)}</span>
      </div>
      <div class="card-content">
        ${transmission.dateNaissance ? `
          <div class="card-info">
            <span class="card-label">Date de naissance :</span>
            <span class="card-value">${formatDate(transmission.dateNaissance)}</span>
          </div>
        ` : ''}
        ${transmission.typologie ? `
          <div class="card-info">
            <span class="card-label">Typologie :</span>
            <span class="card-value">${transmission.typologie}</span>
          </div>
        ` : ''}
        ${transmission.ville ? `
          <div class="card-info">
            <span class="card-label">Ville :</span>
            <span class="card-value">${transmission.ville}</span>
          </div>
        ` : ''}
        ${transmission.adresse ? `
          <div class="card-info">
            <span class="card-label">Adresse :</span>
            <span class="card-value">${transmission.adresse}</span>
          </div>
        ` : ''}
        ${transmission.typeTransmission ? `
          <div class="card-info">
            <span class="card-label">Transmission :</span>
            <span class="card-value">${transmission.typeTransmission}</span>
          </div>
        ` : ''}
        ${badges ? `<div class="card-badges">${badges}</div>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn-card btn-edit" onclick="editTransmission(${transmission.id})">Compléter</button>
        <button class="btn-card btn-delete" onclick="deleteTransmissionCard(${transmission.id})">Supprimer</button>
      </div>
    `;

    return card;
  };

  // Fonction pour afficher toutes les cartes
  const displayCards = (transmissions) => {
    const container = document.getElementById('transmissions-list');
    
    if (!transmissions || transmissions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>Aucune transmission enregistrée</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    transmissions.forEach(transmission => {
      const card = createCard(transmission);
      container.appendChild(card);
    });
  };

  // Fonction pour charger et afficher les cartes
  const loadAndDisplayCards = async () => {
    try {
      const transmissions = await getAllTransmissions();
      displayCards(transmissions);
    } catch (error) {
      console.error('Erreur lors du chargement des transmissions:', error);
    }
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

  // Fonction globale pour éditer une transmission (à implémenter)
  window.editTransmission = (id) => {
    console.log('Édition de la transmission:', id);
    // TODO: Implémenter l'édition
    alert('Fonction d\'édition à venir');
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
    modal.classList.add('show');
  });

  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    modalContent.classList.remove('fullscreen');
    btnExpand.textContent = '⛶';
    btnExpand.title = 'Agrandir';
    formTransmission.reset();
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
      // Sauvegarder dans IndexedDB
      const id = await addTransmission(formData);
      console.log('Données du formulaire sauvegardées avec succès, ID:', id);
      
      // Recharger et afficher les cartes
      await loadAndDisplayCards();
      
      // Afficher un message de succès (optionnel)
      alert('Transmission enregistrée avec succès !');
      
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement de la transmission');
    }
  });

  // Gestion automatique des champs selon la typologie de ménage
  const typologieSelect = document.getElementById('form-typologie');
  const nbPersonnesSelect = document.getElementById('form-nb-personnes');
  const mineursSelect = document.getElementById('form-mineurs');

  typologieSelect.addEventListener('change', () => {
    const typologie = typologieSelect.value;

    if (typologie === 'homme-seul' || typologie === 'femme-seule') {
      // Pour homme seul ou femme seule : 1 personne, 0 mineur, champs désactivés
      nbPersonnesSelect.value = '1';
      nbPersonnesSelect.disabled = true;
      mineursSelect.value = '0';
      mineursSelect.disabled = true;
    } else if (typologie === 'groupe-adultes-sans-enfant') {
      // Pour groupe sans enfant : nombre de personnes libre, 0 mineur (désactivé)
      nbPersonnesSelect.disabled = false;
      if (!nbPersonnesSelect.value) {
        nbPersonnesSelect.value = '';
      }
      mineursSelect.value = '0';
      mineursSelect.disabled = true;
    } else {
      // Pour les autres typologies : réactiver tous les champs
      nbPersonnesSelect.disabled = false;
      mineursSelect.disabled = false;
      // Réinitialiser si vide
      if (!nbPersonnesSelect.value) {
        nbPersonnesSelect.value = '';
      }
      if (!mineursSelect.value) {
        mineursSelect.value = '';
      }
    }
  });

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
    modalAdp.classList.add('show');
  });

  // Fermer la modal ADP
  const closeModalAdp = () => {
    modalAdp.classList.remove('show');
    adpModalContent.classList.remove('fullscreen');
    adpBtnExpand.textContent = '⛶';
    adpBtnExpand.title = 'Agrandir';
    formAdp.reset();
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
  formAdp.addEventListener('submit', (e) => {
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

    console.log('Données du formulaire ADP:', formData);
    // TODO: Traiter les données (sauvegarder, envoyer, etc.)
    
    closeModalAdp();
  });

  // Gestion automatique des champs selon la typologie de ménage (ADP)
  const adpTypologieSelect = document.getElementById('adp-form-typologie');
  const adpNbPersonnesSelect = document.getElementById('adp-form-nb-personnes');
  const adpMineursSelect = document.getElementById('adp-form-mineurs');

  adpTypologieSelect.addEventListener('change', () => {
    const typologie = adpTypologieSelect.value;

    if (typologie === 'homme-seul' || typologie === 'femme-seule') {
      // Pour homme seul ou femme seule : 1 personne, 0 mineur, champs désactivés
      adpNbPersonnesSelect.value = '1';
      adpNbPersonnesSelect.disabled = true;
      adpMineursSelect.value = '0';
      adpMineursSelect.disabled = true;
    } else if (typologie === 'groupe-adultes-sans-enfant') {
      // Pour groupe sans enfant : nombre de personnes libre, 0 mineur (désactivé)
      adpNbPersonnesSelect.disabled = false;
      if (!adpNbPersonnesSelect.value) {
        adpNbPersonnesSelect.value = '';
      }
      adpMineursSelect.value = '0';
      adpMineursSelect.disabled = true;
    } else {
      // Pour les autres typologies : réactiver tous les champs
      adpNbPersonnesSelect.disabled = false;
      adpMineursSelect.disabled = false;
      // Réinitialiser si vide
      if (!adpNbPersonnesSelect.value) {
        adpNbPersonnesSelect.value = '';
      }
      if (!adpMineursSelect.value) {
        adpMineursSelect.value = '';
      }
    }
  });

  // Exemple d'utilisation de l'API Electron (si disponible)
  if (window.electronAPI) {
    console.log('API Electron disponible');
  }
});

