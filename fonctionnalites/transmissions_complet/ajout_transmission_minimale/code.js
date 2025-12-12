/**
 * Code métier - Transmissions : Ajout transmission minimale
 * Fonctions pour tests ET application
 */

// ==================== FONCTIONS APPLICATION ====================

/**
 * Trouve une transmission par personId et date
 */
async function findTransmissionByPersonAndDate(personneId, date) {
  try {
    if (typeof window.getInterventionsByPersonneIdAndDateAndType === 'function') {
      const intervention = await window.getInterventionsByPersonneIdAndDateAndType(
        personneId,
        date,
        'transmissions'
      );
      return intervention;
    }
    // Fallback vers l'ancienne méthode
    const allTransmissions = await window.getAllTransmissions();
    return allTransmissions.find(t => 
      String(t.personId || t.personneId) === String(personneId) && 
      (t.dateTransmission === date || t.date === date)
    );
  } catch (error) {
    console.error('Erreur lors de la recherche de transmission:', error);
    return null;
  }
}

/**
 * Édite une transmission existante
 * @param {number} personneId - L'ID de la personne dans la DB unifiée
 */
async function editTransmission(personneId) {
  console.log('📝 Compléter la transmission pour personne ID:', personneId);
  
  try {
    // Charger la personne depuis la DB unifiée
    const personne = await window.getPersonneById(personneId);
    
    if (!personne) {
      console.error('❌ Personne non trouvée pour ID:', personneId);
      alert('Erreur lors du chargement des données');
      return;
    }
    
    console.log('✅ Personne trouvée:', personne);
    const selectedDate = document.getElementById('transmissions-date')?.value;
    console.log('📅 Date sélectionnée:', selectedDate);
    
    // Chercher si une transmission existe pour cette personne à cette date
    const existingTransmission = await findTransmissionByPersonAndDate(personneId, selectedDate);
    
    console.log('📋 Transmission existante:', existingTransmission ? `ID ${existingTransmission.id}` : 'Aucune');
    
    // Récupérer les DERNIÈRES infos connues (pour pré-remplir le formulaire)
    const dernieresInfos = window.getDernieresInfos ? window.getDernieresInfos(personne) : {
      departement: personne.departement || '',
      typologie: personne.typologie || '',
      nbPersonnes: personne.nbPersonnes || '',
      mineurs: personne.mineurs || ''
    };
    
    // Remplir les champs avec les infos de la personne
    document.getElementById('form-nom').value = personne.nom || '';
    document.getElementById('form-prenom').value = personne.prenom || '';
    document.getElementById('form-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-departement').value = dernieresInfos.departement;
    document.getElementById('form-typologie').value = dernieresInfos.typologie;
    document.getElementById('form-nb-personnes').value = dernieresInfos.nbPersonnes;
    document.getElementById('form-mineurs').value = dernieresInfos.mineurs;
    
    // Stocker les valeurs initiales pour détecter les changements
    const form = document.getElementById('form-modal-transmission');
    form.dataset.initialDepartement = dernieresInfos.departement;
    form.dataset.initialTypologie = dernieresInfos.typologie;
    form.dataset.initialNbPersonnes = dernieresInfos.nbPersonnes;
    form.dataset.initialMineurs = dernieresInfos.mineurs;
    
    // Afficher le bouton historique si la personne a un historique
    const btnVoirHistorique = document.getElementById('btn-voir-historique');
    if (btnVoirHistorique && personne.infoHistorique && personne.infoHistorique.length > 0) {
      btnVoirHistorique.style.display = 'inline-block';
    }
    
    if (existingTransmission) {
      // Remplir les champs de l'intervention existante
      document.getElementById('form-type-transmission').value = existingTransmission.typeTransmission || '';
      document.getElementById('form-adresse').value = existingTransmission.adresse || existingTransmission.lieu || '';
      document.getElementById('form-ville').value = existingTransmission.ville || '';
      document.getElementById('form-signalement').value = existingTransmission.signalement || '';
      document.getElementById('form-transmission').value = existingTransmission.transmission || existingTransmission.observations || '';
      
      // Checkboxes Orly
      if (existingTransmission.orly) {
        document.getElementById('form-premier-contact').checked = existingTransmission.orly.premierContact || false;
        document.getElementById('form-personne-presente').checked = existingTransmission.orly.personnePresente || false;
        document.getElementById('form-pnt').checked = existingTransmission.orly.pnt || false;
        document.getElementById('form-maraude').checked = existingTransmission.orly.maraude || false;
        document.getElementById('form-veille').checked = existingTransmission.orly.veille || false;
        document.getElementById('form-refus-contact').checked = existingTransmission.orly.refusContact || false;
      }
      
      // Checkboxes Accompagnement
      if (existingTransmission.accompagnement) {
        document.getElementById('form-accomp-ecoute').checked = existingTransmission.accompagnement.ecoute || false;
        document.getElementById('form-accomp-orientation').checked = existingTransmission.accompagnement.orientation || false;
        document.getElementById('form-accomp-admin').checked = existingTransmission.accompagnement.admin || false;
        document.getElementById('form-accomp-medical').checked = existingTransmission.accompagnement.medical || false;
        document.getElementById('form-accomp-hebergement').checked = existingTransmission.accompagnement.hebergement || false;
        document.getElementById('form-accomp-autre').checked = existingTransmission.accompagnement.autre || false;
      }
      
      // Checkboxes Distribution
      if (existingTransmission.distribution) {
        document.getElementById('form-distrib-alimentaire').checked = existingTransmission.distribution.alimentaire || false;
        document.getElementById('form-distrib-vestimentaire').checked = existingTransmission.distribution.vestimentaire || false;
        document.getElementById('form-distrib-hygiene').checked = existingTransmission.distribution.hygiene || false;
        document.getElementById('form-distrib-couvertures').checked = existingTransmission.distribution.couvertures || false;
        document.getElementById('form-distrib-duvet').checked = existingTransmission.distribution.duvet || false;
        document.getElementById('form-distrib-autre').checked = existingTransmission.distribution.autre || false;
      }
      
      document.getElementById('form-modal-transmission').dataset.editId = existingTransmission.id;
    } else {
      // Nouvelle transmission pour cette date - réinitialiser les champs de transmission
      document.getElementById('form-type-transmission').value = '';
      document.getElementById('form-adresse').value = '';
      document.getElementById('form-ville').value = '';
      document.getElementById('form-signalement').value = '';
      document.getElementById('form-transmission').value = '';
      
      // Décocher toutes les checkboxes
      document.querySelectorAll('#modal-ajout input[type="checkbox"]').forEach(cb => cb.checked = false);
      
      delete document.getElementById('form-modal-transmission').dataset.editId;
    }
    
    document.getElementById('form-modal-transmission').dataset.personneId = personneId;
    
    // Ouvrir la modal
    const modal = document.getElementById('modal-ajout');
    if (modal) {
      modal.classList.add('show');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
    alert('Erreur lors du chargement des données');
  }
}

/**
 * Supprime une personne (toutes ses interventions)
 */
async function deletePersonCard(personneId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne et toutes ses interventions ?')) {
    return;
  }
  
  try {
    // Utiliser la fonction de suppression de la base unifiée qui supprime aussi les interventions
    if (typeof window.deletePersonne === 'function') {
      await window.deletePersonne(personneId);
      console.log('✅ Personne et toutes ses interventions supprimées');
    } else {
      // Fallback : supprimer manuellement
      const allInterventions = await window.getAllInterventions();
      const personInterventions = allInterventions.filter(i => 
        i.personneId === personneId && i.type === 'transmissions'
      );
      
      for (const intervention of personInterventions) {
        await window.deleteIntervention(intervention.id);
      }
      
      await window.deletePersonne(personneId);
    }

    if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
      await window.afficherToutesLesPersonnesTransmissions();
    } else if (typeof window.loadAndDisplayCards === 'function') {
      await window.loadAndDisplayCards();
    }
    console.log('✅ Personne supprimée');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression : ' + error.message);
  }
}

