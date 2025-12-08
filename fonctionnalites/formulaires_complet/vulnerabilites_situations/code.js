/**
 * Code métier - Ajout des vulnérabilités et situations spécifiques
 */

async function consulterFormulaire(page) {
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierSection(page, section) {
  const content = await page.textContent('#modal-ajout');
  return content.includes(section);
}

async function verifierOptionsPsy(page, options) {
  const content = await page.textContent('#modal-ajout');
  for (const row of options) {
    const option = row['Option'];
    if (!content.includes(option)) return false;
  }
  return true;
}

async function verifierOptionsSociales(page, options) {
  const content = await page.textContent('#modal-ajout');
  for (const row of options) {
    const option = row['Option'];
    if (!content.includes(option)) return false;
  }
  return true;
}

async function verifierOptionsMedicales(page, options) {
  const content = await page.textContent('#modal-ajout');
  for (const row of options) {
    const option = row['Option'];
    if (!content.includes(option)) return false;
  }
  return true;
}

async function verifierCaseSansPapiers(page) {
  return await page.isVisible('#form-sans-papiers');
}

async function cocherCase(page, option) {
  const optionMap = {
    'Troubles psychiatriques': '#form-vuln-psy-troubles',
    'Sans domicile fixe': '#form-sit-sdf',
    'Sans papiers': '#form-sans-papiers',
    'Addiction': '#form-vuln-psy-addiction',
    'Maladie chronique': '#form-sit-med-maladie'
  };
  
  const selector = optionMap[option];
  if (selector) {
    await page.check(selector);
  }
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierInformationsEnregistrees(page) {
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierVisiblesSurFiche(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Vulnérabilité') || content.includes('Situation');
}

async function consulterFiche(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierBadgesColores(page) {
  const badges = await page.$$('.badge');
  return badges.length > 0;
}

async function verifierIdentificationCritique(page) {
  return await page.isVisible('.critique, .alert-danger');
}

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function filtrerParVulnerabilite(page, type) {
  await page.selectOption('#filter-vulnerabilite', { label: type });
  await page.click('#btn-apply-filters');
  await page.waitForTimeout(500);
}

async function verifierStatistiques(page) {
  const content = await page.textContent('#statistiques-tab');
  return content.includes('statistiques') || content.includes('Statistiques');
}

async function verifierChampCommentaire(page) {
  return await page.isVisible('#form-commentaire-vulnerabilite');
}

async function ajouterCommentaire(page, commentaire) {
  await page.fill('#form-commentaire-vulnerabilite', commentaire);
}

async function verifierCommentaireEnregistre(page) {
  const content = await page.textContent('#transmissions-list');
  return content.length > 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFormulaire,
    verifierSection,
    verifierOptionsPsy,
    verifierOptionsSociales,
    verifierOptionsMedicales,
    verifierCaseSansPapiers,
    cocherCase,
    enregistrer,
    verifierInformationsEnregistrees,
    verifierVisiblesSurFiche,
    consulterFiche,
    verifierBadgesColores,
    verifierIdentificationCritique,
    allerStatistiques,
    filtrerParVulnerabilite,
    verifierStatistiques,
    verifierChampCommentaire,
    ajouterCommentaire,
    verifierCommentaireEnregistre
  };
}

