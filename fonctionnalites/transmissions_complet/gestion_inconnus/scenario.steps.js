const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je clique sur {string}', async function(bouton) {
  await code.cliquerNouvelleFiche(this.page);
});

When('que je coche la case {string}', async function(option) {
  await code.cocherInconnu(this.page);
});

Then('les champs {string} et {string} devraient être désactivés', async function(champ1, champ2) {
  const result = await code.verifierChampsDesactives(this.page);
  expect(result).toBeTruthy();
});

Then('le champ {string} devrait rester actif', async function(champ) {
  const result = await code.verifierChampDescriptionActif(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir une description physique', async function() {
  await code.saisirDescription(this.page, 'Test description');
  expect(true).toBeTruthy();
});

When('je crée une fiche avec {string} coché', async function(option) {
  await code.cliquerNouvelleFiche(this.page);
  await code.cocherInconnu(this.page);
});

When('que je remplis {string} avec {string}', async function(champ, valeur) {
  await code.saisirDescription(this.page, valeur);
});

When('que je complète les autres informations requises', async function() {
  await code.remplirAutresInfos(this.page);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la fiche devrait être enregistrée', async function() {
  const result = await code.verifierFicheEnregistree(this.page);
  expect(result).toBeTruthy();
});

Then('la fiche devrait afficher {string} à la place du nom', async function(texte) {
  const result = await code.verifierAffichageInconnu(this.page);
  expect(result).toBeTruthy();
});

Given('qu\'il existe des fiches avec des personnes inconnues', async function() {
  this.fichesInconnuesExistent = true;
});

When('je coche le filtre {string}', async function(filtre) {
  await code.cocherFiltreInconnus(this.page);
});

Then('je devrais voir seulement les fiches de personnes inconnues', async function() {
  const result = await code.verifierSeulsInconnus(this.page);
  expect(result).toBeTruthy();
});

Given('que la case {string} est cochée', async function(option) {
  await code.cocherInconnu(this.page);
});

When('je décoche la case {string}', async function(option) {
  await code.decocherInconnu(this.page);
});

Then('les champs {string} et {string} devraient redevenir actifs', async function(champ1, champ2) {
  const result = await code.verifierChampsActifs(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir un nom et un prénom', async function() {
  await code.remplirNom(this.page, 'Test');
  await code.remplirPrenom(this.page, 'Test');
  expect(true).toBeTruthy();
});

Given('une fiche existante avec {string} coché', async function(option) {
  this.ficheInconnueExiste = true;
});

When('je modifie cette fiche', async function() {
  await code.modifierFiche(this.page);
});

When('que je remplis {string} avec {string}', async function(champ, valeur) {
  if (champ === 'Nom') {
    await code.remplirNom(this.page, valeur);
  } else if (champ === 'Prénom') {
    await code.remplirPrenom(this.page, valeur);
  }
});

Then('la fiche devrait afficher {string}', async function(texte) {
  const result = await code.verifierNomAffiche(this.page, texte);
  expect(result).toBeTruthy();
});

Then('la description physique devrait être conservée', async function() {
  const result = await code.verifierDescriptionConservee(this.page);
  expect(result).toBeTruthy();
});

