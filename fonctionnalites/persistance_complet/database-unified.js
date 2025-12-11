(function() {
  'use strict';

  const DB_NAME_UNIFIED = 'MaraudesUnifiedDB';
  const DB_VERSION_UNIFIED = 1;
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
        if (!db.objectStoreNames.contains(STORE_INTERVENTIONS)) {
          const interventionsStore = db.createObjectStore(STORE_INTERVENTIONS, {
            keyPath: 'id',
            autoIncrement: true
          });
          interventionsStore.createIndex('personneId', 'personneId', { unique: false });
          interventionsStore.createIndex('date', 'date', { unique: false });
          interventionsStore.createIndex('type', 'type', { unique: false });
          interventionsStore.createIndex('personneId_date_type', ['personneId', 'date', 'type'], { unique: true });
          console.log('✅ Object store Interventions créé dans DB Unifiée');
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
      
      // Vérifier si l'index composite existe
      let indexExists = false;
      try {
        const index = store.index('personneId_date_type');
        indexExists = true;
        const key = [personneId, date, type];
        const request = index.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          // En cas d'erreur, utiliser la méthode alternative
          fallbackGetIntervention(store, personneId, date, type, resolve, reject);
        };
      } catch (error) {
        // L'index n'existe pas, utiliser la méthode alternative
        fallbackGetIntervention(store, personneId, date, type, resolve, reject);
      }
    });
  };
  
  // Fonction de secours pour récupérer une intervention sans index composite
  const fallbackGetIntervention = (store, personneId, date, type, resolve, reject) => {
    try {
      const index = store.index('personneId');
      const range = IDBKeyRange.only(personneId);
      const request = index.getAll(range);
      
      request.onsuccess = () => {
        const interventions = request.result.filter(i => i.date === date && i.type === type);
        resolve(interventions.length > 0 ? interventions[0] : null);
      };
      request.onerror = () => {
        // Si même l'index personneId n'existe pas, utiliser getAll
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const interventions = getAllRequest.result.filter(
            i => i.personneId === personneId && i.date === date && i.type === type
          );
          resolve(interventions.length > 0 ? interventions[0] : null);
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    } catch (error) {
      // Si aucun index n'existe, utiliser getAll
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const interventions = getAllRequest.result.filter(
          i => i.personneId === personneId && i.date === date && i.type === type
        );
        resolve(interventions.length > 0 ? interventions[0] : null);
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
    }
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

  // ==================== FONCTIONS DE COMPATIBILITÉ (ancienne API) ====================
  
  /**
   * Fonction de compatibilité pour addTransmission (ancienne API)
   * Convertit l'ancien format vers le nouveau format de la base unifiée
   */
  const addTransmission = async (data) => {
    await initDatabaseUnified();
    
    try {
      // Séparer les données de la personne et de l'intervention
      const personneData = {
        nom: data.nom || '',
        prenom: data.prenom || '',
        dateNaissance: data.dateNaissance || '',
        descriptionPhysique: data.descriptionPhysique || '',
        inconnu: data.inconnu || false,
        departement: data.departement || '',
        typologie: data.typologie || '',
        nbPersonnes: data.nbPersonnes || '',
        mineurs: data.mineurs || ''
      };
      
      // Créer ou récupérer la personne
      let personneId = data.personId || data.personneId;
      if (!personneId) {
        // Pas d'ID fourni, créer ou récupérer la personne
        personneId = await creerOuRecupererPersonne(personneData);
      } else {
        // Un ID est fourni, vérifier si la personne existe
        try {
          const personneExistante = await getPersonneById(personneId);
          if (personneExistante) {
            // La personne existe, la mettre à jour
            await updatePersonne(personneId, personneData);
          } else {
            // La personne n'existe pas, la créer
            console.warn(`⚠️ Personne ID ${personneId} non trouvée, création d'une nouvelle personne`);
            personneId = await creerOuRecupererPersonne(personneData);
          }
        } catch (error) {
          // En cas d'erreur, créer ou récupérer la personne
          console.warn(`⚠️ Erreur lors de la vérification de la personne ID ${personneId}, création/récupération:`, error);
          personneId = await creerOuRecupererPersonne(personneData);
        }
      }
      
      // Préparer les données de l'intervention
      const interventionData = {
        personneId: personneId,
        date: data.dateTransmission || data.date || new Date().toISOString().split('T')[0],
        type: 'transmissions',
        typeTransmission: data.typeTransmission || '',
        adresse: data.adresse || '',
        ville: data.ville || '',
        signalement: data.signalement || '',
        transmission: data.transmission || '',
        orly: data.orly || {},
        accompagnement: data.accompagnement || {},
        distribution: data.distribution || {},
        observations: data.observations || data.transmission || '',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      };
      
      // Si un ID est fourni, c'est une mise à jour
      if (data.id) {
        interventionData.id = data.id;
        const updated = await updateIntervention(data.id, interventionData);
        // Retourner l'ID de l'intervention (compatibilité avec l'ancien code)
        return updated.id;
      } else {
        // Vérifier si une intervention existe déjà pour cette personne, date et type
        const existingIntervention = await getInterventionsByPersonneIdAndDateAndType(
          personneId,
          interventionData.date,
          'transmissions'
        );
        
        if (existingIntervention) {
          // Mettre à jour l'intervention existante
          const updated = await updateIntervention(existingIntervention.id, interventionData);
          // Retourner l'ID de l'intervention (compatibilité avec l'ancien code)
          return updated.id;
        } else {
          // Créer une nouvelle intervention
          const interventionId = await addIntervention(interventionData);
          // Retourner l'ID de l'intervention (compatibilité avec l'ancien code)
          return interventionId;
        }
      }
    } catch (error) {
      console.error('❌ Erreur dans addTransmission:', error);
      throw error;
    }
  };
  
  /**
   * Fonction de compatibilité pour updateTransmission (ancienne API)
   */
  const updateTransmission = async (data) => {
    await initDatabaseUnified();
    
    try {
      // Si data est juste un ID, on ne peut pas faire grand-chose
      if (typeof data === 'number') {
        throw new Error('updateTransmission nécessite un objet avec les données');
      }
      
      // Utiliser addTransmission qui gère aussi les mises à jour
      return await addTransmission(data);
    } catch (error) {
      console.error('❌ Erreur dans updateTransmission:', error);
      throw error;
    }
  };
  
  /**
   * Fonction de compatibilité pour getAllTransmissions (ancienne API)
   * Retourne toutes les interventions de type 'transmissions' avec les données de la personne
   */
  const getAllTransmissions = async () => {
    await initDatabaseUnified();
    const allInterventions = await getAllInterventions();
    const allPersonnes = await getAllPersonnes();
    
    // Créer un Map pour accéder rapidement aux personnes par ID
    const personnesMap = new Map(allPersonnes.map(p => [p.id, p]));
    
    // Filtrer pour ne retourner que les transmissions et enrichir avec les données de la personne
    return allInterventions
      .filter(interv => interv.type === 'transmissions')
      .map(interv => {
        const personne = personnesMap.get(interv.personneId) || {};
        
        // Convertir au format ancien avec les données de la personne
        return {
          id: interv.id,
          personId: interv.personneId,
          personneId: interv.personneId,
          // Données de la personne
          nom: personne.nom || '',
          prenom: personne.prenom || '',
          dateNaissance: personne.dateNaissance || '',
          descriptionPhysique: personne.descriptionPhysique || '',
          inconnu: personne.inconnu || false,
          departement: personne.departement || '',
          typologie: personne.typologie || '',
          nbPersonnes: personne.nbPersonnes || '',
          mineurs: personne.mineurs || '',
          // Données de l'intervention
          dateTransmission: interv.date,
          date: interv.date,
          typeTransmission: interv.typeTransmission || '',
          adresse: interv.adresse || '',
          ville: interv.ville || '',
          signalement: interv.signalement || '',
          transmission: interv.transmission || interv.observations || '',
          orly: interv.orly || {},
          accompagnement: interv.accompagnement || {},
          distribution: interv.distribution || {},
          observations: interv.observations || '',
        };
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
  
  // Fonctions de compatibilité (ancienne API)
  window.addTransmission = addTransmission;
  window.updateTransmission = updateTransmission;
  window.getAllTransmissions = getAllTransmissions;

  console.log('📦 Module Persistance Unifiée chargé');
})();