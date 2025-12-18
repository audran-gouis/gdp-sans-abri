/**
 * Gestion de l'onglet Archives
 * Affiche les personnes archivées avec possibilité de restauration
 */

(function() {
  'use strict';

  /**
   * Affiche toutes les personnes archivées
   */
  async function afficherToutesLesPersonnesArchives() {
    const container = document.getElementById('archives-list');
    if (!container) {
      console.warn('Container archives-list non trouvé');
      return;
    }

    try {
      // Utiliser la fonction globale pour charger les personnes
      let personnes;
      if (typeof window.chargerToutesLesPersonnesAvecInterventions === 'function') {
        personnes = await window.chargerToutesLesPersonnesAvecInterventions();
      } else {
        // Fallback
        personnes = await window.getAllPersonnes();
      }
      
      console.log(`${personnes.length} personnes chargées pour Archives`);
      
      // Filtrer uniquement les personnes archivées
      const personnesArchivees = personnes.filter(p => p.archive === true);
      console.log(`${personnesArchivees.length} personnes archivées trouvées`);
      
      // Appliquer les filtres
      const personnesFiltrees = appliquerFiltresArchives(personnesArchivees);
      console.log(`${personnesFiltrees.length} personnes après filtrage`);

      if (personnesFiltrees.length === 0) {
        container.innerHTML = `
          <div class="empty-archives">
            <h3>Aucune fiche archivée</h3>
            <p>Les fiches archivées apparaîtront ici.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = personnesFiltrees.map(personne => {
        const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
          departement: personne.departement || '',
          typologie: personne.typologie || ''
        };
        
        const personneNom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim() || 'Non renseigné';
        const dateArchivage = personne.dateArchivage ? new Date(personne.dateArchivage).toLocaleDateString('fr-FR') : '';
        
        // Compter les interventions
        const nbInterventions = (personne.transmissions?.length || 0) + 
                                (personne.adp?.length || 0) + 
                                (personne.pointAccueil?.length || 0);

        return `
          <div class="transmission-card archived" data-personne-id="${personne.id}">
            <div class="card-header">
              <h3>${personneNom} <span class="archive-badge">Archivée</span></h3>
              <div class="card-badges">
                ${dateArchivage ? `<span class="badge-info">Archivée le ${dateArchivage}</span>` : ''}
              </div>
            </div>
            <div class="card-body">
              ${personne.descriptionPhysique ? `<p><strong>Description:</strong> ${personne.descriptionPhysique}</p>` : ''}
              ${personne.dateNaissance ? `<p><strong>Date de naissance:</strong> ${new Date(personne.dateNaissance).toLocaleDateString('fr-FR')}</p>` : ''}
              ${dernieresInfos.departement ? `<p><strong>Département:</strong> ${dernieresInfos.departement}</p>` : ''}
              ${dernieresInfos.typologie ? `<p><strong>Typologie:</strong> ${dernieresInfos.typologie}</p>` : ''}
              <p><strong>Interventions:</strong> ${nbInterventions}</p>
            </div>
            <div class="card-actions">
              <button class="btn-card btn-restore" data-personne-id="${personne.id}">Restaurer</button>
            </div>
          </div>
        `;
      }).join('');

      // Attacher les événements de restauration
      container.querySelectorAll('.btn-restore').forEach(btn => {
        btn.addEventListener('click', () => {
          const personneId = parseInt(btn.dataset.personneId);
          restaurerPersonne(personneId);
        });
      });
      
      // Initialiser les filtres après le rendu (si pas déjà fait)
      initFiltresArchives();

    } catch (error) {
      console.error('Erreur chargement archives:', error);
      container.innerHTML = '<p class="empty-message">Erreur lors du chargement des archives</p>';
    }
  }

  /**
   * Applique les filtres aux personnes archivées
   */
  function appliquerFiltresArchives(personnes) {
    const filtreNom = document.getElementById('filter-archives-nom')?.value.toLowerCase().trim() || '';
    const filtrePrenom = document.getElementById('filter-archives-prenom')?.value.toLowerCase().trim() || '';
    const filtreDdn = document.getElementById('filter-archives-ddn')?.value || '';
    const filtreInconnu = document.getElementById('filter-archives-inconnu')?.value || '';
    const filtreDescription = document.getElementById('filter-archives-description')?.value.toLowerCase().trim() || '';
    const filtreTypologie = document.getElementById('filter-archives-typologie')?.value.toLowerCase().trim() || '';
    const filtreDepartement = document.getElementById('filter-archives-departement')?.value.toLowerCase().trim() || '';

    return personnes.filter(personne => {
      // Filtre Nom (avec fuzzyMatch si disponible)
      if (filtreNom) {
        const nom = personne.nom || '';
        if (typeof window.fuzzyMatch === 'function') {
          if (!window.fuzzyMatch(nom, filtreNom)) return false;
        } else {
          if (!nom.toLowerCase().includes(filtreNom)) return false;
        }
      }

      // Filtre Prénom (avec fuzzyMatch si disponible)
      if (filtrePrenom) {
        const prenom = personne.prenom || '';
        if (typeof window.fuzzyMatch === 'function') {
          if (!window.fuzzyMatch(prenom, filtrePrenom)) return false;
        } else {
          if (!prenom.toLowerCase().includes(filtrePrenom)) return false;
        }
      }

      // Filtre Date de naissance
      if (filtreDdn && personne.dateNaissance !== filtreDdn) {
        return false;
      }

      // Filtre Connus/Inconnus
      if (filtreInconnu === 'connus' && personne.inconnu) {
        return false;
      }
      if (filtreInconnu === 'inconnus' && !personne.inconnu) {
        return false;
      }

      // Filtre Description (avec fuzzyMatch si disponible)
      if (filtreDescription) {
        const description = personne.descriptionPhysique || '';
        if (typeof window.fuzzyMatch === 'function') {
          if (!window.fuzzyMatch(description, filtreDescription)) return false;
        } else {
          if (!description.toLowerCase().includes(filtreDescription)) return false;
        }
      }

      // Filtre Typologie (avec fuzzyMatch si disponible)
      if (filtreTypologie) {
        const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : { typologie: personne.typologie || '' };
        const typologie = dernieresInfos.typologie || '';
        if (typeof window.fuzzyMatch === 'function') {
          if (!window.fuzzyMatch(typologie, filtreTypologie)) return false;
        } else {
          if (!typologie.toLowerCase().includes(filtreTypologie)) return false;
        }
      }

      // Filtre Département
      if (filtreDepartement) {
        const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : { departement: personne.departement || '' };
        const departement = dernieresInfos.departement || '';
        if (!departement.toLowerCase().includes(filtreDepartement)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Restaure une personne archivée
   */
  async function restaurerPersonne(personneId) {
    try {
      const personne = await window.getPersonneById(personneId);
      
      if (!personne) {
        await window.customAlert('Erreur : Personne non trouvée', 'error');
        return;
      }
      
      const nom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim();
      
      const confirmation = await window.customConfirm(`Voulez-vous restaurer la fiche de ${nom} ?\n\nLa fiche redeviendra visible dans les listes et comptera dans les statistiques.`, 'Restaurer');
      if (!confirmation) {
        return;
      }
      
      // Restaurer la personne
      await window.updatePersonne(personneId, {
        archive: false,
        dateArchivage: null
      });
      
      console.log('Personne restaurée:', personneId);
      
      // Rafraîchir l'affichage des archives
      await afficherToutesLesPersonnesArchives();
      
      window.showToast(`Fiche restaurée ! ${nom} est de nouveau visible dans les listes.`, 'success');
      
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      await window.customAlert('Erreur lors de la restauration : ' + error.message, 'error');
    }
  }

  /**
   * Initialise les filtres de l'onglet Archives
   */
  let filtresInitialises = false;
  
  function initFiltresArchives() {
    if (filtresInitialises) return;
    
    const filtres = [
      'filter-archives-nom',
      'filter-archives-prenom',
      'filter-archives-ddn',
      'filter-archives-inconnu',
      'filter-archives-description',
      'filter-archives-typologie',
      'filter-archives-departement'
    ];

    let nbFiltresTrouves = 0;
    filtres.forEach(filtreId => {
      const element = document.getElementById(filtreId);
      if (element) {
        nbFiltresTrouves++;
        element.addEventListener('input', () => {
          console.log(`Filtre ${filtreId} modifié`);
          afficherToutesLesPersonnesArchives();
        });
      }
    });
    
    if (nbFiltresTrouves > 0) {
      filtresInitialises = true;
      console.log(`Filtres Archives initialisés : ${nbFiltresTrouves}/${filtres.length}`);
    }
  }

  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM chargé, tentative init filtres Archives');
      setTimeout(initFiltresArchives, 500);
    });
  } else {
    console.log('DOM déjà chargé, tentative init filtres Archives');
    setTimeout(initFiltresArchives, 500);
  }

  // Exposer les fonctions globalement
  window.afficherToutesLesPersonnesArchives = afficherToutesLesPersonnesArchives;
  window.restaurerPersonne = restaurerPersonne;
  window.initFiltresArchives = initFiltresArchives;

  console.log('Module Archives chargé');
})();

