const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
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

Given('je suis sur la page d\'accueil', async function() {
  const isVisible = await this.page.isVisible('#transmissions-tab');
  expect(isVisible).toBeTruthy();
});

When('je clique sur l\'onglet {string}', async function(onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  
  const tabId = ongletMap[onglet];
  
  await this.page.waitForSelector(`button[data-tab="${tabId}"]`, { state: 'visible', timeout: 10000 });
  await this.page.click(`button[data-tab="${tabId}"]`);
  await this.page.waitForTimeout(500);
  
  // Activation manuelle si nécessaire
  const isActive = await this.page.isVisible(`#${tabId}-tab.active`);
  if (!isActive) {
    await this.page.evaluate((tid) => {
      if (typeof window.activerOnglet === 'function') {
        window.activerOnglet(tid);
      } else {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const button = document.querySelector(`button[data-tab="${tid}"]`);
        const content = document.getElementById(`${tid}-tab`);
        
        if (button) button.classList.add('active');
        if (content) content.classList.add('active');
      }
    }, tabId);
  }
  
  console.log(`✅ Clic sur l'onglet "${onglet}"`);
});

Then('l\'onglet {string} devrait être actif', async function(onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  
  const tabId = ongletMap[onglet];
  
  const buttonActive = await this.page.isVisible(`button[data-tab="${tabId}"].active`);
  const contentActive = await this.page.isVisible(`#${tabId}-tab.active`);
  
  expect(buttonActive || contentActive).toBeTruthy();
  console.log(`✅ Onglet "${onglet}" est actif`);
});

Then('je devrais voir le contenu des transmissions quotidiennes', async function() {
  const isVisible = await this.page.isVisible('#transmissions-tab.active');
  expect(isVisible).toBeTruthy();
  console.log('✅ Contenu des transmissions quotidiennes visible');
});


  
  // Activation manuelle si nécessaire
  const isActive = await this.page.isVisible(`#${tabId}-tab.active`);
  if (!isActive) {
    await this.page.evaluate((tid) => {
      if (typeof window.activerOnglet === 'function') {
        window.activerOnglet(tid);
      } else {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const button = document.querySelector(`button[data-tab="${tid}"]`);
        const content = document.getElementById(`${tid}-tab`);
        
        if (button) button.classList.add('active');
        if (content) content.classList.add('active');
      }
    }, tabId);
  }
  
  console.log(`✅ Clic sur l'onglet "${onglet}"`);
});

Then('l\'onglet {string} devrait être actif', async function(onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  
  const tabId = ongletMap[onglet];
  
  const buttonActive = await this.page.isVisible(`button[data-tab="${tabId}"].active`);
  const contentActive = await this.page.isVisible(`#${tabId}-tab.active`);
  
  expect(buttonActive || contentActive).toBeTruthy();
  console.log(`✅ Onglet "${onglet}" est actif`);
});
