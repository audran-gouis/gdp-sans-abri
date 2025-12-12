/**
 * Module d'intégration de la gestion des doublons dans l'application principale
 */
(function() {
  'use strict';

  /**
   * Vérifie automatiquement les doublons potentiels avant de créer une nouvelle personne
   * @param {Object} infosPersonne - Informations de la personne à créer
   * @returns {Promise<Array>} Liste des doublons potentiels trouvés
   */
  const verifierDoublonsAvantCreation = async (infosPersonne) => {
    const personnes = await getAllPersonnes();
    const doublonsPotentiels = [];
    
    const nomRecherche = (infosPersonne.nom || '').toLowerCase().trim();
    const prenomRecherche = (infosPersonne.prenom || '').toLowerCase().trim();
    const ddnRecherche = infosPersonne.dateNaissance;
    
    for (const personne of personnes) {
      // Ne pas comparer avec les inconnus
      if (personne.inconnu || infosPersonne.inconnu) continue;
      
      const nomExistant = (personne.nom || '').toLowerCase().trim();
      const prenomExistant = (personne.prenom || '').toLowerCase().trim();
      
      // Vérifier si c'est un doublon potentiel
      const memeNom = nomRecherche && nomExistant === nomRecherche;
      const memePrenom = prenomRecherche && prenomExistant === prenomRecherche;
      const memeDdn = ddnRecherche && personne.dateNaissance === ddnRecherche;
      
      if ((memeNom && memePrenom) || (memeDdn && (memeNom || memePrenom))) {
        const interventions = await getInterventionsByPersonneId(personne.id);
        doublonsPotentiels.push({
          ...personne,
          nbInterventions: interventions.length
        });
      }
    }
    
    return doublonsPotentiels;
  };

  /**
   * Affiche une modale d'avertissement si des doublons sont détectés
   * @param {Array} doublons - Liste des doublons potentiels
   * @returns {Promise<Object>} Action choisie par l'utilisateur
   */
  const afficherAvertissementDoublons = (doublons) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal-doublon-warning';
      modal.innerHTML = `
        <div class="modal-doublon-overlay"></div>
        <div class="modal-doublon-content">
          <div class="modal-doublon-header">
            <h2>⚠️ Doublons potentiels détectés</h2>
          </div>
          <div class="modal-doublon-body">
            <p>Les fiches suivantes ressemblent à celle que vous essayez de créer :</p>
            <div class="doublons-list">
              ${doublons.map(d => `
                <div class="doublon-item" data-id="${d.id}">
                  <div class="doublon-info">
                    <strong>${d.nom} ${d.prenom}</strong>
                    <small>Date de naissance: ${d.dateNaissance || 'Non renseignée'}</small>
                    <small>${d.nbInterventions} intervention(s)</small>
                  </div>
                  <button class="btn-utiliser" data-id="${d.id}">
                    Utiliser cette fiche
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-doublon-footer">
            <button class="btn btn-secondary btn-annuler">Annuler</button>
            <button class="btn btn-primary btn-creer-quand-meme">Créer une nouvelle fiche</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Style de la modale
      const style = document.createElement('style');
      style.textContent = `
        .modal-doublon-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-doublon-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
        }
        .modal-doublon-content {
          position: relative;
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-doublon-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .modal-doublon-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a202c;
        }
        .modal-doublon-body {
          padding: 24px;
          overflow-y: auto;
        }
        .modal-doublon-body p {
          margin: 0 0 16px 0;
          color: #4b5563;
        }
        .doublons-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .doublon-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .doublon-item:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .doublon-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .doublon-info strong {
          color: #1a202c;
          font-size: 16px;
        }
        .doublon-info small {
          color: #6b7280;
          font-size: 13px;
        }
        .btn-utiliser {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-utiliser:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }
        .modal-doublon-footer {
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
      `;
      document.head.appendChild(style);
      
      // Gestion des événements
      modal.querySelector('.btn-annuler').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve({ action: 'annuler' });
      });
      
      modal.querySelector('.btn-creer-quand-meme').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve({ action: 'creer' });
      });
      
      modal.querySelectorAll('.btn-utiliser').forEach(btn => {
        btn.addEventListener('click', () => {
          const personneId = parseInt(btn.dataset.id);
          document.body.removeChild(modal);
          document.head.removeChild(style);
          resolve({ action: 'utiliser', personneId });
        });
      });
    });
  };

  /**
   * Wrapper pour creerOuRecupererPersonne avec vérification des doublons
   */
  const creerOuRecupererPersonneAvecVerification = async (infos, options = {}) => {
    const { verifierDoublons = true, afficherAvertissement = true } = options;
    
    // Si la vérification est désactivée, utiliser la fonction originale
    if (!verifierDoublons) {
      return await creerOuRecupererPersonne(infos);
    }
    
    // Vérifier les doublons
    const doublons = await verifierDoublonsAvantCreation(infos);
    
    // Si des doublons sont trouvés et qu'on doit afficher l'avertissement
    if (doublons.length > 0 && afficherAvertissement) {
      const resultat = await afficherAvertissementDoublons(doublons);
      
      if (resultat.action === 'annuler') {
        throw new Error('Création annulée par l\'utilisateur');
      } else if (resultat.action === 'utiliser') {
        return resultat.personneId;
      }
      // Sinon, continuer avec la création
    }
    
    // Créer la personne normalement
    return await creerOuRecupererPersonne(infos);
  };

  /**
   * Ouvre la page de gestion des doublons dans une nouvelle fenêtre
   */
  const ouvrirGestionDoublons = () => {
    const width = 1400;
    const height = 900;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(
      'fonctionnalites/persistance_complet/gestion-doublons.html',
      'gestion-doublons',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  /**
   * Ajoute un badge de notification s'il y a des doublons
   */
  const ajouterBadgeDoublons = async () => {
    try {
      const rapport = await genererRapportDoublons();
      const totalDoublons = rapport.doublonsPersonnes.nombre + rapport.doublonsInterventions.nombre;
      
      if (totalDoublons > 0) {
        // Créer un badge de notification
        const badge = document.createElement('div');
        badge.id = 'badge-doublons';
        badge.innerHTML = `
          <button class="btn-badge-doublons" title="Gérer les doublons">
            <span class="icon">🔍</span>
            <span class="count">${totalDoublons}</span>
          </button>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          #badge-doublons {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
          }
          .btn-badge-doublons {
            position: relative;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
            border: none;
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .btn-badge-doublons:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 30px rgba(239, 68, 68, 0.6);
          }
          .btn-badge-doublons .icon {
            font-size: 24px;
          }
          .btn-badge-doublons .count {
            position: absolute;
            top: -4px;
            right: -4px;
            background: white;
            color: #ef4444;
            font-weight: 700;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .btn-badge-doublons {
            animation: pulse 2s infinite;
          }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(badge);
        
        badge.querySelector('.btn-badge-doublons').addEventListener('click', ouvrirGestionDoublons);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des doublons:', error);
    }
  };

  // Exporter les fonctions
  window.verifierDoublonsAvantCreation = verifierDoublonsAvantCreation;
  window.afficherAvertissementDoublons = afficherAvertissementDoublons;
  window.creerOuRecupererPersonneAvecVerification = creerOuRecupererPersonneAvecVerification;
  window.ouvrirGestionDoublons = ouvrirGestionDoublons;
  window.ajouterBadgeDoublons = ajouterBadgeDoublons;

  console.log('🔗 Module Intégration Doublons chargé');

  // Badge désactivé par défaut
  // Pour l'activer manuellement : ajouterBadgeDoublons()
})();

