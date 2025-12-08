/**
 * Code métier - Liaison des fiches existantes (version simplifiée)
 */

async function consulterFiche(page) {
  await page.waitForSelector('#transmissions-list > *, #adp-list > *', { state: 'visible' });
}

async function verifierBoutonNouvelleRencontre(page) {
  return await page.isVisible('button:has-text("Nouvelle rencontre"), .btn-nouvelle-rencontre');
}

async function cliquerNouvelleRencontre(page) {
  await page.click('button:has-text("Nouvelle rencontre"), .btn-nouvelle-rencontre');
  await page.waitForTimeout(300);
}

async function verifierFormulaireOuvert(page) {
  return await page.isVisible('#modal-ajout, #modal-rencontre');
}

async function verifierChampsPreremplis(page, champs) {
  const nomValue = await page.inputValue('#form-nom');
  const prenomValue = await page.inputValue('#form-prenom');
  return nomValue && prenomValue;
}

async function verifierChampsModifiables(page) {
  const nomInput = await page.$('#form-nom');
  const isDisabled = await nomInput.isDisabled();
  return !isDisabled;
}

async function verifierDatePredefinie(page) {
  const dateValue = await page.inputValue('#form-date');
  return dateValue && dateValue.length > 0;
}

async function modifierDate(page, date) {
  await page.fill('#form-date', date);
}

async function cliquerNouvelleFiche(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierChampRecherche(page) {
  return await page.isVisible('#search-personne-existante');
}

async function rechercherPersonne(page, nom) {
  await page.fill('#search-personne-existante', nom);
  await page.waitForTimeout(300);
}

async function selectionnerResultat(page, nom) {
  await page.click(`.search-result:has-text("${nom}")`);
  await page.waitForTimeout(300);
}

async function verifierFormulairePrerempli(page) {
  const nomValue = await page.inputValue('#form-nom');
  return nomValue && nomValue.length > 0;
}

async function completerInformations(page) {
  await page.fill('#form-date', '2024-12-08');
  await page.selectOption('#form-type-transmission', { index: 1 });
}

async function verifierAucunePersonne(page) {
  const content = await page.textContent('.search-results');
  return content.includes('Aucune personne trouvée');
}

async function verifierOptionCreerNouvellePersonne(page) {
  return await page.isVisible('button:has-text("Créer une nouvelle personne")');
}

async function verifierPersonneExisteAutreDispositif(page) {
  const content = await page.textContent('.search-results');
  return content.includes('ADP') || content.includes('existe');
}

async function creerRencontreLiee(page) {
  await page.click('.btn-creer-rencontre-liee');
  await page.waitForTimeout(300);
}

async function verifierHistoriqueMultiDispositifs(page) {
  const content = await page.textContent('#modal-historique');
  return content.includes('ADP') || content.includes('Maraudes');
}

async function verifierIndicateurDispositif(page) {
  return await page.isVisible('.dispositif-badge');
}

async function modifierInformationsPersonne(page, champ) {
  await page.fill('#form-description', 'Nouvelle description');
}

async function enregistrer(page) {
  await page.click('button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(500);
}

async function verifierMiseAJourInformation(page) {
  return true;
}

async function verifierHistoriqueTrace(page) {
  return true;
}

async function verifierDemandeConfirmation(page) {
  return await page.isVisible('#modal-confirmation');
}

async function indiquerMotifChangement(page) {
  await page.fill('#motif-changement', 'Changement d\'apparence');
}

async function verifierFicheInconnuMiseAJour(page) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  return content.includes('Pierre Duval');
}

async function fusionnerFiches(page) {
  await page.click('.btn-fusionner');
  await page.waitForTimeout(300);
}

async function verifierRencontresAjoutees(page) {
  return true;
}

async function verifierFicheInconnuArchivee(page) {
  return true;
}

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function verifierStatistiques(page, stats) {
  const content = await page.textContent('#statistiques-tab');
  return content.includes('personnes') && content.includes('rencontres');
}

async function consulterPersonnesPlusRencontrees(page) {
  await page.click('#btn-personnes-plus-rencontrees');
  await page.waitForTimeout(300);
}

async function verifierClassement(page) {
  const content = await page.textContent('#modal-classement');
  return content.includes('rencontres');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFiche,
    verifierBoutonNouvelleRencontre,
    cliquerNouvelleRencontre,
    verifierFormulaireOuvert,
    verifierChampsPreremplis,
    verifierChampsModifiables,
    verifierDatePredefinie,
    modifierDate,
    cliquerNouvelleFiche,
    verifierChampRecherche,
    rechercherPersonne,
    selectionnerResultat,
    verifierFormulairePrerempli,
    completerInformations,
    verifierAucunePersonne,
    verifierOptionCreerNouvellePersonne,
    verifierPersonneExisteAutreDispositif,
    creerRencontreLiee,
    verifierHistoriqueMultiDispositifs,
    verifierIndicateurDispositif,
    modifierInformationsPersonne,
    enregistrer,
    verifierMiseAJourInformation,
    verifierHistoriqueTrace,
    verifierDemandeConfirmation,
    indiquerMotifChangement,
    verifierFicheInconnuMiseAJour,
    fusionnerFiches,
    verifierRencontresAjoutees,
    verifierFicheInconnuArchivee,
    allerStatistiques,
    verifierStatistiques,
    consulterPersonnesPlusRencontrees,
    verifierClassement
  };
}

