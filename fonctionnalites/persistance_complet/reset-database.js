/**
 * Script pour réinitialiser complètement la base de données IndexedDB
 * À exécuter dans la console du navigateur si vous rencontrez des problèmes de migration
 */

(async function resetDatabase() {
  const DB_NAME = 'MaraudesUnifiedDB';
  
  console.log('🔄 Début de la réinitialisation de la base de données...');
  
  try {
    // Fermer toute connexion ouverte
    if (window.dbUnified) {
      window.dbUnified.close();
      window.dbUnified = null;
      console.log('✅ Connexion fermée');
    }
    
    // Supprimer la base de données
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => {
      console.log('✅ Base de données supprimée avec succès');
      console.log('🔄 Rechargez la page pour recréer la base de données avec la nouvelle structure');
    };
    
    deleteRequest.onerror = (event) => {
      console.error('❌ Erreur lors de la suppression:', event.target.error);
    };
    
    deleteRequest.onblocked = () => {
      console.warn('⚠️ La suppression est bloquée. Fermez tous les onglets utilisant cette base de données et réessayez.');
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();

