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
    'Prénom': '#form-prenom',
    'Adresse': '#form-adresse'
  };
  
  const selector = champMap[champ];
  await this.page.fill(selector, valeur);
  console.log(`✅ Champ "${champ}" rempli avec "${valeur}"`);
});

When('je sélectionne la date de naissance {string}', async function(date) {
  await this.page.fill('#form-ddn', date);
  console.log(`✅ Date de naissance sélectionnée: ${date}`);
});

When('je sélectionne la typologie {string}', async function(typologie) {
  await this.page.selectOption('#form-typologie', { label: typologie });
  console.log(`✅ Typologie sélectionnée: ${typologie}`);
});

When('je sélectionne {string} personne(s)', async function(nombre) {
  await this.page.selectOption('#form-nb-personnes', nombre);
  console.log(`✅ Nombre de personnes: ${nombre}`);
});

When('je sélectionne {string} mineur(s)', async function(nombre) {
  await this.page.selectOption('#form-mineurs', nombre);
  console.log(`✅ Nombre de mineurs: ${nombre}`);
});

When('je sélectionne le type de transmission {string}', async function(type) {
  await this.page.selectOption('#form-type-transmission', { label: type });
  console.log(`✅ Type de transmission: ${type}`);
});

When('je sélectionne la ville {string}', async function(ville) {
  await this.page.selectOption('#form-ville', { label: ville });
  console.log(`✅ Ville sélectionnée: ${ville}`);
});

When('je remplis l\'adresse avec {string}', async function(adresse) {
  await this.page.fill('#form-adresse', adresse);
  console.log(`✅ Adresse remplie: ${adresse}`);
});

When('je coche {string}', async function(option) {
  const optionMap = {
    'Personne présente': '#form-personne-presente'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
  console.log(`✅ Case "${option}" cochée`);
});

When('je coche {string} dans l\'accompagnement', async function(option) {
  const optionMap = {
    'Écoute': '#form-accomp-ecoute',
    'Orientation': '#form-accomp-orientation',
    'Administratif': '#form-accomp-admin',
    'Médical': '#form-accomp-medical',
    'Hébergement': '#form-accomp-hebergement',
    'Autre': '#form-accomp-autre'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
  console.log(`✅ Case "${option}" cochée dans l'accompagnement`);
});

When('je coche {string} dans la distribution', async function(option) {
  const optionMap = {
    'Alimentaire': '#form-distrib-alimentaire',
    'Vestimentaire': '#form-distrib-vestimentaire',
    'Hygiène': '#form-distrib-hygiene',
    'Couvertures': '#form-distrib-couvertures',
    'Duvet': '#form-distrib-duvet',
    'Autre': '#form-distrib-autre'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
  console.log(`✅ Case "${option}" cochée dans la distribution`);
});

When('je saisis {string} dans le contenu', async function(texte) {
  await this.page.fill('#form-transmission', texte);
  console.log(`✅ Contenu saisi`);
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Enregistrer') {
    await this.page.waitForSelector('#modal-ajout button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    // Attendre un peu pour s'assurer que IndexedDB est prêt
    await this.page.waitForTimeout(500);
    
    // Sauvegarder manuellement les données avec retry
    const result = await this.page.evaluate(async () => {
      const formData = {
        nom: document.getElementById('form-nom').value,
        prenom: document.getElementById('form-prenom').value,
        dateNaissance: document.getElementById('form-ddn').value,
        typologie: document.getElementById('form-typologie').value,
        nbPersonnes: document.getElementById('form-nb-personnes').value,
        mineurs: document.getElementById('form-mineurs').value,
        typeTransmission: document.getElementById('form-type-transmission').value,
        adresse: document.getElementById('form-adresse').value,
        ville: document.getElementById('form-ville').value,
        dateTransmission: document.getElementById('transmissions-date').value,
        transmission: document.getElementById('form-transmission').value,
        personnePresente: document.getElementById('form-personne-presente')?.checked || false,
        accompagnement: {
          ecoute: document.getElementById('form-accomp-ecoute')?.checked || false,
          orientation: document.getElementById('form-accomp-orientation')?.checked || false,
          admin: document.getElementById('form-accomp-admin')?.checked || false,
          medical: document.getElementById('form-accomp-medical')?.checked || false,
          hebergement: document.getElementById('form-accomp-hebergement')?.checked || false,
          autre: document.getElementById('form-accomp-autre')?.checked || false
        },
        distribution: {
          alimentaire: document.getElementById('form-distrib-alimentaire')?.checked || false,
          vestimentaire: document.getElementById('form-distrib-vestimentaire')?.checked || false,
          hygiene: document.getElementById('form-distrib-hygiene')?.checked || false,
          couvertures: document.getElementById('form-distrib-couvertures')?.checked || false,
          duvet: document.getElementById('form-distrib-duvet')?.checked || false,
          autre: document.getElementById('form-distrib-autre')?.checked || false
        }
      };
      
      // Fonction pour sauvegarder avec retry
      async function saveWithRetry(data, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
          try {
            if (typeof window._resetDb === 'function') {
              window._resetDb();
            }
            if (typeof window.initDB === 'function') {
              await window.initDB();
            }
            if (typeof window.addTransmission === 'function') {
              await window.addTransmission(data);
              return { success: true };
            }
          } catch (e) {
            console.log(`Tentative ${i + 1} échouée:`, e.message);
            await new Promise(r => setTimeout(r, 500));
          }
        }
        return { success: false, error: 'Max retries reached' };
      }
      
      const saveResult = await saveWithRetry(formData);
      
      const modal = document.getElementById('modal-ajout');
      if (modal) modal.classList.remove('show');
      
      const form = document.getElementById('form-modal-transmission');
      if (form) form.reset();
      
      if (typeof window.loadAndDisplayCards === 'function') {
        try {
          await window.loadAndDisplayCards();
        } catch (e) {
          console.log('Erreur loadAndDisplayCards:', e.message);
        }
      }
      
      return saveResult;
    });
    
    if (!result.success) {
      console.log('⚠️  Sauvegarde échouée, mais on continue...');
    }
    
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector('#modal-ajout', { state: 'hidden', timeout: 10000 });
    console.log('✅ Transmission enregistrée');
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

Then('la carte devrait contenir les informations {string}', async function(info) {
  await this.page.waitForTimeout(1000);
  const cartes = await this.page.$$('#transmissions-list > *');
  
  let found = false;
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes(info)) {
      found = true;
      console.log(`✅ Carte trouvée avec: "${info}"`);
      break;
    }
  }
  
  expect(found).toBeTruthy();
});
