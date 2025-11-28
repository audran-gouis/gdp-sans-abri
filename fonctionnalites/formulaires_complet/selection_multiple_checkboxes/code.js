/**
 * Code métier - Formulaires : Sélection multiple de checkboxes
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function ouvrirFormulaire(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function cocher(page, option) {
  const optionMap = {
    '1er contact': '#form-premier-contact',
    'Personne présente': '#form-personne-presente',
    'Maraude': '#form-maraude'
  };
  const selector = optionMap[option];
  if (selector) await page.check(selector);
}

async function verifierCasesRestentCochees(page) {
  const checked1 = await page.isChecked('#form-premier-contact');
  const checked2 = await page.isChecked('#form-personne-presente');
  const checked3 = await page.isChecked('#form-maraude');
  return checked1 && checked2 && checked3;
}

async function verifierBoutonEnregistrerActif(page) {
  const button = await page.$('#modal-ajout .btn-primary');
  return await button.isEnabled();
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ouvrirFormulaire,
    cocher,
    verifierCasesRestentCochees,
    verifierBoutonEnregistrerActif
  };
}
