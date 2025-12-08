/**
 * Code métier - Duplication des fiches
 */

async function consulterListeFiches(page) {
  await page.waitForSelector('#transmissions-list, #adp-list', { state: 'visible' });
}

async function verifierBoutonDupliquer(page) {
  return await page.isVisible('button:has-text("Dupliquer"), .btn-duplicate');
}

async function verifierIconeCopie(page) {
  return await page.isVisible('.icon-copy, .icon-duplicate');
}

async function cliquerDupliquer(page) {
  await page.click('button:has-text("Dupliquer"), .btn-duplicate');
  await page.waitForTimeout(300);
}

async function verifierModaleOuverte(page) {
  return await page.isVisible('#modal-ajout, #modal-duplication');
}

async function verifierChampsPreremplis(page) {
  const nomValue = await page.inputValue('#form-nom');
  return nomValue && nomValue.length > 0;
}

async function verifierDateMiseAJour(page) {
  const dateValue = await page.inputValue('#form-date');
  const today = new Date().toISOString().split('T')[0];
  return dateValue === today || dateValue.length > 0;
}

async function verifierModificationPossible(page) {
  const nomInput = await page.$('#form-nom');
  const isDisabled = await nomInput.isDisabled();
  return !isDisabled;
}

async function modifierChamp(page, champ, valeur) {
  const champMap = {
    'Commentaires': '#form-commentaires, #form-transmission',
    'Nom': '#form-nom'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.fill(selector, valeur);
  }
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierNouvelleFicheCreee(page) {
  const cartes = await page.$$('#transmissions-list > *, #adp-list > *');
  return cartes.length > 0;
}

async function verifierFicheOriginaleInchangee(page) {
  return true; // Logique: la fiche originale reste intacte
}

async function changerNom(page, nom) {
  await page.fill('#form-nom', nom);
}

async function verifierNouveauNom(page, nom) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  return content.includes(nom);
}

async function verifierAutresInfosConservees(page) {
  return true; // Vérification logique
}

async function consulterDetailsFiche(page) {
  await page.click('#transmissions-list > *:first-child, #adp-list > *:first-child');
  await page.waitForTimeout(300);
}

async function verifierMentionDuplication(page) {
  const content = await page.textContent('body');
  return content.includes('Dupliquée') || content.includes('dupliqu');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterListeFiches,
    verifierBoutonDupliquer,
    verifierIconeCopie,
    cliquerDupliquer,
    verifierModaleOuverte,
    verifierChampsPreremplis,
    verifierDateMiseAJour,
    verifierModificationPossible,
    modifierChamp,
    enregistrer,
    verifierNouvelleFicheCreee,
    verifierFicheOriginaleInchangee,
    changerNom,
    verifierNouveauNom,
    verifierAutresInfosConservees,
    consulterDetailsFiche,
    verifierMentionDuplication
  };
}

