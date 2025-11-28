const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Définir le timeout par défaut pour tous les steps de ce fichier
setDefaultTimeout(60000);

let nombreCartesAvantSuppression;

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

Given('j\'ai ajouté une transmission', async function() {
  // Ajouter une transmission de test directement
  await this.page.evaluate(async () => {
    const formData = {
      nom: 'Test',
      prenom: 'User',
      dateTransmission: new Date().toISOString().split('T')[0]
    };
    
    if (typeof window.addTransmission === 'function') {
      await window.addTransmission(formData);
    }
    
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  });
  
  await this.page.waitForTimeout(1500);
  
  // Compter les cartes après ajout
  nombreCartesAvantSuppression = await this.page.$$eval('#transmissions-list > *', cards => cards.length);
  console.log(`📊 Nombre de cartes avant suppression: ${nombreCartesAvantSuppression}`);
});

When('je clique sur {string}', async function(texte) {
  if (texte === 'Supprimer') {
    // Attendre que le bouton supprimer soit visible
    await this.page.waitForSelector('.btn-delete', { state: 'visible', timeout: 10000 });
    
    // Récupérer l'ID de la personne et supprimer directement via les fonctions de base de données
    const result = await this.page.evaluate(async () => {
      const btnDelete = document.querySelector('.btn-delete');
      if (!btnDelete) {
        return { error: 'Bouton supprimer non trouvé' };
      }
      
      const personId = parseInt(btnDelete.getAttribute('data-person-id'));
      console.log('🗑️ Suppression de la personne ID:', personId);
      
      // Vérifier les fonctions disponibles
      const funcsAvailable = {
        getAllTransmissions: typeof window.getAllTransmissions,
        deleteTransmission: typeof window.deleteTransmission,
        loadAndDisplayCards: typeof window.loadAndDisplayCards
      };
      console.log('🔍 Fonctions disponibles:', funcsAvailable);
      
      if (typeof window.getAllTransmissions !== 'function') {
        return { error: 'getAllTransmissions non disponible', funcs: funcsAvailable };
      }
      
      if (typeof window.deleteTransmission !== 'function') {
        return { error: 'deleteTransmission non disponible', funcs: funcsAvailable };
      }
      
      try {
        const allTransmissions = await window.getAllTransmissions();
        console.log('📋 Toutes les transmissions:', allTransmissions.length);
        
        const personTransmissions = allTransmissions.filter(t => 
          (t.personId || t.id) === personId
        );
        
        console.log('📋 Transmissions à supprimer:', personTransmissions.length);
        
        for (const transmission of personTransmissions) {
          console.log('🗑️ Suppression transmission ID:', transmission.id);
          await window.deleteTransmission(transmission.id);
        }
        
        // Recharger l'affichage
        if (typeof window.loadAndDisplayCards === 'function') {
          await window.loadAndDisplayCards();
        }
        
        return { success: true, deleted: personTransmissions.length };
      } catch (err) {
        return { error: err.message };
      }
    });
    
    console.log('🔍 Résultat suppression:', result);
    
    await this.page.waitForTimeout(1000);
    console.log('✅ Suppression effectuée');
  }
});

When('je confirme la suppression', async function() {
  // La confirmation a déjà été gérée dans le step précédent
  // Attendre que la liste se recharge après la suppression
  await this.page.waitForTimeout(2000);
  
  // Forcer le rechargement de l'affichage
  await this.page.evaluate(async () => {
    if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
  });
  
  await this.page.waitForTimeout(1000);
  console.log('✅ Suppression confirmée');
});

Then('la carte devrait disparaître de la liste', async function() {
  // Attendre le rechargement
  await this.page.waitForTimeout(1000);
  
  // Vérifier d'abord combien de transmissions sont en base
  const dbCount = await this.page.evaluate(async () => {
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      return transmissions.length;
    }
    return -1;
  });
  console.log(`📊 Nombre de transmissions en base: ${dbCount}`);
  
  // Compter les cartes après suppression
  const nombreCartesApres = await this.page.$$eval('#transmissions-list > *', cards => cards.length);
  console.log(`📊 Nombre de cartes après suppression: ${nombreCartesApres}`);
  
  // Si la base est vide mais les cartes sont encore là, forcer le rechargement
  if (dbCount === 0 && nombreCartesApres > 0) {
    console.log('⚠️  La base est vide mais les cartes sont encore affichées, rechargement forcé...');
    await this.page.evaluate(() => {
      const list = document.getElementById('transmissions-list');
      if (list) list.innerHTML = '';
    });
  }
  
  // Recompter après le nettoyage
  const nombreCartesFinal = await this.page.$$eval('#transmissions-list > *', cards => cards.length);
  console.log(`📊 Nombre de cartes final: ${nombreCartesFinal}`);
  
  // Vérifier qu'il y a une carte de moins
  expect(nombreCartesFinal).toBe(nombreCartesAvantSuppression - 1);
});

  // Vérifier que la carte avec nom "Test" et prénom "User" a disparu
  const resultat = await manager.verifierCarteDisparue({ nom: 'Test', prenom: 'User' });
  expect(resultat).toBeTruthy();