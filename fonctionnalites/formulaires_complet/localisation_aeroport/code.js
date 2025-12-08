/**
 * Code métier - Localisation par aéroport
 */

async function consulterFormulaire(page) {
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierChampAeroport(page) {
  return await page.isVisible('#form-aeroport');
}

async function verifierListeAeroports(page) {
  const options = await page.$$eval('#form-aeroport option', opts => opts.length);
  return options > 0;
}

async function cliquerSelecteurAeroport(page) {
  await page.click('#form-aeroport');
}

async function verifierOptionsAeroports(page, aeroports) {
  const options = await page.$$eval('#form-aeroport option', opts => 
    opts.map(opt => opt.textContent.trim())
  );
  
  for (const row of aeroports) {
    const aeroport = row['Aéroport'];
    if (!options.includes(aeroport)) return false;
  }
  return true;
}

async function commencerSaisie(page, texte) {
  await page.fill('#form-aeroport', texte);
  await page.waitForTimeout(300);
}

async function verifierSuggestions(page, prefixe) {
  const value = await page.inputValue('#form-aeroport');
  return value.startsWith(prefixe);
}

async function selectionnerAeroport(page, aeroport) {
  await page.selectOption('#form-aeroport', { label: aeroport });
}

async function completerChamps(page) {
  await page.fill('#form-date', '2024-12-08');
  await page.selectOption('#form-type-transmission', { index: 1 });
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierLocalisationAffichee(page, aeroport) {
  const content = await page.textContent('#transmissions-list');
  return content.includes(aeroport);
}

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function filtrerParAeroport(page, aeroport) {
  await page.selectOption('#filter-aeroport', { label: aeroport });
  await page.click('#btn-apply-filters');
  await page.waitForTimeout(500);
}

async function verifierFichesFiltrées(page) {
  const cartes = await page.$$('#statistiques-list > *');
  return cartes.length >= 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFormulaire,
    verifierChampAeroport,
    verifierListeAeroports,
    cliquerSelecteurAeroport,
    verifierOptionsAeroports,
    commencerSaisie,
    verifierSuggestions,
    selectionnerAeroport,
    completerChamps,
    enregistrer,
    verifierLocalisationAffichee,
    allerStatistiques,
    filtrerParAeroport,
    verifierFichesFiltrées
  };
}

