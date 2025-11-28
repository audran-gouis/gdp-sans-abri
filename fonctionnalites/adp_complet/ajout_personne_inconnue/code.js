/**
 * Code métier - ADP : Ajout personne inconnue
 */
async function naviguerVersOnglet(page, onglet) {
  const ongletMap = { 'Transmissions Quotidiennes': 'transmissions', 'ADP': 'adp', 'Statistiques': 'statistiques' };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible' });
}

async function ouvrirFormulaire(page) {
  await page.click('#adp-btn-ajouter');
  await page.waitForSelector('#modal-adp', { state: 'visible' });
}

async function cocherInconnu(page) {
  await page.check('#adp-form-inconnu');
}

async function enregistrer(page) {
  await page.click('#modal-adp button[type="submit"]');
  await page.waitForTimeout(300);
  await page.waitForSelector('#modal-adp', { state: 'hidden' });
}

async function verifierCarteApparue(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#adp-list > *');
  return cartes.length > 0;
}

async function verifierCarteContient(page, texte) {
  await page.waitForTimeout(2000);
  const cartes = await page.$$('#adp-list > *');
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes(texte)) return true;
  }
  return false;
}

module.exports = { naviguerVersOnglet, ouvrirFormulaire, cocherInconnu, enregistrer, verifierCarteApparue, verifierCarteContient };







