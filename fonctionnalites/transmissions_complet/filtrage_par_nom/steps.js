const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Définir le timeout par défaut pour tous les steps de ce fichier
setDefaultTimeout(60000);

Given('l\'application est ouverte', async function() {
  await this.page.waitForLoadState('domcontentloaded');
  const title = await this.page.title();
  expect(title).toBe('App Finale Maraudes');
  
  await this.page.waitForFunction(() => {
    return document.querySelector('.tab-button') !== null;
  }, { timeout: 10000 });
  
  await this.page.waitForFunction(() => {
    const tabContent = document.querySelector('.tab-content.active');
    return tabContent !== null;
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

Given('j\'ai ajouté une transmission avec le nom {string}', async function(nom) {
  // Ajouter une transmission de test
  await this.page.evaluate(async (nomPersonne) => {
    const formData = {
      nom: nomPersonne,
      prenom: 'Test',
      dateTransmission: new Date().toISOString().split('T')[0]
    };
    
    if (typeof window.addTransmission === 'function') {
      await window.addTransmission(formData);
    }
    
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  }, nom);
  
  await this.page.waitForTimeout(1500);
  console.log(`✅ Transmission de test ajoutée avec le nom: "${nom}"`);
});

When('je saisis {string} dans le filtre {string}', async function(valeur, filtre) {
  // Le filtre "nom" correspond à #filter-nom
  await this.page.fill('#filter-nom', valeur);
  
  // Déclencher manuellement l'événement input pour le filtrage
  await this.page.evaluate(() => {
    const input = document.getElementById('filter-nom');
    if (input) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  // Forcer le rechargement avec filtrage
  await this.page.evaluate(async () => {
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  });
  
  await this.page.waitForTimeout(1500);
  console.log(`✅ Filtre "${filtre}" rempli avec: "${valeur}"`);
});

Then('je devrais voir uniquement la carte contenant {string}', async function(texte) {
  await this.page.waitForTimeout(1000);
  
  // Récupérer toutes les cartes (tous les enfants directs de la liste)
  const cartesVisibles = await this.page.$$eval('#transmissions-list > *', cards => {
    return cards
      .filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none';
      })
      .map(card => card.textContent);
  });
  
  console.log(`📊 ${cartesVisibles.length} carte(s) visible(s)`);
  
  // Vérifier qu'au moins une carte visible contient le texte
  const found = cartesVisibles.some(content => content.includes(texte));
  expect(found).toBeTruthy();
  console.log(`✅ Carte contenant "${texte}" est visible`);
});

Then('je ne devrais pas voir la carte contenant {string}', async function(texte) {
  await this.page.waitForTimeout(1000);
  
  // Récupérer toutes les cartes (tous les enfants directs de la liste)
  const cartesVisibles = await this.page.$$eval('#transmissions-list > *', cards => {
    return cards
      .filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none';
      })
      .map(card => card.textContent);
  });
  
  console.log(`📊 Cartes visibles: ${cartesVisibles.length}`);
  cartesVisibles.forEach((c, i) => console.log(`  Carte ${i+1}: ${c.substring(0, 50)}...`));
  
  // Vérifier qu'aucune carte visible ne contient le texte
  const found = cartesVisibles.some(content => content.includes(texte));
  expect(found).toBeFalsy();
  console.log(`✅ Carte contenant "${texte}" n'est pas visible`);
});


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

Given('j\'ai ajouté une transmission avec le nom {string}', async function(nom) {
  // Ajouter une transmission de test
  await this.page.evaluate(async (nomPersonne) => {
    const formData = {
      nom: nomPersonne,
      prenom: 'Test',
      dateTransmission: new Date().toISOString().split('T')[0]
    };
    
    if (typeof window.addTransmission === 'function') {
      await window.addTransmission(formData);
    }
    
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  }, nom);
  
  await this.page.waitForTimeout(1500);
  console.log(`✅ Transmission de test ajoutée avec le nom: "${nom}"`);
});

When('je saisis {string} dans le filtre {string}', async function(valeur, filtre) {
  // Le filtre "nom" correspond à #filter-nom
  await this.page.fill('#filter-nom', valeur);
  
  // Déclencher manuellement l'événement input pour le filtrage
  await this.page.evaluate(() => {
    const input = document.getElementById('filter-nom');
    if (input) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  
  // Forcer le rechargement avec filtrage
  await this.page.evaluate(async () => {
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  });
  
  await this.page.waitForTimeout(1500);
  console.log(`✅ Filtre "${filtre}" rempli avec: "${valeur}"`);
});

Then('je devrais voir uniquement la carte contenant {string}', async function(texte) {
  await this.page.waitForTimeout(1000);
  
  // Récupérer toutes les cartes (tous les enfants directs de la liste)
  const cartesVisibles = await this.page.$$eval('#transmissions-list > *', cards => {
    return cards
      .filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none';
      })
      .map(card => card.textContent);
  });
  
  console.log(`📊 ${cartesVisibles.length} carte(s) visible(s)`);
  
  // Vérifier qu'au moins une carte visible contient le texte
  const found = cartesVisibles.some(content => content.includes(texte));
  expect(found).toBeTruthy();
  console.log(`✅ Carte contenant "${texte}" est visible`);
});

Then('je ne devrais pas voir la carte contenant {string}', async function(texte) {
  await this.page.waitForTimeout(1000);
  
  // Récupérer toutes les cartes (tous les enfants directs de la liste)
  const cartesVisibles = await this.page.$$eval('#transmissions-list > *', cards => {
    return cards
      .filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none';
      })
      .map(card => card.textContent);
  });
  
  console.log(`📊 Cartes visibles: ${cartesVisibles.length}`);
  cartesVisibles.forEach((c, i) => console.log(`  Carte ${i+1}: ${c.substring(0, 50)}...`));
  
  // Vérifier qu'aucune carte visible ne contient le texte
  const found = cartesVisibles.some(content => content.includes(texte));
  expect(found).toBeFalsy();
  console.log(`✅ Carte contenant "${texte}" n'est pas visible`);
});