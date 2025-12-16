/**
 * BASE DE DONNÉES CENTRALISÉE DES PERSONNES
 * Une seule personne avec ses infos de base
 * Les interventions (Transmissions, ADP, PA) référencent cette personne
 */

const DB_NAME_PERSONNES = 'MaraudesPersonnesDB';
const DB_VERSION_PERSONNES = 1;
const STORE_NAME_PERSONNES = 'personnes';

let dbPersonnes = null;

/**
 * Initialise la base de données des personnes
 */
async function initDatabasePersonnes() {
  return new Promise((resolve, reject) => {
    if (dbPersonnes) {
      resolve(dbPersonnes);
      return;
    }

    const request = indexedDB.open(DB_NAME_PERSONNES, DB_VERSION_PERSONNES);

    request.onerror = () => {
      console.error('❌ Erreur ouverture DB Personnes');
      reject(request.error);
    };

    request.onsuccess = (event) => {
      dbPersonnes = event.target.result;
      console.log('✅ Base Personnes ouverte');
      resolve(dbPersonnes);
    };

    request.onupgradeneeded = (event) => {
      dbPersonnes = event.target.result;
      
      if (!dbPersonnes.objectStoreNames.contains(STORE_NAME_PERSONNES)) {
        const objectStore = dbPersonnes.createObjectStore(STORE_NAME_PERSONNES, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Index pour recherche
        objectStore.createIndex('nom', 'nom', { unique: false });
        objectStore.createIndex('prenom', 'prenom', { unique: false });
        objectStore.createIndex('dateNaissance', 'dateNaissance', { unique: false });
        objectStore.createIndex('personId', 'personId', { unique: true });
        objectStore.createIndex('descriptionPhysique', 'descriptionPhysique', { unique: false });
        
        console.log('✅ Object store Personnes créé');
      }
    };
  });
}

/**
 * Génère un personId unique basé sur les infos de la personne
 */
function genererPersonId(personne) {
  if (personne.inconnu) {
    // Pour les inconnus, utiliser la description physique comme identifiant
    const desc = (personne.descriptionPhysique || '').substring(0, 50);
    return `inconnu_${desc}_${Date.now()}`;
  }
  
  const nom = (personne.nom || '').toLowerCase().trim();
  const prenom = (personne.prenom || '').toLowerCase().trim();
  const ddn = personne.dateNaissance || '';
  
  return `${nom}_${prenom}_${ddn}`;
}

/**
 * Trouve une personne par ses infos (nom, prénom, DDN ou description pour inconnus)
 */
async function trouverPersonne(infos) {
  await initDatabasePersonnes();
  
  const personId = genererPersonId(infos);
  
  return new Promise((resolve, reject) => {
    const transaction = dbPersonnes.transaction([STORE_NAME_PERSONNES], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME_PERSONNES);
    const index = objectStore.index('personId');
    const request = index.get(personId);

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Crée ou récupère une personne
 * Retourne l'ID de la personne (nouveau ou existant)
 */
async function creerOuRecupererPersonne(infos) {
  await initDatabasePersonnes();
  
  console.log('🔍 Création nouvelle personne:', infos);
  
  // NE PLUS CHERCHER LES DOUBLONS - Toujours créer une nouvelle personne
  // L'utilisateur gérera manuellement les doublons via l'outil dédié
  
  // Créer une nouvelle personne avec un personId unique basé sur timestamp
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const personId = `person_${timestamp}_${random}`;
  
  const nouvellePersonne = {
    personId,
    nom: infos.nom || '',
    prenom: infos.prenom || '',
    dateNaissance: infos.dateNaissance || '',
    descriptionPhysique: infos.descriptionPhysique || '',
    inconnu: infos.inconnu || false,
    departement: infos.departement || infos.departementOrigine || '',
    typologie: infos.typologie || '',
    nbPersonnes: infos.nbPersonnes || '',
    mineurs: infos.mineurs || '',
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const transaction = dbPersonnes.transaction([STORE_NAME_PERSONNES], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PERSONNES);
    const request = objectStore.add(nouvellePersonne);

    request.onsuccess = () => {
      console.log('✅ Nouvelle personne créée, ID:', request.result);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère une personne par son ID
 */
async function getPersonneById(id) {
  await initDatabasePersonnes();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPersonnes.transaction([STORE_NAME_PERSONNES], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME_PERSONNES);
    const request = objectStore.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Met à jour les informations d'une personne
 */
async function updatePersonne(id, infos) {
  await initDatabasePersonnes();
  
  return new Promise(async (resolve, reject) => {
    const personne = await getPersonneById(id);
    if (!personne) {
      reject(new Error('Personne non trouvée'));
      return;
    }
    
    const personneModifiee = {
      ...personne,
      ...infos,
      id, // Garder l'ID
      personId: personne.personId, // Garder le personId
      dateModification: new Date().toISOString()
    };
    
    const transaction = dbPersonnes.transaction([STORE_NAME_PERSONNES], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PERSONNES);
    const request = objectStore.put(personneModifiee);

    request.onsuccess = () => {
      console.log('✅ Personne mise à jour, ID:', id);
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Récupère toutes les personnes
 */
async function getAllPersonnes() {
  await initDatabasePersonnes();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPersonnes.transaction([STORE_NAME_PERSONNES], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME_PERSONNES);
    const request = objectStore.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Supprime une personne
 */
async function deletePersonne(id) {
  await initDatabasePersonnes();
  
  return new Promise((resolve, reject) => {
    const transaction = dbPersonnes.transaction([STORE_NAME_PERSONNES], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME_PERSONNES);
    const request = objectStore.delete(id);

    request.onsuccess = () => {
      console.log('✅ Personne supprimée, ID:', id);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.initDatabasePersonnes = initDatabasePersonnes;
  window.genererPersonId = genererPersonId;
  window.trouverPersonne = trouverPersonne;
  window.creerOuRecupererPersonne = creerOuRecupererPersonne;
  window.getPersonneById = getPersonneById;
  window.updatePersonne = updatePersonne;
  window.getAllPersonnes = getAllPersonnes;
  window.deletePersonne = deletePersonne;
}

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDatabasePersonnes,
    genererPersonId,
    trouverPersonne,
    creerOuRecupererPersonne,
    getPersonneById,
    updatePersonne,
    getAllPersonnes,
    deletePersonne
  };
}

console.log('✅ Module Database Personnes chargé');