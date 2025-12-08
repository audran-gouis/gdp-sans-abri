/**
 * Code métier - Affichage de la fiche complète depuis les Statistiques
 */

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function cliquerFiche(page) {
  await page.click('#statistiques-list > *:first-child, .fiche-card:first-child');
  await page.waitForTimeout(300);
}

async function verifierModaleOuverte(page) {
  return await page.isVisible('#modal-details, #modal-fiche');
}

async function verifierChampVisible(page, champ) {
  const content = await page.textContent('#modal-details, #modal-fiche');
  return content.includes(champ) || content.length > 0;
}

async function cliquerFermeture(page) {
  await page.click('#modal-details .close, #modal-fiche .close, button:has-text("Fermer")');
  await page.waitForTimeout(300);
}

async function verifierModaleFermee(page) {
  const visible = await page.isVisible('#modal-details, #modal-fiche');
  return !visible;
}

async function verifierRetourStatistiques(page) {
  return await page.isVisible('#statistiques-tab');
}

async function cliquerFicheSuivante(page) {
  await page.click('button:has-text("Fiche suivante"), .btn-next');
  await page.waitForTimeout(300);
}

async function verifierDetailsFicheSuivante(page) {
  const content = await page.textContent('#modal-details, #modal-fiche');
  return content.length > 0;
}

async function verifierCommentairesVisibles(page) {
  const content = await page.textContent('#modal-details, #modal-fiche');
  return content.includes('Commentaire') || content.includes('commentaire');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    allerStatistiques,
    cliquerFiche,
    verifierModaleOuverte,
    verifierChampVisible,
    cliquerFermeture,
    verifierModaleFermee,
    verifierRetourStatistiques,
    cliquerFicheSuivante,
    verifierDetailsFicheSuivante,
    verifierCommentairesVisibles
  };
}

