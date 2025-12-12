/**
 * Code métier ADP - Ajout personne complète avec BASE UNIFIÉE
 * Utilise database-unified.js
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Trouve une intervention ADP par personneId et date
 */
async function findAdpByPersonAndDate(personneId, date) {
  const interventions = await window.getInterventionsByPersonneAndDate(personneId, date);
  console.log('🔍 Recherche ADP pour personneId:', personneId, 'date:', date);
  const found = interventions.find(i => i.type === 'adp');
  console.log('🔍 ADP trouvée:', found ? `ID ${found.id}` : 'Aucune');
  return found;
}

/**
 * Édite une intervention ADP pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB unifiée
 */
async function editTransmissionAdp(personneId) {
  console.log('📝 Compléter l\'ADP pour personne ID:', personneId);
  
  try {
    // Charger la personne depuis la DB unifiée
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      alert('Erreur lors du chargement des données');
      return;
    }
    
    console.log('✅ Personne trouvée:', personne);
    const selectedDate = document.getElementById('adp-date')?.value;
    console.log('📅 Date sélectionnée:', selectedDate);
    
    // Chercher si une ADP existe pour cette personne à cette date
    const existingAdp = await findAdpByPersonAndDate(personneId, selectedDate);
    
    console.log('📋 ADP existante:', existingAdp ? `ID ${existingAdp.id}` : 'Aucune');
    
    // Récupérer les DERNIÈRES infos connues (pour pré-remplir le formulaire)
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Remplir les champs avec les infos de la personne
    document.getElementById('adp-form-nom').value = personne.nom || '';
    document.getElementById('adp-form-prenom').value = personne.prenom || '';
    document.getElementById('adp-form-ddn').value = personne.dateNaissance || '';
    document.getElementById('adp-form-description').value = personne.descriptionPhysique || '';
    document.getElementById('adp-form-inconnu').checked = personne.inconnu || false;
    document.getElementById('adp-form-departement').value = dernieresInfos.departement;
    document.getElementById('adp-form-typologie').value = dernieresInfos.typologie;
    document.getElementById('adp-form-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('adp-form-mineurs').value = dernieresInfos.mineurs;
    
    if (existingAdp) {
      // MODE ÉDITION : charger toutes les données de l'ADP
      console.log('✅ ADP existante pour cette date - MODE ÉDITION');
      document.getElementById('adp-form-type-transmission').value = existingAdp.typeTransmission || '';
      document.getElementById('adp-form-adresse').value = existingAdp.lieu || '';
      document.getElementById('adp-form-ville').value = existingAdp.ville || '';
      document.getElementById('adp-form-signalement').value = existingAdp.signalement || '';
      document.getElementById('adp-form-transmission').value = existingAdp.observations || '';
      
      // Checkboxes Orly
      if (existingAdp.orly) {
        document.getElementById('adp-form-premier-contact').checked = existingAdp.orly.premierContact || false;
        document.getElementById('adp-form-personne-presente').checked = existingAdp.orly.personnePresente || false;
        document.getElementById('adp-form-pnt').checked = existingAdp.orly.pnt || false;
        document.getElementById('adp-form-maraude').checked = existingAdp.orly.maraude || false;
        document.getElementById('adp-form-veille').checked = existingAdp.orly.veille || false;
        document.getElementById('adp-form-refus-contact').checked = existingAdp.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingAdp.accompagnement) {
        document.getElementById('adp-form-accomp-ecoute').checked = existingAdp.accompagnement.ecoute || false;
        document.getElementById('adp-form-accomp-orientation').checked = existingAdp.accompagnement.orientation || false;
        document.getElementById('adp-form-accomp-admin').checked = existingAdp.accompagnement.admin || false;
        document.getElementById('adp-form-accomp-medical').checked = existingAdp.accompagnement.medical || false;
        document.getElementById('adp-form-accomp-hebergement').checked = existingAdp.accompagnement.hebergement || false;
        document.getElementById('adp-form-accomp-autre').checked = existingAdp.accompagnement.autre || false;
      }
      
      // Checkboxes Distribution
      if (existingAdp.distribution) {
        document.getElementById('adp-form-distrib-alimentaire').checked = existingAdp.distribution.alimentaire || false;
        document.getElementById('adp-form-distrib-vestimentaire').checked = existingAdp.distribution.vestimentaire || false;
        document.getElementById('adp-form-distrib-hygiene').checked = existingAdp.distribution.hygiene || false;
        document.getElementById('adp-form-distrib-couvertures').checked = existingAdp.distribution.couvertures || false;
        document.getElementById('adp-form-distrib-duvet').checked = existingAdp.distribution.duvet || false;
        document.getElementById('adp-form-distrib-autre').checked = existingAdp.distribution.autre || false;
      }
      
      document.getElementById('modal-adp').dataset.editId = existingAdp.id;
      console.log('🔖 editId défini à:', existingAdp.id);
    } else {
      // MODE CRÉATION : réinitialiser les champs d'intervention
      console.log('➕ Pas d\'ADP pour cette date - MODE CRÉATION');
      document.getElementById('adp-form-type-transmission').value = '';
      document.getElementById('adp-form-adresse').value = '';
      document.getElementById('adp-form-ville').value = '';
      document.getElementById('adp-form-signalement').value = '';
      document.getElementById('adp-form-transmission').value = '';
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-adp input[type="checkbox"]').forEach(cb => {
        if (cb.id !== 'adp-form-inconnu') { // Ne pas décocher "inconnu"
          cb.checked = false;
        }
      });
      
      delete document.getElementById('modal-adp').dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle ADP');
    }
    
    document.getElementById('modal-adp').dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
    // Replier automatiquement la section "Informations Personnelles" pour une personne existante
    const gridInfoPerso = document.getElementById('adp-grid-info-perso');
    const toggleIcon = document.querySelector('#adp-section-info-perso .collapse-toggle');
    if (gridInfoPerso && toggleIcon) {
      gridInfoPerso.style.display = 'none';
      toggleIcon.classList.add('collapsed');
      console.log('📁 Section Informations Personnelles repliée automatiquement (ADP)');
    }
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-adp');
    if (modal) {
    modal.classList.add('show');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
    alert('Erreur lors du chargement des données');
  }
}