/**
 * Initialise le formulaire de transmissions
 */
function initTransmissionsForm() {
  const btnAjouter = document.getElementById('btn-ajouter');
  const modal = document.getElementById('modal-ajout');
  const form = document.getElementById('form-modal-transmission');
  const btnAnnuler = document.getElementById('btn-annuler');
  const modalClose = document.querySelector('#modal-ajout .modal-close');
  
  if (!btnAjouter || !modal || !form) {
    console.warn('Éléments formulaire Transmissions non trouvés');
    return;
  }
  
  /**
   * Obtient la date à utiliser par défaut
   * Si on est entre 00h00 et 03h00, on retourne la veille
   * Sinon on retourne la date du jour
   */
  function getDateParDefaut() {
    const maintenant = new Date();
    const heures = maintenant.getHours();
    
    // Si on est entre minuit et 3h du matin, on prend la veille
    if (heures >= 0 && heures < 3) {
      maintenant.setDate(maintenant.getDate() - 1);
    }
    
    // Formater en YYYY-MM-DD pour l'input date
    return maintenant.toISOString().split('T')[0];
  }
  
  // Ouvrir la modal pour ajout
  btnAjouter.addEventListener('click', () => {
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personneId;
    delete form.dataset.initialDepartement;
    delete form.dataset.initialTypologie;
    delete form.dataset.initialNbPersonnes;
    delete form.dataset.initialMineurs;
    
    // Cacher le bouton historique et l'alerte en mode création
    const btnVoirHistorique = document.getElementById('btn-voir-historique');
    if (btnVoirHistorique) btnVoirHistorique.style.display = 'none';
    const alerteModif = document.getElementById('alerte-modification-infos');
    if (alerteModif) alerteModif.style.display = 'none';
    
    // Initialiser la date du sélecteur de transmission avec la date par défaut
    const dateTransmission = document.getElementById('transmissions-date');
    if (dateTransmission && !dateTransmission.value) {
      dateTransmission.value = getDateParDefaut();
      console.log('Date Transmissions initialisée à:', dateTransmission.value);
    }
    
    modal.classList.add('show');
  });
  
  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    form.reset();
    delete form.dataset.editId;
    delete form.dataset.personneId;
    delete form.dataset.initialDepartement;
    delete form.dataset.initialTypologie;
    delete form.dataset.initialNbPersonnes;
    delete form.dataset.initialMineurs;
    
    // Cacher l'alerte
    const alerteModif = document.getElementById('alerte-modification-infos');
    if (alerteModif) alerteModif.style.display = 'none';
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Détecter les changements sur les champs historisés
  const champsHistorises = [
    'form-departement',
    'form-typologie', 
    'form-nb-personnes',
    'form-mineurs'
  ];
  
  champsHistorises.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => {
        // Vérifier si on est en mode édition (pas création)
        if (!form.dataset.personneId) return;
        
        const alerteModif = document.getElementById('alerte-modification-infos');
        if (!alerteModif) return;
        
        // Vérifier si au moins un champ a changé
        const depChanged = document.getElementById('form-departement').value !== (form.dataset.initialDepartement || '');
        const typoChanged = document.getElementById('form-typologie').value !== (form.dataset.initialTypologie || '');
        const nbChanged = document.getElementById('form-nb-personnes').value !== (form.dataset.initialNbPersonnes || '');
        const minChanged = document.getElementById('form-mineurs').value !== (form.dataset.initialMineurs || '');
        
        if (depChanged || typoChanged || nbChanged || minChanged) {
          alerteModif.style.display = 'block';
          console.log('⚠️ Modification détectée des informations historisées');
        } else {
          alerteModif.style.display = 'none';
        }
      });
    }
  });
  
  // Event listener pour le bouton "Voir l'historique"
  const btnVoirHistorique = document.getElementById('btn-voir-historique');
  if (btnVoirHistorique) {
    btnVoirHistorique.addEventListener('click', async (e) => {
      e.preventDefault();
      const personneId = form.dataset.personneId;
      if (personneId && window.afficherHistoriqueModal) {
        const personne = await window.getPersonneById(parseInt(personneId));
        if (personne) {
          window.afficherHistoriqueModal(personne);
        }
      }
    });
  }
  
  // Soumettre le formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = form.dataset.editId;
    const personneId = form.dataset.personneId ? parseInt(form.dataset.personneId) : null;
    const selectedDate = document.getElementById('transmissions-date')?.value || new Date().toISOString().split('T')[0];
    
    console.log('💾 Soumission formulaire Transmissions - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
    
    try {
      // Données de la personne
      const personneData = {
        nom: document.getElementById('form-nom').value,
        prenom: document.getElementById('form-prenom').value,
        dateNaissance: document.getElementById('form-ddn').value,
        descriptionPhysique: document.getElementById('form-description')?.value || '',
        inconnu: document.getElementById('form-inconnu')?.checked || false
        // NOTE: departement, typologie, nbPersonnes, mineurs sont gérés via infoHistorique
      };
      
      // Données de l'intervention Transmission
      const interventionData = {
        typeTransmission: document.getElementById('form-type-transmission').value,
        adresse: document.getElementById('form-adresse').value,
        lieu: document.getElementById('form-adresse').value, // Alias pour compatibilité
        ville: document.getElementById('form-ville').value,
        signalement: document.getElementById('form-signalement').value,
        transmission: document.getElementById('form-transmission').value,
        observations: document.getElementById('form-transmission').value, // Alias pour compatibilité
        date: selectedDate,
        type: 'transmissions',
        orly: {
          premierContact: document.getElementById('form-premier-contact')?.checked || false,
          personnePresente: document.getElementById('form-personne-presente')?.checked || false,
          pnt: document.getElementById('form-pnt')?.checked || false,
          maraude: document.getElementById('form-maraude')?.checked || false,
          veille: document.getElementById('form-veille')?.checked || false,
          refusContact: document.getElementById('form-refus-contact')?.checked || false
        },
        accompagnement: {
          ecoute: document.getElementById('form-accomp-ecoute')?.checked || false,
          orientation: document.getElementById('form-accomp-orientation')?.checked || false,
          admin: document.getElementById('form-accomp-admin')?.checked || false,
          medical: document.getElementById('form-accomp-medical')?.checked || false,
          hebergement: document.getElementById('form-accomp-hebergement')?.checked || false,
          autre: document.getElementById('form-accomp-autre')?.checked || false
        },
        distribution: {
          alimentaire: document.getElementById('form-distrib-alimentaire')?.checked || false,
          vestimentaire: document.getElementById('form-distrib-vestimentaire')?.checked || false,
          hygiene: document.getElementById('form-distrib-hygiene')?.checked || false,
          couvertures: document.getElementById('form-distrib-couvertures')?.checked || false,
          duvet: document.getElementById('form-distrib-duvet')?.checked || false,
          autre: document.getElementById('form-distrib-autre')?.checked || false
        }
      };
      
      let finalPersonneId = personneId;
      
      if (personneId) {
        // Charger la personne existante pour gérer l'historisation
        const personneExistante = await window.getPersonneById(personneId);
        
        // Détecter si les infos historisées ont changé
        if (window.ajouterVersionInfos && personneExistante) {
          const nouvellesInfos = {
            departement: document.getElementById('form-departement')?.value || '',
            typologie: document.getElementById('form-typologie').value,
            nbPersonnes: document.getElementById('form-nb-personnes').value,
            mineurs: document.getElementById('form-mineurs').value
          };
          
          // Si la personne n'a pas d'historique (ancienne donnée), on doit l'initialiser
          // avec la date de la PREMIÈRE intervention, pas la date actuelle
          if (!personneExistante.infoHistorique || personneExistante.infoHistorique.length === 0) {
            console.log('⚠️ Personne sans historique détectée - initialisation nécessaire');
            
            // Récupérer toutes les interventions et filtrer par personneId
            const toutesInterventions = await window.getAllInterventions();
            const interventions = toutesInterventions.filter(i => i.personneId === personneId);
            
            // Trouver la date de la première intervention
            let premiereDateIntervention = selectedDate; // Par défaut, la date actuelle
            if (interventions && interventions.length > 0) {
              const dates = interventions.map(i => i.date).sort();
              premiereDateIntervention = dates[0];
              console.log(`📅 Première intervention trouvée: ${premiereDateIntervention}`);
            }
            
            // Initialiser l'historique avec les ANCIENNES valeurs à la date de la première intervention
            const anciennesInfos = {
              departement: form.dataset.initialDepartement || '',
              typologie: form.dataset.initialTypologie || '',
              nbPersonnes: form.dataset.initialNbPersonnes || '',
              mineurs: form.dataset.initialMineurs || ''
            };
            
            personneExistante.infoHistorique = [{
              dateDebut: premiereDateIntervention,
              departement: anciennesInfos.departement,
              typologie: anciennesInfos.typologie,
              nbPersonnes: anciennesInfos.nbPersonnes,
              mineurs: anciennesInfos.mineurs
            }];
            
            console.log('📦 Historique initialisé avec anciennes valeurs:', personneExistante.infoHistorique);
          }
          
          // Maintenant, ajouter la nouvelle version si différente
          const historiqueMAJ = window.ajouterVersionInfos(
            personneExistante, 
            selectedDate, 
            nouvellesInfos
          );
          
          console.log('📋 Historique mis à jour:', historiqueMAJ);
          
          // Mettre à jour UNIQUEMENT l'historique, pas les champs directs
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
              departement: document.getElementById('form-departement')?.value || '',
              typologie: document.getElementById('form-typologie').value,
              nbPersonnes: document.getElementById('form-nb-personnes').value,
              mineurs: document.getElementById('form-mineurs').value
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
        console.log('✅ Intervention Transmission mise à jour, ID:', editId);
      } else {
        // Créer une nouvelle intervention
        const interventionId = await window.ajouterIntervention(interventionData);
        console.log('✅ Nouvelle intervention Transmission créée, ID:', interventionId);
      }
      
      // Fermer la modal et rafraîchir
      closeModal();
      if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
        await window.afficherToutesLesPersonnesTransmissions();
      } else if (typeof window.afficherToutesFichesTransmissions === 'function') {
        await window.afficherToutesFichesTransmissions();
      } else {
        await window.loadAndDisplayCards();
      }
      console.log('✅ Transmission enregistrée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement : ' + error.message);
    }
  });
  
  console.log('✅ Formulaire Transmissions initialisé');
}

// ==================== EXPORT ====================

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findTransmissionByPersonAndDate,
    editTransmission,
    deletePersonCard,
    initTransmissionsForm
  };
} else {
  // Exposer globalement pour le navigateur
  window.findTransmissionByPersonAndDate = findTransmissionByPersonAndDate;
  window.editTransmission = editTransmission;
  window.deletePersonCard = deletePersonCard;
  window.initTransmissionsForm = initTransmissionsForm;
}

console.log('✅ Module ajout_transmission_minimale chargé');
