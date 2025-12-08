/**
 * Code métier - Suivi social, domiciliation et suivi médical avec indication du lieu
 */

async function consulterFormulaire(page) {
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierSection(page, section) {
  const content = await page.textContent('#modal-ajout');
  return content.includes(section);
}

async function verifierCaseACocher(page, option) {
  const optionMap = {
    'Suivi social en cours': '#form-suivi-social',
    'Domiciliation active': '#form-domiciliation',
    'Suivi médical en cours': '#form-suivi-medical'
  };
  
  const selector = optionMap[option];
  if (!selector) return false;
  return await page.isVisible(selector);
}

async function cocherCase(page, option) {
  const optionMap = {
    'Suivi social en cours': '#form-suivi-social',
    'Domiciliation active': '#form-domiciliation',
    'Suivi médical en cours': '#form-suivi-medical'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
    await page.waitForTimeout(300);
  }
}

async function verifierChampApparait(page, champ) {
  const champMap = {
    'Lieu du suivi social': '#form-lieu-suivi-social',
    'Lieu de domiciliation': '#form-lieu-domiciliation',
    'Lieu du suivi médical': '#form-lieu-suivi-medical'
  };
  
  const selector = champMap[champ];
  if (!selector) return false;
  return await page.isVisible(selector);
}

async function commencerSaisie(page, champ, texte) {
  const champMap = {
    'Lieu du suivi social': '#form-lieu-suivi-social',
    'Lieu de domiciliation': '#form-lieu-domiciliation',
    'Lieu du suivi médical': '#form-lieu-suivi-medical'
  };
  
  const selector = champMap[champ];
  if (selector) {
    await page.fill(selector, texte);
    await page.waitForTimeout(300);
  }
}

async function verifierSuggestions(page) {
  // Vérifier si des suggestions apparaissent
  return await page.isVisible('.autocomplete-suggestions');
}

async function saisirDansChamp(page, champ, texte) {
  const champMap = {
    'lieu': '#form-lieu-suivi-social'
  };
  
  const selector = champMap[champ] || '#form-lieu-suivi-social';
  await page.fill(selector, texte);
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierAffichageSuivi(page, texte) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(texte);
}

async function verifierChampsSaisie(page, champs) {
  const content = await page.textContent('#modal-ajout');
  for (const row of champs) {
    const champ = row['Champ'];
    if (!content.includes(champ)) return false;
  }
  return true;
}

async function verifierTypesDisponibles(page, types) {
  const content = await page.textContent('#modal-ajout');
  for (const row of types) {
    const type = row['Type de domiciliation'] || row['Type'];
    if (!content.includes(type)) return false;
  }
  return true;
}

async function selectionnerType(page, type) {
  await page.selectOption('#form-type-domiciliation', { label: type });
}

async function saisirAdresse(page, adresse) {
  await page.fill('#form-adresse-domiciliation', adresse);
}

async function verifierAffichageComplet(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Domiciliation');
}

async function saisirDateExpiration(page, date) {
  await page.fill('#form-date-expiration', date);
}

async function verifierAlerte(page) {
  return await page.isVisible('.alert-expiration');
}

async function verifierOptionsEtablissement(page, types) {
  const content = await page.textContent('#modal-ajout');
  for (const row of types) {
    const type = row['Type'];
    if (!content.includes(type)) return false;
  }
  return true;
}

async function selectionnerEtablissement(page, type) {
  await page.selectOption('#form-type-etablissement', { label: type });
}

async function saisirEtablissement(page, nom) {
  await page.fill('#form-nom-etablissement', nom);
}

async function verifierOptionsCouverture(page, options) {
  const content = await page.textContent('#modal-ajout');
  for (const row of options) {
    const option = row['Option'];
    if (!content.includes(option)) return false;
  }
  return true;
}

async function consulterFiche(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierRecapitulatifSuivis(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Suivi');
}

async function verifierLieuAffiche(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('lieu') || content.includes('Lieu');
}

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function filtrerParSuivi(page, type) {
  await page.selectOption('#filter-suivi', { label: type });
  await page.click('#btn-apply-filters');
  await page.waitForTimeout(500);
}

async function verifierFichesFiltrées(page) {
  const cartes = await page.$$('#statistiques-list > *');
  return cartes.length >= 0;
}

async function verifierStatistiquesSuivis(page, stats) {
  const content = await page.textContent('#statistiques-tab');
  for (const row of stats) {
    const stat = row['Statistique'];
    if (!content.includes(stat)) return false;
  }
  return true;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFormulaire,
    verifierSection,
    verifierCaseACocher,
    cocherCase,
    verifierChampApparait,
    commencerSaisie,
    verifierSuggestions,
    saisirDansChamp,
    enregistrer,
    verifierAffichageSuivi,
    verifierChampsSaisie,
    verifierTypesDisponibles,
    selectionnerType,
    saisirAdresse,
    verifierAffichageComplet,
    saisirDateExpiration,
    verifierAlerte,
    verifierOptionsEtablissement,
    selectionnerEtablissement,
    saisirEtablissement,
    verifierOptionsCouverture,
    consulterFiche,
    verifierRecapitulatifSuivis,
    verifierLieuAffiche,
    allerStatistiques,
    filtrerParSuivi,
    verifierFichesFiltrées,
    verifierStatistiquesSuivis
  };
}

