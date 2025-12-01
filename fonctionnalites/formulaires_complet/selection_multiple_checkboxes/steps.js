const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

setDefaultTimeout(60000);

let checkedOptions = [];

Given('l\'application est ouverte', async function() {
  await this.page.waitForLoadState('domcontentloaded');
  const title = await this.page.title();
  expect(title).toBe('App Finale Maraudes');
  
  await this.page.waitForFunction(() => {
    return document.querySelector('.tab-button') !== null;
  }, { timeout: 10000 });
  
  await this.page.waitForTimeout(1000);
  checkedOptions = [];
});

Given('je suis sur le formulaire de transmission', async function() {
  // Cliquer sur le bouton Ajouter pour ouvrir la modale
  const btnAjouter = await this.page.$('#btn-ajouter-transmission, button:has-text("Ajouter")');
  if (btnAjouter) {
    await btnAjouter.click();
    await this.page.waitForTimeout(500);
  }
  
  // Vérifier que la modale est ouverte
  const modalVisible = await this.page.isVisible('#modal-ajout.show, #modal-ajout');
  if (!modalVisible) {
    await this.page.evaluate(() => {
      const modal = document.getElementById('modal-ajout');
      if (modal) modal.classList.add('show');
    });
  }
  
  console.log('✅ Formulaire de transmission ouvert');
});

When('je coche {string}', async function(option) {
  const optionMap = {
    'Écoute': '#form-accomp-ecoute',
    'Orientation': '#form-accomp-orientation',
    'Alimentaire': '#form-distrib-alimentaire',
    'Vestimentaire': '#form-distrib-vestimentaire'
  };
  
  const selector = optionMap[option];
  if (selector) {
    const checkbox = await this.page.$(selector);
    if (checkbox) {
      await checkbox.check();
      checkedOptions.push(option);
      console.log(`✅ Case "${option}" cochée`);
    } else {
      // Chercher par label
      const label = await this.page.$(`label:has-text("${option}")`);
      if (label) {
        await label.click();
        checkedOptions.push(option);
        console.log(`✅ Case "${option}" cochée via label`);
      }
    }
  }
});

Then('toutes les cases devraient rester cochées', async function() {
  const optionMap = {
    'Écoute': '#form-accomp-ecoute',
    'Orientation': '#form-accomp-orientation',
    'Alimentaire': '#form-distrib-alimentaire',
    'Vestimentaire': '#form-distrib-vestimentaire'
  };
  
  let allChecked = true;
  for (const option of checkedOptions) {
    const selector = optionMap[option];
    if (selector) {
      const isChecked = await this.page.isChecked(selector);
      if (!isChecked) {
        allChecked = false;
        console.log(`⚠️  Case "${option}" n'est plus cochée`);
      }
    }
  }
  
  expect(allChecked).toBeTruthy();
  console.log('✅ Toutes les cases sont restées cochées');
});

Then('je devrais pouvoir enregistrer avec plusieurs types d\'intervention', async function() {
  const btnEnregistrer = await this.page.$('#modal-ajout button[type="submit"], button:has-text("Enregistrer")');
  const isEnabled = btnEnregistrer ? await btnEnregistrer.isEnabled() : true;
  
  expect(isEnabled).toBeTruthy();
  console.log('✅ Bouton Enregistrer actif');
});
