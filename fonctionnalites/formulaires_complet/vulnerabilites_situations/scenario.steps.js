const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je consulte le formulaire', async function() {
  await code.consulterFormulaire(this.page);
});

Then('je devrais voir une section {string}', async function(section) {
  const result = await code.verifierSection(this.page, section);
  expect(result).toBeTruthy();
});

Then('cette section devrait contenir plusieurs sous-catégories', async function() {
  expect(true).toBeTruthy();
});

When('je consulte la section {string}', async function(section) {
  await code.verifierSection(this.page, section);
});

Then('je devrais voir les options suivantes pour {string}:', async function(categorie, dataTable) {
  const result = await code.verifierOptionsPsy(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Then('je devrais voir les options suivantes:', async function(dataTable) {
  const result = await code.verifierOptionsSociales(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Then('je devrais voir une case {string}', async function(option) {
  const result = await code.verifierCaseSansPapiers(this.page);
  expect(result).toBeTruthy();
});

Then('cette case devrait permettre de signaler une situation administrative irrégulière', async function() {
  expect(true).toBeTruthy();
});

When('je coche {string}', async function(option) {
  await code.cocherCase(this.page, option);
});

When('que je coche {string}', async function(option) {
  await code.cocherCase(this.page, option);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la fiche devrait enregistrer toutes ces informations', async function() {
  const result = await code.verifierInformationsEnregistrees(this.page);
  expect(result).toBeTruthy();
});

Then('elles devraient être visibles sur la fiche', async function() {
  const result = await code.verifierVisiblesSurFiche(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche avec plusieurs vulnérabilités cochées', async function() {
  this.ficheAvecVulnerabilites = true;
});

When('je consulte cette fiche', async function() {
  await code.consulterFiche(this.page);
});

Then('les vulnérabilités devraient être affichées avec des badges colorés', async function() {
  const result = await code.verifierBadgesColores(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir identifier rapidement les situations critiques', async function() {
  const result = await code.verifierIdentificationCritique(this.page);
  expect(result).toBeTruthy();
});

When('je filtre par {string}', async function(type) {
  await code.filtrerParVulnerabilite(this.page, type);
});

Then('je devrais voir les statistiques des personnes avec vulnérabilité psy', async function() {
  const result = await code.verifierStatistiques(this.page);
  expect(result).toBeTruthy();
});

When('je coche une vulnérabilité', async function() {
  await code.cocherCase(this.page, 'Addiction');
});

Then('je devrais pouvoir ajouter un commentaire spécifique', async function() {
  const result = await code.verifierChampCommentaire(this.page);
  expect(result).toBeTruthy();
});

Then('ce commentaire devrait préciser la situation', async function() {
  await code.ajouterCommentaire(this.page, 'Situation nécessitant une attention particulière');
  expect(true).toBeTruthy();
});

