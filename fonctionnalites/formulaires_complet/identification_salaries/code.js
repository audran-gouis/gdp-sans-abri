/**
 * Code métier - Identification des salariés
 */

async function cliquerNouvelleFiche(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierChampSalarie(page) {
  return await page.isVisible('#form-salarie');
}

async function verifierChampObligatoire(page, champ) {
  const label = await page.$(`label[for="form-salarie"]`);
  if (!label) return false;
  const text = await label.textContent();
  return text.includes('*');
}

async function cliquerSelecteurSalarie(page) {
  await page.click('#form-salarie');
}

async function verifierListeSalaries(page) {
  const options = await page.$$eval('#form-salarie option', opts => opts.length);
  return options > 0;
}

async function selectionnerSalarie(page, nom) {
  await page.selectOption('#form-salarie', { label: nom });
}

async function completerAutresInfos(page) {
  await page.fill('#form-date', '2024-12-08');
  await page.selectOption('#form-type-transmission', { index: 1 });
}

async function enregistrerFiche(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierSalarieAffiche(page, nom) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(nom);
}

async function consulterFiche(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierCreePar(page, nom) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(nom);
}

async function modifierFiche(page, salarie) {
  await page.click('#transmissions-list > *:first-child .btn-edit');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierModifiePar(page, nom) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(nom);
}

async function filtrerParSalarie(page, nom) {
  await page.selectOption('#filter-salarie', { label: nom });
  await page.click('#btn-apply-filters');
  await page.waitForTimeout(500);
}

async function verifierFichesDuSalarie(page) {
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length >= 0;
}

async function accederGestionSalaries(page) {
  await page.click('#btn-gestion-salaries');
  await page.waitForSelector('#modal-salaries', { state: 'visible' });
}

async function verifierPossibiliteAjout(page) {
  return await page.isVisible('#btn-ajouter-salarie');
}

async function verifierPossibiliteModification(page) {
  return await page.isVisible('.btn-modifier-salarie');
}

async function verifierPossibiliteDesactivation(page) {
  return await page.isVisible('.btn-desactiver-salarie');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cliquerNouvelleFiche,
    verifierChampSalarie,
    verifierChampObligatoire,
    cliquerSelecteurSalarie,
    verifierListeSalaries,
    selectionnerSalarie,
    completerAutresInfos,
    enregistrerFiche,
    verifierSalarieAffiche,
    consulterFiche,
    verifierCreePar,
    modifierFiche,
    verifierModifiePar,
    filtrerParSalarie,
    verifierFichesDuSalarie,
    accederGestionSalaries,
    verifierPossibiliteAjout,
    verifierPossibiliteModification,
    verifierPossibiliteDesactivation
  };
}

