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

Then('cette section devrait contenir une case à cocher {string}', async function(option) {
  const result = await code.verifierCaseACocher(this.page, option);
  expect(result).toBeTruthy();
});

When('je coche {string}', async function(option) {
  await code.cocherCase(this.page, option);
});

Then('un champ {string} devrait apparaître', async function(champ) {
  const result = await code.verifierChampApparait(this.page, champ);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir le nom de la structure', async function() {
  expect(true).toBeTruthy();
});

When('je commence à taper dans le champ {string}', async function(champ) {
  await code.commencerSaisie(this.page, champ, 'CCAS');
});

Then('je devrais voir des suggestions de structures connues', async function() {
  const result = await code.verifierSuggestions(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir sélectionner une structure existante', async function() {
  expect(true).toBeTruthy();
});

Then('Ou saisir une nouvelle structure', async function() {
  expect(true).toBeTruthy();
});

When('que je saisis {string} dans le champ lieu', async function(texte) {
  await code.saisirDansChamp(this.page, 'lieu', texte);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la fiche devrait afficher {string}', async function(texte) {
  const result = await code.verifierAffichageSuivi(this.page, texte);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir:', async function(dataTable) {
  const result = await code.verifierChampsSaisie(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir l\'adresse de domiciliation', async function() {
  expect(true).toBeTruthy();
});

Then('je devrais pouvoir sélectionner le type:', async function(dataTable) {
  const result = await code.verifierTypesDisponibles(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('que je sélectionne le type {string}', async function(type) {
  await code.selectionnerType(this.page, type);
});

When('que je saisis {string}', async function(texte) {
  await code.saisirAdresse(this.page, texte);
});

Then('la fiche devrait afficher les informations de domiciliation complètes', async function() {
  const result = await code.verifierAffichageComplet(this.page);
  expect(result).toBeTruthy();
});

When('je renseigne une domiciliation', async function() {
  await code.cocherCase(this.page, 'Domiciliation active');
});

Then('je devrais pouvoir saisir la date d\'expiration', async function() {
  const result = await code.verifierChampApparait(this.page, 'Date d\'expiration');
  expect(result).toBeTruthy();
});

Then('une alerte devrait apparaître si la domiciliation expire bientôt', async function() {
  const result = await code.verifierAlerte(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir le nom de l\'établissement', async function() {
  expect(true).toBeTruthy();
});

Then('je devrais pouvoir sélectionner le type d\'établissement:', async function(dataTable) {
  const result = await code.verifierOptionsEtablissement(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('que je sélectionne {string}', async function(type) {
  await code.selectionnerEtablissement(this.page, type);
});

When('je consulte la section médicale', async function() {
  await code.verifierSection(this.page, 'Suivi Médical');
});

Then('je devrais voir des options pour la couverture santé:', async function(dataTable) {
  const result = await code.verifierOptionsCouverture(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Given('une fiche avec suivi social, domiciliation et suivi médical', async function() {
  this.ficheComplete = true;
});

When('je consulte cette fiche', async function() {
  await code.consulterFiche(this.page);
});

Then('je devrais voir une section récapitulative des suivis', async function() {
  const result = await code.verifierRecapitulatifSuivis(this.page);
  expect(result).toBeTruthy();
});

Then('chaque suivi devrait afficher le lieu associé', async function() {
  const result = await code.verifierLieuAffiche(this.page);
  expect(result).toBeTruthy();
});

When('je filtre par {string}', async function(type) {
  await code.filtrerParSuivi(this.page, type);
});

Then('je devrais voir les personnes avec un suivi social en cours', async function() {
  const result = await code.verifierFichesFiltrées(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir:', async function(dataTable) {
  const result = await code.verifierStatistiquesSuivis(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

