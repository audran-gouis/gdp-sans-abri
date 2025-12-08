const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

Given('que je suis sur l\'onglet {string}', async function(onglet) {
  if (onglet === 'Point Accueil') {
    await code.naviguerVersPointAccueil(this.page);
  }
});

When('je clique sur {string}', async function(bouton) {
  if (bouton.includes('Point Accueil')) {
    await code.cliquerNouvelleFichePA(this.page);
  }
});

Then('une modale devrait s\'ouvrir', async function() {
  const result = await code.verifierModaleOuverte(this.page);
  expect(result).toBeTruthy();
});

Then('le titre devrait être {string}', async function(titre) {
  const result = await code.verifierTitreModale(this.page, titre);
  expect(result).toBeTruthy();
});

When('que je remplis le champ {string} avec {string}', async function(champ, valeur) {
  await code.remplirChamp(this.page, champ, valeur);
});

When('que je sélectionne la date de naissance {string}', async function(date) {
  await code.selectionnerDateNaissance(this.page, date);
});

When('que je sélectionne le point d\'accueil {string}', async function(point) {
  await code.selectionnerPointAccueil(this.page, point);
});

When('que je sélectionne la date {string}', async function(date) {
  await code.selectionnerDate(this.page, date);
});

When('que je coche {string}', async function(option) {
  await code.cocherOption(this.page, option);
});

When('que je coche {string} dans Accompagnement', async function(option) {
  await code.cocherOption(this.page, option);
});

When('que je coche {string} dans Distribution', async function(option) {
  await code.cocherOption(this.page, option);
});

When('que je saisis {string} dans Commentaires', async function(texte) {
  await code.saisirCommentaires(this.page, texte);
});

When('que je clique sur {string}', async function(bouton) {
  await code.enregistrer(this.page);
});

Then('la fiche devrait être enregistrée avec succès', async function() {
  const result = await code.verifierFicheEnregistree(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir la fiche dans la liste Point Accueil', async function() {
  const result = await code.verifierFicheDansListe(this.page);
  expect(result).toBeTruthy();
});

Given('une fiche Point Accueil créée pour {string}', async function(nom) {
  this.nomPersonne = nom;
});

When('je consulte la liste des fiches Point Accueil', async function() {
  await code.consulterListeFichesPA(this.page);
});

Then('je devrais voir une fiche contenant {string}', async function(nom) {
  const result = await code.verifierFicheContient(this.page, nom);
  expect(result).toBeTruthy();
});

Then('la fiche devrait afficher le point d\'accueil {string}', async function(point) {
  const result = await code.verifierAffichagePointAccueil(this.page, point);
  expect(result).toBeTruthy();
});

Then('la fiche devrait afficher la date {string}', async function(date) {
  const result = await code.verifierAffichageDate(this.page, date);
  expect(result).toBeTruthy();
});

Then('la fiche devrait afficher {string} dans les accompagnements', async function(accompagnement) {
  const result = await code.verifierAffichageAccompagnement(this.page, accompagnement);
  expect(result).toBeTruthy();
});

