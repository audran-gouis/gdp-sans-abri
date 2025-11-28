/**
 * Code métier pour le scénario de modification de transmission
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
 * Ouvre la modale de modification
 */
async function ouvrirModification(page) {
  await page.click('.btn-edit:visible');
  await page.waitForTimeout(500);
  await page.waitForSelector('#modal-ajout.show', { state: 'visible', timeout: 5000 });
}

/**
 * Change le nom dans le formulaire
 */
async function changerNom(page, nouveauNom) {
  // Vérifier si la section Informations Personnelles est repliée
  const sectionRepliee = await page.locator('#grid-info-perso').evaluate(el => el.classList.contains('collapsed'));
  
  // Si la section est repliée, la déplier en cliquant sur l'en-tête
  if (sectionRepliee) {
    await page.click('#section-info-perso .section-header');
    await page.waitForTimeout(300);
  }
  
  // Maintenant on peut remplir le champ
  await page.fill('#form-nom', nouveauNom);
}

/**
 * Enregistre la transmission
 */
async function enregistrer(page) {
  page.on('console', msg => console.log(`🖥️  CONSOLE [${msg.type()}]:`, msg.text()));
  
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(1000);
}

/**
 * Vérifie que la carte affiche un nom
 */
async function verifierCarteAfficheNom(page, nom) {
  await page.waitForTimeout(2000);
  const cartes = await page.$$('#transmissions-list > *');
  
  const expectedParts = nom.split(' ');
  
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    const allPartsFound = expectedParts.every(part => contenu.includes(part));
    if (allPartsFound) {
      return true;
    }
  }
  
  return false;
}

module.exports = {
  naviguerVersOnglet,
  ajouterTransmissionTest,
  ouvrirModification,
  changerNom,
  enregistrer,
  verifierCarteAfficheNom
};







