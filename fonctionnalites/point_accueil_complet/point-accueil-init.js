/**
 * Code métier Point Accueil - BASE UNIFIÉE
 * Utilise database-unified.js
 */

// ==================== FONCTIONS UTILITAIRES ====================

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

/**
 * Trouve une intervention Point Accueil par personneId et date
 */
async function findPAByPersonAndDate(personneId, date) {
  const interventions = await window.getInterventionsByPersonneAndDate(personneId, date);
  console.log('🔍 Recherche PA pour personneId:', personneId, 'date:', date);
  const found = interventions.find(i => i.type === 'pointAccueil');
  console.log('🔍 PA trouvée:', found ? `ID ${found.id}` : 'Aucune');
  return found;
}

/**
 * Édite une intervention Point Accueil pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB unifiée
 */
async function modifierFichePA(personneId) {
  console.log('📝 Compléter le Point Accueil pour personne ID:', personneId);
  
  try {
    // Charger la personne depuis la DB unifiée
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      alert('Erreur lors du chargement des données');
      return;
    }
    
    console.log('✅ Personne trouvée:', personne);
    const selectedDate = document.getElementById('pa-date')?.value;
    console.log('📅 Date sélectionnée:', selectedDate);
    
    // Chercher si une fiche PA existe pour cette personne à cette date
    const existingPA = await findPAByPersonAndDate(personneId, selectedDate);
    
    console.log('📋 PA existante:', existingPA ? `ID ${existingPA.id}` : 'Aucune');
    
    const formPA = document.getElementById('form-point-accueil');
    
    // Remplir les champs avec les infos de la personne
    document.getElementById('form-pa-nom').value = personne.nom || '';
    document.getElementById('form-pa-prenom').value = personne.prenom || '';
    document.getElementById('form-pa-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-pa-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-pa-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-pa-departement').value = personne.departement || '';
    document.getElementById('form-pa-typologie').value = personne.typologie || '';
    document.getElementById('form-pa-nb-personnes').value = personne.nbPersonnes || '';
    document.getElementById('form-pa-mineurs').value = personne.mineurs || '';
    
    if (existingPA) {
      // MODE ÉDITION : charger toutes les données de la fiche PA
      console.log('✅ Fiche PA existante pour cette date - MODE ÉDITION');
      document.getElementById('form-pa-type-transmission').value = existingPA.typeTransmission || '';
      document.getElementById('form-pa-adresse').value = existingPA.lieu || '';
      document.getElementById('form-pa-ville').value = existingPA.ville || '';
      document.getElementById('form-pa-signalement').value = existingPA.signalement || '';
      document.getElementById('form-pa-transmission').value = existingPA.observations || '';
      
      // Checkboxes Orly
      if (existingPA.orly) {
        document.getElementById('form-pa-premier-contact').checked = existingPA.orly.premierContact || false;
        document.getElementById('form-pa-personne-presente').checked = existingPA.orly.personnePresente || false;
        document.getElementById('form-pa-pnt').checked = existingPA.orly.pnt || false;
        document.getElementById('form-pa-maraude').checked = existingPA.orly.maraude || false;
        document.getElementById('form-pa-veille').checked = existingPA.orly.veille || false;
        document.getElementById('form-pa-refus-contact').checked = existingPA.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingPA.accompagnement) {
        document.getElementById('form-pa-accomp-ecoute').checked = existingPA.accompagnement.ecoute || false;
        document.getElementById('form-pa-accomp-orientation').checked = existingPA.accompagnement.orientation || false;
        document.getElementById('form-pa-accomp-admin').checked = existingPA.accompagnement.admin || false;
        document.getElementById('form-pa-accomp-medical').checked = existingPA.accompagnement.medical || false;
        document.getElementById('form-pa-accomp-hebergement').checked = existingPA.accompagnement.hebergement || false;
        document.getElementById('form-pa-accomp-autre').checked = existingPA.accompagnement.autre || false;
      }
      
      // Checkboxes Distribution
      if (existingPA.distribution) {
        document.getElementById('form-pa-distrib-alimentaire').checked = existingPA.distribution.alimentaire || false;
        document.getElementById('form-pa-distrib-vestimentaire').checked = existingPA.distribution.vestimentaire || false;
        document.getElementById('form-pa-distrib-hygiene').checked = existingPA.distribution.hygiene || false;
        document.getElementById('form-pa-distrib-couvertures').checked = existingPA.distribution.couvertures || false;
        document.getElementById('form-pa-distrib-duvet').checked = existingPA.distribution.duvet || false;
        document.getElementById('form-pa-distrib-autre').checked = existingPA.distribution.autre || false;
      }
      
      formPA.dataset.editId = existingPA.id;
      console.log('🔖 editId défini à:', existingPA.id);
    } else {
      // MODE CRÉATION : réinitialiser les champs d'intervention
      console.log('➕ Pas de fiche PA pour cette date - MODE CRÉATION');
      document.getElementById('form-pa-type-transmission').value = '';
      document.getElementById('form-pa-adresse').value = '';
      document.getElementById('form-pa-ville').value = '';
      document.getElementById('form-pa-signalement').value = '';
      document.getElementById('form-pa-transmission').value = '';
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-point-accueil input[type="checkbox"]').forEach(cb => {
        if (cb.id !== 'form-pa-inconnu') { // Ne pas décocher "inconnu"
          cb.checked = false;
        }
      });
      
      delete formPA.dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle fiche PA');
    }
    
    formPA.dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-point-accueil');
    if (modal) {
      modal.classList.add('show');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
    alert('Erreur lors du chargement des données');
  }
}

