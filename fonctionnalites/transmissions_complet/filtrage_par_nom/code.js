/**
 * Code métier pour le scénario de filtrage par nom
 */

/**
 * Navigue vers un onglet spécifique
 */
async function naviguerVersOnglet(page, onglet) {
  const ongletMap = { 
    'Transmissions Quotidiennes': 'transmissions', 
    'ADP': 'adp', 
    'Statistiques': 'statistiques' 
  };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible' });
}

/**
 * Ajoute une transmission de test
 */
async function ajouterTransmissionTest(page, donnees) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
  
  await page.fill('#form-nom', donnees.nom || 'Test');
  await page.fill('#form-prenom', donnees.prenom || 'User');
  await page.fill('#modal-ajout #form-transmission', donnees.contenu || 'Transmission de test');
  
  page.on('console', msg => console.log(`🖥️  CONSOLE [${msg.type()}]:`, msg.text()));
  
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(1000);
}

/**
 * Filtre les transmissions par nom
 */
async function filtrerParNom(page, nom) {
  await page.fill('#filter-nom', nom);
  await page.waitForTimeout(300);
  console.log(`✅ Filtre par nom: ${nom}`);
}

/**
 * Vérifie qu'une seule carte est visible avec un nom
 */
async function verifierSeuleCarteVisible(page, nom) {
  const cartes = await page.$$('#transmissions-list > *:visible');
  
  for (const carte of cartes) {
    const texte = await carte.textContent();
    if (!texte.includes(nom)) {
      return false;
    }
  }
  
  return cartes.length > 0;
}

/**
 * Vérifie qu'une carte n'est PAS visible
 */
async function verifierCarteNonVisible(page, nom) {
  const cartes = await page.$$('#transmissions-list > *:visible');
  
  for (const carte of cartes) {
    const texte = await carte.textContent();
    if (texte.includes(nom)) {
      return false;
    }
  }
  
  return true;
}

module.exports = {
  naviguerVersOnglet,
  ajouterTransmissionTest,
  filtrerParNom,
  verifierSeuleCarteVisible,
  verifierCarteNonVisible
};














