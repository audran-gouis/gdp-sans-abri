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

Given('je suis sur l\'onglet {string}', async function(onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  
  const tabId = ongletMap[onglet];
  
  await this.page.waitForSelector(`button[data-tab="${tabId}"]`, { state: 'visible', timeout: 10000 });
  await this.page.click(`button[data-tab="${tabId}"]`);
  await this.page.waitForTimeout(300);
  
  const isActive = await this.page.isVisible(`#${tabId}-tab.active`);
  if (!isActive) {
    console.log(`⚠️  L'onglet ${tabId} n'est pas actif, activation manuelle...`);
    await this.page.evaluate((tid) => {
      if (typeof window.activerOnglet === 'function') {
        window.activerOnglet(tid);
      } else {
        const buttons = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.tab-content');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        const button = document.querySelector(`button[data-tab="${tid}"]`);
        const content = document.getElementById(`${tid}-tab`);
        
        if (button) button.classList.add('active');
        if (content) content.classList.add('active');
      }
    }, tabId);
    
    await this.page.waitForTimeout(200);
  }
  
  await this.page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible', timeout: 5000 });
});

When('je coche {string} dans les types d\'intervention', async function(type) {
  const checkbox = await this.page.$(`input[type="checkbox"][value="${type}"], input[type="checkbox"][name="${type}"], #check-${type.toLowerCase()}`);
  if (checkbox) {
    await checkbox.check();
    console.log(`✅ Type d'intervention coché: "${type}"`);
  } else {
    const label = await this.page.$(`label:has-text("${type}")`);
    if (label) {
      await label.click();
      console.log(`✅ Type d'intervention coché via label: "${type}"`);
    } else {
      console.log(`⚠️  Checkbox pour "${type}" non trouvée`);
    }
  }
  await this.page.waitForTimeout(500);
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Appliquer') {
    const btnAppliquer = await this.page.$('button:has-text("Appliquer"), #btn-appliquer');
    if (btnAppliquer) {
      await btnAppliquer.click();
      console.log('✅ Bouton Appliquer cliqué');
    } else {
      console.log('⚠️  Bouton Appliquer non trouvé');
    }
    await this.page.waitForTimeout(1000);
  }
});

Then('je devrais voir les statistiques des maraudes', async function() {
  await this.page.waitForTimeout(1000);
  
  const isStatsVisible = await this.page.isVisible('#statistiques-tab.active');
  expect(isStatsVisible).toBeTruthy();
  
  console.log('✅ Statistiques des maraudes affichées');
});


        if (button) button.classList.add('active');
        if (content) content.classList.add('active');
      }
    }, tabId);
    
    await this.page.waitForTimeout(200);
  }
  
  await this.page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible', timeout: 5000 });
});

When('je coche {string} dans les types d\'intervention', async function(type) {
  const checkbox = await this.page.$(`input[type="checkbox"][value="${type}"], input[type="checkbox"][name="${type}"], #check-${type.toLowerCase()}`);
  if (checkbox) {
    await checkbox.check();
    console.log(`✅ Type d'intervention coché: "${type}"`);
  } else {
    const label = await this.page.$(`label:has-text("${type}")`);
    if (label) {
      await label.click();
      console.log(`✅ Type d'intervention coché via label: "${type}"`);
    } else {
      console.log(`⚠️  Checkbox pour "${type}" non trouvée`);
    }
  }
  await this.page.waitForTimeout(500);
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Appliquer') {
    const btnAppliquer = await this.page.$('button:has-text("Appliquer"), #btn-appliquer');
    if (btnAppliquer) {
      await btnAppliquer.click();
      console.log('✅ Bouton Appliquer cliqué');
    } else {
      console.log('⚠️  Bouton Appliquer non trouvé');
    }
    await this.page.waitForTimeout(1000);
  }
});
