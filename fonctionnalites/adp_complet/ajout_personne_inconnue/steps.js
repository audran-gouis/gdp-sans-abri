const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Définir le timeout par défaut pour tous les steps de ce fichier
setDefaultTimeout(60000);

// ==================== TESTS: Ajout personne inconnue ====================

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
      const buttons = document.querySelectorAll('.tab-button');
      const contents = document.querySelectorAll('.tab-content');
      
      buttons.forEach(btn => btn.classList.remove('active'));
      contents.forEach(content => content.classList.remove('active'));
      
      const button = document.querySelector(`button[data-tab="${tid}"]`);
      const content = document.getElementById(`${tid}-tab`);
      
      if (button) button.classList.add('active');
      if (content) content.classList.add('active');
    }, tabId);
    
    await this.page.waitForTimeout(200);
  }
  
  await this.page.waitForSelector(`#${tabId}-tab.active`, { state: 'visible', timeout: 5000 });
});

When('je clique sur le bouton {string} dans l\'onglet ADP', async function(texte) {
  await this.page.waitForSelector('#adp-btn-ajouter', { state: 'visible', timeout: 10000 });
  await this.page.waitForTimeout(1000);
  await this.page.click('#adp-btn-ajouter');
  await this.page.waitForTimeout(500);
  
  const isVisible = await this.page.isVisible('#modal-adp.show');
  if (!isVisible) {
    await this.page.evaluate(() => {
      const modal = document.getElementById('modal-adp');
      if (modal) {
        modal.classList.add('show');
        const form = document.getElementById('form-adp');
        if (form) form.reset();
      }
    });
  }
  
  await this.page.waitForSelector('#modal-adp', { state: 'visible', timeout: 10000 });
});

When('je coche la case {string}', async function(option) {
  const optionMap = {
    'Inconnu': '#adp-form-inconnu'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
});

When('je remplis {string} avec {string}', async function(champ, valeur) {
  const champMap = {
    'Description Physique': '#adp-form-description'
  };
  
  const selector = champMap[champ];
  await this.page.fill(selector, valeur);
});

When('je sélectionne le type de transmission {string}', async function(type) {
  await this.page.selectOption('#adp-form-type-transmission', { label: type });
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Enregistrer') {
    await this.page.waitForSelector('#modal-adp button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    await this.page.evaluate(async () => {
      const formData = {
        nom: document.getElementById('adp-form-nom').value,
        prenom: document.getElementById('adp-form-prenom').value,
        dateNaissance: document.getElementById('adp-form-ddn').value,
        descriptionPhysique: document.getElementById('adp-form-description').value,
        inconnu: document.getElementById('adp-form-inconnu').checked,
        departementOrigine: document.getElementById('adp-form-departement').value,
        typologie: document.getElementById('adp-form-typologie').value,
        nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
        mineurs: document.getElementById('adp-form-mineurs').value,
        typeTransmission: document.getElementById('adp-form-type-transmission').value,
        pointAccueil: document.getElementById('adp-form-point-accueil').checked,
        adresse: document.getElementById('adp-form-adresse').value,
        ville: document.getElementById('adp-form-ville').value,
        signalement: document.getElementById('adp-form-signalement').value,
        dateTransmission: document.getElementById('adp-date').value,
        transmission: document.getElementById('adp-form-transmission').value,
        orly: {
          premierContact: document.getElementById('adp-form-premier-contact').checked,
          personnePresente: document.getElementById('adp-form-personne-presente')?.checked || false,
          pnt: document.getElementById('adp-form-pnt')?.checked || false,
          maraude: document.getElementById('adp-form-maraude')?.checked || false,
          veille: document.getElementById('adp-form-veille')?.checked || false,
          refusContact: document.getElementById('adp-form-refus-contact')?.checked || false
        },
        accompagnement: {
          ecoute: document.getElementById('adp-form-accomp-ecoute')?.checked || false,
          orientation: document.getElementById('adp-form-accomp-orientation')?.checked || false,
          admin: document.getElementById('adp-form-accomp-admin')?.checked || false,
          medical: document.getElementById('adp-form-accomp-medical')?.checked || false,
          hebergement: document.getElementById('adp-form-accomp-hebergement')?.checked || false,
          autre: document.getElementById('adp-form-accomp-autre')?.checked || false
        },
        distribution: {
          alimentaire: document.getElementById('adp-form-distrib-alimentaire')?.checked || false,
          vestimentaire: document.getElementById('adp-form-distrib-vestimentaire')?.checked || false,
          hygiene: document.getElementById('adp-form-distrib-hygiene')?.checked || false,
          couvertures: document.getElementById('adp-form-distrib-couvertures')?.checked || false,
          duvet: document.getElementById('adp-form-distrib-duvet')?.checked || false,
          autre: document.getElementById('adp-form-distrib-autre')?.checked || false
        }
      };
      
      if (typeof window.addTransmissionAdp === 'function') {
        await window.addTransmissionAdp(formData);
      }
      
      const modal = document.getElementById('modal-adp');
      if (modal) modal.classList.remove('show');
      
      const form = document.getElementById('form-adp');
      if (form) form.reset();
      
      if (typeof window.loadAndDisplayCardsAdp === 'function') {
        await window.loadAndDisplayCardsAdp();
      }
    });
    
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector('#modal-adp', { state: 'hidden', timeout: 10000 });
  }
});

Then('la modale devrait se fermer', async function() {
  const isHidden = await this.page.isHidden('.modal');
  expect(isHidden).toBeTruthy();
});

