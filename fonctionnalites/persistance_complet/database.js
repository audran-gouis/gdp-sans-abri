/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées sur window
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 3;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erreur ouverture DB Transmissions');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        console.log('✅ Base Transmissions ouverte');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Index pour référencer la personne (clé étrangère)
          objectStore.createIndex('personneId', 'personneId', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = async (transmission) => {
    await initDB(); // S'assurer que la DB est prête
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.add(transmission);

      request.onsuccess = () => {
        console.log('✅ Transmission ajoutée, ID:', request.result);
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  };

  const getAllTransmissions = async () => {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = async (transmission) => {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(transmission);

      request.onsuccess = () => {
        console.log('✅ Transmission mise à jour');
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  };

  const deleteTransmission = async (id) => {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBADP = () => {
    return new Promise((resolve, reject) => {
      if (dbAdp) {
        resolve(dbAdp);
        return;
      }
      
      const request = indexedDB.open(DB_NAME_ADP, DB_VERSION_ADP);

      request.onerror = () => {
        console.error('❌ Erreur ouverture DB ADP');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        dbAdp = event.target.result;
        console.log('✅ Base ADP ouverte');
        resolve(dbAdp);
      };

      request.onupgradeneeded = (event) => {
        dbAdp = event.target.result;
        
        if (!dbAdp.objectStoreNames.contains(STORE_NAME_ADP)) {
          const objectStore = dbAdp.createObjectStore(STORE_NAME_ADP, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Index pour référencer la personne (clé étrangère)
          objectStore.createIndex('personneId', 'personneId', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = async (transmission) => {
    await initDBADP();
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.add(transmission);

      request.onsuccess = () => {
        console.log('✅ Transmission ADP ajoutée, ID:', request.result);
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  };

  const getAllTransmissionsAdp = async () => {
    await initDBADP();
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = async (transmission) => {
    await initDBADP();
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.put(transmission);

      request.onsuccess = () => {
        console.log('✅ Transmission ADP mise à jour');
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  };

  const deleteTransmissionAdp = async (id) => {
    await initDBADP();
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE SUR WINDOW ====================
  
  // Transmissions
  window.initDB = initDB;
  window.addTransmission = addTransmission;
  window.getAllTransmissions = getAllTransmissions;
  window.updateTransmission = updateTransmission;
  window.deleteTransmission = deleteTransmission;
  
  // ADP
  window.initDBADP = initDBADP;
  window.addTransmissionAdp = addTransmissionAdp;
  window.getAllTransmissionsAdp = getAllTransmissionsAdp;
  window.updateTransmissionAdp = updateTransmissionAdp;
  window.deleteTransmissionAdp = deleteTransmissionAdp;

  console.log('📦 Module Persistance chargé');
})();
