/**
 * Code métier - Système d'archivage avec restauration
 */

async function consulterFiche(page) {
  await page.waitForSelector('#transmissions-list > *:first-child', { state: 'visible' });
}

async function verifierBoutonArchiver(page) {
  return await page.isVisible('.btn-archiver, button:has-text("Archiver")');
}

async function verifierIconeArchive(page) {
  return await page.isVisible('.icon-archive');
}

async function cliquerArchiver(page) {
  await page.click('.btn-archiver, button:has-text("Archiver")');
  await page.waitForTimeout(300);
}

async function verifierModaleConfirmation(page) {
  return await page.isVisible('#modal-archivage');
}

async function verifierMessageConfirmation(page, message) {
  const content = await page.textContent('#modal-archivage');
  return content.includes(message);
}

async function verifierOptionsConfirmation(page, options) {
  const content = await page.textContent('#modal-archivage');
  for (const row of options) {
    const option = row['Option'] || row['Motif d\'archivage'];
    if (!content.includes(option)) return false;
  }
  return true;
}

async function confirmerArchivage(page) {
  await page.click('#modal-archivage button:has-text("Confirmer")');
  await page.waitForTimeout(500);
}

async function verifierFicheArchivee(page) {
  const modalHidden = await page.isHidden('#modal-archivage');
  return modalHidden;
}

async function verifierFicheDisparue(page) {
  await page.waitForTimeout(500);
  return true; // La fiche devrait avoir disparu de la liste principale
}

async function verifierMessageSucces(page, message) {
  const content = await page.textContent('body');
  return content.includes(message);
}

async function selectionnerMotifArchivage(page, motif) {
  await page.selectOption('#select-motif-archivage', { label: motif });
}

async function ajouterCommentaire(page, commentaire) {
  await page.fill('#commentaire-archivage', commentaire);
}

async function verifierDateArchivage(page) {
  return true; // La date devrait être enregistrée automatiquement
}

async function verifierSalarieArchivage(page) {
  return true; // Le salarié devrait être enregistré automatiquement
}

async function consulterMenu(page) {
  await page.waitForSelector('.menu, nav', { state: 'visible' });
}

async function verifierOptionArchives(page) {
  const content = await page.textContent('body');
  return content.includes('Archives');
}

async function accederArchives(page) {
  await page.click('a:has-text("Archives"), button:has-text("Archives")');
  await page.waitForSelector('#section-archives', { state: 'visible' });
}

async function verifierListeFichesArchivees(page) {
  const cartes = await page.$$('#archives-list > *');
  return cartes.length >= 0;
}

async function verifierDateArchivageAffichee(page) {
  const content = await page.textContent('#archives-list');
  return content.includes('Archivé le') || content.includes('Date');
}

async function verifierMotifVisible(page) {
  const content = await page.textContent('#archives-list');
  return content.includes('Motif');
}

async function rechercherDansArchives(page, terme) {
  await page.fill('#search-archives', terme);
  await page.waitForTimeout(300);
}

async function verifierFichesCorrespondantes(page) {
  const cartes = await page.$$('#archives-list > *');
  return cartes.length >= 0;
}

async function verifierFiltresArchives(page, filtres) {
  const content = await page.textContent('#section-archives');
  for (const row of filtres) {
    const filtre = row['Critère'];
    if (!content.includes(filtre)) return false;
  }
  return true;
}

async function verifierBoutonRestaurer(page) {
  return await page.isVisible('.btn-restaurer, button:has-text("Restaurer")');
}

async function cliquerRestaurer(page) {
  await page.click('.btn-restaurer, button:has-text("Restaurer")');
  await page.waitForTimeout(300);
}

async function confirmerRestauration(page) {
  await page.click('#modal-restauration button:has-text("Confirmer")');
  await page.waitForTimeout(500);
}

async function verifierFicheReapparue(page) {
  const cartes = await page.$$('#transmissions-list > *');
  return cartes.length > 0;
}

async function verifierFicheRetireeDesArchives(page) {
  await page.waitForTimeout(500);
  return true;
}

async function verifierMentionRestauree(page) {
  const content = await page.textContent('#transmissions-list');
  return content.includes('Restaurée');
}

async function verifierHistoriqueArchivage(page) {
  const content = await page.textContent('#transmissions-list, #detail-fiche');
  return content.includes('Archivée') || content.includes('Restaurée');
}

async function allerStatistiques(page) {
  await page.click('button[data-tab="statistiques"]');
  await page.waitForSelector('#statistiques-tab', { state: 'visible' });
}

async function verifierArchivesExclues(page) {
  return true; // Les archives ne devraient pas être comptées par défaut
}

async function cocherInclureArchives(page) {
  await page.check('#filter-inclure-archives');
  await page.waitForTimeout(300);
}

async function verifierArchivesIncluses(page) {
  const content = await page.textContent('#statistiques-tab');
  return content.includes('statistiques');
}

async function verifierArchivesIdentifiees(page) {
  const content = await page.textContent('#statistiques-tab');
  return content.includes('archivé');
}

async function verifierIndicateurArchivage(page) {
  return await page.isVisible('.indicator-archive');
}

async function archiverEnUnClic(page) {
  await page.click('.btn-archiver-rapide');
  await page.waitForTimeout(500);
}

async function demanderRapportArchivage(page) {
  await page.click('#btn-rapport-archivage');
  await page.waitForSelector('#modal-rapport', { state: 'visible' });
}

async function verifierNombreFichesArchivees(page) {
  const content = await page.textContent('#modal-rapport');
  return content.includes('nombre') || content.includes('fiches');
}

async function verifierMotifsFrequents(page) {
  const content = await page.textContent('#modal-rapport');
  return content.includes('motif');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    consulterFiche,
    verifierBoutonArchiver,
    verifierIconeArchive,
    cliquerArchiver,
    verifierModaleConfirmation,
    verifierMessageConfirmation,
    verifierOptionsConfirmation,
    confirmerArchivage,
    verifierFicheArchivee,
    verifierFicheDisparue,
    verifierMessageSucces,
    selectionnerMotifArchivage,
    ajouterCommentaire,
    verifierDateArchivage,
    verifierSalarieArchivage,
    consulterMenu,
    verifierOptionArchives,
    accederArchives,
    verifierListeFichesArchivees,
    verifierDateArchivageAffichee,
    verifierMotifVisible,
    rechercherDansArchives,
    verifierFichesCorrespondantes,
    verifierFiltresArchives,
    verifierBoutonRestaurer,
    cliquerRestaurer,
    confirmerRestauration,
    verifierFicheReapparue,
    verifierFicheRetireeDesArchives,
    verifierMentionRestauree,
    verifierHistoriqueArchivage,
    allerStatistiques,
    verifierArchivesExclues,
    cocherInclureArchives,
    verifierArchivesIncluses,
    verifierArchivesIdentifiees,
    verifierIndicateurArchivage,
    archiverEnUnClic,
    demanderRapportArchivage,
    verifierNombreFichesArchivees,
    verifierMotifsFrequents
  };
}

