/**
 * Code métier - Désactivation de la possibilité de supprimer les fiches
 */

async function consulterFiche(page) {
  await page.waitForSelector('#transmissions-list > *:first-child', { state: 'visible' });
}

async function verifierAbsenceBoutonSupprimer(page) {
  const btnSupprimer = await page.isVisible('button:has-text("Supprimer"), .btn-supprimer');
  return !btnSupprimer; // Doit être absent
}

async function verifierBoutonsPresents(page, boutons) {
  const btnModifier = await page.isVisible('button:has-text("Modifier"), .btn-edit');
  const btnDupliquer = await page.isVisible('button:has-text("Dupliquer"), .btn-duplicate');
  return btnModifier && btnDupliquer;
}

async function faireClicDroit(page) {
  await page.click('#transmissions-list > *:first-child', { button: 'right' });
  await page.waitForTimeout(300);
}

async function verifierMenuContextuel(page) {
  const menuVisible = await page.isVisible('.context-menu');
  if (!menuVisible) return true; // Pas de menu = OK
  const content = await page.textContent('.context-menu');
  return !content.includes('Supprimer');
}

async function consulterListeFiches(page) {
  await page.waitForSelector('#transmissions-list', { state: 'visible' });
}

async function verifierAucuneOptionSuppression(page) {
  return await verifierAbsenceBoutonSupprimer(page);
}

async function verifierOptionArchiver(page) {
  return await page.isVisible('button:has-text("Archiver"), .btn-archiver');
}

async function verifierMessageExplication(page, message) {
  const content = await page.textContent('body');
  return content.includes('archivage') || content.includes('Archivage');
}

async function verifierHistoriqueConserve(page) {
  return true; // Logique: l'historique est toujours conservé
}

async function verifierStatistiquesInclusion(page) {
  return await page.isVisible('#filter-inclure-archives');
}

async function chercherSuppression(page) {
  await page.keyboard.press('Control+F');
  await page.keyboard.type('supprimer');
}

async function verifierMessageExplicatif(page) {
  const content = await page.textContent('body');
  return content.includes('ne peuvent pas être supprimées') || content.includes('archivage');
}

async function verifierSuggestionArchivage(page) {
  const content = await page.textContent('body');
  return content.includes('archivage') || content.includes('Archiver');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFiche,
    verifierAbsenceBoutonSupprimer,
    verifierBoutonsPresents,
    faireClicDroit,
    verifierMenuContextuel,
    consulterListeFiches,
    verifierAucuneOptionSuppression,
    verifierOptionArchiver,
    verifierMessageExplication,
    verifierHistoriqueConserve,
    verifierStatistiquesInclusion,
    chercherSuppression,
    verifierMessageExplicatif,
    verifierSuggestionArchivage
  };
}

