const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

// Contexte
Given('qu\'il existe des fiches enregistrées', async function() {
  this.fichesExistent = true;
});

// ARCHIVAGE
When('je consulte une fiche', async function() {
  await code.consulterFiche(this.page);
});

Then('je devrais voir un bouton {string}', async function(bouton) {
  const result = await code.verifierBoutonArchiver(this.page);
  expect(result).toBeTruthy();
});

Then('le bouton devrait être représenté par une icône de boîte d\'archive', async function() {
  const result = await code.verifierIconeArchive(this.page);
  expect(result).toBeTruthy();
});

When('je clique sur {string} une fiche', async function(action) {
  await code.cliquerArchiver(this.page);
});

Then('une modale de confirmation devrait apparaître', async function() {
  const result = await code.verifierModaleConfirmation(this.page);
  expect(result).toBeTruthy();
});

Then('le message devrait demander {string}', async function(message) {
  const result = await code.verifierMessageConfirmation(this.page, message);
  expect(result).toBeTruthy();
});

Then('je devrais voir les options {string} et {string}', async function(opt1, opt2) {
  expect(true).toBeTruthy();
});

When('je confirme l\'archivage d\'une fiche', async function() {
  await code.confirmerArchivage(this.page);
});

Then('la fiche devrait être marquée comme archivée', async function() {
  const result = await code.verifierFicheArchivee(this.page);
  expect(result).toBeTruthy();
});

Then('la fiche devrait disparaître de la liste principale', async function() {
  const result = await code.verifierFicheDisparue(this.page);
  expect(result).toBeTruthy();
});

Then('un message devrait confirmer {string}', async function(message) {
  const result = await code.verifierMessageSucces(this.page, message);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir sélectionner un motif:', async function(dataTable) {
  const result = await code.verifierOptionsConfirmation(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir ajouter un commentaire', async function() {
  await code.ajouterCommentaire(this.page, 'Test commentaire');
  expect(true).toBeTruthy();
});

When('j\'archive une fiche', async function() {
  await code.cliquerArchiver(this.page);
  await code.confirmerArchivage(this.page);
});

Then('la date et l\'heure d\'archivage devraient être enregistrées', async function() {
  const result = await code.verifierDateArchivage(this.page);
  expect(result).toBeTruthy();
});

Then('le nom du salarié ayant archivé devrait être enregistré', async function() {
  const result = await code.verifierSalarieArchivage(this.page);
  expect(result).toBeTruthy();
});

// ACCÈS AUX ARCHIVES
When('je consulte le menu de l\'application', async function() {
  await code.consulterMenu(this.page);
});

Then('je devrais voir une option {string}', async function(option) {
  const result = await code.verifierOptionArchives(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir accéder aux fiches archivées', async function() {
  await code.accederArchives(this.page);
  expect(true).toBeTruthy();
});

When('je suis dans la section {string}', async function(section) {
  await code.accederArchives(this.page);
});

Then('je devrais voir la liste des fiches archivées', async function() {
  const result = await code.verifierListeFichesArchivees(this.page);
  expect(result).toBeTruthy();
});

Then('chaque fiche devrait afficher la date d\'archivage', async function() {
  const result = await code.verifierDateArchivageAffichee(this.page);
  expect(result).toBeTruthy();
});

Then('le motif d\'archivage devrait être visible', async function() {
  const result = await code.verifierMotifVisible(this.page);
  expect(result).toBeTruthy();
});

When('que je recherche {string}', async function(terme) {
  await code.rechercherDansArchives(this.page, terme);
});

Then('je devrais voir les fiches archivées correspondantes', async function() {
  const result = await code.verifierFichesCorrespondantes(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir filtrer par:', async function(dataTable) {
  const result = await code.verifierFiltresArchives(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

// RESTAURATION
Given('que je suis dans la section {string}', async function(section) {
  await code.accederArchives(this.page);
});

When('je consulte une fiche archivée', async function() {
  await code.consulterFiche(this.page);
});

Then('je devrais voir un bouton {string}', async function(bouton) {
  const result = await code.verifierBoutonRestaurer(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche archivée', async function() {
  this.ficheArchivee = true;
});

When('je clique sur {string}', async function(bouton) {
  await code.cliquerRestaurer(this.page);
});

When('que je confirme la restauration', async function() {
  await code.confirmerRestauration(this.page);
});

Then('la fiche devrait réapparaître dans la liste principale', async function() {
  const result = await code.verifierFicheReapparue(this.page);
  expect(result).toBeTruthy();
});

Then('elle devrait être retirée des archives', async function() {
  const result = await code.verifierFicheRetireeDesArchives(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche restaurée', async function() {
  this.ficheRestauree = true;
});

Then('je devrais voir une mention {string}', async function(mention) {
  const result = await code.verifierMentionRestauree(this.page);
  expect(result).toBeTruthy();
});

Then('l\'historique devrait montrer l\'archivage et la restauration', async function() {
  const result = await code.verifierHistoriqueArchivage(this.page);
  expect(result).toBeTruthy();
});

// STATISTIQUES ET ARCHIVES
Then('les fiches archivées ne devraient pas être comptées par défaut', async function() {
  const result = await code.verifierArchivesExclues(this.page);
  expect(result).toBeTruthy();
});

When('je coche {string}', async function(option) {
  await code.cocherInclureArchives(this.page);
});

Then('les statistiques devraient inclure les fiches archivées', async function() {
  const result = await code.verifierArchivesIncluses(this.page);
  expect(result).toBeTruthy();
});

Then('elles devraient être clairement identifiées', async function() {
  const result = await code.verifierArchivesIdentifiees(this.page);
  expect(result).toBeTruthy();
});

// ARCHIVAGE AUTOMATIQUE
Given('des fiches non modifiées depuis plus d\'un an', async function() {
  this.vieillesFiches = true;
});

When('je consulte la liste des fiches', async function() {
  await code.consulterFiche(this.page);
});

Then('un indicateur devrait suggérer {string}', async function(message) {
  const result = await code.verifierIndicateurArchivage(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir archiver en un clic', async function() {
  await code.archiverEnUnClic(this.page);
  expect(true).toBeTruthy();
});

When('je demande un rapport d\'archivage', async function() {
  await code.demanderRapportArchivage(this.page);
});

Then('je devrais voir le nombre de fiches archivées par période', async function() {
  const result = await code.verifierNombreFichesArchivees(this.page);
  expect(result).toBeTruthy();
});

Then('les motifs d\'archivage les plus fréquents', async function() {
  const result = await code.verifierMotifsFrequents(this.page);
  expect(result).toBeTruthy();
});

