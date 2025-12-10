/**
 * SCRIPT DE MIGRATION - Base de données unifiée
 * 
 * Transfère toutes les données existantes des anciennes bases vers la nouvelle base unifiée.
 * À exécuter une seule fois après le déploiement de la nouvelle architecture.
 * 
 * Exposé globalement sur window.migrerVersBa seUnifiee()
 */

(function() {
  'use strict';

  async function migrerVersBaseUnifiee() {
    console.log('🚀 === DÉBUT DE LA MIGRATION VERS LA BASE UNIFIÉE ===');

    if (!confirm('⚠️ ATTENTION : Cette migration va transférer toutes vos données vers une nouvelle base de données unifiée.\n\nLes anciennes bases seront conservées comme sauvegarde mais ne seront plus utilisées.\n\nCette opération peut prendre quelques minutes.\n\nSouhaitez-vous continuer ?')) {
      console.log('Migration annulée par l\'utilisateur');
      return;
    }

    try {
      // Initialiser toutes les bases de données
      console.log('📊 Initialisation des bases de données...');
      
      if (typeof window.initDatabaseUnified === 'function') {
        await window.initDatabaseUnified();
      } else {
        throw new Error('Base de données unifiée non disponible');
      }

      if (typeof window.initDatabasePersonnes === 'function') {
        await window.initDatabasePersonnes();
      }
      if (typeof window.initDB === 'function') {
        await window.initDB();
      }
      if (typeof window.initDBADP === 'function') {
        await window.initDBADP();
      }
      if (typeof window.initDatabasePA === 'function') {
        await window.initDatabasePA();
      }

      // 1. Migrer les personnes
      console.log('\n📋 === MIGRATION DES PERSONNES ===');
      let personnesMap = new Map(); // oldId -> newId
      
      if (typeof window.getAllPersonnes === 'function') {
        const anciennesPersonnes = await window.getAllPersonnes();
        console.log(`📊 ${anciennesPersonnes.length} personnes à migrer`);

        for (const personne of anciennesPersonnes) {
          try {
            const newId = await window.creerOuRecupererPersonne({
              nom: personne.nom,
              prenom: personne.prenom,
              dateNaissance: personne.dateNaissance,
              descriptionPhysique: personne.descriptionPhysique,
              inconnu: personne.inconnu,
              departement: personne.departement,
              typologie: personne.typologie,
              nbPersonnes: personne.nbPersonnes,
              mineurs: personne.mineurs
            });
            personnesMap.set(personne.id, newId);
            console.log(`✅ Personne migrée: ${personne.prenom} ${personne.nom} (${personne.id} -> ${newId})`);
          } catch (error) {
            console.error(`❌ Erreur migration personne ${personne.id}:`, error);
          }
        }
      }

      // 2. Migrer les interventions Transmissions
      console.log('\n📋 === MIGRATION DES TRANSMISSIONS ===');
      if (typeof window.getAllTransmissions === 'function') {
        const transmissions = await window.getAllTransmissions();
        console.log(`📊 ${transmissions.length} transmissions à migrer`);

        for (const trans of transmissions) {
          try {
            if (!trans.personneId) {
              console.warn(`⚠️ Transmission sans personneId ignorée:`, trans);
              continue;
            }

            const newPersonneId = personnesMap.get(trans.personneId);
            if (!newPersonneId) {
              console.warn(`⚠️ Personne ${trans.personneId} introuvable, transmission ignorée`);
              continue;
            }

            await window.ajouterIntervention({
              personneId: newPersonneId,
              date: trans.dateTransmission,
              type: 'transmissions',
              lieu: trans.lieu,
              ville: trans.ville,
              orly: trans.orly,
              accompagnement: trans.accompagnement,
              distribution: trans.distribution,
              observations: trans.observations,
              signalement: trans.signalement,
              typeTransmission: trans.typeTransmission
            });
            console.log(`✅ Transmission migrée pour personne ${newPersonneId} le ${trans.dateTransmission}`);
          } catch (error) {
            console.error(`❌ Erreur migration transmission:`, error);
          }
        }
      }

      // 3. Migrer les interventions ADP
      console.log('\n📋 === MIGRATION DES ADP ===');
      if (typeof window.getAllTransmissionsAdp === 'function') {
        const adp = await window.getAllTransmissionsAdp();
        console.log(`📊 ${adp.length} ADP à migrer`);

        for (const intervention of adp) {
          try {
            if (!intervention.personneId) {
              console.warn(`⚠️ ADP sans personneId ignorée:`, intervention);
              continue;
            }

            const newPersonneId = personnesMap.get(intervention.personneId);
            if (!newPersonneId) {
              console.warn(`⚠️ Personne ${intervention.personneId} introuvable, ADP ignorée`);
              continue;
            }

            await window.ajouterIntervention({
              personneId: newPersonneId,
              date: intervention.dateTransmission,
              type: 'adp',
              lieu: intervention.lieu,
              ville: intervention.ville,
              orly: intervention.orly,
              accompagnement: intervention.accompagnement,
              distribution: intervention.distribution,
              observations: intervention.observations,
              signalement: intervention.signalement,
              typeTransmission: intervention.typeTransmission
            });
            console.log(`✅ ADP migrée pour personne ${newPersonneId} le ${intervention.dateTransmission}`);
          } catch (error) {
            console.error(`❌ Erreur migration ADP:`, error);
          }
        }
      }

      // 4. Migrer les interventions Point Accueil
      console.log('\n📋 === MIGRATION DES POINT ACCUEIL ===');
      if (typeof window.recupererFichesPA === 'function') {
        const pa = await window.recupererFichesPA();
        console.log(`📊 ${pa.length} Point Accueil à migrer`);

        for (const fiche of pa) {
          try {
            if (!fiche.personneId) {
              console.warn(`⚠️ Fiche PA sans personneId ignorée:`, fiche);
              continue;
            }

            const newPersonneId = personnesMap.get(fiche.personneId);
            if (!newPersonneId) {
              console.warn(`⚠️ Personne ${fiche.personneId} introuvable, PA ignorée`);
              continue;
            }

            await window.ajouterIntervention({
              personneId: newPersonneId,
              date: fiche.date,
              type: 'pointAccueil',
              lieu: fiche.lieu,
              ville: fiche.ville,
              services: fiche.services,
              observations: fiche.observations
            });
            console.log(`✅ Point Accueil migré pour personne ${newPersonneId} le ${fiche.date}`);
          } catch (error) {
            console.error(`❌ Erreur migration Point Accueil:`, error);
          }
        }
      }

      // Résumé de la migration
      console.log('\n📊 === RÉSUMÉ DE LA MIGRATION ===');
      const nouvellesPersonnes = await window.getAllPersonnes();
      const nouvellesInterventions = await window.getAllInterventions();
      
      console.log(`✅ ${nouvellesPersonnes.length} personnes dans la nouvelle base`);
      console.log(`✅ ${nouvellesInterventions.length} interventions dans la nouvelle base`);
      
      const interventionsParType = {
        transmissions: nouvellesInterventions.filter(i => i.type === 'transmissions').length,
        adp: nouvellesInterventions.filter(i => i.type === 'adp').length,
        pointAccueil: nouvellesInterventions.filter(i => i.type === 'pointAccueil').length
      };
      
      console.log(`   - Transmissions: ${interventionsParType.transmissions}`);
      console.log(`   - ADP: ${interventionsParType.adp}`);
      console.log(`   - Point Accueil: ${interventionsParType.pointAccueil}`);

      alert(`✅ Migration terminée avec succès !\n\n${nouvellesPersonnes.length} personnes\n${nouvellesInterventions.length} interventions\n\nL'application va maintenant se recharger pour utiliser la nouvelle base de données.`);

      console.log('🎉 === MIGRATION TERMINÉE ===');
      
      // Recharger l'application
      location.reload();

    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      alert('❌ Erreur lors de la migration. Consultez la console pour plus de détails.');
    }
  }

  // Exposer la fonction globalement
  window.migrerVersBaseUnifiee = migrerVersBaseUnifiee;

  console.log('📦 Script de migration vers base unifiée chargé. Utilisez window.migrerVersBaseUnifiee() pour lancer la migration.');
})();

