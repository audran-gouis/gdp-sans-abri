/**
 * Code métier - Statistiques : Filtrage par type d'intervention
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function cocherTypeIntervention(page, type) {
  const typeMap = {
    'Maraude': '#stats-filter-maraude',
    '1er contact': '#stats-filter-premier-contact',
    'Personne présente': '#stats-filter-personne-presente',
    'PNT': '#stats-filter-pnt',
    'Veille': '#stats-filter-veille',
    'Refus de contact': '#stats-filter-refus-contact'
  };
  
  const selector = typeMap[type];
  if (selector) {
    await page.check(selector);
    console.log(`✅ Type d'intervention coché: ${type}`);
  }
}

async function appliquer(page) {
  await page.click('button:has-text("Appliquer")');
  await page.waitForTimeout(500);
  console.log('✅ Filtre appliqué');
}

async function verifierStatistiquesMaraudes(page) {
  await page.waitForSelector('#stats-content');
  const content = await page.textContent('#stats-content');
  
  const affichees = !content.includes('Sélectionnez une période');
  console.log(`✅ Statistiques maraudes ${affichees ? 'affichées' : 'non affichées'}`);
  return affichees;
}

async function obtenirContenuStatistiques(page) {
  await page.waitForSelector('#stats-content');
  return await page.textContent('#stats-content');
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cocherTypeIntervention,
    appliquer,
    verifierStatistiquesMaraudes,
    obtenirContenuStatistiques
  };
}
