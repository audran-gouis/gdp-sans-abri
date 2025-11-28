/**
 * Code métier - Formulaires : Autocomplétion des champs
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function ouvrirFormulaire(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function commencerSaisie(page, champ) {
  const champMap = {
    'Nom': '#form-nom',
    'Prénom': '#form-prenom',
    'Adresse': '#form-adresse'
  };
  const selector = champMap[champ];
  await page.fill(selector, 'A');
  await page.waitForTimeout(100);
}

async function verifierAttributAutocomplete(page, attribut) {
  const champMap = {
    'family-name': '#form-nom',
    'given-name': '#form-prenom',
    'street-address': '#form-adresse'
  };
  const selector = champMap[attribut];
  const autocompleteValue = await page.getAttribute(selector, 'autocomplete');
  return autocompleteValue === attribut;
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ouvrirFormulaire,
    commencerSaisie,
    verifierAttributAutocomplete
  };
}
