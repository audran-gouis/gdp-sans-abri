(function() {
  'use strict';

  const DB_NAME_UNIFIED = 'MaraudesUnifiedDB';
  const DB_VERSION_UNIFIED = 2;
  const STORE_PERSONNES = 'personnes';
  const STORE_INTERVENTIONS = 'interventions';

  let dbUnified = null;

  const initDatabaseUnified = () => {
    return new Promise((resolve, reject) => {
      if (dbUnified) {
        resolve(dbUnified);
        return;
      }

      const request = indexedDB.open(DB_NAME_UNIFIED, DB_VERSION_UNIFIED);

      request.onerror = () => {
        console.error('❌ Erreur ouverture DB Unifiée');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        dbUnified = event.target.result;
        console.log('✅ Base Unifiée ouverte');
        resolve(dbUnified);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const transaction = event.target.transaction;
        const oldVersion = event.oldVersion;

        console.log(`🔄 Mise à jour DB de version ${oldVersion} vers ${DB_VERSION_UNIFIED}`);

        // Store pour les personnes
        if (!db.objectStoreNames.contains(STORE_PERSONNES)) {
          const personnesStore = db.createObjectStore(STORE_PERSONNES, {
            keyPath: 'id',
            autoIncrement: true
          });
          personnesStore.createIndex('personId', 'personId', { unique: true });
          personnesStore.createIndex('nom', 'nom', { unique: false });
          personnesStore.createIndex('prenom', 'prenom', { unique: false });
          personnesStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          personnesStore.createIndex('inconnu', 'inconnu', { unique: false });
          console.log('✅ Object store Personnes créé dans DB Unifiée');
        }

        // Store pour les interventions
        let interventionsStore;
        if (!db.objectStoreNames.contains(STORE_INTERVENTIONS)) {
          interventionsStore = db.createObjectStore(STORE_INTERVENTIONS, {
            keyPath: 'id',
            autoIncrement: true
          });
          interventionsStore.createIndex('personneId', 'personneId', { unique: false });
          interventionsStore.createIndex('date', 'date', { unique: false });
          interventionsStore.createIndex('type', 'type', { unique: false });
          interventionsStore.createIndex('personneId_date_type', ['personneId', 'date', 'type'], { unique: false });
          console.log('✅ Object store Interventions créé dans DB Unifiée');
        } else {
          // Récupérer le store existant depuis la transaction
          interventionsStore = transaction.objectStore(STORE_INTERVENTIONS);
          
          // Ajouter l'index composé s'il n'existe pas (migration v1 -> v2)
          if (oldVersion < 2 && !interventionsStore.indexNames.contains('personneId_date_type')) {
            interventionsStore.createIndex('personneId_date_type', ['personneId', 'date', 'type'], { unique: false });
            console.log('✅ Index composé personneId_date_type ajouté');
          }
        }
      };
    });
  };

  const genererPersonId = (personne) => {
    if (personne.inconnu) {
      return `inconnu_${(personne.descriptionPhysique || '').substring(0, 50).replace(/\s/g, '_').toLowerCase()}`;
    }
    const nom = (personne.nom || '').toLowerCase().trim();
    const prenom = (personne.prenom || '').toLowerCase().trim();
    const ddn = personne.dateNaissance || '';
    return `${nom}_${prenom}_${ddn}`;
  };

  const creerOuRecupererPersonne = async (infos) => {
    await initDatabaseUnified();
    const personId = genererPersonId(infos);

    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_PERSONNES], 'readwrite');
      const store = transaction.objectStore(STORE_PERSONNES);
      const index = store.index('personId');
      const request = index.get(personId);

      request.onsuccess = async () => {
        let personne = request.result;
        if (personne) {
          // Mettre à jour les infos de la personne si elle existe
          const updatedPersonne = {
            ...personne,
            nom: infos.nom || personne.nom,
            prenom: infos.prenom || personne.prenom,
            dateNaissance: infos.dateNaissance || personne.dateNaissance,
            descriptionPhysique: infos.descriptionPhysique || personne.descriptionPhysique,
            inconnu: typeof infos.inconnu === 'boolean' ? infos.inconnu : personne.inconnu,
            departement: infos.departement || personne.departement,
            typologie: infos.typologie || personne.typologie,
            nbPersonnes: infos.nbPersonnes || personne.nbPersonnes,
            mineurs: infos.mineurs || personne.mineurs,
            dateModification: new Date().toISOString()
          };
          await updatePersonne(personne.id, updatedPersonne);
          resolve(personne.id);
        } else {
          // Créer une nouvelle personne
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
          const addRequest = store.add(nouvellePersonne);
          addRequest.onsuccess = () => resolve(addRequest.result);
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      request.onerror = () => reject(request.error);
    });
  };

  const getPersonneById = async (id) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_PERSONNES], 'readonly');
      const store = transaction.objectStore(STORE_PERSONNES);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

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
        nom: infos.nom || personne.nom,
        prenom: infos.prenom || personne.prenom,
        dateNaissance: infos.dateNaissance || personne.dateNaissance,
        descriptionPhysique: infos.descriptionPhysique || personne.descriptionPhysique,
        inconnu: typeof infos.inconnu === 'boolean' ? infos.inconnu : personne.inconnu,
        departement: infos.departement || personne.departement,
        typologie: infos.typologie || personne.typologie,
        nbPersonnes: infos.nbPersonnes || personne.nbPersonnes,
        mineurs: infos.mineurs || personne.mineurs,
        dateModification: new Date().toISOString()
      };
      const transaction = dbUnified.transaction([STORE_PERSONNES], 'readwrite');
      const store = transaction.objectStore(STORE_PERSONNES);
      const request = store.put(personneModifiee);
      request.onsuccess = () => resolve(personneModifiee);
      request.onerror = () => reject(request.error);
    });
  };

  const deletePersonne = async (id) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_PERSONNES, STORE_INTERVENTIONS], 'readwrite');
      const personnesStore = transaction.objectStore(STORE_PERSONNES);
      const interventionsStore = transaction.objectStore(STORE_INTERVENTIONS);

      // Supprimer toutes les interventions liées à cette personne
      const index = interventionsStore.index('personneId');
      const range = IDBKeyRange.only(id);
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Supprimer la personne elle-même
      const request = personnesStore.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const getAllPersonnes = async () => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_PERSONNES], 'readonly');
      const store = transaction.objectStore(STORE_PERSONNES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const addIntervention = async (intervention) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readwrite');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const request = store.add(intervention);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getInterventionById = async (id) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readonly');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateIntervention = async (id, updates) => {
    await initDatabaseUnified();
    return new Promise(async (resolve, reject) => {
      const intervention = await getInterventionById(id);
      if (!intervention) {
        reject(new Error('Intervention non trouvée'));
        return;
      }
      const updatedIntervention = {
        ...intervention,
        ...updates,
        dateModification: new Date().toISOString()
      };
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readwrite');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const request = store.put(updatedIntervention);
      request.onsuccess = () => resolve(updatedIntervention);
      request.onerror = () => reject(request.error);
    });
  };

  const deleteIntervention = async (id) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readwrite');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const getAllInterventions = async () => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readonly');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const getInterventionsByPersonneIdAndDateAndType = async (personneId, date, type) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readonly');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const index = store.index('personneId_date_type');
      const key = [personneId, date, type];
      const request = index.getAll(key);
      request.onsuccess = () => {
        const results = request.result;
        // Retourner le premier résultat ou null si aucun
        resolve(results.length > 0 ? results[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  };

  const getInterventionsByPersonneAndDate = async (personneId, date) => {
    await initDatabaseUnified();
    return new Promise((resolve, reject) => {
      const transaction = dbUnified.transaction([STORE_INTERVENTIONS], 'readonly');
      const store = transaction.objectStore(STORE_INTERVENTIONS);
      const index = store.index('personneId');
      const range = IDBKeyRange.only(personneId);
      const request = index.getAll(range);
      
      request.onsuccess = () => {
        const interventions = request.result.filter(i => i.date === date);
        resolve(interventions);
      };
      request.onerror = () => reject(request.error);
    });
  };

  const getPersonnesAvecInterventions = async () => {
    await initDatabaseUnified();
    const personnes = await getAllPersonnes();
    const interventions = await getAllInterventions();

    const personnesMap = new Map(personnes.map(p => [p.id, { ...p, interventions: [] }]));

    interventions.forEach(interv => {
      if (personnesMap.has(interv.personneId)) {
        personnesMap.get(interv.personneId).interventions.push(interv);
      }
    });

    return Array.from(personnesMap.values());
  };

  /**
   * Change le type d'une intervention (déplace d'un type à un autre)
   * @param {number} interventionId - ID de l'intervention à déplacer
   * @param {string} nouveauType - Nouveau type ('transmissions', 'adp', 'pointAccueil')
   * @returns {Promise<Object>} - L'intervention mise à jour
   */
  const changerTypeIntervention = async (interventionId, nouveauType) => {
    await initDatabaseUnified();
    
    return new Promise(async (resolve, reject) => {
      try {
        // Récupérer l'intervention actuelle
        const intervention = await getInterventionById(interventionId);
        
        if (!intervention) {
          reject(new Error('Intervention non trouvée'));
          return;
        }
        
        // Vérifier si une intervention du nouveau type existe déjà pour cette personne et cette date
        const existingIntervention = await getInterventionsByPersonneIdAndDateAndType(
          intervention.personneId,
          intervention.date,
          nouveauType
        );
        
        if (existingIntervention && existingIntervention.id !== interventionId) {
          reject(new Error(`Une intervention de type "${nouveauType}" existe déjà pour cette personne à cette date`));
          return;
        }
        
        // Pour éviter les conflits avec l'index unique, on doit supprimer puis recréer
        // Sauvegarder toutes les données
        const interventionData = {
          personneId: intervention.personneId,
          date: intervention.date,
          type: nouveauType,
          typeTransmission: intervention.typeTransmission || '',
          adresse: intervention.adresse || intervention.lieu || '',
          lieu: intervention.lieu || intervention.adresse || '',
          ville: intervention.ville || '',
          signalement: intervention.signalement || '',
          transmission: intervention.transmission || '',
          observations: intervention.observations || intervention.transmission || '',
          orly: intervention.orly || {},
          accompagnement: intervention.accompagnement || {},
          distribution: intervention.distribution || {},
          dateCreation: intervention.dateCreation || new Date().toISOString(),
          dateModification: new Date().toISOString()
        };
        
        // Supprimer l'ancienne intervention
        await deleteIntervention(interventionId);
        
        // Créer la nouvelle intervention avec le nouveau type
        const newInterventionId = await addIntervention(interventionData);
        
        // Récupérer la nouvelle intervention créée
        const newIntervention = await getInterventionById(newInterventionId);
        resolve(newIntervention);
      } catch (error) {
        console.error('❌ Erreur lors du changement de type:', error);
        reject(error);
      }
    });
  };

  window.initDatabaseUnified = initDatabaseUnified;
  window.creerOuRecupererPersonne = creerOuRecupererPersonne;
  window.getPersonneById = getPersonneById;
  window.updatePersonne = updatePersonne;
  window.deletePersonne = deletePersonne;
  window.addIntervention = addIntervention;
  window.ajouterIntervention = addIntervention; // Alias
  window.getInterventionById = getInterventionById;
  window.updateIntervention = updateIntervention;
  window.modifierIntervention = updateIntervention; // Alias
  window.deleteIntervention = deleteIntervention;
  window.supprimerIntervention = deleteIntervention; // Alias
  window.getAllPersonnes = getAllPersonnes;
  window.getAllInterventions = getAllInterventions;
  window.getInterventionsByPersonneIdAndDateAndType = getInterventionsByPersonneIdAndDateAndType;
  window.getInterventionsByPersonneAndDate = getInterventionsByPersonneAndDate;
  window.getPersonnesAvecInterventions = getPersonnesAvecInterventions;
  window.changerTypeIntervention = changerTypeIntervention;

  console.log('📦 Module Persistance Unifiée chargé');
})();