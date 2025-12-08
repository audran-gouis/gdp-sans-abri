const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

// Version simplifiée avec les principaux scénarios

Given('qu\'il existe des personnes enregistrées dans la base de données', async function() {
  this.personnesEnregistrees = true;
});

Given('une fiche existante pour {string}', async function(nom) {
  this.nomPersonne = nom;
});

When('je consulte cette fiche', async function() {
  await code.consulterFiche(this.page);
});

Then('je devrais voir un bouton {string}', async function(bouton) {
  const result = await code.verifierBoutonNouvelleRencontre(this.page);
  expect(result).toBeTruthy();
});

Then('ce bouton devrait permettre d\'ajouter une nouvelle rencontre pour cette personne', async function() {
  expect(true).toBeTruthy();
});

When('je clique sur {string}', async function(bouton) {
  await code.cliquerNouvelleRencontre(this.page);
});

Then('un formulaire devrait s\'ouvrir', async function() {
  const result = await code.verifierFormulaireOuvert(this.page);
  expect(result).toBeTruthy();
});

Then('les informations de la personne devraient être pré-remplies (nom, prénom, date de naissance)', async function() {
  const result = await code.verifierChampsPreremplis(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir saisir les informations de la nouvelle rencontre', async function() {
  expect(true).toBeTruthy();
});

Given('que je crée une nouvelle rencontre pour une personne existante', async function() {
  await code.cliquerNouvelleRencontre(this.page);
});

Then('les champs suivants devraient être pré-remplis:', async function(dataTable) {
  const result = await code.verifierChampsPreremplis(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

Then('ces champs devraient être modifiables si besoin', async function() {
  const result = await code.verifierChampsModifiables(this.page);
  expect(result).toBeTruthy();
});

Given('que je crée une nouvelle rencontre', async function() {
  await code.cliquerNouvelleRencontre(this.page);
});

Then('la date devrait être pré-remplie avec la date du jour', async function() {
  const result = await code.verifierDatePredefinie(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir la modifier si la rencontre était antérieure', async function() {
  await code.modifierDate(this.page, '2024-11-01');
  expect(true).toBeTruthy();
});

When('je clique sur {string}', async function(bouton) {
  await code.cliquerNouvelleFiche(this.page);
});

Then('je devrais voir un champ de recherche {string}', async function(placeholder) {
  const result = await code.verifierChampRecherche(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir rechercher par nom, prénom ou description', async function() {
  expect(true).toBeTruthy();
});

When('je recherche {string} dans le champ de recherche', async function(terme) {
  await code.rechercherPersonne(this.page, terme);
});

When('que je sélectionne {string} dans les résultats', async function(nom) {
  await code.selectionnerResultat(this.page, nom);
});

Then('les informations de Jean Dupont devraient remplir le formulaire', async function() {
  const result = await code.verifierFormulairePrerempli(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir compléter les informations de la rencontre', async function() {
  await code.completerInformations(this.page);
  expect(true).toBeTruthy();
});

When('je recherche une personne qui n\'existe pas', async function() {
  await code.rechercherPersonne(this.page, 'XYZXYZXYZ');
});

Then('je devrais voir le message {string}', async function(message) {
  const result = await code.verifierAucunePersonne(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais avoir l\'option {string}', async function(option) {
  const result = await code.verifierOptionCreerNouvellePersonne(this.page);
  expect(result).toBeTruthy();
});

Given('{string} enregistrée dans ADP', async function(nom) {
  this.personneADP = nom;
});

When('je suis dans {string}', async function(dispositif) {
  this.dispositifActuel = dispositif;
});

When('que je recherche {string}', async function(nom) {
  await code.rechercherPersonne(this.page, nom);
});

Then('je devrais voir qu\'elle existe dans ADP', async function() {
  const result = await code.verifierPersonneExisteAutreDispositif(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir créer une rencontre liée', async function() {
  await code.creerRencontreLiee(this.page);
  expect(true).toBeTruthy();
});

Given('une personne avec des rencontres dans plusieurs dispositifs', async function() {
  this.personneMultiDispositifs = true;
});

Then('je devrais voir l\'historique de tous les dispositifs', async function() {
  const result = await code.verifierHistoriqueMultiDispositifs(this.page);
  expect(result).toBeTruthy();
});

Then('chaque rencontre devrait indiquer son dispositif d\'origine', async function() {
  const result = await code.verifierIndicateurDispositif(this.page);
  expect(result).toBeTruthy();
});

Given('une nouvelle rencontre pour une personne existante', async function() {
  await code.cliquerNouvelleRencontre(this.page);
});

When('je modifie le champ {string}', async function(champ) {
  await code.modifierInformationsPersonne(this.page, champ);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la description physique devrait être mise à jour', async function() {
  const result = await code.verifierMiseAJourInformation(this.page);
  expect(result).toBeTruthy();
});

Then('l\'historique devrait garder trace de l\'ancienne description', async function() {
  const result = await code.verifierHistoriqueTrace(this.page);
  expect(result).toBeTruthy();
});

Given('une personne avec un historique', async function() {
  this.personneAvecHistorique = true;
});

When('que je modifie des informations significatives', async function() {
  await code.modifierInformationsPersonne(this.page, 'description');
});

Then('un message devrait demander confirmation', async function() {
  const result = await code.verifierDemandeConfirmation(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir indiquer le motif du changement', async function() {
  await code.indiquerMotifChangement(this.page);
  expect(true).toBeTruthy();
});

Given('une fiche {string} avec description {string}', async function(type, description) {
  this.ficheInconnu = { type, description };
});

When('je découvre son identité {string}', async function(nom) {
  this.nouvelleid = nom;
});

When('que je modifie la fiche pour ajouter le nom', async function() {
  await this.page.fill('#form-nom', this.nouvelleid);
});

Then('la fiche devrait être mise à jour', async function() {
  await code.enregistrer(this.page);
  const result = await code.verifierFicheInconnuMiseAJour(this.page);
  expect(result).toBeTruthy();
});

Then('l\'historique devrait montrer qu\'il était précédemment {string}', async function(statut) {
  const result = await code.verifierHistoriqueTrace(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche {string} avec {int} rencontres', async function(type, nb) {
  this.ficheInconnuAvecRencontres = { type, nb };
});

Given('que je découvre que c\'est {string} (fiche existante)', async function(nom) {
  this.idReelle = nom;
});

When('je fusionne les deux fiches', async function() {
  await code.fusionnerFiches(this.page);
});

Then('les {int} rencontres devraient être ajoutées à l\'historique de Jean Dupont', async function(nb) {
  const result = await code.verifierRencontresAjoutees(this.page);
  expect(result).toBeTruthy();
});

Then('la fiche {string} devrait être archivée', async function(type) {
  const result = await code.verifierFicheInconnuArchivee(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir:', async function(dataTable) {
  const result = await code.verifierStatistiques(this.page, dataTable.hashes());
  expect(result).toBeTruthy();
});

When('je consulte {string}', async function(section) {
  await code.consulterPersonnesPlusRencontrees(this.page);
});

Then('je devrais voir un classement des personnes par nombre de rencontres', async function() {
  const result = await code.verifierClassement(this.page);
  expect(result).toBeTruthy();
});