/**
 * Initialise les filtres Point Accueil
 */
function initPAFilters() {
  const filterNom = document.getElementById('pa-filter-nom');
  const filterPrenom = document.getElementById('pa-filter-prenom');
  const filterDdn = document.getElementById('pa-filter-ddn');
  const filterInconnu = document.getElementById('pa-filter-inconnu');
  const filterDescription = document.getElementById('pa-filter-description');

  if (filterNom) {
    filterNom.addEventListener('input', () => {
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
  }

  if (filterPrenom) {
    filterPrenom.addEventListener('input', () => {
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
  }

  if (filterDdn) {
    filterDdn.addEventListener('change', () => {
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
  }

  if (filterInconnu) {
    filterInconnu.addEventListener('change', () => {
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
  }

  if (filterDescription) {
    filterDescription.addEventListener('input', () => {
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        window.afficherToutesLesPersonnesPA();
      }
    });
  }

  console.log('✅ Filtres Point Accueil initialisés');
}

/**
 * Initialise le formulaire Point Accueil
 */
function initPointAccueilForm() {
  const btnAjouter = document.getElementById('btn-ajouter-pa');
  const modal = document.getElementById('modal-point-accueil');
  const formPA = document.getElementById('form-point-accueil');
  const btnAnnuler = document.getElementById('pa-btn-annuler');
  const modalClose = document.querySelector('.pa-modal-close');
  
  if (!btnAjouter || !modal || !formPA) {
    console.warn('⚠️ Éléments formulaire Point Accueil non trouvés');
    return;
  }
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    formPA.reset();
    delete formPA.dataset.editId;
    delete formPA.dataset.personneId;
    
    const datePA = document.getElementById('pa-date');
    if (datePA && !datePA.value) {
      datePA.value = getDateParDefaut();
      console.log('📅 Date PA initialisée à:', datePA.value);
    }
    
    modal.classList.add('show');
  });
  
  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    formPA.reset();
    delete formPA.dataset.editId;
    delete formPA.dataset.personneId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Initialiser l'auto-complétion de la typologie
  if (typeof window.initTypologieAutocomplete === 'function') {
    window.initTypologieAutocomplete();
    console.log('✅ Auto-complétion typologie initialisée pour Point Accueil');
  }
  
  // Gestion de la case "Inconnu"
  const checkboxInconnu = document.getElementById('form-pa-inconnu');
  const inputNom = document.getElementById('form-pa-nom');
  const inputPrenom = document.getElementById('form-pa-prenom');
  
  if (checkboxInconnu && inputNom && inputPrenom) {
    checkboxInconnu.addEventListener('change', () => {
      if (checkboxInconnu.checked) {
        inputNom.disabled = true;
        inputPrenom.disabled = true;
        inputNom.value = '';
        inputPrenom.value = '';
      } else {
        inputNom.disabled = false;
        inputPrenom.disabled = false;
      }
    });
  }
  
  // Soumettre le formulaire
  formPA.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = formPA.dataset.editId;
    const personneId = formPA.dataset.personneId ? parseInt(formPA.dataset.personneId) : null;
    const selectedDate = document.getElementById('pa-date')?.value || document.getElementById('form-pa-date')?.value || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire PA - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    try {
      // Données de la personne
      const personneData = {
        nom: document.getElementById('form-pa-nom').value,
        prenom: document.getElementById('form-pa-prenom').value,
        dateNaissance: document.getElementById('form-pa-ddn').value,
        descriptionPhysique: document.getElementById('form-pa-description').value,
        inconnu: document.getElementById('form-pa-inconnu').checked,
        departement: document.getElementById('form-pa-departement').value,
        typologie: document.getElementById('form-pa-typologie').value,
        nbPersonnes: document.getElementById('form-pa-nb-personnes').value,
        mineurs: document.getElementById('form-pa-mineurs').value
      };
      
      // Données de l'intervention Point Accueil
      const interventionData = {
        typeTransmission: document.getElementById('form-pa-type-transmission').value,
        lieu: document.getElementById('form-pa-adresse').value,
        ville: document.getElementById('form-pa-ville').value,
        signalement: document.getElementById('form-pa-signalement').value,
        observations: document.getElementById('form-pa-transmission').value,
        date: selectedDate,
        type: 'pointAccueil',
        orly: {
          premierContact: document.getElementById('form-pa-premier-contact')?.checked || false,
          personnePresente: document.getElementById('form-pa-personne-presente')?.checked || false,
          pnt: document.getElementById('form-pa-pnt')?.checked || false,
          maraude: document.getElementById('form-pa-maraude')?.checked || false,
          veille: document.getElementById('form-pa-veille')?.checked || false,
          refusContact: document.getElementById('form-pa-refus-contact')?.checked || false
        },
        accompagnement: {
          ecoute: document.getElementById('form-pa-accomp-ecoute')?.checked || false,
          orientation: document.getElementById('form-pa-accomp-orientation')?.checked || false,
          admin: document.getElementById('form-pa-accomp-admin')?.checked || false,
          medical: document.getElementById('form-pa-accomp-medical')?.checked || false,
          hebergement: document.getElementById('form-pa-accomp-hebergement')?.checked || false,
          autre: document.getElementById('form-pa-accomp-autre')?.checked || false
        },
        distribution: {
          alimentaire: document.getElementById('form-pa-distrib-alimentaire')?.checked || false,
          vestimentaire: document.getElementById('form-pa-distrib-vestimentaire')?.checked || false,
          hygiene: document.getElementById('form-pa-distrib-hygiene')?.checked || false,
          couvertures: document.getElementById('form-pa-distrib-couvertures')?.checked || false,
          duvet: document.getElementById('form-pa-distrib-duvet')?.checked || false,
          autre: document.getElementById('form-pa-distrib-autre')?.checked || false
        }
      };
      
      let finalPersonneId = personneId;
      
      if (personneId) {
        // Mettre à jour la personne existante
        await window.updatePersonne(personneId, personneData);
        console.log('✅ Personne mise à jour, ID:', personneId);
      } else {
        // Créer ou récupérer la personne
        finalPersonneId = await window.creerOuRecupererPersonne(personneData);
        console.log('✅ Personne créée/récupérée, ID:', finalPersonneId);
      }
      
      // Ajouter personneId à l'intervention
      interventionData.personneId = finalPersonneId;
      
      if (editId) {
        // Mettre à jour l'intervention existante
        await window.updateIntervention(parseInt(editId), interventionData);
        console.log('✅ Intervention PA mise à jour, ID:', editId);
      } else {
        // Créer une nouvelle intervention
        const interventionId = await window.ajouterIntervention(interventionData);
        console.log('✅ Nouvelle intervention PA créée, ID:', interventionId);
      }
      
      // Fermer la modal et rafraîchir
      closeModal();
      await window.afficherToutesLesPersonnesPA();
      console.log('✅ Point Accueil enregistré avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement : ' + error.message);
    }
  });
  
  console.log('✅ Formulaire Point Accueil initialisé (Base Unifiée)');
}

// Exposer les fonctions globalement
window.modifierFichePA = modifierFichePA;
window.initPointAccueilForm = initPointAccueilForm;
window.initPAFilters = initPAFilters;

console.log('✅ Module Point Accueil chargé (Base Unifiée)');
