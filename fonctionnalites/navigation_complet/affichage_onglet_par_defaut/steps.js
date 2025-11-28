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

Given('je suis sur la page d\'accueil', async function() {
  const isVisible = await this.page.isVisible('#transmissions-tab');
  expect(isVisible).toBeTruthy();
});

Then('je devrais voir l\'onglet {string} actif', async function(onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  
  const tabId = ongletMap[onglet];
  
  // Vérifier que le bouton a la classe active
  const buttonActive = await this.page.isVisible(`button[data-tab="${tabId}"].active`);
  
  // Vérifier que le contenu a la classe active
  const contentActive = await this.page.isVisible(`#${tabId}-tab.active`);
  
  expect(buttonActive || contentActive).toBeTruthy();
  console.log(`✅ Onglet "${onglet}" est actif`);
});

Then('je devrais voir le contenu des transmissions quotidiennes', async function() {
  const isVisible = await this.page.isVisible('#transmissions-tab.active');
  expect(isVisible).toBeTruthy();
  console.log('✅ Contenu des transmissions quotidiennes visible');
});


  };
  
  const tabId = ongletMap[onglet];
  
  // Vérifier que le bouton a la classe active
  const buttonActive = await this.page.isVisible(`button[data-tab="${tabId}"].active`);
  
  // Vérifier que le contenu a la classe active
  const contentActive = await this.page.isVisible(`#${tabId}-tab.active`);
  
  expect(buttonActive || contentActive).toBeTruthy();
  console.log(`✅ Onglet "${onglet}" est actif`);
});
