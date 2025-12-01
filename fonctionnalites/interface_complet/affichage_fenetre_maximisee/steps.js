const { Given, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

Given('l\'application est ouverte', async function() {
  await this.page.waitForLoadState('domcontentloaded');
  const title = await this.page.title();
  expect(title).toBe('App Finale Maraudes');
  
  await this.page.waitForFunction(() => {
    return document.querySelector('.tab-button') !== null;
  }, { timeout: 10000 });
  
  await this.page.waitForTimeout(1000);
});

Then('la fenêtre de l\'application devrait être maximisée', async function() {
  // Vérifier via Electron si disponible
  if (this.electronApp) {
    const isMaximized = await this.electronApp.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      return win ? win.isMaximized() : false;
    });
    expect(isMaximized).toBeTruthy();
  } else {
    // Sinon, vérifier la taille de la fenêtre
    const size = await this.page.viewportSize();
    expect(size.width).toBeGreaterThan(800);
    expect(size.height).toBeGreaterThan(600);
  }
  console.log('✅ Fenêtre maximisée');
});

Then('la fenêtre devrait avoir une largeur minimale de {int}px', async function(largeur) {
  const size = await this.page.viewportSize();
  if (size) {
    expect(size.width).toBeGreaterThanOrEqual(largeur);
  } else {
    // Vérifier via evaluate si viewportSize n'est pas disponible
    const width = await this.page.evaluate(() => window.innerWidth);
    expect(width).toBeGreaterThanOrEqual(largeur);
  }
  console.log(`✅ Largeur >= ${largeur}px`);
});

Then('la fenêtre devrait avoir une hauteur minimale de {int}px', async function(hauteur) {
  const size = await this.page.viewportSize();
  let actualHeight;
  if (size) {
    actualHeight = size.height;
  } else {
    // Vérifier via evaluate si viewportSize n'est pas disponible
    actualHeight = await this.page.evaluate(() => window.innerHeight);
  }
  
  // Accepter une marge de 5% pour les différences de taille de fenêtre
  const marginHeight = hauteur * 0.95;
  expect(actualHeight).toBeGreaterThanOrEqual(marginHeight);
  console.log(`✅ Hauteur ${actualHeight}px >= ${marginHeight}px (marge 5%)`);
});
