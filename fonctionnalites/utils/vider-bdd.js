/**
 * Script pour supprimer complètement toutes les bases de données
 * À exécuter depuis la console du navigateur
 */

async function viderToutesLesBDD() {
  console.log('🗑️ Suppression complète de toutes les bases de données...');
  
  try {
    // Supprimer la base Transmissions
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('MaraudesDB');
      request.onsuccess = () => {
        console.log('✅ Base Transmissions supprimée');
        resolve();
      };
      request.onerror = () => {
        console.warn('⚠️ Erreur Transmissions:', request.error);
        resolve(); // Continue même en cas d'erreur
      };
      request.onblocked = () => {
        console.warn('⚠️ Suppression Transmissions bloquée, fermez tous les onglets');
        resolve();
      };
    });
    
    // Supprimer la base ADP
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('MaraudesADPDB');
      request.onsuccess = () => {
        console.log('✅ Base ADP supprimée');
        resolve();
      };
      request.onerror = () => {
        console.warn('⚠️ Erreur ADP:', request.error);
        resolve();
      };
      request.onblocked = () => {
        console.warn('⚠️ Suppression ADP bloquée, fermez tous les onglets');
        resolve();
      };
    });
    
    // Supprimer la base Point Accueil
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('MaraudesPointAccueilDB');
      request.onsuccess = () => {
        console.log('✅ Base Point Accueil supprimée');
        resolve();
      };
      request.onerror = () => {
        console.warn('⚠️ Erreur Point Accueil:', request.error);
        resolve();
      };
      request.onblocked = () => {
        console.warn('⚠️ Suppression Point Accueil bloquée, fermez tous les onglets');
        resolve();
      };
    });
    
    console.log('🎉 Toutes les bases de données ont été supprimées');
    console.log('🔄 Rechargement de la page pour recréer les bases...');
    
    // Recharger la page pour recréer les bases vides
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

// Exposer la fonction globalement
window.viderToutesLesBDD = viderToutesLesBDD;

console.log('💡 Pour vider toutes les bases de données, tapez: viderToutesLesBDD()');
console.log('💡 La page se rechargera automatiquement après la suppression');
