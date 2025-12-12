/**
 * Script de test pour le système de gestion des doublons
 * À exécuter dans la console du navigateur
 */

(async function testGestionDoublons() {
  console.log('🧪 Début des tests du système de gestion des doublons\n');
  
  let testsReussis = 0;
  let testsEchoues = 0;
  
  const test = (nom, condition, message = '') => {
    if (condition) {
      console.log(`✅ ${nom}`);
      testsReussis++;
    } else {
      console.error(`❌ ${nom}${message ? ': ' + message : ''}`);
      testsEchoues++;
    }
  };
  
  try {
    // Test 1: Vérifier que les fonctions sont disponibles
    console.log('\n📋 Test 1: Disponibilité des fonctions');
    test('detecterDoublons existe', typeof window.detecterDoublons === 'function');
    test('fusionnerPersonnes existe', typeof window.fusionnerPersonnes === 'function');
    test('detecterDoublonsInterventions existe', typeof window.detecterDoublonsInterventions === 'function');
    test('nettoyerDoublonsInterventions existe', typeof window.nettoyerDoublonsInterventions === 'function');
    test('genererRapportDoublons existe', typeof window.genererRapportDoublons === 'function');
    test('verifierDoublonsAvantCreation existe', typeof window.verifierDoublonsAvantCreation === 'function');
    test('creerOuRecupererPersonneAvecVerification existe', typeof window.creerOuRecupererPersonneAvecVerification === 'function');
    
    // Test 2: Créer des données de test
    console.log('\n📋 Test 2: Création de données de test');
    
    const personne1Id = await creerOuRecupererPersonne({
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: '1990-01-01',
      departement: '75',
      typologie: 'Isolé'
    });
    test('Création personne 1', personne1Id > 0);
    
    const personne2Id = await creerOuRecupererPersonne({
      nom: 'Dupond',  // Similaire à Dupont
      prenom: 'Jean',
      dateNaissance: '1990-01-01',
      departement: '75',
      typologie: 'Isolé'
    });
    test('Création personne 2 (doublon potentiel)', personne2Id > 0 && personne2Id !== personne1Id);
    
    const personne3Id = await creerOuRecupererPersonne({
      nom: 'Martin',
      prenom: 'Sophie',
      dateNaissance: '1985-05-15',
      departement: '92',
      typologie: 'Famille'
    });
    test('Création personne 3 (pas un doublon)', personne3Id > 0);
    
    // Créer des interventions
    const interv1Id = await addIntervention({
      personneId: personne1Id,
      date: '2024-12-10',
      type: 'transmissions',
      transmission: 'Test intervention 1'
    });
    test('Création intervention 1', interv1Id > 0);
    
    const interv2Id = await addIntervention({
      personneId: personne2Id,
      date: '2024-12-11',
      type: 'adp',
      observations: 'Test intervention 2'
    });
    test('Création intervention 2', interv2Id > 0);
    
    // Test 3: Détection des doublons
    console.log('\n📋 Test 3: Détection des doublons');
    
    const doublons = await detecterDoublons(0.7);
    test('Détection des doublons', Array.isArray(doublons));
    test('Au moins un groupe de doublons détecté', doublons.length > 0, `Trouvé: ${doublons.length} groupe(s)`);
    
    if (doublons.length > 0) {
      const groupe = doublons.find(g => 
        g.personnes.some(p => p.id === personne1Id) && 
        g.personnes.some(p => p.id === personne2Id)
      );
      test('Jean Dupont/Dupond détectés comme doublons', groupe !== undefined);
      if (groupe) {
        test('Score de confiance cohérent', groupe.scoreConfiance > 0.7 && groupe.scoreConfiance <= 1);
        test('Nombre d\'interventions correct', groupe.personnes[0].nbInterventions >= 0);
      }
    }
    
    // Test 4: Vérification avant création
    console.log('\n📋 Test 4: Vérification avant création');
    
    const doublonsPotentiels = await verifierDoublonsAvantCreation({
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: '1990-01-01'
    });
    test('Vérification retourne un tableau', Array.isArray(doublonsPotentiels));
    test('Doublon détecté pour Jean Dupont', doublonsPotentiels.length > 0);
    
    const pasDeDoublon = await verifierDoublonsAvantCreation({
      nom: 'Nouveau',
      prenom: 'Personne',
      dateNaissance: '2000-01-01'
    });
    test('Pas de doublon pour une nouvelle personne', pasDeDoublon.length === 0);
    
    // Test 5: Créer des doublons d'interventions
    console.log('\n📋 Test 5: Détection des doublons d\'interventions');
    
    const interv3Id = await addIntervention({
      personneId: personne1Id,
      date: '2024-12-10',
      type: 'transmissions',  // Même que interv1
      transmission: 'Doublon de test'
    });
    test('Création d\'une intervention en doublon', interv3Id > 0);
    
    const doublonsInterv = await detecterDoublonsInterventions();
    test('Détection des doublons d\'interventions', Array.isArray(doublonsInterv));
    test('Au moins un doublon d\'intervention détecté', doublonsInterv.length > 0);
    
    // Test 6: Rapport complet
    console.log('\n📋 Test 6: Génération du rapport');
    
    const rapport = await genererRapportDoublons();
    test('Rapport généré', rapport !== null);
    test('Rapport contient doublonsPersonnes', rapport.doublonsPersonnes !== undefined);
    test('Rapport contient doublonsInterventions', rapport.doublonsInterventions !== undefined);
    test('Rapport contient dateRapport', rapport.dateRapport !== undefined);
    test('Nombre de doublons personnes cohérent', rapport.doublonsPersonnes.nombre >= 0);
    test('Nombre de doublons interventions cohérent', rapport.doublonsInterventions.nombre >= 0);
    
    // Test 7: Fusion (optionnel, commenté pour ne pas modifier les données)
    console.log('\n📋 Test 7: Test de fusion (simulation)');
    console.log('⚠️ Tests de fusion désactivés pour préserver les données');
    console.log('Pour tester la fusion, décommentez le code ci-dessous:');
    console.log(`
    // const personneFusionnee = await fusionnerPersonnes(${personne1Id}, [${personne2Id}]);
    // test('Fusion réussie', personneFusionnee !== null);
    // const personne2Apres = await getPersonneById(${personne2Id});
    // test('Personne 2 supprimée après fusion', personne2Apres === undefined);
    `);
    
    // Test 8: Nettoyage (optionnel, commenté)
    console.log('\n📋 Test 8: Nettoyage (simulation)');
    console.log('⚠️ Test de nettoyage désactivé pour préserver les données');
    console.log('Pour tester le nettoyage, exécutez:');
    console.log('// const nbSuppressions = await nettoyerDoublonsInterventions();');
    
    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(50));
    console.log(`✅ Tests réussis: ${testsReussis}`);
    console.log(`❌ Tests échoués: ${testsEchoues}`);
    console.log(`📈 Taux de réussite: ${Math.round((testsReussis / (testsReussis + testsEchoues)) * 100)}%`);
    
    if (testsEchoues === 0) {
      console.log('\n🎉 Tous les tests sont passés avec succès !');
    } else {
      console.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    }
    
    // Afficher le rapport final
    console.log('\n📋 Rapport final:');
    console.log('─'.repeat(50));
    console.log(`Groupes de doublons de personnes: ${rapport.doublonsPersonnes.nombre}`);
    console.log(`Personnes concernées: ${rapport.doublonsPersonnes.totalPersonnesConcernees}`);
    console.log(`Groupes d'interventions en doublon: ${rapport.doublonsInterventions.nombre}`);
    console.log(`Interventions concernées: ${rapport.doublonsInterventions.totalInterventionsConcernees}`);
    console.log('─'.repeat(50));
    
    // Instructions de nettoyage
    console.log('\n🧹 Pour nettoyer les données de test:');
    console.log(`
await deletePersonne(${personne1Id});
await deletePersonne(${personne2Id});
await deletePersonne(${personne3Id});
console.log('✅ Données de test nettoyées');
    `);
    
    return {
      testsReussis,
      testsEchoues,
      rapport,
      personnesTest: [personne1Id, personne2Id, personne3Id]
    };
    
  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error);
    console.error(error.stack);
    return {
      testsReussis,
      testsEchoues,
      erreur: error.message
    };
  }
})().then(result => {
  console.log('\n✨ Tests terminés');
  window.resultatTests = result;
  console.log('Les résultats sont disponibles dans window.resultatTests');
});

