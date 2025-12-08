/**
 * Code métier pour le scénario d'ajout de transmission complète
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
  
  await page.waitForSelector(`button[data-tab="${tabId}"]`, { state: 'visible' });
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab`, { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Ouvre le formulaire d'ajout
 */
async function ouvrirFormulaire(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
  console.log('✅ Formulaire ouvert');
}

/**
 * Remplit un champ du formulaire
 */
async function remplirChamp(page, nomChamp, valeur) {
  const champMap = {
    'Nom': '#form-nom',
    'Prénom': '#form-prenom',
    'Adresse': '#form-adresse'
  };
  
  const selector = champMap[nomChamp];
  if (!selector) {
    throw new Error(`Champ "${nomChamp}" non trouvé`);
  }
  
  await page.fill(selector, valeur);
  console.log(`✅ Champ "${nomChamp}" rempli avec "${valeur}"`);
}

/**
 * Sélectionne une date de naissance
 */
async function selectionnerDateNaissance(page, date) {
  await page.fill('#form-ddn', date);
}

/**
 * Sélectionne une typologie
 */
async function selectionnerTypologie(page, typologie) {
  await page.selectOption('#form-typologie', { label: typologie });
}

/**
 * Sélectionne le nombre de personnes
 */
async function selectionnerNbPersonnes(page, nombre) {
  await page.selectOption('#form-nb-personnes', nombre);
}

/**
 * Sélectionne le nombre de mineurs
 */
async function selectionnerNbMineurs(page, nombre) {
  await page.selectOption('#form-mineurs', nombre);
}

/**
 * Sélectionne le type de transmission
 */
async function selectionnerTypeTransmission(page, type) {
  await page.selectOption('#form-type-transmission', { label: type });
}

/**
 * Sélectionne une ville
 */
async function selectionnerVille(page, ville) {
  await page.selectOption('#form-ville', { label: ville });
}

/**
 * Coche une case à cocher
 */
async function cocher(page, option) {
  const optionMap = {
    'Personne présente': '#form-personne-presente',
    '1er contact': '#form-premier-contact',
    'PNT': '#form-pnt',
    'Maraude': '#form-maraude',
    'Veille': '#form-veille',
    'Refus de contact': '#form-refus-contact'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
    console.log(`✅ Case "${option}" cochée`);
  }
}

/**
 * Coche une option d'accompagnement
 */
async function cocherAccompagnement(page, option) {
  const optionMap = {
    'Écoute': '#form-accomp-ecoute',
    'Orientation': '#form-accomp-orientation'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
  }
}

/**
 * Coche une option de distribution
 */
async function cocherDistribution(page, option) {
  const optionMap = {
    'Alimentaire': '#form-distrib-alimentaire',
    'Vestimentaire': '#form-distrib-vestimentaire'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
  }
}

/**
 * Remplit le contenu de la transmission
 */
async function saisirContenu(page, texte) {
  await page.fill('#modal-ajout #form-transmission', texte);
  console.log(`✅ Contenu rempli: "${texte}"`);
}

/**
 * Enregistre la transmission
 */
async function enregistrer(page) {
  page.on('console', msg => console.log(`🖥️  CONSOLE [${msg.type()}]:`, msg.text()));
  page.on('pageerror', error => console.log(`❌ PAGE ERROR:`, error.message));
  
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(1000);
  console.log('✅ Transmission enregistrée');
}

/**
 * Vérifie qu'une nouvelle carte apparaît
 */
async function verifierCarteApparue(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

/**
 * Vérifie qu'une carte contient un texte
 */
async function verifierCarteContient(page, texte) {
  await page.waitForTimeout(2000);
  const cartes = await page.$$('#transmissions-list > *');
  
  console.log(`🔍 Nombre de cartes trouvées: ${cartes.length}`);
  
  const expectedParts = texte.split(' ');
  
  for (let i = 0; i < cartes.length; i++) {
    const carte = cartes[i];
    const contenu = await carte.textContent();
    console.log(`📄 Carte ${i + 1} contenu: "${contenu.substring(0, 150)}..."`);
    
    const allPartsFound = expectedParts.every(part => contenu.includes(part));
    if (allPartsFound) {
      console.log(`✅ Carte trouvée avec toutes les parties de: "${texte}"`);
      return true;
    }
  }
  
  console.log(`❌ Carte non trouvée avec: "${texte}"`);
  return false;
}

module.exports = {
  naviguerVersOnglet,
  ouvrirFormulaire,
  remplirChamp,
  selectionnerDateNaissance,
  selectionnerTypologie,
  selectionnerNbPersonnes,
  selectionnerNbMineurs,
  selectionnerTypeTransmission,
  selectionnerVille,
  cocher,
  cocherAccompagnement,
  cocherDistribution,
  saisirContenu,
  enregistrer,
  verifierCarteApparue,
  verifierCarteContient
};














