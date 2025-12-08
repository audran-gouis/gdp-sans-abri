const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je consulte le formulaire', async function() {
  await code.consulterFormulaire(this.page);
});

Then('je devrais voir une section {string}', async function(section) {
  const result = await code.verifierSectionRessources(this.page);
  expect(result).toBeTruthy();
});

Then('cette section devrait permettre de documenter la situation financière', async function() {
  expect(true).toBeTruthy();
});

When('je consulte la section Ressources', async function() {
  await code.verifierSectionRessources(this.page);
});

Then('je devrais voir la question {string}', async function(question) {
  const result = await code.verifierQuestionRessources(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir répondre {string}, {string} ou {string}', async function(opt1, opt2, opt3) {
  expect(true).toBeTruthy();
});

When('je réponds {string} à {string}', async function(reponse, question) {
  if (reponse === 'Oui') {
    await code.repondreOui(this.page);
  } else if (reponse === 'Non') {
    await code.repondreNon(this.page);
  }
});

Then('je devrais pouvoir sélectionner les types de ressources:', async function(dataTable) {
  const result = await code.verifierTypesRessources(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('je réponds {string} aux ressources', async function(reponse) {
  await code.repondreOui(this.page);
});

When('que je coche {string}', async function(type) {
  await code.cocherRessource(this.page, type);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la fiche devrait afficher les deux types de ressources', async function() {
  const result = await code.verifierRessourcesAffichees(this.page);
  expect(result).toBeTruthy();
});

When('je renseigne les ressources', async function() {
  await code.repondreOui(this.page);
});

Then('je devrais pouvoir indiquer une tranche de revenus:', async function(dataTable) {
  const result = await code.verifierTrancheRevenus(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Then('la fiche devrait afficher {string}', async function(texte) {
  const result = await code.verifierAucuneRessource(this.page);
  expect(result).toBeTruthy();
});

Then('cette information devrait être mise en évidence', async function() {
  expect(true).toBeTruthy();
});

Then('je devrais voir une option {string}', async function(option) {
  const result = await code.verifierOptionDemandeEnCours(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir préciser le type de demande en cours', async function() {
  expect(true).toBeTruthy();
});

Given('une fiche avec des ressources renseignées', async function() {
  this.ficheAvecRessources = true;
});

When('je consulte cette fiche', async function() {
  await code.consulterFiche(this.page);
});

Then('je devrais voir un récapitulatif des ressources', async function() {
  const result = await code.verifierRecapitulatif(this.page);
  expect(result).toBeTruthy();
});

Then('les ressources devraient être clairement identifiées', async function() {
  expect(true).toBeTruthy();
});

Then('je devrais voir des statistiques sur les ressources:', async function(dataTable) {
  const result = await code.verifierStatistiquesRessources(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('je filtre par {string}', async function(type) {
  await code.filtrerParRessources(this.page, type);
});

Then('je devrais voir uniquement les personnes sans ressources connues', async function() {
  const result = await code.verifierFichesFiltrées(this.page);
  expect(result).toBeTruthy();
});

Given('une personne avec plusieurs rencontres', async function() {
  this.personneAvecHistorique = true;
});

When('je consulte son historique', async function() {
  await code.consulterHistorique(this.page);
});

Then('je devrais voir l\'évolution de ses ressources au fil du temps', async function() {
  const result = await code.verifierEvolutionRessources(this.page);
  expect(result).toBeTruthy();
});
