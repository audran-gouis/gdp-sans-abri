/**
 * Base de données Point Accueil (distincte de ADP et Transmissions)
 * Utilise IndexedDB pour le stockage local
 */

const DB_NAME_PA = 'MaraudesPointAccueilDB';
const DB_VERSION = 1;
const STORE_NAME_PA = 'pointAccueil';

let dbPA = null;

/**
 * Initialise la base de données Point Accueil
 */
async function initDatabasePA() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME_PA, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbPA = request.result;
      resolve(dbPA);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME_PA)) {
        const objectStore = db.createObjectStore(STORE_NAME_PA, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Index pour référencer la personne (clé étrangère)
        objectStore.createIndex('personneId', 'personneId', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('dateCreation', 'dateCreation', { unique: false });
      }
    };
  });
}

/**
 * Sauvegarde une fiche Point Accueil
 */
async function sauvegarderFichePA(ficheData) {
  if (!dbPA) await initDatabasePA();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPA.transaction([STORE_NAME_PA], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PA);
    
    const fiche = {
      ...ficheData,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };
    
    const request = objectStore.add(fiche);
    
    request.onsuccess = () => {
      fiche.id = request.result;
      resolve(fiche);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère toutes les fiches Point Accueil
 */
async function recupererFichesPA() {
  if (!dbPA) await initDatabasePA();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPA.transaction([STORE_NAME_PA], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME_PA);
    const request = objectStore.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère une fiche Point Accueil par ID
 */
async function recupererFichePA(id) {
  if (!dbPA) await initDatabasePA();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPA.transaction([STORE_NAME_PA], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME_PA);
    const request = objectStore.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Met à jour une fiche Point Accueil
 */
async function mettreAJourFichePA(id, ficheData) {
  if (!dbPA) await initDatabasePA();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPA.transaction([STORE_NAME_PA], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PA);
    
    const fiche = {
      ...ficheData,
      id,
      dateModification: new Date().toISOString()
    };
    
    const request = objectStore.put(fiche);
    
    request.onsuccess = () => resolve(fiche);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime une fiche Point Accueil
 */
async function supprimerFichePA(id) {
  if (!dbPA) await initDatabasePA();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPA.transaction([STORE_NAME_PA], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PA);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Recherche des fiches Point Accueil par critères
 */
async function rechercherFichesPA(criteres) {
  const fiches = await recupererFichesPA();
  
  return fiches.filter(fiche => {
    if (criteres.personneId && fiche.personneId !== criteres.personneId) {
      return false;
    }
    if (criteres.date && fiche.date !== criteres.date) {
      return false;
    }
    return true;
  });
}

/**
 * Vide complètement la base de données Point Accueil
 */
async function viderDatabasePA() {
  if (!dbPA) await initDatabasePA();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPA.transaction([STORE_NAME_PA], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PA);
    const request = objectStore.clear();
    
    request.onsuccess = () => {
      console.log('✅ Base de données Point Accueil vidée');
      resolve(true);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Exporte les données Point Accueil en JSON
 */
async function exporterDonneesPA() {
  const fiches = await recupererFichesPA();
  return JSON.stringify(fiches, null, 2);
}

/**
 * Importe des données Point Accueil depuis JSON
 */
async function importerDonneesPA(jsonData) {
  const fiches = JSON.parse(jsonData);
  const promises = fiches.map(fiche => {
    delete fiche.id; // Laisser autoIncrement générer les IDs
    return sauvegarderFichePA(fiche);
  });
  return Promise.all(promises);
}

// Export pour utilisation dans l'application et les tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDatabasePA,
    sauvegarderFichePA,
    recupererFichesPA,
    recupererFichePA,
    mettreAJourFichePA,
    supprimerFichePA,
    rechercherFichesPA,
    viderDatabasePA,
    exporterDonneesPA,
    importerDonneesPA
  };
}
