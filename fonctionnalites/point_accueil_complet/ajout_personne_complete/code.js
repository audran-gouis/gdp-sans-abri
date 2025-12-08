/**
 * Code métier - Ajout d'une personne complète au Point d'Accueil
 */

async function naviguerVersPointAccueil(page) {
  await page.click('button[data-tab="point-accueil"]');
  await page.waitForSelector('#point-accueil-tab', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500);
}

async function cliquerNouvelleFichePA(page) {
  await page.click('#btn-ajouter-pa');
  await page.waitForSelector('#modal-point-accueil', { state: 'visible' });
}

async function verifierModaleOuverte(page) {
  return await page.isVisible('#modal-point-accueil');
}

async function verifierTitreModale(page, titre) {
  const titleText = await page.textContent('#modal-pa-title');
  return titleText.includes(titre);
}

async function remplirChamp(page, nomChamp, valeur) {
  const champMap = {
    'Nom': '#form-pa-nom',
    'Prénom': '#form-pa-prenom',
    'Description physique': '#form-pa-description'
  };
  
  const selector = champMap[nomChamp];
  if (!selector) {
    throw new Error(`Champ "${nomChamp}" non trouvé`);
  }
  
  await page.fill(selector, valeur);
}

async function selectionnerDateNaissance(page, date) {
  await page.fill('#form-pa-ddn', date);
}

async function selectionnerPointAccueil(page, point) {
  await page.selectOption('#form-pa-point-accueil', { label: point });
}

async function selectionnerDate(page, date) {
  await page.fill('#form-pa-date', date);
}

async function cocherOption(page, option) {
  const optionMap = {
    'Personne présente': '#form-pa-present',
    'Écoute': '#form-pa-ecoute',
    'Orientation': '#form-pa-orientation',
    'Information': '#form-pa-information',
    'Alimentaire': '#form-pa-alimentaire',
    'Vestimentaire': '#form-pa-vestimentaire',
    'Hygiène': '#form-pa-hygiene'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
  }
}

async function saisirCommentaires(page, texte) {
  await page.fill('#form-pa-commentaires', texte);
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

async function verifierFicheDansListe(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#point-accueil-list > *');
  return cartes.length > 0;
}

async function consulterListeFichesPA(page) {
  await page.waitForSelector('#point-accueil-list', { state: 'visible' });
  await page.waitForTimeout(500);
}

async function verifierFicheContient(page, nom) {
  const content = await page.textContent('#point-accueil-list');
  return content.includes(nom);
}

async function verifierAffichagePointAccueil(page, point) {
  const content = await page.textContent('#point-accueil-list');
  return content.includes(point);
}

async function verifierAffichageDate(page, date) {
  const content = await page.textContent('#point-accueil-list');
  return content.includes(date);
}

async function verifierAffichageAccompagnement(page, accompagnement) {
  const content = await page.textContent('#point-accueil-list');
  return content.includes(accompagnement);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    naviguerVersPointAccueil,
    cliquerNouvelleFichePA,
    verifierModaleOuverte,
    verifierTitreModale,
    remplirChamp,
    selectionnerDateNaissance,
    selectionnerPointAccueil,
    selectionnerDate,
    cocherOption,
    saisirCommentaires,
    enregistrer,
    verifierFicheEnregistree,
    verifierFicheDansListe,
    consulterListeFichesPA,
    verifierFicheContient,
    verifierAffichagePointAccueil,
    verifierAffichageDate,
    verifierAffichageAccompagnement
  };
}

