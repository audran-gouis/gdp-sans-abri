(function() {
  'use strict';

  /**
   * Calcule un score de similarité entre deux chaînes (algorithme Levenshtein normalisé)
   * @returns {number} Score entre 0 (différent) et 1 (identique)
   */
  const calculerSimilarite = (str1, str2) => {
    if (!str1 || !str2) return 0;
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();
    
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    // Matrice de distance de Levenshtein
    const matrix = [];
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[len1][len2];
    return 1 - (distance / maxLen);
  };

  /**
   * Détecte les doublons potentiels parmi les personnes
   * @param {number} seuilSimilarite - Seuil de similarité (0-1), par défaut 0.8
   * @returns {Promise<Array>} Liste des groupes de doublons potentiels
   */
  const detecterDoublons = async (seuilSimilarite = 0.8) => {
    try {
      // Vérifier que les fonctions nécessaires existent
      if (typeof window.initDatabaseUnified !== 'function') {
        throw new Error('initDatabaseUnified non disponible');
      }
      if (typeof window.getAllPersonnes !== 'function') {
        throw new Error('getAllPersonnes non disponible');
      }
      
      await window.initDatabaseUnified();
      const personnes = await window.getAllPersonnes();
      
      console.log(`📊 Analyse de ${personnes.length} personne(s)`);
      
      if (!personnes || personnes.length === 0) {
        console.log('Aucune personne dans la base');
        return [];
      }
      
      const groupesDoublons = [];
      const personnesTraitees = new Set();
      
      for (let i = 0; i < personnes.length; i++) {
        if (personnesTraitees.has(personnes[i].id)) continue;
        
        const personne1 = personnes[i];
        const doublonsPotentiels = [personne1];
        
        for (let j = i + 1; j < personnes.length; j++) {
          if (personnesTraitees.has(personnes[j].id)) continue;
          
          const personne2 = personnes[j];
          
          // Ne pas comparer les inconnus entre eux
          if (personne1.inconnu || personne2.inconnu) continue;
          
          // Calculer la similarité sur les informations personnelles
          const simNom = calculerSimilarite(personne1.nom || '', personne2.nom || '');
          const simPrenom = calculerSimilarite(personne1.prenom || '', personne2.prenom || '');
          const dateIdentique = personne1.dateNaissance === personne2.dateNaissance && personne1.dateNaissance;
          
          // Critères de détection de doublons basés sur les informations personnelles
          const estDoublon = (
            // Même nom et prénom similaires (>60%)
            (simNom >= seuilSimilarite && simPrenom >= 0.6) ||
            // Même prénom et nom similaires (>60%)
            (simPrenom >= seuilSimilarite && simNom >= 0.6) ||
            // Même date de naissance + nom ou prénom identique
            (dateIdentique && (simNom === 1 || simPrenom === 1)) ||
            // Nom et prénom identiques (100%)
            (simNom === 1 && simPrenom === 1)
          );
          
          if (estDoublon) {
            console.log(`✓ Doublon détecté: ${personne1.nom} ${personne1.prenom} ↔ ${personne2.nom} ${personne2.prenom}`);
            doublonsPotentiels.push(personne2);
            personnesTraitees.add(personne2.id);
          }
        }
        
        if (doublonsPotentiels.length > 1) {
          // Récupérer les interventions pour chaque personne
          const groupe = await Promise.all(
            doublonsPotentiels.map(async (p) => {
              const interventions = await getInterventionsByPersonneId(p.id);
              return {
                ...p,
                nbInterventions: interventions.length,
                interventions: interventions
              };
            })
          );
          
          // Trier par nombre d'interventions (décroissant)
          groupe.sort((a, b) => b.nbInterventions - a.nbInterventions);
          
          groupesDoublons.push({
            id: `groupe_${i}`,
            personnes: groupe,
            scoreConfiance: Math.max(
              calculerSimilarite(groupe[0].nom || '', groupe[1].nom || ''),
              calculerSimilarite(groupe[0].prenom || '', groupe[1].prenom || '')
            )
          });
          
          personnesTraitees.add(personne1.id);
        }
      }
      
      // Trier par score de confiance décroissant
      groupesDoublons.sort((a, b) => b.scoreConfiance - a.scoreConfiance);
      
      console.log(`✅ ${groupesDoublons.length} groupe(s) de doublons détecté(s)`);
      return groupesDoublons;
      
    } catch (error) {
      console.error('❌ Erreur dans detecterDoublons:', error);
      throw error;
    }
  };

  /**
   * Récupère toutes les interventions d'une personne
   */
  const getInterventionsByPersonneId = async (personneId) => {
    try {
      if (typeof window.initDatabaseUnified !== 'function') {
        return [];
      }
      
      await window.initDatabaseUnified();
      
      // Utiliser getAllInterventions et filtrer
      if (typeof window.getAllInterventions === 'function') {
        const toutesInterventions = await window.getAllInterventions();
        return toutesInterventions.filter(i => i.personneId === personneId);
      }
      
      return [];
    } catch (error) {
      console.error('Erreur getInterventionsByPersonneId:', error);
      return [];
    }
  };

  /**
   * Fusionne plusieurs personnes en une seule
   * @param {number} personnePrincipaleId - ID de la personne à conserver
   * @param {Array<number>} personnesAFusionnerIds - IDs des personnes à fusionner
   * @returns {Promise<Object>} La personne fusionnée
   */
  const fusionnerPersonnes = async (personnePrincipaleId, personnesAFusionnerIds) => {
    try {
      await window.initDatabaseUnified();
      
      // Récupérer la personne principale
      const personnePrincipale = await window.getPersonneById(personnePrincipaleId);
      if (!personnePrincipale) {
        throw new Error('Personne principale non trouvée');
      }
      
      console.log(`🔀 Fusion de ${personnesAFusionnerIds.length} personne(s) vers ID ${personnePrincipaleId}`);
      
      // Pour chaque personne à fusionner
      for (const personneId of personnesAFusionnerIds) {
        if (personneId === personnePrincipaleId) continue;
        
        // Récupérer toutes les interventions de cette personne
        const interventions = await getInterventionsByPersonneId(personneId);
        console.log(`  → ${interventions.length} intervention(s) de la personne ${personneId}`);
        
        // Transférer chaque intervention vers la personne principale
        for (const intervention of interventions) {
          try {
            // Créer une nouvelle intervention pour la personne principale (sans l'id)
            const nouvelleIntervention = {
              personneId: personnePrincipaleId,
              date: intervention.date,
              type: intervention.type,
              typeTransmission: intervention.typeTransmission || '',
              adresse: intervention.adresse || '',
              lieu: intervention.lieu || '',
              ville: intervention.ville || '',
              signalement: intervention.signalement || '',
              transmission: intervention.transmission || '',
              observations: intervention.observations || '',
              orly: intervention.orly || {},
              accompagnement: intervention.accompagnement || {},
              distribution: intervention.distribution || {},
              dateCreation: intervention.dateCreation || new Date().toISOString(),
              dateModification: new Date().toISOString()
            };
            
            await window.addIntervention(nouvelleIntervention);
          } catch (error) {
            // Si l'intervention existe déjà (contrainte unique), on l'ignore
            console.log(`    ⚠️ Intervention du ${intervention.date} (${intervention.type}) existe déjà, ignorée`);
          }
        }
        
        // Supprimer la personne fusionnée
        await window.deletePersonne(personneId);
        console.log(`  ✅ Personne ${personneId} supprimée`);
      }
      
      console.log('✅ Fusion terminée');
      return personnePrincipale;
      
    } catch (error) {
      console.error('❌ Erreur lors de la fusion:', error);
      throw error;
    }
  };

  /**
   * Recherche les doublons d'interventions (même personne, même date, même type)
   * @returns {Promise<Array>} Liste des groupes d'interventions en doublon
   */
  const detecterDoublonsInterventions = async () => {
    try {
      await window.initDatabaseUnified();
      const interventions = await window.getAllInterventions();
      
      if (!interventions || interventions.length === 0) {
        return [];
      }
      
      // Grouper les interventions par clé unique
      const groupes = new Map();
      
      interventions.forEach(interv => {
        const cle = `${interv.personneId}_${interv.date}_${interv.type}`;
        if (!groupes.has(cle)) {
          groupes.set(cle, []);
        }
        groupes.get(cle).push(interv);
      });
      
      // Ne garder que les groupes avec plus d'une intervention
      const doublons = [];
      groupes.forEach((intervs, cle) => {
        if (intervs.length > 1) {
          doublons.push({
            cle,
            interventions: intervs.sort((a, b) => 
              new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0)
            )
          });
        }
      });
      
      return doublons;
      
    } catch (error) {
      console.error('❌ Erreur dans detecterDoublonsInterventions:', error);
      return [];
    }
  };

  /**
   * Nettoie les doublons d'interventions en conservant la plus récente
   * @returns {Promise<number>} Nombre d'interventions supprimées
   */
  const nettoyerDoublonsInterventions = async () => {
    try {
      const doublons = await detecterDoublonsInterventions();
      let compteurSuppressions = 0;
      
      for (const groupe of doublons) {
        // Conserver la première (plus récente) et supprimer les autres
        for (let i = 1; i < groupe.interventions.length; i++) {
          await window.deleteIntervention(groupe.interventions[i].id);
          compteurSuppressions++;
        }
      }
      
      console.log(`🧹 ${compteurSuppressions} doublon(s) d'interventions supprimé(s)`);
      return compteurSuppressions;
      
    } catch (error) {
      console.error('❌ Erreur dans nettoyerDoublonsInterventions:', error);
      throw error;
    }
  };

  /**
   * Génère un rapport sur les doublons dans la base de données
   * @returns {Promise<Object>} Rapport détaillé
   */
  const genererRapportDoublons = async () => {
    const doublonsPersonnes = await detecterDoublons(0.8);
    const doublonsInterventions = await detecterDoublonsInterventions();
    
    return {
      doublonsPersonnes: {
        nombre: doublonsPersonnes.length,
        totalPersonnesConcernees: doublonsPersonnes.reduce((acc, g) => acc + g.personnes.length, 0),
        groupes: doublonsPersonnes
      },
      doublonsInterventions: {
        nombre: doublonsInterventions.length,
        totalInterventionsConcernees: doublonsInterventions.reduce((acc, g) => acc + g.interventions.length, 0),
        groupes: doublonsInterventions
      },
      dateRapport: new Date().toISOString()
    };
  };

  // Exporter les fonctions
  window.detecterDoublons = detecterDoublons;
  window.fusionnerPersonnes = fusionnerPersonnes;
  window.detecterDoublonsInterventions = detecterDoublonsInterventions;
  window.nettoyerDoublonsInterventions = nettoyerDoublonsInterventions;
  window.genererRapportDoublons = genererRapportDoublons;

  console.log('🔍 Module Gestion des Doublons chargé');
})();

