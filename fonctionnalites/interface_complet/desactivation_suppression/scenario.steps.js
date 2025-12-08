const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je consulte une fiche', async function() {
  await code.consulterFiche(this.page);
});

Then('je ne devrais pas voir de bouton {string}', async function(bouton) {
  const result = await code.verifierAbsenceBoutonSupprimer(this.page);
  expect(result).toBeTruthy();
});

Then('seuls les boutons {string} et {string} devraient être visibles', async function(btn1, btn2) {
  const result = await code.verifierBoutonsPresents(this.page, [btn1, btn2]);
  expect(result).toBeTruthy();
});

When('je fais un clic droit sur une fiche', async function() {
  await code.faireClicDroit(this.page);
});

Then('le menu contextuel ne devrait pas contenir {string}', async function(option) {
  const result = await code.verifierMenuContextuel(this.page);
  expect(result).toBeTruthy();
});

Given('que je suis un utilisateur standard', async function() {
  this.estUtilisateurStandard = true;
});

When('je consulte la liste des fiches', async function() {
  await code.consulterListeFiches(this.page);
});

Then('aucune option de suppression ne devrait être disponible', async function() {
  const result = await code.verifierAucuneOptionSuppression(this.page);
  expect(result).toBeTruthy();
});

When('je souhaite {string} une fiche', async function(action) {
  // Action virtuelle - pas besoin d'implémentation réelle
});

Then('je devrais voir l\'option {string} à la place', async function(option) {
  const result = await code.verifierOptionArchiver(this.page);
  expect(result).toBeTruthy();
});

Then('un message devrait expliquer {string}', async function(message) {
  const result = await code.verifierMessageExplication(this.page, message);
  expect(result).toBeTruthy();
});

Given('une fiche archivée', async function() {
  this.ficheArchivee = true;
});

Then('l\'historique complet devrait être conservé', async function() {
  const result = await code.verifierHistoriqueConserve(this.page);
  expect(result).toBeTruthy();
});

Then('les statistiques devraient pouvoir inclure ou exclure les fiches archivées', async function() {
  const result = await code.verifierStatistiquesInclusion(this.page);
  expect(result).toBeTruthy();
});

Then('je ne devrais pas non plus avoir de bouton {string}', async function(bouton) {
  const result = await code.verifierAbsenceBoutonSupprimer(this.page);
  expect(result).toBeTruthy();
});

Then('seul l\'archivage devrait être possible', async function() {
  const result = await code.verifierOptionArchiver(this.page);
  expect(result).toBeTruthy();
});

When('je cherche comment supprimer une fiche', async function() {
  await code.chercherSuppression(this.page);
});

Then('je devrais voir un message explicatif', async function() {
  const result = await code.verifierMessageExplicatif(this.page);
  expect(result).toBeTruthy();
});

Then('le message devrait indiquer {string}', async function(message) {
  const result = await code.verifierMessageExplicatif(this.page);
  expect(result).toBeTruthy();
});

Then('le message devrait suggérer l\'archivage comme alternative', async function() {
  const result = await code.verifierSuggestionArchivage(this.page);
  expect(result).toBeTruthy();
});

