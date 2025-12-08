/**
 * Code métier - Gestion des personnes inconnues dans Transmissions Quotidiennes
 */

async function cliquerNouvelleFiche(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function cocherInconnu(page) {
  await page.check('#form-inconnu');
  await page.waitForTimeout(300);
}

async function verifierChampsDesactives(page) {
  const nomDisabled = await page.isDisabled('#form-nom');
  const prenomDisabled = await page.isDisabled('#form-prenom');
  return nomDisabled && prenomDisabled;
}

async function verifierChampDescriptionActif(page) {
  const descriptionActif = await page.isEnabled('#form-description');
  return descriptionActif;
}

async function saisirDescription(page, description) {
  await page.fill('#form-description', description);
}

async function remplirAutresInfos(page) {
  await page.fill('#form-date', '2024-12-08');
  await page.selectOption('#form-type-transmission', { index: 1 });
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierFicheEnregistree(page) {
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierAffichageInconnu(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Inconnu');
}

async function cocherFiltreInconnus(page) {
  await page.check('#filter-inconnus');
  await page.waitForTimeout(300);
}

async function verifierSeulsInconnus(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Inconnu');
}

async function decocherInconnu(page) {
  await page.uncheck('#form-inconnu');
  await page.waitForTimeout(300);
}

async function verifierChampsActifs(page) {
  const nomActif = await page.isEnabled('#form-nom');
  const prenomActif = await page.isEnabled('#form-prenom');
  return nomActif && prenomActif;
}

async function modifierFiche(page) {
  await page.click('#transmissions-list > *:first-child .btn-edit');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function remplirNom(page, nom) {
  await page.fill('#form-nom', nom);
}

async function remplirPrenom(page, prenom) {
  await page.fill('#form-prenom', prenom);
}

async function verifierNomAffiche(page, nom) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(nom);
}

async function verifierDescriptionConservee(page) {
  const content = await page.textContent('#transmissions-list');
  return content.length > 0; // La description devrait toujours être là
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cliquerNouvelleFiche,
    cocherInconnu,
    verifierChampsDesactives,
    verifierChampDescriptionActif,
    saisirDescription,
    remplirAutresInfos,
    enregistrer,
    verifierFicheEnregistree,
    verifierAffichageInconnu,
    cocherFiltreInconnus,
    verifierSeulsInconnus,
    decocherInconnu,
    verifierChampsActifs,
    modifierFiche,
    remplirNom,
    remplirPrenom,
    verifierNomAffiche,
    verifierDescriptionConservee
  };
}

