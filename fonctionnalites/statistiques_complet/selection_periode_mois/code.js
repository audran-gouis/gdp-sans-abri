/**
 * Code métier - Statistiques : Sélection période mois
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS TESTS (PLAYWRIGHT) ====================

async function selectionnerTypePeriode(page, typePeriode) {
  const typeMap = {
    'Jour précis': 'day',
    'Mois': 'month',
    'Année': 'year',
    'Plage de dates': 'range'
  };
  
  const value = typeMap[typePeriode];
  await page.selectOption('#stats-period-type', value);
  await page.waitForTimeout(300);
  console.log(`✅ Type de période sélectionné: ${typePeriode}`);
}

async function selectionnerMois(page, mois) {
  await page.fill('#stats-month', mois);
  console.log(`✅ Mois sélectionné: ${mois}`);
}

async function appliquer(page) {
  await page.click('button:has-text("Appliquer")');
  await page.waitForTimeout(500);
  console.log('✅ Filtre appliqué');
}

async function verifierStatistiquesAffichees(page) {
  await page.waitForSelector('#stats-content');
  const content = await page.textContent('#stats-content');
  
  const affichees = !content.includes('Sélectionnez une période');
  console.log(`✅ Statistiques ${affichees ? 'affichées' : 'non affichées'}`);
  return affichees;
}

async function verifierStatistiquesPourMois(page) {
  return await verifierStatistiquesAffichees(page);
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selectionnerTypePeriode,
    selectionnerMois,
    appliquer,
    verifierStatistiquesAffichees,
    verifierStatistiquesPourMois
  };
}
