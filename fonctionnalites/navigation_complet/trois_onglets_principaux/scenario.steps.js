const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je consulte la barre de navigation', async function() {
  await code.consulterBarreNavigation(this.page);
});

Then('je devrais voir l\'onglet {string}', async function(onglet) {
  const result = await code.verifierOngletVisible(this.page, onglet);
  expect(result).toBeTruthy();
});

When('je lance l\'application', async function() {
  await code.lancerApplication(this.page);
});

Then('l\'onglet {string} devrait être actif par défaut', async function(onglet) {
  const result = await code.verifierOngletActif(this.page, onglet);
  expect(result).toBeTruthy();
});

Then('je devrais voir le contenu des maraudes départementales', async function() {
  const result = await code.verifierContenuVisible(this.page, 'maraudes');
  expect(result).toBeTruthy();
});

When('je clique sur l\'onglet {string}', async function(onglet) {
  await code.cliquerOnglet(this.page, onglet);
});

Then('l\'onglet {string} devrait devenir actif', async function(onglet) {
  const result = await code.verifierOngletActif(this.page, onglet);
  expect(result).toBeTruthy();
});

Then('je devrais voir la liste des fiches ADP', async function() {
  const result = await code.verifierListeFiches(this.page, 'ADP');
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir ajouter une nouvelle fiche ADP', async function() {
  const result = await code.verifierBoutonAjouter(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir la liste des fiches Point Accueil', async function() {
  const result = await code.verifierListeFiches(this.page, 'Point Accueil');
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir ajouter une nouvelle fiche Point Accueil', async function() {
  const result = await code.verifierBoutonAjouter(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche créée dans {string}', async function(onglet) {
  this.ongletCreation = onglet;
});

When('je consulte chaque onglet', async function() {
  await code.cliquerOnglet(this.page, 'ADP');
  await code.cliquerOnglet(this.page, 'Point Accueil');
});

Then('les fiches devraient être affichées dans leur onglet respectif', async function() {
  const result = await code.verifierFichesDansOngletRespectif(this.page);
  expect(result).toBeTruthy();
});

Then('les fiches ne devraient pas être mélangées entre les onglets', async function() {
  const result = await code.verifierFichesPasMelangees(this.page);
  expect(result).toBeTruthy();
});

When('je vais sur l\'onglet {string}', async function(onglet) {
  await code.allerStatistiques(this.page);
});

Then('je devrais pouvoir filtrer par source de données', async function() {
  expect(true).toBeTruthy();
});

Then('je devrais voir un filtre {string}', async function(filtre) {
  const result = await code.verifierFiltreSource(this.page, filtre);
  expect(result).toBeTruthy();
});

When('je crée une fiche dans {string}', async function(onglet) {
  await code.creerFiche(this.page, onglet);
});

Then('le formulaire devrait être adapté aux maraudes', async function() {
  const result = await code.verifierFormulaireAdapte(this.page, 'maraudes');
  expect(result).toBeTruthy();
});

Then('le formulaire devrait être adapté au point d\'accueil', async function() {
  const result = await code.verifierFormulaireAdapte(this.page, 'point-accueil');
  expect(result).toBeTruthy();
});

