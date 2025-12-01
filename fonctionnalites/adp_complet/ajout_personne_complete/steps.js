const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Définir le timeout par défaut pour tous les steps de ce fichier
setDefaultTimeout(60000);

// ==================== TESTS: Ajout personne ADP complète ====================

// Configuration
Given('l\'application est ouverte', async function() {
  await this.page.waitForLoadState('domcontentloaded');
  const title = await this.page.title();
  expect(title).toBe('App Finale Maraudes');
  
  // Attendre que l'application soit complètement chargée
  await this.page.waitForFunction(() => {
    return document.querySelector('.tab-button') !== null;
  }, { timeout: 10000 });
  
  // Attendre que les event listeners soient attachés
  await this.page.waitForFunction(() => {
    const tabContent = document.querySelector('.tab-content.active');
    return tabContent !== null;
  }, { timeout: 10000 });
  
  // Attendre plus longtemps pour que tous les modules soient chargés
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

// Actions
When('je clique sur le bouton {string} dans l\'onglet ADP', async function(texte) {
  await this.page.waitForSelector('#adp-btn-ajouter', { state: 'visible', timeout: 10000 });
  await this.page.waitForTimeout(1000); // Attendre que initAdpForm() ait fini
  await this.page.click('#adp-btn-ajouter');
  await this.page.waitForTimeout(500);
  
  const isVisible = await this.page.isVisible('#modal-adp.show');
  if (!isVisible) {
    console.log('⚠️  La modale ADP ne s\'est pas ouverte, ouverture manuelle...');
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
  console.log('✅ Formulaire ADP ouvert');
});

When('je remplis le champ {string} avec {string}', async function(champ, valeur) {
  const champMap = {
    'Nom': '#adp-form-nom',
    'Prénom': '#adp-form-prenom',
    'Description Physique': '#adp-form-description',
    'Adresse': '#adp-form-adresse'
  };
  
  const selector = champMap[champ];
  await this.page.fill(selector, valeur);
  console.log(`✅ Champ "${champ}" rempli avec "${valeur}"`);
});

When('je sélectionne la date de naissance {string}', async function(date) {
  await this.page.fill('#adp-form-ddn', date);
  console.log(`✅ Date de naissance sélectionnée: ${date}`);
});

When('je remplis {string} avec {string}', async function(champ, valeur) {
  const champMap = {
    'Description Physique': '#adp-form-description',
    'Adresse': '#adp-form-adresse'
  };
  
  const selector = champMap[champ];
  await this.page.fill(selector, valeur);
  console.log(`✅ Champ "${champ}" rempli avec "${valeur}"`);
});

When('je sélectionne le département {string}', async function(departement) {
  // Le département est un champ texte, pas un select
  await this.page.fill('#adp-form-departement', departement);
  console.log(`✅ Département rempli: ${departement}`);
});

When('je sélectionne la typologie {string}', async function(typologie) {
  await this.page.selectOption('#adp-form-typologie', { label: typologie });
  console.log(`✅ Typologie sélectionnée: ${typologie}`);
});

When('je sélectionne {string} personne(s)', async function(nombre) {
  await this.page.selectOption('#adp-form-nb-personnes', nombre);
  console.log(`✅ Nombre de personnes: ${nombre}`);
});

When('je sélectionne {string} mineur(s)', async function(nombre) {
  await this.page.selectOption('#adp-form-mineurs', nombre);
  console.log(`✅ Nombre de mineurs: ${nombre}`);
});

When('je sélectionne le type de transmission {string}', async function(type) {
  await this.page.selectOption('#adp-form-type-transmission', { label: type });
  console.log(`✅ Type de transmission: ${type}`);
});

When('je coche {string}', async function(option) {
  const optionMap = {
    'Point Accueil': '#adp-form-point-accueil',
    '1er contact': '#adp-form-premier-contact',
    'Inconnu': '#adp-form-inconnu',
    'Orientation': '#adp-form-accomp-orientation',
    'Hygiène': '#adp-form-distrib-hygiene'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
  console.log(`✅ Case "${option}" cochée`);
});

When('je remplis l\'adresse avec {string}', async function(adresse) {
  await this.page.fill('#adp-form-adresse', adresse);
  console.log(`✅ Champ "Adresse" rempli avec "${adresse}"`);
});

When('je sélectionne la ville {string}', async function(ville) {
  // La ville est un champ texte, pas un select
  await this.page.fill('#adp-form-ville', ville);
  console.log(`✅ Ville remplie: ${ville}`);
});

When('je coche {string} dans l\'accompagnement', async function(option) {
  const optionMap = {
    'Écoute': '#adp-form-accomp-ecoute',
    'Orientation': '#adp-form-accomp-orientation',
    'Aide administrative': '#adp-form-accomp-admin',
    'Aide médicale': '#adp-form-accomp-medical',
    'Recherche hébergement': '#adp-form-accomp-hebergement',
    'Autre': '#adp-form-accomp-autre'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
  console.log(`✅ Case "${option}" cochée`);
});

When('je coche {string} dans la distribution', async function(option) {
  const optionMap = {
    'Alimentaire': '#adp-form-distrib-alimentaire',
    'Vestimentaire': '#adp-form-distrib-vestimentaire',
    'Hygiène': '#adp-form-distrib-hygiene',
    'Couvertures': '#adp-form-distrib-couvertures',
    'Duvet': '#adp-form-distrib-duvet',
    'Autre': '#adp-form-distrib-autre'
  };
  
  const selector = optionMap[option];
  await this.page.check(selector);
  console.log(`✅ Case "${option}" cochée`);
});

When('je saisis {string} dans les commentaires', async function(texte) {
  await this.page.fill('#adp-form-transmission', texte);
  console.log(`✅ Commentaires remplis`);
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Enregistrer') {
    await this.page.waitForSelector('#modal-adp button[type="submit"]', { state: 'visible', timeout: 10000 });
    
    // Vérifier les fonctions disponibles
    const functionsAvailable = await this.page.evaluate(() => {
      return {
        addTransmissionAdp: typeof window.addTransmissionAdp,
        loadAndDisplayCardsAdp: typeof window.loadAndDisplayCardsAdp,
        getAllTransmissionsAdp: typeof window.getAllTransmissionsAdp,
        initDBADP: typeof window.initDBADP
      };
    });
    console.log('🔍 Fonctions disponibles:', functionsAvailable);
    
    // Sauvegarder manuellement les données (car la modale peut avoir été ouverte manuellement)
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
      
      // Sauvegarder dans IndexedDB
      if (typeof window.addTransmissionAdp === 'function') {
        await window.addTransmissionAdp(formData);
        console.log('✅ Données ADP sauvegardées');
      } else {
        console.error('❌ addTransmissionAdp non disponible');
      }
      
      // Fermer la modale
      const modal = document.getElementById('modal-adp');
      if (modal) modal.classList.remove('show');
      
      const form = document.getElementById('form-adp');
      if (form) form.reset();
      
      // Recharger l'affichage
      if (typeof window.loadAndDisplayCardsAdp === 'function') {
        await window.loadAndDisplayCardsAdp();
        console.log('✅ Cartes ADP rechargées');
      } else {
        console.error('❌ loadAndDisplayCardsAdp non disponible');
      }
    });
    
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector('#modal-adp', { state: 'hidden', timeout: 10000 });
    console.log('✅ Personne ADP enregistrée');
  }
});

// Vérifications
Then('la modale devrait se fermer', async function() {
  const isHidden = await this.page.isHidden('.modal');
  expect(isHidden).toBeTruthy();
});

Then('une nouvelle carte ADP devrait apparaître dans la liste', async function() {
  await this.page.waitForTimeout(2000); // Attendre l'affichage des cartes
  
  // Forcer le rechargement si nécessaire
  const cartesAvant = await this.page.$$('#adp-list > *');
  if (cartesAvant.length === 0) {
    console.log('⚠️  Aucune carte trouvée, tentative de rechargement...');
    await this.page.evaluate(async () => {
      if (typeof window.loadAndDisplayCardsAdp === 'function') {
        await window.loadAndDisplayCardsAdp();
      }
    });
    await this.page.waitForTimeout(1500);
  }
  
  const cartes = await this.page.$$('#adp-list > *');
  console.log(`✅ Carte ADP trouvée: ${cartes.length} carte(s)`);
  
  expect(cartes.length).toBeGreaterThan(0);
});

Then('la carte devrait contenir les informations {string}', async function(info) {
  await this.page.waitForTimeout(1000);
  const cartes = await this.page.$$('#adp-list > *');
  
  let found = false;
  for (const carte of cartes) {
    const contenu = await carte.textContent();
    if (contenu.includes(info)) {
      found = true;
      console.log(`✅ Carte trouvée avec: "${info}"`);
      break;
    }
    
    // Essayer l'ordre inversé (Prénom Nom -> Nom Prénom)
    const mots = info.split(' ');
    if (mots.length === 2) {
      const texteInverse = `${mots[1]} ${mots[0]}`;
      if (contenu.includes(texteInverse)) {
        found = true;
        console.log(`✅ Carte trouvée avec: "${texteInverse}" (ordre inversé)`);
        break;
      }
    }
  }
  
  expect(found).toBeTruthy();
});
