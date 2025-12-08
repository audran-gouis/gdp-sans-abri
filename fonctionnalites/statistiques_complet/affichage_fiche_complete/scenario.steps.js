const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

Given('que je suis sur l\'onglet {string}', async function(onglet) {
  await code.allerStatistiques(this.page);
});

Given('qu\'il existe des fiches enregistrées', async function() {
  this.fichesExistent = true;
});

When('je clique sur une fiche dans la liste des statistiques', async function() {
  await code.cliquerFiche(this.page);
});

Then('une modale devrait s\'ouvrir avec les détails complets', async function() {
  const result = await code.verifierModaleOuverte(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir le nom et prénom de la personne', async function() {
  const result = await code.verifierChampVisible(this.page, 'nom');
  expect(result).toBeTruthy();
});

Then('je devrais voir la date de naissance', async function() {
  const result = await code.verifierChampVisible(this.page, 'date');
  expect(result).toBeTruthy();
});

Then('je devrais voir la description physique', async function() {
  const result = await code.verifierChampVisible(this.page, 'description');
  expect(result).toBeTruthy();
});

Then('je devrais voir les informations d\'accompagnement', async function() {
  const result = await code.verifierChampVisible(this.page, 'accompagnement');
  expect(result).toBeTruthy();
});

Then('je devrais voir les commentaires associés', async function() {
  const result = await code.verifierCommentairesVisibles(this.page);
  expect(result).toBeTruthy();
});

Given('que la modale de détails est ouverte', async function() {
  await code.cliquerFiche(this.page);
});

When('je clique sur le bouton de fermeture', async function() {
  await code.cliquerFermeture(this.page);
});

Then('la modale devrait se fermer', async function() {
  const result = await code.verifierModaleFermee(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais revenir à la vue des statistiques', async function() {
  const result = await code.verifierRetourStatistiques(this.page);
  expect(result).toBeTruthy();
});

When('je clique sur {string}', async function(bouton) {
  await code.cliquerFicheSuivante(this.page);
});

Then('les détails de la fiche suivante devraient s\'afficher', async function() {
  const result = await code.verifierDetailsFicheSuivante(this.page);
  expect(result).toBeTruthy();
});

Then('les commentaires de cette nouvelle fiche devraient être visibles', async function() {
  const result = await code.verifierCommentairesVisibles(this.page);
  expect(result).toBeTruthy();
});

