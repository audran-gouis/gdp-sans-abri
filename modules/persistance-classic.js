/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();

/**
 * MODULE PERSISTANCE - Gestion IndexedDB
 * Compatible Electron (pas d'import/export ES6)
 * Variables globales exposées dans window.DB
 */

(function() {
  'use strict';

  // ==================== CONSTANTES ====================
  
  const DB_NAME = 'MaraudesDB';
  const DB_VERSION = 2;
  const STORE_NAME = 'transmissions';
  
  const DB_NAME_ADP = 'MaraudesADP_DB';
  const DB_VERSION_ADP = 1;
  const STORE_NAME_ADP = 'adp_transmissions';
  
  let db = null;
  let dbAdp = null;

  // ==================== TRANSMISSIONS ====================
  
  const initDB = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          
          console.log('Object store Transmissions créé');
        }
      };
    });
  };

  const addTransmission = (transmission) => {
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

  const getAllTransmissions = () => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmission = (transmission) => {
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

  const deleteTransmission = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== ADP ====================
  
  const initDBAdp = () => {
    return new Promise((resolve, reject) => {
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
          
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('prenom', 'prenom', { unique: false });
          objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
          objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
          objectStore.createIndex('personId', 'personId', { unique: false });
          objectStore.createIndex('inconnu', 'inconnu', { unique: false });
          
          console.log('Object store ADP créé');
        }
      };
    });
  };

  const addTransmissionAdp = (transmission) => {
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

  const getAllTransmissionsAdp = () => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const updateTransmissionAdp = (transmission) => {
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

  const deleteTransmissionAdp = (id) => {
    return new Promise((resolve, reject) => {
      const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME_ADP);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // ==================== EXPOSITION GLOBALE ====================
  
  window.DB = {
    // Constantes
    DB_NAME,
    DB_VERSION,
    STORE_NAME,
    DB_NAME_ADP,
    DB_VERSION_ADP,
    STORE_NAME_ADP,
    
    // Transmissions
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    
    // ADP
    initDBAdp,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp,
    
    // Accesseurs
    getDb: () => db,
    getDbAdp: () => dbAdp
  };

  console.log('📦 Module Persistance chargé (window.DB disponible)');
})();