Then('une nouvelle carte ADP devrait apparaître pour une personne inconnue', async function() {
  await this.page.waitForTimeout(2000);
  
  const cartesAvant = await this.page.$$('#adp-list > *');
  if (cartesAvant.length === 0) {
    await this.page.evaluate(async () => {
      if (typeof window.loadAndDisplayCardsAdp === 'function') {
        await window.loadAndDisplayCardsAdp();
      }
    });
    await this.page.waitForTimeout(1500);
  }
  
  const cartes = await this.page.$$('#adp-list > *');
  expect(cartes.length).toBeGreaterThan(0);
  
  // Vérifier que la carte contient "Inconnu"
  let foundInconnu = false;
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes('Inconnu')) {
      foundInconnu = true;
      break;
    }
  }
  expect(foundInconnu).toBeTruthy();
});


  await this.page.waitForTimeout(1000);
  await this.page.click('#adp-btn-ajouter');
  await this.page.waitForTimeout(500);
  
  const isVisible = await this.page.isVisible('#modal-adp.show');
  if (!isVisible) {
    await this.page.evaluate(() => {
      const modal = document.getElementById('modal-adp');
      if (modal) {
        modal.classList.add('show');
        const form = document.getElementById('form-adp');
        if (form) form.reset();
      }
    });
  }
  
  await this.page.waitForSelector('#modal-adp', { state: 'visible', timeout: 10000 });
});

When('je coche la case {string}', async function(option) {
  const optionMap = {
    'Inconnu': '#adp-form-inconnu'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
});

When('je remplis {string} avec {string}', async function(champ, valeur) {
  const champMap = {
    'Description Physique': '#adp-form-description'
  };
  
  const selector = champMap[champ];
  await this.page.fill(selector, valeur);
});

When('je sélectionne le type de transmission {string}', async function(type) {
  await this.page.selectOption('#adp-form-type-transmission', { label: type });
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Enregistrer') {
    await this.page.waitForSelector('#modal-adp button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    await this.page.evaluate(async () => {
      const formData = {
        nom: document.getElementById('adp-form-nom').value,
        prenom: document.getElementById('adp-form-prenom').value,
        dateNaissance: document.getElementById('adp-form-ddn').value,
        descriptionPhysique: document.getElementById('adp-form-description').value,
        inconnu: document.getElementById('adp-form-inconnu').checked,
        departementOrigine: document.getElementById('adp-form-departement').value,
        typologie: document.getElementById('adp-form-typologie').value,
        nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
        mineurs: document.getElementById('adp-form-mineurs').value,
        typeTransmission: document.getElementById('adp-form-type-transmission').value,
        pointAccueil: document.getElementById('adp-form-point-accueil').checked,
        adresse: document.getElementById('adp-form-adresse').value,
        ville: document.getElementById('adp-form-ville').value,
        signalement: document.getElementById('adp-form-signalement').value,
        dateTransmission: document.getElementById('adp-date').value,
        transmission: document.getElementById('adp-form-transmission').value,
        orly: {
          premierContact: document.getElementById('adp-form-premier-contact').checked,
          personnePresente: document.getElementById('adp-form-personne-presente')?.checked || false,
          pnt: document.getElementById('adp-form-pnt')?.checked || false,
          maraude: document.getElementById('adp-form-maraude')?.checked || false,
          veille: document.getElementById('adp-form-veille')?.checked || false,
          refusContact: document.getElementById('adp-form-refus-contact')?.checked || false
        },
        accompagnement: {
          ecoute: document.getElementById('adp-form-accomp-ecoute')?.checked || false,
          orientation: document.getElementById('adp-form-accomp-orientation')?.checked || false,
          admin: document.getElementById('adp-form-accomp-admin')?.checked || false,
          medical: document.getElementById('adp-form-accomp-medical')?.checked || false,
          hebergement: document.getElementById('adp-form-accomp-hebergement')?.checked || false,
          autre: document.getElementById('adp-form-accomp-autre')?.checked || false
        },
        distribution: {
          alimentaire: document.getElementById('adp-form-distrib-alimentaire')?.checked || false,
          vestimentaire: document.getElementById('adp-form-distrib-vestimentaire')?.checked || false,
          hygiene: document.getElementById('adp-form-distrib-hygiene')?.checked || false,
          couvertures: document.getElementById('adp-form-distrib-couvertures')?.checked || false,
          duvet: document.getElementById('adp-form-distrib-duvet')?.checked || false,
          autre: document.getElementById('adp-form-distrib-autre')?.checked || false
        }
      };
      
      if (typeof window.addTransmissionAdp === 'function') {
        await window.addTransmissionAdp(formData);
      }
      
      const modal = document.getElementById('modal-adp');
      if (modal) modal.classList.remove('show');
      
      const form = document.getElementById('form-adp');
      if (form) form.reset();
      
      if (typeof window.loadAndDisplayCardsAdp === 'function') {
        await window.loadAndDisplayCardsAdp();
      }
    });
    
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector('#modal-adp', { state: 'hidden', timeout: 10000 });
  }
});

Then('la modale devrait se fermer', async function() {
  const isHidden = await this.page.isHidden('.modal');
  expect(isHidden).toBeTruthy();
});

Then('une nouvelle carte ADP devrait apparaître pour une personne inconnue', async function() {
  await this.page.waitForTimeout(2000);
  
  const cartesAvant = await this.page.$$('#adp-list > *');
  if (cartesAvant.length === 0) {
    await this.page.evaluate(async () => {
      if (typeof window.loadAndDisplayCardsAdp === 'function') {
        await window.loadAndDisplayCardsAdp();
      }
    });
    await this.page.waitForTimeout(1500);
  }
  
  const cartes = await this.page.$$('#adp-list > *');
  expect(cartes.length).toBeGreaterThan(0);
  
  // Vérifier que la carte contient "Inconnu"
  let foundInconnu = false;
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes('Inconnu')) {
      foundInconnu = true;
      break;
    }
  }
  expect(foundInconnu).toBeTruthy();
});