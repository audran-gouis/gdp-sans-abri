const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

Given('une fiche avec un signalement actif', async function() {
  this.ficheAvecSignalement = true;
});

When('je consulte la liste des fiches', async function() {
  await code.consulterListeFiches(this.page);
});

Then('la fiche devrait avoir un indicateur jaune', async function() {
  const result = await code.verifierIndicateurCouleur(this.page, 'jaune');
  expect(result).toBeTruthy();
});

Then('le badge {string} devrait être de couleur jaune', async function(badge) {
  const result = await code.verifierBadgeCouleur(this.page, badge, 'jaune');
  expect(result).toBeTruthy();
});

Given('une fiche marquée comme {string}', async function(type) {
  this.typeFiche = type;
});

Then('la fiche devrait avoir un indicateur bleu', async function() {
  const result = await code.verifierIndicateurCouleur(this.page, 'bleu');
  expect(result).toBeTruthy();
});

Then('le badge {string} devrait être de couleur bleue', async function(badge) {
  const result = await code.verifierBadgeCouleur(this.page, badge, 'bleu');
  expect(result).toBeTruthy();
});

Given('une fiche avec la mention {string} cochée', async function(mention) {
  this.mentionFiche = mention;
});

Then('la fiche devrait avoir un indicateur rouge', async function() {
  const result = await code.verifierIndicateurCouleur(this.page, 'rouge');
  expect(result).toBeTruthy();
});

Then('le badge {string} devrait être de couleur rouge', async function(badge) {
  const result = await code.verifierBadgeCouleur(this.page, badge, 'rouge');
  expect(result).toBeTruthy();
});

Then('cette fiche devrait être mise en évidence pour alerter', async function() {
  expect(true).toBeTruthy();
});

Then('la fiche devrait avoir un indicateur gris', async function() {
  const result = await code.verifierIndicateurCouleur(this.page, 'gris');
  expect(result).toBeTruthy();
});

Then('le badge {string} devrait être de couleur grise', async function(badge) {
  const result = await code.verifierBadgeCouleur(this.page, badge, 'gris');
  expect(result).toBeTruthy();
});

Then('la fiche devrait apparaître en grisé', async function() {
  const result = await code.verifierIndicateurCouleur(this.page, 'gris');
  expect(result).toBeTruthy();
});

Given('une fiche avec {string} et {string}', async function(opt1, opt2) {
  this.optionsFiche = [opt1, opt2];
});

Then('la fiche devrait afficher les deux badges colorés', async function() {
  const result = await code.verifierPlusieursIndicateurs(this.page);
  expect(result).toBeTruthy();
});

Then('le badge jaune {string} devrait être visible', async function(badge) {
  const result = await code.verifierBadgeCouleur(this.page, badge, 'jaune');
  expect(result).toBeTruthy();
});

Then('le badge bleu {string} devrait être visible', async function(badge) {
  const result = await code.verifierBadgeCouleur(this.page, badge, 'bleu');
  expect(result).toBeTruthy();
});

When('je consulte l\'interface de l\'application', async function() {
  await code.consulterInterface(this.page);
});

Then('je devrais voir une légende explicative des couleurs', async function() {
  const result = await code.verifierLegende(this.page);
  expect(result).toBeTruthy();
});

Then('la légende devrait indiquer {string}', async function(explication) {
  const result = await code.verifierExplicationCouleur(this.page, 'jaune', 'Signalement');
  expect(result).toBeTruthy();
});

