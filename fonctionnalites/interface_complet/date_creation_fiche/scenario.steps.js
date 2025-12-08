const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je suis sur l\'onglet {string}', async function(onglet) {
  await code.allerOnglet(this.page, onglet);
});

Then('chaque fiche devrait afficher sa date de création', async function() {
  const result = await code.verifierDateCreation(this.page);
  expect(result).toBeTruthy();
});

Then('la date devrait être au format {string}', async function(format) {
  const result = await code.verifierFormatDate(this.page, format);
  expect(result).toBeTruthy();
});

When('je crée une nouvelle fiche', async function() {
  await code.creerNouvelleFiche(this.page);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la date et l\'heure actuelles devraient être enregistrées automatiquement', async function() {
  const result = await code.verifierDateEnregistree(this.page);
  expect(result).toBeTruthy();
});

Then('cette date devrait apparaître sur la fiche créée', async function() {
  const result = await code.verifierDateApparue(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche créée le {string}', async function(date) {
  this.dateCreation = date;
});

Given('que la date de transmission est le {string}', async function(date) {
  this.dateTransmission = date;
});

Then('je devrais voir les deux dates distinctement', async function() {
  const result = await code.verifierDeuxDatesDistinctes(this.page);
  expect(result).toBeTruthy();
});

Then('la date de création devrait être {string}', async function(date) {
  const result = await code.verifierDateCreationAffichee(this.page, date);
  expect(result).toBeTruthy();
});

Then('la date de transmission devrait être {string}', async function(date) {
  const result = await code.verifierDateTransmissionAffichee(this.page, date);
  expect(result).toBeTruthy();
});

