/**
 * Code métier pour le scénario de suppression de transmission
 */

/**
 * Ajoute une transmission de test
 */
async function ajouterTransmissionTest(page, donnees) {
  // Ouvrir le formulaire
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
  console.log('✅ Formulaire ouvert');
  
  // Remplir les champs obligatoires
  await page.fill('#form-nom', donnees.nom || 'Test');
  console.log(`✅ Champ "Nom" rempli avec "${donnees.nom}"`);
  
  await page.fill('#form-prenom', donnees.prenom || 'User');
  console.log(`✅ Champ "Prénom" rempli avec "${donnees.prenom}"`);
  
  // Saisir le contenu (obligatoire)
  await page.fill('#modal-ajout #form-transmission', donnees.contenu || 'Transmission de test');
  console.log(`✅ Contenu rempli: "${donnees.contenu || 'Transmission de test'}"`);
  
  // Écouter les erreurs et logs de la console
  page.on('console', msg => console.log(`🖥️  CONSOLE [${msg.type()}]:`, msg.text()));
  page.on('pageerror', error => console.log(`❌ PAGE ERROR:`, error.message));
  
  // Enregistrer
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(1000);
  console.log('✅ Transmission enregistrée');
}

/**
 * Trouve et clique sur le bouton supprimer d'une carte spécifique
 */
async function supprimerCarte(page, criteres) {
  // Préparer l'interception du dialog AVANT de cliquer
  page.once('dialog', dialog => dialog.accept());
  
  // Trouver la carte qui correspond aux critères
  const cartes = await page.$$('.transmission-card');
  let carteRecherchee = null;
  
  for (const carte of cartes) {
    const textecarte = await carte.textContent();
    const correspondance = Object.values(criteres).every(valeur => textecarte.includes(valeur));
    
    if (correspondance) {
      carteRecherchee = carte;
      console.log(`🎯 Carte trouvée: "${textecarte.substring(0, 50)}..."`);
      break;
    }
  }
  
  if (!carteRecherchee) {
    throw new Error(`Carte non trouvée avec les critères: ${JSON.stringify(criteres)}`);
  }
  
  // Cliquer sur le bouton "Supprimer" de cette carte
  const btnDelete = await carteRecherchee.$('.btn-delete');
  await btnDelete.click();
  await page.waitForTimeout(300);
}

/**
 * Compte le nombre de cartes visibles
 */
async function compterCartes(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('.transmission-card');
  return cartes.length;
}

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

module.exports = {
  ajouterTransmissionTest,
  supprimerCarte,
  compterCartes,
  naviguerVersOnglet
};







