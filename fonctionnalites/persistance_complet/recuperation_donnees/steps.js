const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

Given('j\'ai ajouté des transmissions précédemment', async function() {
  await this.page.waitForLoadState('domcontentloaded');
  
  // Ajouter des transmissions de test
  await this.page.evaluate(async () => {
    if (typeof window.initDB === 'function') {
      await window.initDB();
    }
    
    if (typeof window.addTransmission === 'function') {
      const today = new Date().toISOString().split('T')[0];
      await window.addTransmission({ nom: 'Test1', prenom: 'User1', dateTransmission: today });
      await window.addTransmission({ nom: 'Test2', prenom: 'User2', dateTransmission: today });
      await window.addTransmission({ nom: 'Test3', prenom: 'User3', dateTransmission: today });
    }
  });
  
  console.log('✅ Transmissions de test ajoutées');
});

When('je ferme et rouvre l\'application', async function() {
  await this.page.reload();
  await this.page.waitForLoadState('domcontentloaded');
  
  await this.page.waitForFunction(() => {
    return document.querySelector('.tab-button') !== null;
  }, { timeout: 10000 });
  
  await this.page.waitForTimeout(1000);
  console.log('✅ Application rechargée');
});

Then('toutes mes transmissions devraient être affichées', async function() {
  await this.page.waitForTimeout(2000);
  
  // Recharger les cartes
  await this.page.evaluate(async () => {
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  });
  
  await this.page.waitForTimeout(1000);
  
  const count = await this.page.evaluate(async () => {
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      return transmissions.length;
    }
    return 0;
  });
  
  expect(count).toBeGreaterThanOrEqual(3);
  console.log(`✅ ${count} transmissions affichées`);
});

Then('les données devraient être identiques à celles enregistrées', async function() {
  const hasTestData = await this.page.evaluate(async () => {
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      const hasTest1 = transmissions.some(t => t.nom === 'Test1');
      const hasTest2 = transmissions.some(t => t.nom === 'Test2');
      const hasTest3 = transmissions.some(t => t.nom === 'Test3');
      return hasTest1 && hasTest2 && hasTest3;
    }
    return false;
  });
  
  expect(hasTestData).toBeTruthy();
  console.log('✅ Données identiques vérifiées');
});


  }, { timeout: 10000 });
  
  await this.page.waitForTimeout(1000);
  console.log('✅ Application rechargée');
});

Then('toutes mes transmissions devraient être affichées', async function() {
  await this.page.waitForTimeout(2000);
  
  // Recharger les cartes
  await this.page.evaluate(async () => {
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  });
  
  await this.page.waitForTimeout(1000);
  
  const count = await this.page.evaluate(async () => {
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      return transmissions.length;
    }
    return 0;
  });
  
  expect(count).toBeGreaterThanOrEqual(3);
  console.log(`✅ ${count} transmissions affichées`);
});

Then('les données devraient être identiques à celles enregistrées', async function() {
  const hasTestData = await this.page.evaluate(async () => {
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      const hasTest1 = transmissions.some(t => t.nom === 'Test1');
      const hasTest2 = transmissions.some(t => t.nom === 'Test2');
      const hasTest3 = transmissions.some(t => t.nom === 'Test3');
      return hasTest1 && hasTest2 && hasTest3;
    }
    return false;
  });
  
  expect(hasTestData).toBeTruthy();
  console.log('✅ Données identiques vérifiées');
});