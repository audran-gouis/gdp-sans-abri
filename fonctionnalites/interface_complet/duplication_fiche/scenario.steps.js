const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

When('je consulte la liste des fiches', async function() {
  await code.consulterListeFiches(this.page);
});

Then('chaque fiche devrait avoir un bouton {string}', async function(bouton) {
  const result = await code.verifierBoutonDupliquer(this.page);
  expect(result).toBeTruthy();
});

Then('le bouton devrait être représenté par une icône de copie', async function() {
  const result = await code.verifierIconeCopie(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche Transmission avec les informations complètes', async function() {
  this.ficheTransmission = true;
});

When('je clique sur le bouton {string}', async function(bouton) {
  await code.cliquerDupliquer(this.page);
});

Then('une nouvelle modale devrait s\'ouvrir', async function() {
  const result = await code.verifierModaleOuverte(this.page);
  expect(result).toBeTruthy();
});

Then('tous les champs devraient être pré-remplis avec les données de la fiche originale', async function() {
  const result = await code.verifierChampsPreremplis(this.page);
  expect(result).toBeTruthy();
});

Then('la date devrait être mise à jour à aujourd\'hui', async function() {
  const result = await code.verifierDateMiseAJour(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir modifier les informations avant d\'enregistrer', async function() {
  const result = await code.verifierModificationPossible(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche ADP avec les informations complètes', async function() {
  this.ficheADP = true;
});

Then('les informations de la personne devraient être copiées', async function() {
  const result = await code.verifierChampsPreremplis(this.page);
  expect(result).toBeTruthy();
});

Then('les informations d\'accompagnement devraient être copiées', async function() {
  const result = await code.verifierChampsPreremplis(this.page);
  expect(result).toBeTruthy();
});

Given('que j\'ai dupliqué une fiche', async function() {
  await code.cliquerDupliquer(this.page);
});

When('je modifie le champ {string}', async function(champ) {
  await code.modifierChamp(this.page, champ, 'Nouvelle valeur');
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('une nouvelle fiche devrait être créée', async function() {
  const result = await code.verifierNouvelleFicheCreee(this.page);
  expect(result).toBeTruthy();
});

Then('la fiche originale devrait rester inchangée', async function() {
  const result = await code.verifierFicheOriginaleInchangee(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche avec plusieurs informations d\'intervention', async function() {
  this.ficheComplexe = true;
});

When('je duplique la fiche', async function() {
  await code.cliquerDupliquer(this.page);
});

When('que je change le nom en {string}', async function(nom) {
  await code.changerNom(this.page, nom);
});

Then('la nouvelle fiche devrait avoir le nouveau nom', async function() {
  const result = await code.verifierNouveauNom(this.page, 'Nouveau Nom');
  expect(result).toBeTruthy();
});

Then('les autres informations devraient être conservées', async function() {
  const result = await code.verifierAutresInfosConservees(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche dupliquée', async function() {
  this.ficheDupliquee = true;
});

When('je consulte les détails de la nouvelle fiche', async function() {
  await code.consulterDetailsFiche(this.page);
});

Then('je devrais voir une mention {string}', async function(mention) {
  const result = await code.verifierMentionDuplication(this.page);
  expect(result).toBeTruthy();
});

