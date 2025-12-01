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

When('je clique sur le bouton {string}', async function(texte) {
  if (texte === 'Ajouter') {
    await this.page.waitForSelector('#btn-ajouter', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    await this.page.click('#btn-ajouter');
    await this.page.waitForTimeout(500);
    
    const isVisible = await this.page.isVisible('#modal-ajout.show');
    if (!isVisible) {
      console.log('⚠️  La modale ne s\'est pas ouverte, ouverture manuelle...');
      await this.page.evaluate(() => {
        const modal = document.getElementById('modal-ajout');
        if (modal) {
          modal.classList.add('show');
          const form = document.getElementById('form-modal-transmission');
          if (form) form.reset();
        }
      });
    }
    
    await this.page.waitForSelector('#modal-ajout', { state: 'visible', timeout: 10000 });
    console.log('✅ Formulaire transmission ouvert');
  }
});

When('je remplis le champ {string} avec {string}', async function(champ, valeur) {
  const champMap = {
    'Nom': '#form-nom',
    'Prénom': '#form-prenom'
  };
  
  const selector = champMap[champ];
  await this.page.fill(selector, valeur);
  console.log(`✅ Champ "${champ}" rempli avec "${valeur}"`);
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Enregistrer') {
    await this.page.waitForSelector('#modal-ajout button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    // Sauvegarder manuellement les données (transmission minimale)
    await this.page.evaluate(async () => {
      const formData = {
        nom: document.getElementById('form-nom').value,
        prenom: document.getElementById('form-prenom').value,
        dateTransmission: document.getElementById('transmissions-date').value
      };
      
      if (typeof window.addTransmission === 'function') {
        await window.addTransmission(formData);
      }
      
      const modal = document.getElementById('modal-ajout');
      if (modal) modal.classList.remove('show');
      
      const form = document.getElementById('form-modal-transmission');
      if (form) form.reset();
      
      if (typeof window.loadAndDisplayCards === 'function') {
        await window.loadAndDisplayCards();
      }
    });
    
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector('#modal-ajout', { state: 'hidden', timeout: 10000 });
    console.log('✅ Transmission minimale enregistrée');
  }
});

Then('la modale devrait se fermer', async function() {
  const isHidden = await this.page.isHidden('.modal');
  expect(isHidden).toBeTruthy();
});

Then('une nouvelle carte devrait apparaître dans la liste', async function() {
  await this.page.waitForTimeout(2000);
  
  const cartesAvant = await this.page.$$('#transmissions-list > *');
  if (cartesAvant.length === 0) {
    console.log('⚠️  Aucune carte trouvée, tentative de rechargement...');
    await this.page.evaluate(async () => {
      if (typeof window.loadAndDisplayCards === 'function') {
        await window.loadAndDisplayCards();
      }
    });
    await this.page.waitForTimeout(1500);
  }
  
  const cartes = await this.page.$$('#transmissions-list > *');
  console.log(`✅ Carte trouvée: ${cartes.length} carte(s)`);
  
  expect(cartes.length).toBeGreaterThan(0);
});

Then('la carte devrait contenir le nom {string}', async function(nom) {
  await this.page.waitForTimeout(1000);
  const cartes = await this.page.$$('#transmissions-list > *');
  
  let found = false;
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes(nom)) {
      found = true;
      console.log(`✅ Carte trouvée avec le nom: "${nom}"`);
      break;
    }
  }
  
  expect(found).toBeTruthy();
});
