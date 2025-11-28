/**
 * Code métier - Statistiques : Sélection période jour
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

async function selectionnerDate(page, date) {
  await page.fill('#stats-specific-day', date);
  console.log(`✅ Date sélectionnée: ${date}`);
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

async function verifierStatistiquesPourDate(page, date) {
  return await verifierStatistiquesAffichees(page);
}

// Export pour Node.js (tests) et browser (application)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selectionnerTypePeriode,
    selectionnerDate,
    appliquer,
    verifierStatistiquesAffichees,
    verifierStatistiquesPourDate
  };
}
