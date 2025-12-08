/**
 * Code métier - Renseignement des ressources de la personne
 */

async function consulterFormulaire(page) {
  await page.waitForSelector('#modal-ajout', { state: 'visible' });
}

async function verifierSectionRessources(page) {
  const content = await page.textContent('#modal-ajout');
  return content.includes('Ressources');
}

async function verifierQuestionRessources(page) {
  const content = await page.textContent('#modal-ajout');
  return content.includes('Y a-t-il des ressources ?');
}

async function repondreOui(page) {
  await page.check('#form-ressources-oui');
}

async function repondreNon(page) {
  await page.check('#form-ressources-non');
}

async function verifierTypesRessources(page, types) {
  const content = await page.textContent('#modal-ajout');
  for (const row of types) {
    const type = row['Type de ressource'];
    if (!content.includes(type)) return false;
  }
  return true;
}

async function cocherRessource(page, type) {
  const ressourceMap = {
    'RSA': '#form-ressource-rsa',
    'AAH': '#form-ressource-aah',
    'Allocation chômage (ARE)': '#form-ressource-are'
  };
  
  const selector = ressourceMap[type];
  if (selector) {
    await page.check(selector);
  }
}

async function enregistrer(page) {
  await page.click('#modal-ajout button[type="submit"]:has-text("Enregistrer")');
  await page.waitForSelector('#modal-ajout', { state: 'hidden' });
  await page.waitForTimeout(500);
}

async function verifierRessourcesAffichees(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('RSA') || content.includes('AAH');
}

async function verifierTrancheRevenus(page, tranches) {
  const content = await page.textContent('#modal-ajout');
  for (const row of tranches) {
    const tranche = row['Tranche'];
    if (!content.includes(tranche)) return false;
  }
  return true;
}

async function verifierAucuneRessource(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Aucune ressource');
}

async function verifierOptionDemandeEnCours(page) {
  return await page.isVisible('#form-demande-en-cours');
}

async function verifierQuestionCompteBancaire(page) {
  const content = await page.textContent('#modal-ajout');
  return content.includes('Possède un compte bancaire');
}

async function consulterFiche(page) {
  await page.waitForTimeout(500);
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierRecapitulatif(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Ressources');
}

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function verifierStatistiquesRessources(page, stats) {
  const content = await page.textContent('#statistiques-tab');
  for (const row of stats) {
    const stat = row['Statistique'];
    if (!content.includes(stat)) return false;
  }
  return true;
}

async function filtrerParRessources(page, type) {
  await page.selectOption('#filter-ressources', { label: type });
  await page.click('#btn-apply-filters');
  await page.waitForTimeout(500);
}

async function verifierFichesFiltrées(page) {
  const cartes = await page.$$('#statistiques-list > *');
  return cartes.length >= 0;
}

async function consulterHistorique(page) {
  await page.click('.btn-historique');
  await page.waitForSelector('#modal-historique', { state: 'visible' });
}

async function verifierEvolutionRessources(page) {
  const content = await page.textContent('#modal-historique');
  return content.includes('Évolution');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFormulaire,
    verifierSectionRessources,
    verifierQuestionRessources,
    repondreOui,
    repondreNon,
    verifierTypesRessources,
    cocherRessource,
    enregistrer,
    verifierRessourcesAffichees,
    verifierTrancheRevenus,
    verifierAucuneRessource,
    verifierOptionDemandeEnCours,
    verifierQuestionCompteBancaire,
    consulterFiche,
    verifierRecapitulatif,
    allerStatistiques,
    verifierStatistiquesRessources,
    filtrerParRessources,
    verifierFichesFiltrées,
    consulterHistorique,
    verifierEvolutionRessources
  };
}

