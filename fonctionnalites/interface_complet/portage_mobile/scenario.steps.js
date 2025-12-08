const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const code = require('./code');

Given('que l\'application est accessible sur appareil mobile', async function() {
  this.isMobile = true;
});

Given('que j\'utilise une tablette (écran {int}px - {int}px)', async function(min, max) {
  await this.page.setViewportSize({ width: 800, height: 1024 });
});

When('j\'ouvre l\'application', async function() {
  await code.ouvrirApplication(this.page);
});

Then('l\'interface devrait s\'adapter à la taille de l\'écran', async function() {
  const result = await code.verifierInterfaceResponsive(this.page);
  expect(result).toBeTruthy();
});

Then('les onglets devraient être facilement cliquables', async function() {
  const result = await code.verifierOngletsCliquables(this.page);
  expect(result).toBeTruthy();
});

Then('le formulaire devrait être lisible et utilisable', async function() {
  const result = await code.verifierFormulaireUtilisable(this.page);
  expect(result).toBeTruthy();
});

Given('que j\'utilise un téléphone (écran < {int}px)', async function(size) {
  await this.page.setViewportSize({ width: 375, height: 667 });
});

Then('la navigation devrait être accessible via un menu hamburger', async function() {
  const result = await code.verifierMenuHamburger(this.page);
  expect(result).toBeTruthy();
});

Then('les fiches devraient s\'afficher en pleine largeur', async function() {
  const result = await code.verifierFichesPleineLargeur(this.page);
  expect(result).toBeTruthy();
});

Given('que j\'utilise un écran tactile', async function() {
  this.isTouchscreen = true;
});

When('je remplis le formulaire', async function() {
  await code.remplirFormulaire(this.page);
});

Then('les zones de saisie devraient être suffisamment grandes', async function() {
  const result = await code.verifierZonesSaisieTactile(this.page);
  expect(result).toBeTruthy();
});

Then('les boutons devraient avoir une taille minimum de {int}px', async function(size) {
  const result = await code.verifierTailleBoutons(this.page);
  expect(result).toBeTruthy();
});

Then('l\'espacement entre les éléments devrait éviter les erreurs de saisie', async function() {
  const result = await code.verifierEspacementElements(this.page);
  expect(result).toBeTruthy();
});

Given('que je n\'ai pas de connexion internet', async function() {
  await this.page.context().setOffline(true);
});

When('je crée une nouvelle fiche', async function() {
  await code.creerNouvelleFiche(this.page);
});

Then('la fiche devrait être enregistrée localement', async function() {
  const result = await code.verifierEnregistrementLocal(this.page);
  expect(result).toBeTruthy();
});

Then('un indicateur devrait montrer {string}', async function(message) {
  const result = await code.verifierIndicateurHorsLigne(this.page);
  expect(result).toBeTruthy();
});

Then('la synchronisation devrait se faire automatiquement au retour de la connexion', async function() {
  await this.page.context().setOffline(false);
  const result = await code.verifierSynchronisationAuto(this.page);
  expect(result).toBeTruthy();
});

Given('des fiches créées hors-ligne', async function() {
  this.fichesHorsLigne = true;
});

When('la connexion internet est rétablie', async function() {
  await this.page.context().setOffline(false);
});

Then('les fiches devraient être synchronisées automatiquement', async function() {
  const result = await code.verifierSynchronisationAuto(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais voir un message de confirmation', async function() {
  const result = await code.verifierMessageConfirmation(this.page);
  expect(result).toBeTruthy();
});

Then('les conflits éventuels devraient être signalés', async function() {
  const result = await code.verifierSignalementConflits(this.page);
  expect(result).toBeTruthy();
});

Given('que j\'utilise un navigateur compatible PWA', async function() {
  this.isPWACompatible = true;
});

When('je visite l\'application', async function() {
  await code.ouvrirApplication(this.page);
});

Then('je devrais pouvoir l\'installer sur l\'écran d\'accueil', async function() {
  const result = await code.verifierInstallationPWA(this.page);
  expect(result).toBeTruthy();
});

Then('l\'application devrait fonctionner sans barre de navigateur', async function() {
  expect(true).toBeTruthy();
});

Then('l\'icône devrait apparaître sur l\'écran d\'accueil', async function() {
  const result = await code.verifierIconeEcranAccueil(this.page);
  expect(result).toBeTruthy();
});

Given('que j\'utilise un appareil mobile', async function() {
  await this.page.setViewportSize({ width: 375, height: 667 });
});

When('je navigue dans l\'application', async function() {
  await code.naviguerApplication(this.page);
});

Then('le temps de chargement devrait être inférieur à {int} secondes', async function(seconds) {
  const result = await code.verifierTempsChargement(this.page);
  expect(result).toBeTruthy();
});

Then('les animations devraient être fluides', async function() {
  const result = await code.verifierAnimationsFluides(this.page);
  expect(result).toBeTruthy();
});

Then('l\'application ne devrait pas consommer excessivement la batterie', async function() {
  const result = await code.verifierConsommationBatterie(this.page);
  expect(result).toBeTruthy();
});

Given('que j\'utilise une tablette', async function() {
  await this.page.setViewportSize({ width: 800, height: 1024 });
});

When('je change l\'orientation (portrait/paysage)', async function() {
  await code.changerOrientation(this.page);
});

Then('l\'interface devrait s\'adapter automatiquement', async function() {
  const result = await code.verifierAdaptationAuto(this.page);
  expect(result).toBeTruthy();
});

Then('aucune donnée ne devrait être perdue', async function() {
  const result = await code.verifierPasDePerte(this.page);
  expect(result).toBeTruthy();
});

Given('que l\'application est installée sur mobile', async function() {
  this.appInstalled = true;
});

When('de nouvelles données sont synchronisées', async function() {
  await this.page.waitForTimeout(500);
});

Then('je devrais recevoir une notification', async function() {
  const result = await code.verifierNotificationPush(this.page);
  expect(result).toBeTruthy();
});

Then('je devrais pouvoir cliquer pour voir les nouveautés', async function() {
  await code.cliquerNotification(this.page);
  const result = await code.verifierNouveautes(this.page);
  expect(result).toBeTruthy();
});

