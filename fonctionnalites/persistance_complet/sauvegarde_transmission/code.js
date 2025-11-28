/**
 * Code métier - Persistance : Sauvegarde transmission
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS BASE DE DONNÉES (APPLICATION) ====================

const DB_NAME = 'MaraudesDB';
const DB_VERSION = 1;
const STORE_NAME = 'transmissions';

let db = null;

/**
 * Initialise la base de données
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
 * Ajoute une transmission à la base
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

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function naviguerVersOnglet(page, onglet) {
  const ongletMap = { 'Transmissions Quotidiennes': 'transmissions', 'ADP': 'adp', 'Statistiques': 'statistiques' };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible' });
}

async function ajouterTransmission(page, donnees) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
  
  await page.fill('#form-nom', donnees.nom);
  await page.fill('#form-prenom', donnees.prenom);
  await page.fill('#modal-ajout #form-transmission', donnees.contenu);
  
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(1000);
}

async function verifierTransmissionSauvegardée(page, nom) {
  await page.waitForTimeout(2000);
  const cartes = await page.$$('#transmissions-list > *');
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes(nom)) return true;
  }
  return false;
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    initDB,
    addTransmission,
    getAllTransmissions,
    updateTransmission,
    deleteTransmission,
    naviguerVersOnglet, 
    ajouterTransmission, 
    verifierTransmissionSauvegardée 
  };
}