/**
 * Initialise les filtres ADP
 */
function initAdpFilters() {
  const filterNom = document.getElementById('adp-filter-nom');
  const filterPrenom = document.getElementById('adp-filter-prenom');
  const filterDdn = document.getElementById('adp-filter-ddn');
  const filterInconnu = document.getElementById('adp-filter-inconnu');
  const filterDescription = document.getElementById('adp-filter-description');

  if (filterNom) {
    filterNom.addEventListener('input', () => {
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
      }
    });
  }

  if (filterPrenom) {
    filterPrenom.addEventListener('input', () => {
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
      }
    });
  }

  if (filterDdn) {
    filterDdn.addEventListener('change', () => {
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
      }
    });
  }

  if (filterInconnu) {
    filterInconnu.addEventListener('change', () => {
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
      }
    });
  }

  if (filterDescription) {
    filterDescription.addEventListener('input', () => {
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        window.afficherToutesLesPersonnesADP();
      }
    });
  }

  console.log('✅ Filtres ADP initialisés');
}

/**
 * Initialise le formulaire ADP
 */
function initAdpForm() {
  const btnAjouter = document.getElementById('adp-btn-ajouter');
  const modal = document.getElementById('modal-adp');
  const formAdp = document.getElementById('form-adp');
  const btnAnnuler = document.getElementById('adp-btn-annuler');
  const modalClose = document.querySelector('#modal-adp .adp-modal-close');
  
  if (!btnAjouter || !modal || !formAdp) {
    console.warn('⚠️ Éléments formulaire ADP non trouvés');
    return;
  }
  
  /**
   * Obtient la date à utiliser par défaut
   */
  function getDateParDefaut() {
    const maintenant = new Date();
    const heures = maintenant.getHours();
    
    if (heures >= 0 && heures < 3) {
      maintenant.setDate(maintenant.getDate() - 1);
    }
    
    return maintenant.toISOString().split('T')[0];
  }
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    formAdp.reset();
    delete modal.dataset.editId;
    delete modal.dataset.personneId;
    
    const dateAdp = document.getElementById('adp-date');
    if (dateAdp && !dateAdp.value) {
      dateAdp.value = getDateParDefaut();
      console.log('📅 Date ADP initialisée à:', dateAdp.value);
    }
    
    modal.classList.add('show');
  });
  
  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    formAdp.reset();
    delete modal.dataset.editId;
    delete modal.dataset.personneId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Initialiser l'auto-complétion de la typologie
  if (typeof window.initTypologieAutocomplete === 'function') {
    window.initTypologieAutocomplete();
    console.log('✅ Auto-complétion typologie initialisée pour ADP');
  }
  
  // Soumettre le formulaire
  formAdp.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = modal.dataset.editId;
    const personneId = modal.dataset.personneId ? parseInt(modal.dataset.personneId) : null;
    const selectedDate = document.getElementById('adp-date')?.value || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire ADP - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    try {
      // Données de la personne
      const personneData = {
        nom: document.getElementById('adp-form-nom').value,
        prenom: document.getElementById('adp-form-prenom').value,
        dateNaissance: document.getElementById('adp-form-ddn').value,
        descriptionPhysique: document.getElementById('adp-form-description').value,
        inconnu: document.getElementById('adp-form-inconnu').checked
        // NOTE: departement, typologie, nbPersonnes, mineurs sont gérés via infoHistorique
      };
      
      // Données de l'intervention ADP
      const interventionData = {
      typeTransmission: document.getElementById('adp-form-type-transmission').value,
        lieu: document.getElementById('adp-form-adresse').value,
      ville: document.getElementById('adp-form-ville').value,
      signalement: document.getElementById('adp-form-signalement').value,
        observations: document.getElementById('adp-form-transmission').value,
        date: selectedDate,
        type: 'adp',
      orly: {
          premierContact: document.getElementById('adp-form-premier-contact')?.checked || false,
        personnePresente: document.getElementById('adp-form-personne-presente')?.checked || false,
        pnt: document.getElementById('adp-form-pnt')?.checked || false,
        maraude: document.getElementById('adp-form-maraude')?.checked || false,
        veille: document.getElementById('adp-form-veille')?.checked || false,
        refusContact: document.getElementById('adp-form-refus-contact')?.checked || false
      },
      accompagnement: {
        ecoute: document.getElementById('adp-form-accomp-ecoute')?.checked || false,
        orientation: document.getElementById('adp-form-accomp-orientation')?.checked || false,
        admin: document.getElementById('adp-form-accomp-admin')?.checked || false,
        medical: document.getElementById('adp-form-accomp-medical')?.checked || false,
        hebergement: document.getElementById('adp-form-accomp-hebergement')?.checked || false,
        autre: document.getElementById('adp-form-accomp-autre')?.checked || false
      },
      distribution: {
        alimentaire: document.getElementById('adp-form-distrib-alimentaire')?.checked || false,
        vestimentaire: document.getElementById('adp-form-distrib-vestimentaire')?.checked || false,
        hygiene: document.getElementById('adp-form-distrib-hygiene')?.checked || false,
        couvertures: document.getElementById('adp-form-distrib-couvertures')?.checked || false,
        duvet: document.getElementById('adp-form-distrib-duvet')?.checked || false,
        autre: document.getElementById('adp-form-distrib-autre')?.checked || false
      }
    };
    
      let finalPersonneId = personneId;
      
      if (personneId) {
        // Charger la personne existante pour gérer l'historisation
        const personneExistante = await window.getPersonneById(personneId);
        
        // Détecter si les infos historisées ont changé
        if (window.ajouterVersionInfos && personneExistante) {
          const nouvellesInfos = {
            departement: document.getElementById('adp-form-departement').value || '',
            typologie: document.getElementById('adp-form-typologie').value,
            nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
            mineurs: document.getElementById('adp-form-mineurs').value
          };
          
          // Ajouter une version dans l'historique si changement détecté
          const historiqueMAJ = window.ajouterVersionInfos(
            personneExistante, 
            selectedDate, 
            nouvellesInfos
          );
          
          console.log('📋 Historique mis à jour:', historiqueMAJ);
          
          // Mettre à jour UNIQUEMENT l'historique
          personneData.infoHistorique = historiqueMAJ;
        }
        
        // Mettre à jour la personne existante
        await window.updatePersonne(personneId, personneData);
        console.log('✅ Personne mise à jour, ID:', personneId);
      } else {
        // Créer ou récupérer la personne
        finalPersonneId = await window.creerOuRecupererPersonne(personneData);
        console.log('✅ Personne créée/récupérée, ID:', finalPersonneId);
        
        // Initialiser l'historique pour une nouvelle personne
        if (window.ajouterVersionInfos) {
          const personneCreee = await window.getPersonneById(finalPersonneId);
          if (personneCreee) {
            const infosInitiales = {
              departement: document.getElementById('adp-form-departement').value || '',
              typologie: document.getElementById('adp-form-typologie').value,
              nbPersonnes: document.getElementById('adp-form-nb-personnes').value,
              mineurs: document.getElementById('adp-form-mineurs').value
            };
            const historiqueInit = window.ajouterVersionInfos(
              personneCreee,
              selectedDate,
              infosInitiales
            );
            await window.updatePersonne(finalPersonneId, { infoHistorique: historiqueInit });
            console.log('📋 Historique initialisé pour nouvelle personne');
          }
        }
      }
      
      // Ajouter personneId à l'intervention
      interventionData.personneId = finalPersonneId;
      
      if (editId) {
        // Mettre à jour l'intervention existante
        await window.updateIntervention(parseInt(editId), interventionData);
        console.log('✅ Intervention ADP mise à jour, ID:', editId);
      } else {
        // Créer une nouvelle intervention
        const interventionId = await window.ajouterIntervention(interventionData);
        console.log('✅ Nouvelle intervention ADP créée, ID:', interventionId);
      }
      
      // Fermer la modal et rafraîchir
      closeModal();
      await window.afficherToutesLesPersonnesADP();
      console.log('✅ ADP enregistrée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement : ' + error.message);
    }
  });
  
  console.log('✅ Formulaire ADP initialisé (Base Unifiée)');
}

// Exposer les fonctions globalement
  window.editTransmissionAdp = editTransmissionAdp;
  window.initAdpForm = initAdpForm;
  window.initAdpFilters = initAdpFilters;

console.log('✅ Module ADP chargé (Base Unifiée)');
