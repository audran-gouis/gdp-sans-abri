const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('que je coche la case {string}', async function(option) {
  if (option === 'Inconnu') {
    await code.cocherInconnu(this.page);
  }
});

Then('les champs {string} et {string} devraient être désactivés', async function(champ1, champ2) {
  const result = await code.verifierChampsDesactives(this.page);
  expect(result).toBeTruthy();
});

Then('le champ {string} devrait rester actif', async function(champ) {
  const result = await code.verifierChampDescriptionActif(this.page);
  expect(result).toBeTruthy();
});

When('que je remplis {string} avec {string}', async function(champ, valeur) {
  if (champ === 'Description physique') {
    await code.remplirDescription(this.page, valeur);
  } else {
    await code.remplirChamp(this.page, champ, valeur);
  }
});

When('que je sélectionne le point d\'accueil {string}', async function(point) {
  await code.selectionnerPointAccueil(this.page, point);
});

When('que je sélectionne la date {string}', async function(date) {
  await code.selectionnerDate(this.page, date);
});

When('que je coche {string} dans Distribution', async function(option) {
  await code.cocherDistribution(this.page, option);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la fiche devrait être enregistrée', async function() {
  const result = await code.verifierFicheEnregistree(this.page);
  expect(result).toBeTruthy();
});

Then('la fiche devrait afficher {string} dans la liste', async function(texte) {
  const result = await code.verifierAffichageInconnu(this.page);
  expect(result).toBeTruthy();
});

When('que je décoche la case {string}', async function(option) {
  if (option === 'Inconnu') {
    await code.decocherInconnu(this.page);
  }
});

Then('les champs {string} et {string} devraient être réactivés', async function(champ1, champ2) {
  const result = await code.verifierChampsReactives(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche Point Accueil avec {string} coché', async function(option) {
  this.ficheInconnue = true;
});

When('je modifie cette fiche', async function() {
  await code.modifierFiche(this.page);
});

When('que je décoche {string}', async function(option) {
  await code.decocherInconnu(this.page);
});

Then('la fiche devrait afficher {string}', async function(nom) {
  const result = await code.verifierNomAffiche(this.page, nom);
  expect(result).toBeTruthy();
});

Then('la description physique devrait être conservée', async function() {
  const result = await code.verifierDescriptionConservee(this.page);
  expect(result).toBeTruthy();
});

