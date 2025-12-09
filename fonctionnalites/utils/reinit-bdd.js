/**
 * Script de réinitialisation des bases de données
 * À exécuter depuis la console DevTools (Ctrl+Shift+I)
 */

async function reinitialiserBases() {
  console.log('🔄 Réinitialisation des bases de données...');
  
  try {
    // Supprimer toutes les anciennes bases
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('MaraudesDB');
      req.onsuccess = () => {
        console.log('✅ MaraudesDB supprimée');
        resolve();
      };
      req.onerror = () => {
        console.log('⚠️ MaraudesDB pas trouvée ou déjà supprimée');
        resolve();
      };
    });
    
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('MaraudesADP_DB');
      req.onsuccess = () => {
        console.log('✅ MaraudesADP_DB supprimée');
        resolve();
      };
      req.onerror = () => {
        console.log('⚠️ MaraudesADP_DB pas trouvée ou déjà supprimée');
        resolve();
      };
    });
    
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('MaraudesPointAccueilDB');
      req.onsuccess = () => {
        console.log('✅ MaraudesPointAccueilDB supprimée');
        resolve();
      };
      req.onerror = () => {
        console.log('⚠️ MaraudesPointAccueilDB pas trouvée ou déjà supprimée');
        resolve();
      };
    });
    
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('MaraudesPersonnesDB');
      req.onsuccess = () => {
        console.log('✅ MaraudesPersonnesDB supprimée');
        resolve();
      };
      req.onerror = () => {
        console.log('⚠️ MaraudesPersonnesDB pas trouvée ou déjà supprimée');
        resolve();
      };
    });
    
    console.log('✅ Toutes les bases ont été supprimées');
    console.log('🔄 Rechargement de l\'application...');
    
    setTimeout(() => {
      location.reload();
    }, 500);
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  }
}

// Exposer globalement
if (typeof window !== 'undefined') {
  window.reinitialiserBases = reinitialiserBases;
}

console.log('✅ Script de réinitialisation chargé');
console.log('Pour réinitialiser les bases, tapez dans la console: reinitialiserBases()');

