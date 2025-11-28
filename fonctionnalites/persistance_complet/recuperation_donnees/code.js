/**
 * Code métier - Persistance : Récupération des données
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Vérifie si la base de données est initialisée
 */
async function verifierDBInitialisee() {
  return new Promise((resolve) => {
    const request = indexedDB.open('MaraudesDB');
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}

/**
 * Récupère toutes les données de la base
 */
async function obtenirDonnees() {
  return new Promise((resolve) => {
    const request = indexedDB.open('MaraudesDB');
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['transmissions'], 'readonly');
      const store = transaction.objectStore('transmissions');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    };
    request.onerror = () => resolve([]);
  });
}

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function verifierDBInitialiseeTest(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const request = indexedDB.open('MaraudesDB');
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  });
}

async function ajouterTransmission(page, nom) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout.show', { state: 'visible' });
  await page.fill('#form-nom', nom);
  await page.fill('#form-prenom', 'Test');
  await page.fill('#modal-ajout #form-transmission', 'Transmission de test');
  await page.click('#modal-ajout button:has-text("Enregistrer")');
  await page.waitForTimeout(800);
}

async function obtenirDonneesTest(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const request = indexedDB.open('MaraudesDB');
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['transmissions'], 'readonly');
        const store = transaction.objectStore('transmissions');
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      };
      request.onerror = () => resolve([]);
    });
  });
}

async function rechargerPage(page) {
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
}

async function compterCartesVisibles(page) {
  await page.waitForTimeout(1000);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length;
}

async function verifierDonneesIdentiques(page) {
  const data = await obtenirDonneesTest(page);
  const noms = data.map(d => d.nom);
  return noms.includes('Test1') && noms.includes('Test2') && noms.includes('Test3');
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifierDBInitialisee,
    obtenirDonnees,
    verifierDBInitialiseeTest,
    ajouterTransmission,
    obtenirDonneesTest,
    rechargerPage,
    compterCartesVisibles,
    verifierDonneesIdentiques
  };
}
