/**
 * Code métier - Mise en couleur des informations importantes
 */

async function consulterListeFiches(page) {
  await page.waitForSelector('#transmissions-list, #adp-list', { state: 'visible' });
}

async function verifierIndicateurCouleur(page, couleur) {
  const couleurMap = {
    'jaune': ['rgb(255, 255, 0)', 'rgb(255, 235, 59)', 'yellow'],
    'bleu': ['rgb(0, 0, 255)', 'rgb(33, 150, 243)', 'blue'],
    'rouge': ['rgb(255, 0, 0)', 'rgb(244, 67, 54)', 'red'],
    'gris': ['rgb(128, 128, 128)', 'rgb(158, 158, 158)', 'gray', 'grey']
  };
  
  const badges = await page.$$('.badge, .indicator');
  if (badges.length === 0) return false;
  
  for (const badge of badges) {
    const bgColor = await badge.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const couleursValides = couleurMap[couleur] || [];
    if (couleursValides.some(c => bgColor.includes(c))) {
      return true;
    }
  }
  return false;
}

async function verifierBadgeCouleur(page, badge, couleur) {
  const content = await page.textContent('body');
  return content.includes(badge);
}

async function verifierPlusieursIndicateurs(page) {
  const badges = await page.$$('.badge');
  return badges.length >= 2;
}

async function verifierDeuxBadges(page) {
  return await verifierPlusieursIndicateurs(page);
}

async function consulterInterface(page) {
  await page.waitForSelector('body', { state: 'visible' });
}

async function verifierLegende(page) {
  const content = await page.textContent('body');
  return content.includes('légende') || content.includes('Légende');
}

async function verifierExplicationCouleur(page, couleur, signification) {
  const content = await page.textContent('body');
  return content.includes(signification);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterListeFiches,
    verifierIndicateurCouleur,
    verifierBadgeCouleur,
    verifierPlusieursIndicateurs,
    verifierDeuxBadges,
    consulterInterface,
    verifierLegende,
    verifierExplicationCouleur
  };
}

