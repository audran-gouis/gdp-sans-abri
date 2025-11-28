/**
 * Code métier - Interface : Gestion des modales
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function ouvrirModale(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('.modal', { state: 'visible' });
}

async function verifierBoutonAgrandissement(page, icone) {
  const button = await page.$('.modal-expand');
  const text = await button.textContent();
  return text.includes(icone);
}

async function verifierTitreBouton(page, titre) {
  const button = await page.$('.modal-expand');
  const titleAttr = await button.getAttribute('title');
  return titleAttr === titre;
}

async function fermerModale(page) {
  await page.click('.modal-close');
  await page.waitForTimeout(300);
}

async function verifierModaleFermee(page) {
  await page.waitForSelector('.modal', { state: 'hidden' });
  return await page.isHidden('.modal');
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ouvrirModale,
    verifierBoutonAgrandissement,
    verifierTitreBouton,
    fermerModale,
    verifierModaleFermee
  };
}
