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
  async function afficherHistoriqueModal(personne) {
    // Variable pour éviter les double-clics - DÉCLARER EN PREMIER
    let isClosing = false;
    
    const historique = getHistoriqueFormate(personne);
    
    if (historique.length === 0) {
      await window.customAlert('Aucun historique disponible pour cette personne.', 'info');
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

    // Créer le modal
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
    
    // Insérer le tableau d'historique
    content.innerHTML = html;
    
    // Fonction pour fermer le modal
    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.2s ease-out';
      
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 200);
    };
    
    // Créer le bouton de fermeture
    const footerDiv = document.createElement('div');
    footerDiv.style.cssText = 'margin-top: 1.5rem; text-align: right;';
    
    const btnClose = document.createElement('button');
    btnClose.textContent = 'Fermer';
    btnClose.type = 'button';
    btnClose.style.cssText = 'background: #2563eb; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;';
    
    btnClose.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
    
    footerDiv.appendChild(btnClose);
    content.appendChild(footerDiv);
    
    content.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    
    modal.appendChild(content);
    
    modal.style.opacity = '0';
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
      modal.style.transition = 'opacity 0.2s ease-in';
      modal.style.opacity = '1';
    });
    
    modal.addEventListener('mousedown', (e) => {
      if (e.target === modal) {
        e.preventDefault();
        closeModal();
      }
    });
  }

  /**
   * Affiche l'historique des interventions d'une personne pour une section donnée
   * @param {number} personneId - ID de la personne
   * @param {string} section - Section concernée (transmission, accompagnement, etc.)
   */
  async function afficherHistoriqueInterventions(personneId, section) {
    console.log('📊 afficherHistoriqueInterventions appelé avec:', { personneId, section });
    
    if (!personneId) {
      console.error('❌ PersonneId manquant');
      await window.customAlert('Veuillez d\'abord sélectionner ou créer une personne.', 'warning');
      return;
    }

    try {
      // Récupérer la personne et toutes ses interventions
      console.log('🔍 Recherche de la personne:', personneId);
      const personne = await window.getPersonneById(personneId);
      if (!personne) {
        console.error('❌ Personne non trouvée:', personneId);
        await window.customAlert('Personne non trouvée.', 'error');
        return;
      }
      console.log('✅ Personne trouvée:', personne);

      // Récupérer toutes les interventions de cette personne
      console.log('🔍 Recherche des interventions...');
      const toutesInterventions = await window.getAllInterventions();
      console.log('📋 Total interventions:', toutesInterventions.length);
      
      const interventions = toutesInterventions
        .filter(i => i.personneId === personneId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Plus récent en premier

      console.log('📋 Interventions pour cette personne:', interventions.length);
      
      if (interventions.length === 0) {
        console.warn('⚠️ Aucune intervention trouvée');
        await window.customAlert('Aucune intervention trouvée pour cette personne.', 'info');
        return;
      }

      // Générer le contenu selon la section
      console.log('📝 Génération du HTML pour section:', section);
      const titre = getTitreSection(section);
      const html = genererHTMLHistoriqueSection(interventions, section, titre, personne);

      // Afficher dans un modal (même s'il n'y a pas de données, le modal affichera un message approprié)
      console.log('🎨 Affichage du modal historique');
      afficherModalHistoriqueSection(html);
      console.log('✅ Modal historique affiché');
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage de l\'historique:', error);
      await window.customAlert('Erreur lors de l\'affichage de l\'historique.', 'error');
    }
  }

  /**
   * Retourne le titre d'une section
   */
  function getTitreSection(section) {
    const titres = {
      'infos-perso': 'Informations Personnelles',
      'transmission': 'Données de Transmission',
      'type-intervention': 'Type d\'intervention',
      'accompagnement': 'Accompagnement',
      'distribution': 'Distribution',
      'contenu': 'Contenu de la transmission'
    };
    return titres[section] || section;
  }

  /**
   * Vérifie si une intervention a des données pour une section
   */
  function interventionADesDonnees(intervention, section) {
    switch (section) {
      case 'transmission':
        return (intervention.lieu && intervention.lieu.trim() !== '') || 
               (intervention.adresse && intervention.adresse.trim() !== '') ||
               (intervention.ville && intervention.ville.trim() !== '') ||
               (intervention.signalement && intervention.signalement.trim() !== '');
      
      case 'type-intervention':
        return (intervention.typeIntervention && intervention.typeIntervention.trim() !== '') ||
               (intervention.typeTransmission && intervention.typeTransmission.trim() !== '');
      
      case 'accompagnement':
        // Si c'est un tableau (ancien format)
        if (Array.isArray(intervention.accompagnement)) {
          return intervention.accompagnement.length > 0;
        }
        // Si c'est un objet (nouveau format)
        if (intervention.accompagnement && typeof intervention.accompagnement === 'object') {
          return Object.values(intervention.accompagnement).some(val => val === true);
        }
        return false;
      
      case 'distribution':
        // Si c'est un tableau (ancien format)
        if (Array.isArray(intervention.distribution)) {
          return intervention.distribution.length > 0;
        }
        // Si c'est un objet (nouveau format)
        if (intervention.distribution && typeof intervention.distribution === 'object') {
          return Object.values(intervention.distribution).some(val => val === true);
        }
        return false;
      
      case 'contenu':
        return (intervention.contenu && intervention.contenu.trim() !== '') ||
               (intervention.transmission && intervention.transmission.trim() !== '') ||
               (intervention.observations && intervention.observations.trim() !== '');
      
      default:
        return false;
    }
  }

  /**
   * Génère le HTML pour l'historique d'une section
   */
  function genererHTMLHistoriqueSection(interventions, section, titre, personne) {
    // Filtrer les interventions qui ont des données pour cette section
    const interventionsAvecDonnees = interventions.filter(interv => 
      interventionADesDonnees(interv, section)
    );

    let html = `
      <div style="max-height: 500px; overflow-y: auto;">
        <h3 style="margin-top: 0;">Historique - ${titre}</h3>
        <p style="color: #666; margin-bottom: 1rem;">
          <strong>${personne.nom || ''} ${personne.prenom || ''}</strong>
        </p>
    `;

    if (interventionsAvecDonnees.length === 0) {
      html += `
        <div style="padding: 2rem; text-align: center; color: #9ca3af;">
          <p>Aucune donnée enregistrée pour cette section.</p>
        </div>
      `;
    } else {
      html += `
        <p style="color: #666; margin-bottom: 1rem; font-size: 0.9rem;">
          ${interventionsAvecDonnees.length} intervention(s) avec données
        </p>
      `;

      interventionsAvecDonnees.forEach((interv, index) => {
        const isRecent = index === 0;
        const dateFormatee = new Date(interv.date).toLocaleDateString('fr-FR');
        const typeTransmission = interv.typeTransmission || '';
        const typeLabel = typeTransmission ? ` - ${typeTransmission}` : '';
        
        html += `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; ${isRecent ? 'background: #eff6ff; border-color: #2563eb;' : 'background: white;'}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong style="color: #2563eb;">📅 ${dateFormatee}${typeLabel}</strong>
              ${isRecent ? '<span style="color: #2563eb; font-size: 0.9rem;">✨ Plus récent</span>' : ''}
            </div>
            ${genererContenuSection(interv, section)}
          </div>
        `;
      });
    }

    html += `</div>`;
    return html;
  }

  /**
   * Génère le contenu spécifique pour chaque section
   */
  function genererContenuSection(intervention, section) {
    switch (section) {
      case 'transmission':
        let htmlTransmission = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
        
        if (intervention.typeTransmission && intervention.typeTransmission.trim() !== '') {
          htmlTransmission += `<p style="margin: 0;"><strong>Type:</strong> ${intervention.typeTransmission}</p>`;
        }
        
        if (intervention.lieu && intervention.lieu.trim() !== '') {
          htmlTransmission += `<p style="margin: 0;"><strong>Lieu:</strong> ${intervention.lieu}</p>`;
        }
        
        if (intervention.adresse && intervention.adresse.trim() !== '') {
          htmlTransmission += `<p style="margin: 0;"><strong>Adresse:</strong> ${intervention.adresse}</p>`;
        }
        
        if (intervention.ville && intervention.ville.trim() !== '') {
          htmlTransmission += `<p style="margin: 0;"><strong>Ville:</strong> ${intervention.ville}</p>`;
        }
        
        if (intervention.signalement && intervention.signalement.trim() !== '') {
          htmlTransmission += `<p style="margin: 0;"><strong>Signalement:</strong> ${intervention.signalement}</p>`;
        }
        
        htmlTransmission += '</div>';
        return htmlTransmission;
      
      case 'type-intervention':
        let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
        
        // Type de transmission
        const typeInterv = intervention.typeIntervention || intervention.typeTransmission;
        if (typeInterv && typeInterv.trim() !== '') {
          html += `<p style="margin: 0;"><strong>Type:</strong> ${typeInterv}</p>`;
        }
        
        // Checkboxes Orly (pour PA et ADP)
        if (intervention.orly && typeof intervention.orly === 'object') {
          const orlyLabels = {
            premierContact: '1er contact',
            personnePresente: 'Personne présente',
            pnt: 'PNT',
            maraude: 'Maraude',
            veille: 'Veille',
            refusContact: 'Refus de contact'
          };
          
          const orlyChecked = Object.entries(intervention.orly)
            .filter(([key, val]) => val === true)
            .map(([key]) => orlyLabels[key] || key);
          
          if (orlyChecked.length > 0) {
            html += `
              <div style="margin-top: 0.5rem;">
                <strong>Type d'intervention :</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem;">
                  ${orlyChecked.map(label => `<span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.9rem;">✓ ${label}</span>`).join('')}
                </div>
              </div>
            `;
          }
        }
        
        html += '</div>';
        
        if (html === '<div style="display: flex; flex-direction: column; gap: 0.5rem;"></div>') {
          return '<p style="margin: 0; color: #9ca3af;">Aucune donnée</p>';
        }
        
        return html;
      
      case 'accompagnement':
        let accompagnements = [];
        
        // Format objet (nouveau)
        if (intervention.accompagnement && typeof intervention.accompagnement === 'object' && !Array.isArray(intervention.accompagnement)) {
          const labels = {
            hygiene: 'Hygiène',
            accueilJour: 'Accueil de jour',
            admin: 'Administratif',
            hebergement: 'Hébergement (CHU + LHSS)',
            medical: 'Médical',
            // Anciennes valeurs pour compatibilité
            ecoute: 'Écoute',
            orientation: 'Orientation',
            autre: 'Autre'
          };
          accompagnements = Object.entries(intervention.accompagnement)
            .filter(([key, val]) => val === true)
            .map(([key]) => labels[key] || key);
        }
        // Format tableau (ancien)
        else if (Array.isArray(intervention.accompagnement)) {
          accompagnements = intervention.accompagnement;
        }
        
        if (accompagnements.length > 0) {
          return `
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${accompagnements.map(acc => `<span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.9rem;">✓ ${acc}</span>`).join('')}
            </div>
          `;
        }
        return '<p style="margin: 0; color: #9ca3af;">Aucun accompagnement</p>';
      
      case 'distribution':
        let distributions = [];
        
        // Format objet (nouveau)
        if (intervention.distribution && typeof intervention.distribution === 'object' && !Array.isArray(intervention.distribution)) {
          const labels = {
            boisson: 'Boisson (Eau, Café, Thé)',
            alimentaire: 'Alimentaire',
            duvet: 'Duvets',
            couvertureSurvie: 'Couverture de survie',
            bonnetsGants: 'Bonnets/Gants/Tour de Cou',
            sousVetements: 'Sous-vêtements',
            kitsHygiene: 'Kits d\'hygiène',
            // Anciennes valeurs pour compatibilité
            vestimentaire: 'Vestimentaire',
            hygiene: 'Hygiène',
            couvertures: 'Couvertures',
            autre: 'Autre'
          };
          distributions = Object.entries(intervention.distribution)
            .filter(([key, val]) => val === true)
            .map(([key]) => labels[key] || key);
        }
        // Format tableau (ancien)
        else if (Array.isArray(intervention.distribution)) {
          distributions = intervention.distribution;
        }
        
        if (distributions.length > 0) {
          return `
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${distributions.map(dist => `<span style="display: inline-block; background: #dcfce7; color: #166534; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.9rem;">📦 ${dist}</span>`).join('')}
            </div>
          `;
        }
        return '<p style="margin: 0; color: #9ca3af;">Aucune distribution</p>';
      
      case 'contenu':
        const contenu = intervention.contenu || intervention.transmission || intervention.observations || '';
        if (contenu.trim() !== '') {
          return `
            <div style="background: #f9fafb; padding: 0.75rem; border-radius: 4px; border-left: 3px solid #2563eb;">
              <p style="margin: 0; white-space: pre-wrap; color: #374151;">${contenu}</p>
            </div>
          `;
        }
        return '<p style="margin: 0; color: #9ca3af;">Aucun contenu</p>';
      
      default:
        return '<p>Section non reconnue</p>';
    }
  }

  /**
   * Affiche un modal avec le contenu d'historique
   */
  function afficherModalHistoriqueSection(html) {
    // Variable pour éviter les double-clics
    let isClosing = false;
    
    // Créer le modal
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
    
    // Insérer le contenu
    content.innerHTML = html;
    
    // Fonction pour fermer le modal
    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.2s ease-out';
      
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }, 200);
    };
    
    // Créer le bouton de fermeture
    const footerDiv = document.createElement('div');
    footerDiv.style.cssText = 'margin-top: 1.5rem; text-align: right;';
    
    const btnClose = document.createElement('button');
    btnClose.textContent = 'Fermer';
    btnClose.type = 'button';
    btnClose.style.cssText = 'background: #2563eb; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;';
    
    btnClose.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
    
    footerDiv.appendChild(btnClose);
    content.appendChild(footerDiv);
    
    content.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    
    modal.appendChild(content);
    
    modal.style.opacity = '0';
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
      modal.style.transition = 'opacity 0.2s ease-in';
      modal.style.opacity = '1';
    });
    
    modal.addEventListener('mousedown', (e) => {
      if (e.target === modal) {
        e.preventDefault();
        closeModal();
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
  window.afficherHistoriqueInterventions = afficherHistoriqueInterventions;

  console.log('✅ Système d\'historisation des informations chargé');
})();


