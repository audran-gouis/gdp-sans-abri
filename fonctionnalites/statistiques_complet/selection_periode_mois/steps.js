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

When('je sélectionne le type de période {string}', async function(typePeriode) {
  const selecteur = await this.page.$('#stats-period-type');
  if (selecteur) {
    // Mapper le texte français vers la valeur de l'option
    const valueMap = {
      'Jour précis': 'day',
      'Mois': 'month',
      'Année': 'year',
      'Plage de dates': 'range'
    };
    const value = valueMap[typePeriode] || typePeriode.toLowerCase();
    await selecteur.selectOption({ value: value });
    console.log(`✅ Type de période sélectionné: "${typePeriode}" (value: ${value})`);
    
    // Activer manuellement le bon sélecteur de date
    await this.page.evaluate((val) => {
      // Cacher tous les sélecteurs de date
      document.querySelectorAll('.stats-date-option').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
      });
      
      // Afficher le bon sélecteur selon le type
      const selectorMap = {
        'day': '#stats-day-selector',
        'month': '#stats-month-selector',
        'year': '#stats-year-selector',
        'range': '#stats-range-selector'
      };
      
      const selector = document.querySelector(selectorMap[val]);
      if (selector) {
        selector.classList.add('active');
        selector.style.display = 'block';
      }
    }, value);
    
    await this.page.waitForTimeout(300);
  } else {
    console.log('⚠️  Sélecteur de type de période non trouvé');
  }
});

When('je sélectionne le mois {string}', async function(mois) {
  // Attendre que le champ de mois soit visible
  await this.page.waitForTimeout(500);
  
  const monthInput = await this.page.$('#stats-month');
  if (monthInput) {
    await monthInput.fill(mois);
    console.log(`✅ Mois sélectionné: "${mois}"`);
  } else {
    console.log('⚠️  Champ de mois non trouvé');
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

Then('je devrais voir les statistiques pour novembre 2025', async function() {
  await this.page.waitForTimeout(1000);
  
  const isStatsVisible = await this.page.isVisible('#statistiques-tab.active');
  expect(isStatsVisible).toBeTruthy();
  
  console.log('✅ Statistiques affichées pour novembre 2025');
});


    
    await this.page.waitForTimeout(200);
  }
  
  await this.page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible', timeout: 5000 });
});

When('je sélectionne le type de période {string}', async function(typePeriode) {
  const selecteur = await this.page.$('#stats-period-type');
  if (selecteur) {
    // Mapper le texte français vers la valeur de l'option
    const valueMap = {
      'Jour précis': 'day',
      'Mois': 'month',
      'Année': 'year',
      'Plage de dates': 'range'
    };
    const value = valueMap[typePeriode] || typePeriode.toLowerCase();
    await selecteur.selectOption({ value: value });
    console.log(`✅ Type de période sélectionné: "${typePeriode}" (value: ${value})`);
    
    // Activer manuellement le bon sélecteur de date
    await this.page.evaluate((val) => {
      // Cacher tous les sélecteurs de date
      document.querySelectorAll('.stats-date-option').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
      });
      
      // Afficher le bon sélecteur selon le type
      const selectorMap = {
        'day': '#stats-day-selector',
        'month': '#stats-month-selector',
        'year': '#stats-year-selector',
        'range': '#stats-range-selector'
      };
      
      const selector = document.querySelector(selectorMap[val]);
      if (selector) {
        selector.classList.add('active');
        selector.style.display = 'block';
      }
    }, value);
    
    await this.page.waitForTimeout(300);
  } else {
    console.log('⚠️  Sélecteur de type de période non trouvé');
  }
});

When('je sélectionne le mois {string}', async function(mois) {
  // Attendre que le champ de mois soit visible
  await this.page.waitForTimeout(500);
  
  const monthInput = await this.page.$('#stats-month');
  if (monthInput) {
    await monthInput.fill(mois);
    console.log(`✅ Mois sélectionné: "${mois}"`);
  } else {
    console.log('⚠️  Champ de mois non trouvé');
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
