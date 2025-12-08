/**
 * Code métier - Renommer "carte" en "fiche" dans toute l'application
 */

async function allerOnglet(page, onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp',
    'Statistiques': 'statistiques'
  };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab`, { state: 'visible' });
}

async function verifierTermeFiche(page) {
  const content = await page.textContent('body');
  return content.includes('fiche') || content.includes('Fiche');
}

async function verifierAbsenceCarte(page) {
  const content = await page.textContent('body');
  // Vérifier qu'il n'y a pas de "carte" (sauf dans contexte technique)
  return !content.toLowerCase().includes('nouvelle carte');
}

async function verifierBoutonNouvelleFiche(page) {
  return await page.isVisible('button:has-text("Nouvelle fiche")');
}

async function verifierMessageAucuneFiche(page) {
  const content = await page.textContent('body');
  return content.includes('Aucune fiche');
}

async function verifierResultatsXFiches(page) {
  const content = await page.textContent('#statistiques-tab');
  return content.includes('fiches') && !content.includes('cartes');
}

async function creerNouvelleFiche(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
  await page.fill('#form-date', '2024-12-08');
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForTimeout(500);
}

async function verifierMessageConfirmation(page) {
  const content = await page.textContent('body');
  return content.includes('Fiche enregistrée');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    allerOnglet,
    verifierTermeFiche,
    verifierAbsenceCarte,
    verifierBoutonNouvelleFiche,
    verifierMessageAucuneFiche,
    verifierResultatsXFiches,
    creerNouvelleFiche,
    enregistrer,
    verifierMessageConfirmation
  };
}

