/**
 * Module de gestion de la base de données IndexedDB
 * Code applicatif utilisé par l'application ET les tests
 */

const DB_NAME = 'MaraudesDB';
const DB_ADP_NAME = 'MaraudesADP_DB';
const DB_VERSION = 2;
const STORE_NAME = 'transmissions';
const STORE_NAME_ADP = 'adp';

let db = null;
let dbAdp = null;

// ==================== TRANSMISSIONS ====================

/**
 * Initialise la base de données Transmissions
 */
async function initDB() {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ Base de données transmissions initialisée');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('nom', 'nom', { unique: false });
        objectStore.createIndex('prenom', 'prenom', { unique: false });
        objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
        objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
        objectStore.createIndex('personId', 'personId', { unique: false });
      }
    };
  });
}

/**
 * Ajoute une transmission
 */
async function addTransmission(data) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.add(data);
    
    request.onsuccess = () => {
      console.log('✅ Transmission ajoutée, ID:', request.result);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère toutes les transmissions
 */
async function getAllTransmissions() {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Met à jour une transmission
 */
async function updateTransmission(data) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(data);
    
    request.onsuccess = () => {
      console.log('✅ Transmission mise à jour');
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime une transmission
 */
async function deleteTransmission(id) {
  if (!db) await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      console.log('✅ Transmission supprimée');
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// ==================== ADP ====================

/**
 * Initialise la base de données ADP
 */
async function initDBADP() {
  if (dbAdp) return dbAdp;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_ADP_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbAdp = request.result;
      console.log('✅ Base de données ADP initialisée');
      resolve(dbAdp);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME_ADP)) {
        const objectStore = database.createObjectStore(STORE_NAME_ADP, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('nom', 'nom', { unique: false });
        objectStore.createIndex('prenom', 'prenom', { unique: false });
        objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
        objectStore.createIndex('dateTransmission', 'dateTransmission', { unique: false });
        objectStore.createIndex('personId', 'personId', { unique: false });
      }
    };
  });
}

/**
 * Ajoute une transmission ADP
 */
async function addTransmissionAdp(data) {
  if (!dbAdp) await initDBADP();
  
  return new Promise((resolve, reject) => {
    const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_ADP);
    const request = objectStore.add(data);
    
    request.onsuccess = () => {
      console.log('✅ Transmission ADP ajoutée, ID:', request.result);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère toutes les transmissions ADP
 */
async function getAllTransmissionsAdp() {
  if (!dbAdp) await initDBADP();
  
  return new Promise((resolve, reject) => {
    const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME_ADP);
    const request = objectStore.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Met à jour une transmission ADP
 */
async function updateTransmissionAdp(data) {
  if (!dbAdp) await initDBADP();
  
  return new Promise((resolve, reject) => {
    const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_ADP);
    const request = objectStore.put(data);
    
    request.onsuccess = () => {
      console.log('✅ Transmission ADP mise à jour');
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime une transmission ADP
 */
async function deleteTransmissionAdp(id) {
  if (!dbAdp) await initDBADP();
  
  return new Promise((resolve, reject) => {
    const transaction = dbAdp.transaction([STORE_NAME_ADP], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_ADP);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      console.log('✅ Transmission ADP supprimée');
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Export pour Node.js (tests) et browser (application)
// Toujours rendre les fonctions disponibles globalement dans le navigateur
if (typeof window !== 'undefined') {
  console.log('🔧 Exposition des fonctions database globalement...');
  window.initDB = initDB;
  window.addTransmission = addTransmission;
  window.getAllTransmissions = getAllTransmissions;
  window.updateTransmission = updateTransmission;
  window.deleteTransmission = deleteTransmission;
  window.initDBADP = initDBADP;
  window.addTransmissionAdp = addTransmissionAdp;
  window.getAllTransmissionsAdp = getAllTransmissionsAdp;
  window.updateTransmissionAdp = updateTransmissionAdp;
  window.deleteTransmissionAdp = deleteTransmissionAdp;
  
  // Exposer les références aux bases pour les tests
  window._resetDbAdp = function() {
    if (dbAdp) {
      dbAdp.close();
    }
    dbAdp = null;
  };
  
  window._resetDb = function() {
    if (db) {
      db.close();
    }
    db = null;
  };
  
  console.log('✅ Fonctions database exposées globalement');
}

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    initDBADP,
    addTransmissionAdp,
    getAllTransmissionsAdp,
    updateTransmissionAdp,
    deleteTransmissionAdp
  };
}
