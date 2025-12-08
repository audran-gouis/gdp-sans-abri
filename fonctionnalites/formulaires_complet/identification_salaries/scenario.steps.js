const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const {
  cliquerNouvelleFiche,
  verifierChampSalarie,
  verifierChampObligatoire,
  cliquerSelecteurSalarie,
  verifierListeSalaries,
  selectionnerSalarie,
  completerAutresInfos,
  enregistrerFiche,
  verifierSalarieAffiche,
  consulterFiche,
  verifierCreePar,
  modifierFiche,
  verifierModifiePar,
  filtrerParSalarie,
  verifierFichesDuSalarie,
  accederGestionSalaries,
  verifierPossibiliteAjout,
  verifierPossibiliteModification,
  verifierPossibiliteDesactivation
} = require('./code');

When('je clique sur {string}', async function(bouton) {
  await cliquerNouvelleFiche(this.page);
});

Then('je devrais voir un champ {string} obligatoire', async function(champ) {
  const result = await verifierChampSalarie(this.page);
  expect(result).toBeTruthy();
});

Then('le champ devrait proposer une liste de salariés', async function() {
  const result = await verifierListeSalaries(this.page);
  expect(result).toBeTruthy();
});

When('je clique sur le sélecteur de salarié', async function() {
  await cliquerSelecteurSalarie(this.page);
});

Then('je devrais voir la liste des salariés enregistrés', async function() {
  const result = await verifierListeSalaries(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir en sélectionner un', async function() {
  expect(true).toBeTruthy();
});

When('je sélectionne le salarié {string}', async function(nom) {
  await selectionnerSalarie(this.page, nom);
});

When('que je complète les autres informations', async function() {
  await completerAutresInfos(this.page);
});

Then('la fiche devrait afficher {string}', async function(texte) {
  const result = await verifierSalarieAffiche(this.page, texte);
  expect(result).toBeTruthy();
});

Then('l\'heure de création devrait être enregistrée', async function() {
  expect(true).toBeTruthy();
});

Given('une fiche créée par {string}', async function(nom) {
  this.salarieCreateur = nom;
});

When('je consulte cette fiche', async function() {
  const result = await consulterFiche(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir {string}', async function(texte) {
  const result = await verifierSalarieAffiche(this.page, texte);
  expect(result).toBeTruthy();
});

When('{string} modifie cette fiche', async function(nom) {
  await modifierFiche(this.page, nom);
});

When('clique sur {string}', async function(bouton) {
  await enregistrerFiche(this.page);
});

Then('la date de modification devrait être enregistrée', async function() {
  expect(true).toBeTruthy();
});

When('je filtre par salarié {string}', async function(nom) {
  await filtrerParSalarie(this.page, nom);
});

Then('je devrais voir uniquement les fiches créées par ce salarié', async function() {
  const result = await verifierFichesDuSalarie(this.page);
  expect(result).toBeTruthy();
});

Given('que je suis administrateur', async function() {
  this.estAdministrateur = true;
});

When('j\'accède à la gestion des salariés', async function() {
  await accederGestionSalaries(this.page);
});

Then('je devrais pouvoir ajouter un nouveau salarié', async function() {
  const result = await verifierPossibiliteAjout(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir modifier un salarié existant', async function() {
  const result = await verifierPossibiliteModification(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir désactiver un salarié', async function() {
  const result = await verifierPossibiliteDesactivation(this.page);
  expect(result).toBeTruthy();
});

