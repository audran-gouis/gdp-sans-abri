const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je suis sur l\'onglet {string}', async function(onglet) {
  await code.allerOnglet(this.page, onglet);
});

Then('je devrais voir le terme {string} au lieu de {string}', async function(terme1, terme2) {
  const result = await code.verifierTermeFiche(this.page);
  expect(result).toBeTruthy();
  const pasDeCartes = await code.verifierAbsenceCarte(this.page);
  expect(pasDeCartes).toBeTruthy();
});

Then('le bouton devrait afficher {string}', async function(texte) {
  const result = await code.verifierBoutonNouvelleFiche(this.page);
  expect(result).toBeTruthy();
});

Then('le message vide devrait indiquer {string}', async function(texte) {
  const result = await code.verifierMessageAucuneFiche(this.page);
  expect(result).toBeTruthy();
});

Then('les résultats devraient afficher {string} au lieu de {string}', async function(terme1, terme2) {
  const result = await code.verifierResultatsXFiches(this.page);
  expect(result).toBeTruthy();
});

When('je crée une nouvelle entrée', async function() {
  await code.creerNouvelleFiche(this.page);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('le message de confirmation devrait contenir {string}', async function(texte) {
  const result = await code.verifierMessageConfirmation(this.page);
  expect(result).toBeTruthy();
});

