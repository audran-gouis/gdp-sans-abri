/**
 * BASE DE DONNÉES UNIFIÉE - Architecture unique pour toutes les données
 * 
 * Structure :
 * - Table "personnes" : informations de base des personnes
 * - Table "interventions" : toutes les interventions (Transmissions, ADP, Point Accueil)
 *   avec référence à la personne par personneId
 * 
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées sur window
 */

(function() {
  'use strict';

  const DB_NAME = 'MaraudesUnifiedDB';
  const DB_VERSION = 1;
  const STORE_PERSONNES = 'personnes';
  const STORE_INTERVENTIONS = 'interventions';

  let db = null;

  /**
   * Initialise la base de données unifiée
   */
  const initDatabaseUnified = () => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erreur ouverture DB Unifiée');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('✅ Base de données unifiée ouverte');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Table PERSONNES
        if (!db.objectStoreNames.contains(STORE_PERSONNES)) {
          const storePersonnes = db.createObjectStore(STORE_PERSONNES, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Index pour recherche
          storePersonnes.createIndex('personId', 'personId', { unique: true });
          storePersonnes.createIndex('nom', 'nom', { unique: false });
          storePersonnes.createIndex('prenom', 'prenom', { unique: false });
          storePersonnes.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          storePersonnes.createIndex('descriptionPhysique', 'descriptionPhysique', { unique: false });
          storePersonnes.createIndex('inconnu', 'inconnu', { unique: false });
          storePersonnes.createIndex('departement', 'departement', { unique: false });

          console.log('✅ Table Personnes créée');
        }

        // Table INTERVENTIONS
        if (!db.objectStoreNames.contains(STORE_INTERVENTIONS)) {
          const storeInterventions = db.createObjectStore(STORE_INTERVENTIONS, {
            keyPath: 'id',
            autoIncrement: true
          });

          // Index pour recherche
          storeInterventions.createIndex('personneId', 'personneId', { unique: false });
          storeInterventions.createIndex('date', 'date', { unique: false });
          storeInterventions.createIndex('type', 'type', { unique: false });
          storeInterventions.createIndex('personneDate', ['personneId', 'date'], { unique: false });
          storeInterventions.createIndex('personneType', ['personneId', 'type'], { unique: false });

          console.log('✅ Table Interventions créée');
        }
      };
    });
  };

  /**
   * Génère un personId unique basé sur les infos de la personne
   */
  const genererPersonId = (personne) => {
    if (personne.inconnu) {
      return `inconnu_${(personne.descriptionPhysique || '').substring(0, 50).replace(/\s/g, '_').toLowerCase()}_${Date.now()}`;
    }

    const nom = (personne.nom || '').toLowerCase().trim();
    const prenom = (personne.prenom || '').toLowerCase().trim();
    const ddn = personne.dateNaissance || '';

    return `${nom}_${prenom}_${ddn}`;
  };

  // ============================================================
  // GESTION DES PERSONNES
  // ============================================================

  /**
   * Trouve une personne par ses informations
   */
  const trouverPersonne = async (infos) => {
    await initDatabaseUnified();
    const personIdRecherche = genererPersonId(infos);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PERSONNES], 'readonly');
      const objectStore = transaction.objectStore(STORE_PERSONNES);
      const index = objectStore.index('personId');
      const request = index.get(personIdRecherche);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Crée une nouvelle personne ou récupère l'ID d'une personne existante
   */
  const creerOuRecupererPersonne = async (infos) => {
    await initDatabaseUnified();

    console.log('🔍 Recherche/Création personne:', infos);

    // Chercher si la personne existe déjà
    const personneExistante = await trouverPersonne(infos);

    if (personneExistante) {
      console.log('✅ Personne existante trouvée, ID:', personneExistante.id);
      return personneExistante.id;
    }

    // Créer une nouvelle personne
    const personId = genererPersonId(infos);

    const nouvellePersonne = {
      personId,
      nom: infos.nom || '',
      prenom: infos.prenom || '',
      dateNaissance: infos.dateNaissance || '',
      descriptionPhysique: infos.descriptionPhysique || '',
      inconnu: infos.inconnu || false,
      departement: infos.departement || '',
      typologie: infos.typologie || '',
      nbPersonnes: infos.nbPersonnes || '',
      mineurs: infos.mineurs || '',
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PERSONNES], 'readwrite');
      const objectStore = transaction.objectStore(STORE_PERSONNES);
      const request = objectStore.add(nouvellePersonne);

      request.onsuccess = () => {
        console.log('✅ Nouvelle personne créée, ID:', request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère une personne par son ID
   */
  const getPersonneById = async (id) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PERSONNES], 'readonly');
      const objectStore = transaction.objectStore(STORE_PERSONNES);
      const request = objectStore.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Met à jour les informations d'une personne
   */
  const updatePersonne = async (id, infos) => {
    await initDatabaseUnified();

    return new Promise(async (resolve, reject) => {
      const personne = await getPersonneById(id);
      if (!personne) {
        reject(new Error('Personne non trouvée'));
        return;
      }

      const personneModifiee = {
        ...personne,
        nom: infos.nom !== undefined ? infos.nom : personne.nom,
        prenom: infos.prenom !== undefined ? infos.prenom : personne.prenom,
        dateNaissance: infos.dateNaissance || personne.dateNaissance,
        descriptionPhysique: infos.descriptionPhysique !== undefined ? infos.descriptionPhysique : personne.descriptionPhysique,
        inconnu: typeof infos.inconnu === 'boolean' ? infos.inconnu : personne.inconnu,
        departement: infos.departement !== undefined ? infos.departement : personne.departement,
        typologie: infos.typologie || personne.typologie,
        nbPersonnes: infos.nbPersonnes !== undefined ? infos.nbPersonnes : personne.nbPersonnes,
        mineurs: infos.mineurs !== undefined ? infos.mineurs : personne.mineurs,
        dateModification: new Date().toISOString()
      };

      const transaction = db.transaction([STORE_PERSONNES], 'readwrite');
      const objectStore = transaction.objectStore(STORE_PERSONNES);
      const request = objectStore.put(personneModifiee);

      request.onsuccess = () => {
        console.log('✅ Personne mise à jour, ID:', id);
        resolve(personneModifiee);
      };
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère toutes les personnes
   */
  const getAllPersonnes = async () => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_PERSONNES], 'readonly');
      const objectStore = transaction.objectStore(STORE_PERSONNES);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  // ============================================================
  // GESTION DES INTERVENTIONS
  // ============================================================

  /**
   * Ajoute une nouvelle intervention
   */
  const ajouterIntervention = async (intervention) => {
    await initDatabaseUnified();

    if (!intervention.personneId) {
      throw new Error('personneId requis pour ajouter une intervention');
    }
    if (!intervention.date) {
      throw new Error('date requise pour ajouter une intervention');
    }
    if (!intervention.type) {
      throw new Error('type requis (transmissions/adp/pointAccueil)');
    }

    const nouvelleIntervention = {
      ...intervention,
      dateCreation: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readwrite');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const request = objectStore.add(nouvelleIntervention);

      request.onsuccess = () => {
        console.log(`✅ Intervention ${intervention.type} ajoutée, ID:`, request.result);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Met à jour une intervention existante
   */
  const updateIntervention = async (id, data) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readwrite');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      
      const getRequest = objectStore.get(id);
      
      getRequest.onsuccess = () => {
        const intervention = getRequest.result;
        if (!intervention) {
          reject(new Error('Intervention non trouvée'));
          return;
        }

        const interventionModifiee = {
          ...intervention,
          ...data,
          id: intervention.id,
          dateModification: new Date().toISOString()
        };

        const putRequest = objectStore.put(interventionModifiee);
        putRequest.onsuccess = () => {
          console.log('✅ Intervention mise à jour, ID:', id);
          resolve(interventionModifiee);
        };
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  };

  /**
   * Récupère une intervention par ID
   */
  const getInterventionById = async (id) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readonly');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const request = objectStore.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère toutes les interventions
   */
  const getAllInterventions = async () => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readonly');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère les interventions d'une personne
   */
  const getInterventionsByPersonne = async (personneId) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readonly');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const index = objectStore.index('personneId');
      const request = index.getAll(personneId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère les interventions d'une personne pour une date donnée
   */
  const getInterventionsByPersonneAndDate = async (personneId, date) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readonly');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const index = objectStore.index('personneDate');
      const request = index.getAll([personneId, date]);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère les interventions par type
   */
  const getInterventionsByType = async (type) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readonly');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const index = objectStore.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Récupère les interventions d'une personne pour un type donné
   */
  const getInterventionsByPersonneAndType = async (personneId, type) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readonly');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const index = objectStore.index('personneType');
      const request = index.getAll([personneId, type]);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  /**
   * Supprime une intervention
   */
  const deleteIntervention = async (id) => {
    await initDatabaseUnified();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_INTERVENTIONS], 'readwrite');
      const objectStore = transaction.objectStore(STORE_INTERVENTIONS);
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        console.log('✅ Intervention supprimée, ID:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  };

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================

  /**
   * Récupère toutes les personnes avec leurs interventions
   */
  const getPersonnesAvecInterventions = async () => {
    await initDatabaseUnified();

    const personnes = await getAllPersonnes();
    const interventions = await getAllInterventions();

    // Grouper les interventions par personne
    const interventionsParPersonne = {};
    interventions.forEach(intervention => {
      if (!interventionsParPersonne[intervention.personneId]) {
        interventionsParPersonne[intervention.personneId] = [];
      }
      interventionsParPersonne[intervention.personneId].push(intervention);
    });

    // Enrichir les personnes avec leurs interventions
    return personnes.map(personne => ({
      ...personne,
      interventions: interventionsParPersonne[personne.id] || []
    }));
  };

  // ============================================================
  // EXPORTS GLOBAUX
  // ============================================================

  // Exposer les fonctions globalement
  window.initDatabaseUnified = initDatabaseUnified;
  
  // Personnes
  window.creerOuRecupererPersonne = creerOuRecupererPersonne;
  window.getPersonneById = getPersonneById;
  window.updatePersonne = updatePersonne;
  window.getAllPersonnes = getAllPersonnes;
  window.trouverPersonne = trouverPersonne;
  
  // Interventions
  window.ajouterIntervention = ajouterIntervention;
  window.updateIntervention = updateIntervention;
  window.getInterventionById = getInterventionById;
  window.getAllInterventions = getAllInterventions;
  window.getInterventionsByPersonne = getInterventionsByPersonne;
  window.getInterventionsByPersonneAndDate = getInterventionsByPersonneAndDate;
  window.getInterventionsByType = getInterventionsByType;
  window.getInterventionsByPersonneAndType = getInterventionsByPersonneAndType;
  window.deleteIntervention = deleteIntervention;
  
  // Utilitaires
  window.getPersonnesAvecInterventions = getPersonnesAvecInterventions;

  console.log('📦 Module Base de Données Unifiée chargé');
})();

