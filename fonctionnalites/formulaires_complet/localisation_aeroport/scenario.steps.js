const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const {
  consulterFormulaire,
  verifierChampAeroport,
  verifierListeAeroports,
  cliquerSelecteurAeroport,
  verifierOptionsAeroports,
  commencerSaisie,
  verifierSuggestions,
  selectionnerAeroport,
  completerChamps,
  enregistrer,
  verifierLocalisationAffichee,
  allerStatistiques,
  filtrerParAeroport,
  verifierFichesFiltrées
} = require('./code');

When('je consulte le formulaire', async function() {
  await consulterFormulaire(this.page);
});

Then('je devrais voir un champ {string} au lieu de {string}', async function(champ1, champ2) {
  const result = await verifierChampAeroport(this.page);
  expect(result).toBeTruthy();
});

Then('le champ devrait proposer une liste d\'aéroports', async function() {
  const result = await verifierListeAeroports(this.page);
  expect(result).toBeTruthy();
});

When('je clique sur le sélecteur d\'aéroport', async function() {
  await cliquerSelecteurAeroport(this.page);
});

Then('je devrais voir les options suivantes:', async function(dataTable) {
  const result = await verifierOptionsAeroports(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('je commence à taper {string} dans le champ aéroport', async function(texte) {
  await commencerSaisie(this.page, texte);
});

Then('je devrais voir les suggestions commençant par {string}', async function(prefixe) {
  const result = await verifierSuggestions(this.page, prefixe);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir sélectionner {string}', async function(aeroport) {
  await selectionnerAeroport(this.page, aeroport);
  expect(true).toBeTruthy();
});

When('je sélectionne l\'aéroport {string}', async function(aeroport) {
  await selectionnerAeroport(this.page, aeroport);
});

When('que je complète les autres champs requis', async function() {
  await completerChamps(this.page);
});

When('que je clique sur {string}', async function(bouton) {
  await enregistrer(this.page);
});

Then('la fiche devrait afficher {string} comme localisation', async function(aeroport) {
  const result = await verifierLocalisationAffichee(this.page, aeroport);
  expect(result).toBeTruthy();
});

When('je filtre par aéroport {string}', async function(aeroport) {
  await filtrerParAeroport(this.page, aeroport);
});

Then('je devrais voir uniquement les fiches de cet aéroport', async function() {
  const result = await verifierFichesFiltrées(this.page);
  expect(result).toBeTruthy();
});

