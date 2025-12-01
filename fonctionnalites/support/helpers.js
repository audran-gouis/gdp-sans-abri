/**
 * Support - Helpers partagés pour les tests
 * Fonctions utilitaires réutilisables par tous les tests
 */

/**
 * Attend qu'un élément soit visible
 */
async function waitForElement(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

/**
 * Clique sur un élément avec attente
 */
async function clickElement(page, selector) {
  await waitForElement(page, selector);
  await page.click(selector);
}

/**
 * Remplit un champ avec attente
 */
async function fillInput(page, selector, value) {
  await waitForElement(page, selector);
  await page.fill(selector, value);
}

/**
 * Sélectionne une option dans un select
 */
async function selectOption(page, selector, value) {
  await waitForElement(page, selector);
  await page.selectOption(selector, value);
}

/**
 * Coche une checkbox
 */
async function checkCheckbox(page, selector) {
  await waitForElement(page, selector);
  await page.check(selector);
}

/**
 * Décoche une checkbox
 */
async function uncheckCheckbox(page, selector) {
  await waitForElement(page, selector);
  await page.uncheck(selector);
}

/**
 * Récupère le texte d'un élément
 */
async function getText(page, selector) {
  await waitForElement(page, selector);
  return await page.textContent(selector);
}

/**
 * Vérifie si un élément est visible
 */
async function isVisible(page, selector) {
  try {
    return await page.isVisible(selector);
  } catch {
    return false;
  }
}

/**
 * Vérifie si un élément est caché
 */
async function isHidden(page, selector) {
  try {
    return await page.isHidden(selector);
  } catch {
    return true;
  }
}

/**
 * Vérifie si un élément a une classe CSS
 */
async function hasClass(page, selector, className) {
  const element = await page.$(selector);
  if (!element) return false;
  const classes = await element.getAttribute('class');
  return classes && classes.split(' ').includes(className);
}

/**
 * Attend un délai
 */
async function wait(page, ms) {
  await page.waitForTimeout(ms);
}

/**
 * Nettoie la base de données
 */
async function clearDatabase(page, dbName = 'MaraudesDB') {
  return await page.evaluate((name) => {
    return new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }, dbName);
}

/**
 * Récupère les données de la base
 */
async function getDatabaseData(page, dbName = 'MaraudesDB', storeName = 'transmissions') {
  return await page.evaluate((params) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(params.dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([params.storeName], 'readonly');
        const objectStore = transaction.objectStore(params.storeName);
        const getAllRequest = objectStore.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }, { dbName, storeName });
}

/**
 * Ajoute une transmission de test directement dans la base
 */
async function addTestTransmission(page, data, dbName = 'MaraudesDB') {
  return await page.evaluate((params) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(params.dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['transmissions'], 'readwrite');
        const objectStore = transaction.objectStore('transmissions');
        
        params.data.dateCreation = new Date().toISOString();
        params.data.dateTransmission = params.data.dateTransmission || new Date().toISOString().split('T')[0];
        
        const addRequest = objectStore.add(params.data);
        
        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }, { data, dbName });
}

/**
 * Prend une capture d'écran
 */
async function takeScreenshot(page, path) {
  return await page.screenshot({ path, fullPage: true });
}

/**
 * Récupère les logs de la console
 */
function setupConsoleLogging(page) {
  const logs = [];
  
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('pageerror', error => {
    logs.push({
      type: 'error',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  return logs;
}

// Export pour Node.js (tests uniquement)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    waitForElement,
    clickElement,
    fillInput,
    selectOption,
    checkCheckbox,
    uncheckCheckbox,
    getText,
    isVisible,
    isHidden,
    hasClass,
    wait,
    clearDatabase,
    getDatabaseData,
    addTestTransmission,
    takeScreenshot,
    setupConsoleLogging
  };
}









