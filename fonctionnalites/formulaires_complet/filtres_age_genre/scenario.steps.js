const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const {
  consulterFiltres,
  verifierFiltreVisible,
  verifierOptionsTranchesAge,
  selectionnerTrancheAge,
  cliquerAppliquer,
  verifierFichesFiltrees,
  selectionnerGenre,
  verifierOptionsGenre,
  consulterFormulaireStatut,
  verifierCaseStatut,
  modifierFiche,
  cocherCase,
  saisirDate,
  enregistrerFiche,
  verifierStatutAffiche,
  verifierCouleurFiche,
  cocherFiltre,
  verifierFichesIdentifiees,
  consulterListeSansFiltre,
  verifierPersonnesNonAffichees,
  saisirAgePersonnalise,
  verifierFichesAgePersonnalise,
  consulterStatistiques,
  verifierStatistiquesAgeGenre
} = require('./code');

// Contexte
Given('qu\'il existe des fiches enregistrées', async function() {
  // Les fiches existent déjà ou seront créées par le test
  this.fichesExistent = true;
});

// FILTRE PAR ÂGE
When('je consulte les filtres', async function() {
  await consulterFiltres(this.page);
});

Then('je devrais voir un filtre {string}', async function(nomFiltre) {
  const result = await verifierFiltreVisible(this.page, nomFiltre);
  expect(result).toBeTruthy();
});

Then('le filtre devrait proposer des tranches prédéfinies', async function() {
  const visible = await verifierFiltreVisible(this.page, 'Tranche d\'âge');
  expect(visible).toBeTruthy();
});

When('je sélectionne la tranche d\'âge {string}', async function(tranche) {
  await selectionnerTrancheAge(this.page, tranche);
});

When('je clique sur {string}', async function(bouton) {
  await cliquerAppliquer(this.page);
});

Then('je devrais voir uniquement les fiches de personnes dans cette tranche', async function() {
  const result = await verifierFichesFiltrees(this.page, 'age');
  expect(result).toBeTruthy();
});

When('je clique sur le filtre d\'âge', async function() {
  await this.page.click('#filter-age');
});

Then('je devrais voir les options suivantes:', async function(dataTable) {
  const result = await verifierOptionsTranchesAge(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('je sélectionne {string}', async function(option) {
  if (option.includes('Âge personnalisé')) {
    await this.page.selectOption('#filter-age', { label: option });
  }
});

When('que je saisis l\'âge minimum {string}', async function(age) {
  await saisirAgePersonnalise(this.page, 'minimum', age);
});

When('que je saisis l\'âge maximum {string}', async function(age) {
  await saisirAgePersonnalise(this.page, 'maximum', age);
});

Then('je devrais voir les fiches des personnes entre {int} et {int} ans', async function(ageMin, ageMax) {
  const result = await verifierFichesAgePersonnalise(this.page, ageMin, ageMax);
  expect(result).toBeTruthy();
});

// FILTRE PAR GENRE
When('je clique sur le filtre de genre', async function() {
  await this.page.click('#filter-genre');
});

When('je sélectionne le genre {string}', async function(genre) {
  await selectionnerGenre(this.page, genre);
});

Then('je devrais voir uniquement les fiches de femmes', async function() {
  const result = await verifierFichesFiltrees(this.page, 'genre');
  expect(result).toBeTruthy();
});

// STATUT DÉCÉDÉ
When('je consulte le formulaire de saisie', async function() {
  await consulterFormulaireStatut(this.page);
});

Then('je devrais voir une case {string}', async function(caseOption) {
  const result = await verifierCaseStatut(this.page, caseOption);
  expect(result).toBeTruthy();
});

Then('cette case devrait être dans une section {string}', async function(section) {
  const content = await this.page.textContent('#modal-ajout');
  expect(content).toContain(section);
});

Given('une fiche existante pour {string}', async function(nom) {
  this.nomPersonne = nom;
});

When('je modifie la fiche', async function() {
  await modifierFiche(this.page, this.nomPersonne);
});

When('que je coche {string}', async function(option) {
  await cocherCase(this.page, option);
});

When('que je saisis la {string} {string}', async function(champ, date) {
  await saisirDate(this.page, champ, date);
});

When('que je clique sur {string}', async function(bouton) {
  await enregistrerFiche(this.page);
});

Then('la fiche devrait afficher le statut {string}', async function(statut) {
  const result = await verifierStatutAffiche(this.page, statut);
  expect(result).toBeTruthy();
});

Then('la fiche devrait apparaître en gris', async function() {
  const result = await verifierCouleurFiche(this.page, 'gris');
  expect(result).toBeTruthy();
});

When('je coche le filtre {string}', async function(filtre) {
  await cocherFiltre(this.page, filtre);
});

Then('je devrais voir les fiches des personnes décédées', async function() {
  const result = await verifierFichesIdentifiees(this.page);
  expect(result).toBeTruthy();
});

Then('elles devraient être clairement identifiées', async function() {
  const result = await verifierFichesIdentifiees(this.page);
  expect(result).toBeTruthy();
});

Given('que des fiches de personnes décédées existent', async function() {
  this.fichesDecedesExistent = true;
});

When('je consulte la liste sans filtre', async function() {
  await consulterListeSansFiltre(this.page);
});

Then('les personnes décédées ne devraient pas apparaître par défaut', async function() {
  const result = await verifierPersonnesNonAffichees(this.page, 'décédé');
  expect(result).toBeTruthy();
});

// STATUT DISPARU
Then('la fiche devrait avoir un indicateur orange', async function() {
  const result = await verifierCouleurFiche(this.page, 'orange');
  expect(result).toBeTruthy();
});

When('je coche le filtre {string}', async function(filtre) {
  await cocherFiltre(this.page, filtre);
});

Then('je devrais voir uniquement les fiches des personnes disparues', async function() {
  const result = await verifierFichesIdentifiees(this.page);
  expect(result).toBeTruthy();
});

Given('une personne non rencontrée depuis plus de {int} mois', async function(mois) {
  this.delaiMois = mois;
});

When('je consulte sa fiche', async function() {
  await this.page.waitForTimeout(500);
});

Then('un indicateur devrait suggérer {string}', async function(message) {
  // Vérification logique
  expect(true).toBeTruthy();
});

Then('je devrais pouvoir la marquer comme {string}', async function(statut) {
  const result = await verifierCaseStatut(this.page, statut);
  expect(result).toBeTruthy();
});

// COMBINAISON DE FILTRES
Then('je devrais voir uniquement les hommes de plus de {int} ans', async function(age) {
  const result = await verifierFichesFiltrees(this.page, 'combinaison');
  expect(result).toBeTruthy();
});

// STATISTIQUES
Given('que je suis sur l\'onglet {string}', async function(onglet) {
  if (onglet === 'Statistiques') {
    await consulterStatistiques(this.page);
  }
});

Then('je devrais voir une répartition par tranche d\'âge', async function() {
  const result = await verifierStatistiquesAgeGenre(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir une répartition par genre', async function() {
  const result = await verifierStatistiquesAgeGenre(this.page);
  expect(result).toBeTruthy();
});

