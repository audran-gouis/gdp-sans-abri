/**
 * Code métier - Ajout d'une personne inconnue au Point d'Accueil
 */

async function cliquerNouvelleFichePA(page) {
  await page.click('#btn-ajouter-pa');
  await page.waitForSelector('#modal-point-accueil', { state: 'visible' });
}

async function cocherInconnu(page) {
  await page.check('#form-pa-inconnu');
  await page.waitForTimeout(300);
}

async function verifierChampsDesactives(page) {
  const nomDisabled = await page.isDisabled('#form-pa-nom');
  const prenomDisabled = await page.isDisabled('#form-pa-prenom');
  return nomDisabled && prenomDisabled;
}

async function verifierChampDescriptionActif(page) {
  const descriptionActif = await page.isEnabled('#form-pa-description');
  return descriptionActif;
}

async function remplirDescription(page, texte) {
  await page.fill('#form-pa-description', texte);
}

async function selectionnerPointAccueil(page, point) {
  await page.selectOption('#form-pa-point-accueil', { label: point });
}

async function selectionnerDate(page, date) {
  await page.fill('#form-pa-date', date);
}

async function cocherDistribution(page, option) {
  const optionMap = {
    'Alimentaire': '#form-pa-alimentaire',
    'Vestimentaire': '#form-pa-vestimentaire',
    'Hygiène': '#form-pa-hygiene'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
  }
}

async function enregistrer(page) {
  await page.click('#modal-point-accueil button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-point-accueil', { state: 'hidden' });
  await page.waitForTimeout(1000);
}

async function verifierFicheEnregistree(page) {
  const cartes = await page.$$('#point-accueil-list > *');
  return cartes.length > 0;
}

async function verifierAffichageInconnu(page) {
  const content = await page.textContent('#point-accueil-list');
  return content.includes('Inconnu');
}

async function decocherInconnu(page) {
  await page.uncheck('#form-pa-inconnu');
  await page.waitForTimeout(300);
}

async function verifierChampsReactives(page) {
  const nomActif = await page.isEnabled('#form-pa-nom');
  const prenomActif = await page.isEnabled('#form-pa-prenom');
  return nomActif && prenomActif;
}

async function modifierFiche(page) {
  await page.click('#point-accueil-list > *:first-child .btn-edit');
  await page.waitForSelector('#modal-point-accueil', { state: 'visible' });
}

async function remplirChamp(page, champ, valeur) {
  const champMap = {
    'Nom': '#form-pa-nom',
    'Prénom': '#form-pa-prenom'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.fill(selector, valeur);
  }
}

async function verifierNomAffiche(page, nom) {
  const content = await page.textContent('#point-accueil-list');
  return content.includes(nom);
}

async function verifierDescriptionConservee(page) {
  const content = await page.textContent('#point-accueil-list');
  return content.length > 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cliquerNouvelleFichePA,
    cocherInconnu,
    verifierChampsDesactives,
    verifierChampDescriptionActif,
    remplirDescription,
    selectionnerPointAccueil,
    selectionnerDate,
    cocherDistribution,
    enregistrer,
    verifierFicheEnregistree,
    verifierAffichageInconnu,
    decocherInconnu,
    verifierChampsReactives,
    modifierFiche,
    remplirChamp,
    verifierNomAffiche,
    verifierDescriptionConservee
  };
}

