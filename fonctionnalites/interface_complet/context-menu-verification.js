/**
 * Script de vérification du menu contextuel
 * À exécuter dans la console du navigateur (DevTools)
 */

console.log('🔍 Vérification du menu contextuel...\n');

// 1. Vérifier que le CSS est chargé
const contextMenuCSS = Array.from(document.styleSheets).some(sheet => {
  try {
    return sheet.href && sheet.href.includes('context-menu.css');
  } catch (e) {
    return false;
  }
});
console.log(contextMenuCSS ? '✅ CSS du menu contextuel chargé' : '❌ CSS du menu contextuel MANQUANT');

// 2. Vérifier que les fonctions sont disponibles
const fonctionsDisponibles = {
  'initContextMenu': typeof window.initContextMenu === 'function',
  'attachContextMenuToCard': typeof window.attachContextMenuToCard === 'function',
  'attachContextMenuToAllCards': typeof window.attachContextMenuToAllCards === 'function'
};

console.log('\n📦 Fonctions du menu contextuel:');
Object.entries(fonctionsDisponibles).forEach(([nom, disponible]) => {
  console.log(disponible ? `  ✅ ${nom}` : `  ❌ ${nom} MANQUANTE`);
});

// 3. Vérifier les cartes
const cartes = document.querySelectorAll('.transmission-card');
console.log(`\n📇 Nombre de cartes trouvées: ${cartes.length}`);

if (cartes.length > 0) {
  const cartesAvecId = Array.from(cartes).filter(card => card.dataset.personneId);
  console.log(`  ✅ Cartes avec data-personne-id: ${cartesAvecId.length}/${cartes.length}`);
  
  const cartesAvecContextMenu = Array.from(cartes).filter(card => 
    card.hasAttribute('data-context-menu-attached')
  );
  console.log(`  ✅ Cartes avec menu contextuel attaché: ${cartesAvecContextMenu.length}/${cartes.length}`);
  
  // Afficher un exemple de carte
  if (cartesAvecId.length > 0) {
    const exemple = cartesAvecId[0];
    console.log(`\n📋 Exemple de carte:`);
    console.log(`  - personneId: ${exemple.dataset.personneId}`);
    console.log(`  - Menu attaché: ${exemple.hasAttribute('data-context-menu-attached') ? 'Oui' : 'Non'}`);
    const btn = exemple.querySelector('.btn-edit');
    if (btn) {
      console.log(`  - Type: ${btn.dataset.type}`);
    }
  }
} else {
  console.log('  ⚠️ Aucune carte trouvée. Naviguer vers un onglet avec des fiches.');
}

// 4. Vérifier si le menu contextuel existe dans le DOM
const menuElement = document.getElementById('card-context-menu');
console.log(`\n🎨 Menu contextuel dans le DOM: ${menuElement ? 'Oui (caché)' : 'Sera créé au premier clic droit'}`);

// 5. Instructions pour tester
console.log('\n📝 Pour tester:');
console.log('  1. Faire un clic droit sur une carte');
console.log('  2. Vérifier que le menu apparaît');
console.log('  3. Cliquer sur "Doublon de fiche"');
console.log('  4. Vérifier que la modale s\'ouvre avec les infos pré-remplies');

console.log('\n✨ Vérification terminée!\n');

// Retourner un résumé
const toutOK = contextMenuCSS && 
              Object.values(fonctionsDisponibles).every(v => v) && 
              cartes.length > 0;

if (toutOK) {
  console.log('🎉 Tout est en ordre! Le menu contextuel devrait fonctionner.');
} else {
  console.log('⚠️ Des éléments manquent. Vérifier les erreurs ci-dessus.');
}



