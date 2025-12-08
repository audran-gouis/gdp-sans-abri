/**
 * Code métier - Gestion des champs obligatoires et option N/C
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function consulterFormulaire(page) {
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierAsterisqueRouge(page, champ) {
  const champMap = {
    'Date': '#form-date',
    'Aéroport': '#form-aeroport',
    'Type de transmission': '#form-type-transmission',
    'Nombre de personnes': '#form-nb-personnes',
    'Salarié': '#form-salarie'
  };
  
  const selector = champMap[champ];
  if (!selector) return false;
  
  // Vérifier si le label contient un astérisque
  const label = await page.$(`label[for="${selector.replace('#', '')}"]`);
  if (!label) return false;
  
  const text = await label.textContent();
  return text.includes('*');
}

async function verifierLegende(page, texte) {
  const content = await page.textContent('#modal-ajout');
  return content.includes(texte);
}

async function verifierChampsObligatoires(page, champs) {
  for (const row of champs) {
    const champ = row['Champ'];
    const hasAsterisk = await verifierAsterisqueRouge(page, champ);
    if (!hasAsterisk) return false;
  }
  return true;
}

async function cliquerMenuDeroulant(page, champ) {
  const champMap = {
    'Typologie': '#form-typologie',
    'Type de transmission': '#form-type-transmission',
    'Aéroport': '#form-aeroport'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.click(selector);
  }
}

async function verifierOptionNC(page) {
  const selecteurs = ['#form-typologie', '#form-type-transmission'];
  
  for (const selector of selecteurs) {
    const options = await page.$$eval(`${selector} option`, opts => 
      opts.map(opt => opt.textContent)
    );
    
    if (options.length > 0 && options[0].includes('N/C')) {
      return true;
    }
  }
  return false;
}

async function laisserChampVide(page, champ) {
  const champMap = {
    'Date': '#form-date',
    'Nom': '#form-nom'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.fill(selector, '');
  }
}

async function cliquerEnregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(500);
}

async function verifierMessageErreur(page) {
  // Vérifier si la modale est toujours visible (validation échouée)
  const modalVisible = await page.isVisible('#modal-ajout');
  return modalVisible;
}

async function verifierChampEnRouge(page, champ) {
  const champMap = {
    'Date': '#form-date',
    'Nom': '#form-nom'
  };
  
  const selector = champMap[champ];
  if (!selector) return false;
  
  // Vérifier si le champ a une classe d'erreur ou un style rouge
  const classes = await page.getAttribute(selector, 'class') || '';
  return classes.includes('error') || classes.includes('invalid');
}

async function selectionnerOption(page, option, champ) {
  const champMap = {
    'Typologie': '#form-typologie'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.selectOption(selector, { label: option });
  }
}

async function remplirChampsObligatoires(page) {
  await page.fill('#form-date', '2024-12-08');
  await page.selectOption('#form-type-transmission', { index: 1 });
  await page.fill('#form-nb-personnes', '1');
}

async function verifierFicheEnregistree(page) {
  // Vérifier que la modale est fermée
  const modalHidden = await page.isHidden('#modal-ajout');
  return modalHidden;
}

async function verifierMessageConfirmation(page) {
  await page.waitForTimeout(500);
  // Vérifier qu'il n'y a pas de message d'erreur
  const hasError = await page.isVisible('.error-message');
  return !hasError;
}

async function consulterFiche(page) {
  // Attendre que la fiche soit visible dans la liste
  await page.waitForTimeout(1000);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierChampAffiche(page, champ, valeur) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(valeur);
}

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFormulaire,
    verifierAsterisqueRouge,
    verifierLegende,
    verifierChampsObligatoires,
    cliquerMenuDeroulant,
    verifierOptionNC,
    laisserChampVide,
    cliquerEnregistrer,
    verifierMessageErreur,
    verifierChampEnRouge,
    selectionnerOption,
    remplirChampsObligatoires,
    verifierFicheEnregistree,
    verifierMessageConfirmation,
    consulterFiche,
    verifierChampAffiche
  };
}

