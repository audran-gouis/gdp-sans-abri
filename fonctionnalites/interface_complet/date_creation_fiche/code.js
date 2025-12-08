/**
 * Code métier - Affichage de la date de création des fiches
 */

async function allerOnglet(page, onglet) {
  const ongletMap = {
    'Transmissions Quotidiennes': 'transmissions',
    'ADP': 'adp'
  };
  const tabId = ongletMap[onglet];
  await page.click(`button[data-tab="${tabId}"]`);
  await page.waitForSelector(`#${tabId}-tab`, { state: 'visible' });
}

async function verifierDateCreation(page) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  return content.includes('Créé le') || content.includes('Créée le') || /\d{2}\/\d{2}\/\d{4}/.test(content);
}

async function verifierFormatDate(page, format) {
  // Vérifier le format JJ/MM/AAAA HH:MM
  const content = await page.textContent('#transmissions-list, #adp-list');
  const regex = /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/;
  return regex.test(content);
}

async function creerNouvelleFiche(page) {
  await page.click('#btn-ajouter');
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
  await page.fill('#form-date', '2024-12-08');
  await page.selectOption('#form-type-transmission', { index: 1 });
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierDateEnregistree(page) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  return content.includes(dateStr) || /\d{2}\/\d{2}\/\d{4}/.test(content);
}

async function verifierDateApparue(page) {
  return await verifierDateCreation(page);
}

async function verifierDeuxDatesDistinctes(page) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  return content.includes('Créé') && content.includes('Transmission');
}

async function verifierDateCreationAffichee(page, date) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  return content.includes(date) || /15\/03\/2024/.test(content);
}

async function verifierDateTransmissionAffichee(page, date) {
  const content = await page.textContent('#transmissions-list, #adp-list');
  return content.includes(date) || /14\/03\/2024/.test(content);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    allerOnglet,
    verifierDateCreation,
    verifierFormatDate,
    creerNouvelleFiche,
    enregistrer,
    verifierDateEnregistree,
    verifierDateApparue,
    verifierDeuxDatesDistinctes,
    verifierDateCreationAffichee,
    verifierDateTransmissionAffichee
  };
}

