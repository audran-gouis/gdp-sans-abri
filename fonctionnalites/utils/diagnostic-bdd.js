/**
 * Script de diagnostic pour la base de données
 * À exécuter depuis la console DevTools
 */

async function diagnostiquerBDD() {
  console.log('🔍 === DIAGNOSTIC BASE DE DONNÉES ===');
  console.log('');
  
  try {
    // 1. Vérifier les personnes
    if (typeof window.getAllPersonnes === 'function') {
      const personnes = await window.getAllPersonnes();
      console.log(`✅ ${personnes.length} personnes dans MaraudesPersonnesDB`);
      personnes.forEach((p, i) => {
        console.log(`  ${i+1}. ID: ${p.id}, personId: ${p.personId}, Nom: ${p.nom} ${p.prenom}, Inconnu: ${p.inconnu}`);
      });
    } else {
      console.error('❌ Fonction getAllPersonnes non disponible');
    }
    
    console.log('');
    
    // 2. Vérifier les transmissions
    if (typeof window.getAllTransmissions === 'function') {
      const transmissions = await window.getAllTransmissions();
      console.log(`✅ ${transmissions.length} transmissions dans MaraudesDB`);
      transmissions.forEach((t, i) => {
        console.log(`  ${i+1}. ID: ${t.id}, personneId: ${t.personneId}, Date: ${t.dateTransmission}`);
      });
    } else {
      console.error('❌ Fonction getAllTransmissions non disponible');
    }
    
    console.log('');
    
    // 3. Vérifier les ADP
    if (typeof window.getAllTransmissionsAdp === 'function') {
      const adp = await window.getAllTransmissionsAdp();
      console.log(`✅ ${adp.length} transmissions ADP dans MaraudesADP_DB`);
      adp.forEach((a, i) => {
        console.log(`  ${i+1}. ID: ${a.id}, personneId: ${a.personneId}, Date: ${a.dateTransmission}`);
      });
    } else {
      console.error('❌ Fonction getAllTransmissionsAdp non disponible');
    }
    
    console.log('');
    
    // 4. Vérifier les PA
    if (typeof recupererFichesPA === 'function') {
      const pa = await recupererFichesPA();
      console.log(`✅ ${pa.length} fiches PA dans MaraudesPointAccueilDB`);
      pa.forEach((p, i) => {
        console.log(`  ${i+1}. ID: ${p.id}, personneId: ${p.personneId}, Date: ${p.date}`);
      });
    } else {
      console.error('❌ Fonction recupererFichesPA non disponible');
    }
    
    console.log('');
    console.log('=== ANALYSE ===');
    
    // Vérifier la cohérence
    if (typeof window.getAllPersonnes === 'function') {
      const personnes = await window.getAllPersonnes();
      const transmissions = typeof window.getAllTransmissions === 'function' ? await window.getAllTransmissions() : [];
      const adp = typeof window.getAllTransmissionsAdp === 'function' ? await window.getAllTransmissionsAdp() : [];
      const pa = typeof recupererFichesPA === 'function' ? await recupererFichesPA() : [];
      
      console.log(`📊 Personnes: ${personnes.length}`);
      console.log(`📊 Total interventions: ${transmissions.length + adp.length + pa.length}`);
      console.log('');
      
      // Vérifier les orphelins (interventions sans personneId)
      const transOrphelines = transmissions.filter(t => !t.personneId);
      const adpOrphelines = adp.filter(a => !a.personneId);
      const paOrphelines = pa.filter(p => !p.personneId);
      
      if (transOrphelines.length > 0) {
        console.warn(`⚠️ ${transOrphelines.length} transmissions sans personneId (anciennes données)`);
      }
      if (adpOrphelines.length > 0) {
        console.warn(`⚠️ ${adpOrphelines.length} transmissions ADP sans personneId (anciennes données)`);
      }
      if (paOrphelines.length > 0) {
        console.warn(`⚠️ ${paOrphelines.length} fiches PA sans personneId (anciennes données)`);
      }
      
      if (transOrphelines.length === 0 && adpOrphelines.length === 0 && paOrphelines.length === 0) {
        console.log('✅ Toutes les interventions ont un personneId valide');
      } else {
        console.log('');
        console.log('⚠️ SOLUTION: Exécutez reinitialiserBases() pour repartir à zéro');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
  
  console.log('');
  console.log('=== FIN DU DIAGNOSTIC ===');
}

// Exposer globalement
if (typeof window !== 'undefined') {
  window.diagnostiquerBDD = diagnostiquerBDD;
}

console.log('✅ Script de diagnostic chargé');
console.log('Pour lancer le diagnostic, tapez dans la console: diagnostiquerBDD()');

