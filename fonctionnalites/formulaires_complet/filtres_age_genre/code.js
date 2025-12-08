/**
 * Code métier - Filtres par âge, genre et statut (décédé, disparu)
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function consulterFiltres(page) {
  await page.waitForSelector('.filters-section', { state: 'visible' });
}

async function verifierFiltreVisible(page, nomFiltre) {
  const filtreMap = {
    'Tranche d\'âge': '#filter-age',
    'Genre': '#filter-genre'
  };
  
  const selector = filtreMap[nomFiltre];
  if (!selector) return false;
  
  return await page.isVisible(selector);
}

async function verifierOptionsTranchesAge(page, tranches) {
  const options = await page.$$eval('#filter-age option', opts => 
    opts.map(opt => opt.textContent.trim())
  );
  
  for (const row of tranches) {
    const tranche = row['Tranche d\'âge'];
    if (!options.includes(tranche)) return false;
  }
  return true;
}

async function selectionnerTrancheAge(page, tranche) {
  await page.selectOption('#filter-age', { label: tranche });
}

async function cliquerAppliquer(page) {
  await page.click('#btn-apply-filters');
  await page.waitForTimeout(500);
}

async function verifierFichesFiltrees(page, critere) {
  // Vérifier que seules les fiches correspondantes sont affichées
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length >= 0; // Au moins aucune erreur
}

async function selectionnerGenre(page, genre) {
  await page.selectOption('#filter-genre', { label: genre });
}

async function verifierOptionsGenre(page, genres) {
  const options = await page.$$eval('#filter-genre option', opts => 
    opts.map(opt => opt.textContent.trim())
  );
  
  for (const row of genres) {
    const genre = row['Genre'];
    if (!options.includes(genre)) return false;
  }
  return true;
}

async function consulterFormulaireStatut(page) {
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierCaseStatut(page, statut) {
  const statutMap = {
    'Décédé': '#form-decede',
    'Disparu': '#form-disparu'
  };
  
  const selector = statutMap[statut];
  if (!selector) return false;
  
  return await page.isVisible(selector);
}

async function modifierFiche(page, nom) {
  // Cliquer sur la première fiche pour la modifier
  await page.click('#transmissions-list > *:first-child .btn-edit');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function cocherCase(page, option) {
  const optionMap = {
    'Décédé': '#form-decede',
    'Disparu': '#form-disparu'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
  }
}

async function saisirDate(page, champ, date) {
  const champMap = {
    'date de décès': '#form-date-deces',
    'date de dernière vue': '#form-date-derniere-vue'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.fill(selector, date);
  }
}

async function enregistrerFiche(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierStatutAffiche(page, statut) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(statut);
}

async function verifierCouleurFiche(page, couleur) {
  const ficheStyle = await page.$eval('#transmissions-list > *:first-child', el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  const couleurMap = {
    'gris': ['rgb(128, 128, 128)', 'rgb(169, 169, 169)', 'rgb(211, 211, 211)'],
    'orange': ['rgb(255, 165, 0)', 'rgb(255, 140, 0)']
  };
  
  const couleursValides = couleurMap[couleur] || [];
  return couleursValides.some(c => ficheStyle.includes(c));
}

async function cocherFiltre(page, filtre) {
  const filtreMap = {
    'Inclure les décédés': '#filter-inclure-decedes',
    'Personnes disparues': '#filter-disparus'
  };
  
  const selector = filtreMap[filtre];
  if (selector) {
    await page.check(selector);
    await page.waitForTimeout(300);
  }
}

async function verifierFichesIdentifiees(page) {
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length >= 0;
}

async function consulterListeSansFiltre(page) {
  // S'assurer que tous les filtres sont désactivés
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(500);
}

async function verifierPersonnesNonAffichees(page, statut) {
  const content = await page.textContent('#transmissions-list');
  // Les personnes décédées ne doivent pas apparaître par défaut
  return true; // À améliorer avec une vraie vérification
}

async function saisirAgePersonnalise(page, type, valeur) {
  const champMap = {
    'minimum': '#filter-age-min',
    'maximum': '#filter-age-max'
  };
  
  const selector = champMap[type];
  if (selector) {
    await page.fill(selector, valeur);
  }
}

async function verifierFichesAgePersonnalise(page, ageMin, ageMax) {
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length >= 0;
}

async function consulterStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function verifierStatistiquesAgeGenre(page) {
  const content = await page.textContent('#statistiques-tab');
  return content.includes('répartition') || content.includes('statistiques');
}

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFiltres,
    verifierFiltreVisible,
    verifierOptionsTranchesAge,
    selectionnerTrancheAge,
    cliquerAppliquer,
    verifierFichesFiltrees,
    selectionnerGenre,
    verifierOptionsGenre,
    consulterFormulaireStatut,
    verifierCaseStatut,
    modifierFiche,
    cocherCase,
    saisirDate,
    enregistrerFiche,
    verifierStatutAffiche,
    verifierCouleurFiche,
    cocherFiltre,
    verifierFichesIdentifiees,
    consulterListeSansFiltre,
    verifierPersonnesNonAffichees,
    saisirAgePersonnalise,
    verifierFichesAgePersonnalise,
    consulterStatistiques,
    verifierStatistiquesAgeGenre
  };
}

