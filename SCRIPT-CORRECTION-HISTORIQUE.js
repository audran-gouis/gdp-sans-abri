/**
 * Script de correction de l'historique pour les personnes existantes
 * À exécuter une seule fois dans la console
 */

(async function corrigerHistorique() {
  console.log('🔧 Début de la correction de l\'historique...');
  
  try {
    // Charger toutes les personnes
    const personnes = await window.getAllPersonnes();
    console.log(`📊 ${personnes.length} personnes trouvées`);
    
    let nbCorrigees = 0;
    
    for (const personne of personnes) {
      // Vérifier si la personne a un historique
      if (!personne.infoHistorique || personne.infoHistorique.length === 0) {
        console.log(`⏭️  Personne ${personne.id} (${personne.nom}) : pas d'historique, ignorée`);
        continue;
      }
      
      // Vérifier si la personne n'a qu'une seule version dans l'historique
      if (personne.infoHistorique.length === 1) {
        // Récupérer toutes les interventions et filtrer par personneId
        const toutesInterventions = await window.getAllInterventions();
        const interventions = toutesInterventions.filter(i => i.personneId === personne.id);
        
        if (!interventions || interventions.length === 0) {
          console.log(`⏭️  Personne ${personne.id} (${personne.nom}) : aucune intervention, ignorée`);
          continue;
        }
        
        // Trouver la date de la première intervention
        const dates = interventions.map(i => i.date).sort();
        const premiereDateIntervention = dates[0];
        const dateHistoriqueActuelle = personne.infoHistorique[0].dateDebut;
        
        // Si la date dans l'historique est APRÈS la première intervention, c'est un problème
        if (dateHistoriqueActuelle > premiereDateIntervention) {
          console.log(`🔧 Correction nécessaire pour ${personne.nom} ${personne.prenom}`);
          console.log(`   - Première intervention: ${premiereDateIntervention}`);
          console.log(`   - Date dans historique: ${dateHistoriqueActuelle}`);
          
          // Corriger la date de début dans l'historique
          personne.infoHistorique[0].dateDebut = premiereDateIntervention;
          
          // Sauvegarder
          await window.updatePersonne(personne.id, { infoHistorique: personne.infoHistorique });
          nbCorrigees++;
          console.log(`✅ Personne ${personne.id} corrigée !`);
        } else {
          console.log(`✓ Personne ${personne.id} (${personne.nom}) : historique OK`);
        }
      } else {
        console.log(`✓ Personne ${personne.id} (${personne.nom}) : historique complexe (${personne.infoHistorique.length} versions), OK`);
      }
    }
    
    console.log(`\n🎉 Correction terminée : ${nbCorrigees} personne(s) corrigée(s)`);
    
    // Rafraîchir l'affichage
    if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
      await window.afficherToutesLesPersonnesTransmissions();
    }
    if (typeof window.afficherToutesLesPersonnesADP === 'function') {
      await window.afficherToutesLesPersonnesADP();
    }
    if (typeof window.afficherToutesLesPersonnesPA === 'function') {
      await window.afficherToutesLesPersonnesPA();
    }
    
    alert(`✅ Correction terminée !\n${nbCorrigees} personne(s) corrigée(s).\n\nVeuillez vérifier que les informations historiques s'affichent correctement maintenant.`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    alert('Erreur lors de la correction : ' + error.message);
  }
})();

