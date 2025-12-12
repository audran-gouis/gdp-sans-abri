/**
 * Système d'historisation des informations personnelles
 * Gère le versioning du département, typologie, nb personnes et mineurs
 */

(function() {
  'use strict';

  /**
   * Récupère les dernières informations connues (version la plus récente)
   * @param {Object} personne - La personne
   * @returns {Object} Les dernières informations connues
   */
  function getDernieresInfos(personne) {
    if (!personne) {
      return {
        departement: '',
        typologie: '',
        nbPersonnes: '',
        mineurs: ''
      };
    }

    // Si pas d'historique, retourner les valeurs directes (anciennes données)
    if (!personne.infoHistorique || personne.infoHistorique.length === 0) {
      return {
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      };
    }

    // Trier l'historique par date décroissante et prendre la première (= la plus récente)
    const historiqueTrie = [...personne.infoHistorique].sort((a, b) => {
      return new Date(b.dateDebut) - new Date(a.dateDebut);
    });

    const derniereVersion = historiqueTrie[0];
    return {
      departement: derniereVersion.departement || '',
      typologie: derniereVersion.typologie || '',
      nbPersonnes: derniereVersion.nbPersonnes || '',
      mineurs: derniereVersion.mineurs || ''
    };
  }

  /**
   * Récupère les informations valides à une date donnée
   * @param {Object} personne - La personne avec son historique
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Object} Les informations valides à cette date
   */
  function getInfosALaDate(personne, date) {
    console.log('🔍 getInfosALaDate appelée:', { personneId: personne?.id, date, historique: personne?.infoHistorique });
    
    if (!personne || !date) {
      return {
        departement: '',
        typologie: '',
        nbPersonnes: '',
        mineurs: ''
      };
    }

    // Si pas d'historique, retourner les valeurs directes (anciennes données)
    if (!personne.infoHistorique || personne.infoHistorique.length === 0) {
      console.log('⚠️ Pas d\'historique, retour valeurs directes');
      return {
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      };
    }

    // Trier l'historique par date décroissante
    const historiqueTrie = [...personne.infoHistorique].sort((a, b) => {
      return new Date(b.dateDebut) - new Date(a.dateDebut);
    });
    
    console.log('📊 Historique trié:', historiqueTrie);

    // Trouver la version valide à la date donnée
    for (const version of historiqueTrie) {
      console.log(`🔎 Comparaison: ${version.dateDebut} <= ${date} ?`, version.dateDebut <= date);
      if (version.dateDebut <= date) {
        console.log('✅ Version trouvée:', version);
        return {
          departement: version.departement || '',
          typologie: version.typologie || '',
          nbPersonnes: version.nbPersonnes || '',
          mineurs: version.mineurs || ''
        };
      }
    }

    // Si aucune version trouvée (date antérieure à toutes les versions)
    // Retourner la plus ancienne version
    const plusAncienne = historiqueTrie[historiqueTrie.length - 1];
    console.log('⚠️ Aucune version <= date, retour plus ancienne:', plusAncienne);
    return {
      departement: plusAncienne?.departement || '',
      typologie: plusAncienne?.typologie || '',
      nbPersonnes: plusAncienne?.nbPersonnes || '',
      mineurs: plusAncienne?.mineurs || ''
    };
  }

  /**
   * Détecte si les informations ont changé
   * @param {Object} anciennes - Anciennes informations
   * @param {Object} nouvelles - Nouvelles informations
   * @returns {boolean} True si changement détecté
   */
  function detecterChangements(anciennes, nouvelles) {
    const changed = anciennes.departement !== nouvelles.departement ||
           anciennes.typologie !== nouvelles.typologie ||
           anciennes.nbPersonnes !== nouvelles.nbPersonnes ||
           anciennes.mineurs !== nouvelles.mineurs;
    
    console.log('🔎 detecterChangements:', { anciennes, nouvelles, changed });
    return changed;
  }

  /**
   * Ajoute ou met à jour une version dans l'historique
   * @param {Object} personne - La personne
   * @param {string} date - Date de début de validité
   * @param {Object} nouvellesInfos - Nouvelles informations
   * @returns {Array} Historique mis à jour
   */
  function ajouterVersionInfos(personne, date, nouvellesInfos) {
    console.log('🔍 ajouterVersionInfos appelée:', { date, nouvellesInfos, historique: personne.infoHistorique });
    
    // Initialiser l'historique si nécessaire
    let historique = personne.infoHistorique || [];

    // Migrer les anciennes données si l'historique est vide
    if (historique.length === 0 && (personne.departement || personne.typologie)) {
      console.log('📦 Migration des anciennes données');
      historique.push({
        dateDebut: date, // Utiliser la date actuelle comme référence
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      });
    }

    // Vérifier si une version existe déjà pour cette date
    const indexExistant = historique.findIndex(v => v.dateDebut === date);
    console.log('🔍 Index existant pour', date, ':', indexExistant);

    if (indexExistant !== -1) {
      // Mettre à jour la version existante
      console.log('🔄 Mise à jour de la version existante à l\'index', indexExistant);
      historique[indexExistant] = {
        dateDebut: date,
        departement: nouvellesInfos.departement || '',
        typologie: nouvellesInfos.typologie || '',
        nbPersonnes: nouvellesInfos.nbPersonnes || '',
        mineurs: nouvellesInfos.mineurs || ''
      };
    } else {
      // Récupérer les infos actuelles à cette date
      const infosActuelles = getInfosALaDate(personne, date);
      console.log('📊 Infos actuelles à cette date:', infosActuelles);
      console.log('📊 Nouvelles infos:', nouvellesInfos);
      
      // Ajouter une nouvelle version uniquement si différente
      if (detecterChangements(infosActuelles, nouvellesInfos)) {
        console.log('✅ Changements détectés, ajout d\'une nouvelle version');
        historique.push({
          dateDebut: date,
          departement: nouvellesInfos.departement || '',
          typologie: nouvellesInfos.typologie || '',
          nbPersonnes: nouvellesInfos.nbPersonnes || '',
          mineurs: nouvellesInfos.mineurs || ''
        });
        
        // Trier par date
        historique.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));
        
        console.log(`📝 Nouvelle version ajoutée pour le ${date}`);
      } else {
        console.log(`ℹ️ Aucun changement détecté, version non ajoutée`);
      }
    }

    console.log('📋 Historique final:', historique);
    return historique;
  }

  /**
   * Récupère tout l'historique formaté pour affichage
   * @param {Object} personne - La personne
   * @returns {Array} Historique formaté
   */
  function getHistoriqueFormate(personne) {
    if (!personne || !personne.infoHistorique || personne.infoHistorique.length === 0) {
      return [];
    }

    return personne.infoHistorique
      .sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut))
      .map(version => ({
        ...version,
        dateDebutFormatee: new Date(version.dateDebut).toLocaleDateString('fr-FR')
      }));
  }

  /**
   * Nettoie l'historique en supprimant les doublons consécutifs
   * @param {Array} historique - L'historique à nettoyer
   * @returns {Array} Historique nettoyé
   */
  function nettoyerHistorique(historique) {
    if (!historique || historique.length <= 1) {
      return historique;
    }

    const historiqueNettoye = [];
    let precedent = null;

    for (const version of historique) {
      if (!precedent || detecterChangements(precedent, version)) {
        historiqueNettoye.push(version);
        precedent = version;
      }
    }

    return historiqueNettoye;
  }

  /**
   * Migre les données d'une personne vers le nouveau système
   * @param {Object} personne - La personne à migrer
   * @returns {Object} Personne avec historique initialisé
   */
  function migrerVersHistorique(personne) {
    if (!personne) return personne;

    // Si déjà migré, ne rien faire
    if (personne.infoHistorique && personne.infoHistorique.length > 0) {
      return personne;
    }

    // Créer la première version avec les données actuelles
    if (personne.departement || personne.typologie) {
      personne.infoHistorique = [{
        dateDebut: personne.dateCreation || new Date().toISOString().split('T')[0],
        departement: personne.departement || '',
        typologie: personne.typologie || '',
        nbPersonnes: personne.nbPersonnes || '',
        mineurs: personne.mineurs || ''
      }];
      
      console.log(`📦 Migration de la personne ${personne.id} vers système d'historisation`);
    } else {
      personne.infoHistorique = [];
    }

    return personne;
  }

  /**
   * Affiche l'historique dans une modale
   * @param {Object} personne - La personne
   */
  function afficherHistoriqueModal(personne) {
    const historique = getHistoriqueFormate(personne);
    
    if (historique.length === 0) {
      alert('Aucun historique disponible pour cette personne.');
      return;
    }

    let html = `
      <div style="max-height: 400px; overflow-y: auto;">
        <h3 style="margin-top: 0;">Historique des informations</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 0.75rem; text-align: left;">Date de début</th>
              <th style="padding: 0.75rem; text-align: left;">Département</th>
              <th style="padding: 0.75rem; text-align: left;">Typologie</th>
              <th style="padding: 0.75rem; text-align: left;">Personnes</th>
              <th style="padding: 0.75rem; text-align: left;">Mineurs</th>
            </tr>
          </thead>
          <tbody>
    `;

    historique.forEach((version, index) => {
      const isRecent = index === 0;
      html += `
        <tr style="border-bottom: 1px solid #e5e7eb; ${isRecent ? 'background: #eff6ff; font-weight: 600;' : ''}">
          <td style="padding: 0.75rem;">${version.dateDebutFormatee}${isRecent ? ' <span style="color: #2563eb;">(Actuel)</span>' : ''}</td>
          <td style="padding: 0.75rem;">${version.departement || '-'}</td>
          <td style="padding: 0.75rem;">${version.typologie || '-'}</td>
          <td style="padding: 0.75rem;">${version.nbPersonnes || '-'}</td>
          <td style="padding: 0.75rem;">${version.mineurs || '-'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    // Créer et afficher une modale simple
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
    `;
    content.innerHTML = html + `
      <div style="margin-top: 1.5rem; text-align: right;">
        <button id="btn-close-historique" style="background: #2563eb; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer;">
          Fermer
        </button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Fermer au clic
    document.getElementById('btn-close-historique').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Exposer les fonctions globalement
  window.getInfosALaDate = getInfosALaDate;
  window.getDernieresInfos = getDernieresInfos;
  window.detecterChangements = detecterChangements;
  window.ajouterVersionInfos = ajouterVersionInfos;
  window.getHistoriqueFormate = getHistoriqueFormate;
  window.nettoyerHistorique = nettoyerHistorique;
  window.migrerVersHistorique = migrerVersHistorique;
  window.afficherHistoriqueModal = afficherHistoriqueModal;

  console.log('✅ Système d\'historisation des informations chargé');
})();


