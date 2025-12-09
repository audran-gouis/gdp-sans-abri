/**
 * Code métier Point Accueil - Initialisation et gestion du formulaire
 * Copie de la structure ADP pour cohérence
 */

// ==================== FONCTIONS UTILITAIRES ====================

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

// ==================== INITIALISATION FORMULAIRE POINT ACCUEIL ====================

/**
 * Initialise le formulaire Point Accueil
 */
function initPointAccueilForm() {
  const btnAjouter = document.getElementById('btn-ajouter-pa');
  const modal = document.getElementById('modal-point-accueil');
  const formPA = document.getElementById('form-point-accueil');
  const btnAnnuler = document.getElementById('pa-btn-annuler');
  const modalClose = document.querySelector('.pa-modal-close');
  
  console.log('Initialisation Point Accueil:', { btnAjouter, modal, formPA });
  
  if (!btnAjouter || !modal || !formPA) {
    console.warn('Éléments Point Accueil non trouvés');
    return;
  }
  
  // Ouvrir la modale
  btnAjouter.addEventListener('click', () => {
    console.log('Ouverture modale Point Accueil');
    modal.classList.add('show');
    formPA.reset();
    
    // Initialiser la date par défaut
    const dateInput = document.getElementById('form-pa-date');
    if (dateInput) {
      dateInput.value = getDateParDefaut();
      console.log('Date initialisée à:', dateInput.value);
    }
    
    delete formPA.dataset.editId;
    delete formPA.dataset.personId;
  });
  
  // Fermer la modale
  const closeModal = () => {
    console.log('Fermeture modale Point Accueil');
    modal.classList.remove('show');
    formPA.reset();
    delete formPA.dataset.editId;
    delete formPA.dataset.personId;
  };
  
  btnAnnuler?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  
  // Initialiser l'auto-complétion de la typologie
  if (typeof window.initTypologieAutoComplete === 'function') {
    window.initTypologieAutoComplete('form-pa-typologie', 'form-pa-nb-personnes', 'form-pa-mineurs');
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
    console.log('Soumission formulaire Point Accueil');
    
    const formData = {
      nom: document.getElementById('form-pa-nom').value,
      prenom: document.getElementById('form-pa-prenom').value,
      dateNaissance: document.getElementById('form-pa-ddn').value,
      descriptionPhysique: document.getElementById('form-pa-description').value,
      inconnu: document.getElementById('form-pa-inconnu').checked,
      departement: document.getElementById('form-pa-departement').value,
      typologie: document.getElementById('form-pa-typologie').value,
      nbPersonnes: document.getElementById('form-pa-nb-personnes').value,
      mineurs: document.getElementById('form-pa-mineurs').value,
      typeTransmission: document.getElementById('form-pa-type-transmission').value,
      date: document.getElementById('form-pa-date').value,
      adresse: document.getElementById('form-pa-adresse').value,
      ville: document.getElementById('form-pa-ville').value,
      signalement: document.getElementById('form-pa-signalement').value,
      // Type d'intervention
      premierContact: document.getElementById('form-pa-premier-contact').checked,
      personnePresente: document.getElementById('form-pa-personne-presente').checked,
      pnt: document.getElementById('form-pa-pnt').checked,
      maraude: document.getElementById('form-pa-maraude').checked,
      veille: document.getElementById('form-pa-veille').checked,
      refusContact: document.getElementById('form-pa-refus-contact').checked,
      // Accompagnement
      accompEcoute: document.getElementById('form-pa-accomp-ecoute').checked,
      accompOrientation: document.getElementById('form-pa-accomp-orientation').checked,
      accompAdmin: document.getElementById('form-pa-accomp-admin').checked,
      accompMedical: document.getElementById('form-pa-accomp-medical').checked,
      accompHebergement: document.getElementById('form-pa-accomp-hebergement').checked,
      accompAutre: document.getElementById('form-pa-accomp-autre').checked,
      // Distribution
      distribAlimentaire: document.getElementById('form-pa-distrib-alimentaire').checked,
      distribVestimentaire: document.getElementById('form-pa-distrib-vestimentaire').checked,
      distribHygiene: document.getElementById('form-pa-distrib-hygiene').checked,
      distribCouvertures: document.getElementById('form-pa-distrib-couvertures').checked,
      distribDuvet: document.getElementById('form-pa-distrib-duvet').checked,
      distribAutre: document.getElementById('form-pa-distrib-autre').checked,
      // Commentaires
      transmission: document.getElementById('form-pa-transmission').value,
      dateCreation: new Date().toISOString()
    };
    
    try {
      const editId = formPA.dataset.editId;
      const personneId = formPA.dataset.personneId;
      const selectedDate = document.getElementById('pa-date')?.value || formData.date;
      
      console.log('💾 Soumission formulaire PA - editId:', editId, 'personneId:', personneId, 'date:', selectedDate);
      
      // Données de la personne
      const personneData = {
        nom: formData.nom,
        prenom: formData.prenom,
        dateNaissance: formData.dateNaissance,
        descriptionPhysique: formData.descriptionPhysique,
        inconnu: formData.inconnu,
        departement: formData.departement,
        typologie: formData.typologie,
        nbPersonnes: formData.nbPersonnes,
        mineurs: formData.mineurs
      };
      
      // Données spécifiques à la fiche PA
      const ficheData = {
        typeTransmission: formData.typeTransmission,
        date: formData.date,
        adresse: formData.adresse,
        ville: formData.ville,
        signalement: formData.signalement,
        premierContact: formData.premierContact,
        personnePresente: formData.personnePresente,
        pnt: formData.pnt,
        maraude: formData.maraude,
        veille: formData.veille,
        refusContact: formData.refusContact,
        accompEcoute: formData.accompEcoute,
        accompOrientation: formData.accompOrientation,
        accompAdmin: formData.accompAdmin,
        accompMedical: formData.accompMedical,
        accompHebergement: formData.accompHebergement,
        accompAutre: formData.accompAutre,
        distribAlimentaire: formData.distribAlimentaire,
        distribVestimentaire: formData.distribVestimentaire,
        distribHygiene: formData.distribHygiene,
        distribCouvertures: formData.distribCouvertures,
        distribDuvet: formData.distribDuvet,
        distribAutre: formData.distribAutre,
        transmission: formData.transmission
      };
      
      let finalPersonneId = personneId;
      
      // Créer ou récupérer la personne dans la DB centrale
      if (!personneId) {
        finalPersonneId = await window.creerOuRecupererPersonne(personneData);
        console.log('✅ Personne créée/récupérée, ID:', finalPersonneId);
      } else {
        // Mettre à jour les infos de la personne si elles ont changé
        await window.updatePersonne(parseInt(personneId), personneData);
        finalPersonneId = parseInt(personneId);
        console.log('✅ Infos personne mises à jour');
      }
      
      // Ajouter le personneId à la fiche
      ficheData.personneId = finalPersonneId;
      
      if (editId) {
        // Mise à jour d'une fiche existante
        console.log('🔄 Mise à jour fiche PA existante ID:', editId);
        if (typeof mettreAJourFichePA === 'function') {
          await mettreAJourFichePA(parseInt(editId), ficheData);
          console.log('✅ Fiche Point Accueil mise à jour');
        }
      } else {
        // Nouvelle fiche
        console.log('➕ Création nouvelle fiche PA pour personne ID:', finalPersonneId);
        if (typeof sauvegarderFichePA === 'function') {
          await sauvegarderFichePA(ficheData);
          console.log('✅ Fiche Point Accueil sauvegardée');
        }
      }
      
      // Recharger la liste
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        await window.afficherToutesLesPersonnesPA();
      }
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement de la fiche');
    }
  });
  
  console.log('✅ Formulaire Point Accueil initialisé');
}

/**
 * Applique les filtres Point Accueil sur la liste des fiches
 */
function applyPAFilters(fiches) {
  let filtered = fiches;
  
  // Filtre par nom
  const filterNom = document.getElementById('pa-filter-nom')?.value?.toLowerCase();
  if (filterNom) {
    filtered = filtered.filter(fiche => fiche.nom?.toLowerCase().includes(filterNom));
  }
  
  // Filtre par prénom
  const filterPrenom = document.getElementById('pa-filter-prenom')?.value?.toLowerCase();
  if (filterPrenom) {
    filtered = filtered.filter(fiche => fiche.prenom?.toLowerCase().includes(filterPrenom));
  }
  
  // Filtre par date de naissance
  const filterDdn = document.getElementById('pa-filter-ddn')?.value;
  if (filterDdn) {
    filtered = filtered.filter(fiche => fiche.dateNaissance === filterDdn);
  }
  
  // Filtre par inconnu
  const filterInconnu = document.getElementById('pa-filter-inconnu')?.checked;
  if (filterInconnu) {
    filtered = filtered.filter(fiche => fiche.inconnu === true);
  }
  
  // Filtre par description physique
  const filterDescription = document.getElementById('pa-filter-description')?.value?.toLowerCase();
  if (filterDescription) {
    filtered = filtered.filter(fiche => fiche.descriptionPhysique?.toLowerCase().includes(filterDescription));
  }
  
  return filtered;
}

/**
 * Initialise les écouteurs d'événements pour les filtres Point Accueil
 */
function initPAFilters() {
  const filterIds = ['pa-filter-nom', 'pa-filter-prenom', 'pa-filter-ddn', 'pa-filter-inconnu', 'pa-filter-description'];
  
  const rechargerFiches = () => {
    if (typeof window.afficherToutesLesPersonnesPA === 'function') {
      window.afficherToutesLesPersonnesPA();
    }
  };
  
  filterIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const eventType = element.type === 'checkbox' ? 'change' : 'input';
      element.addEventListener(eventType, rechargerFiches);
    }
  });
  
  // Filtre par date (sélecteur en haut)
  const dateSelector = document.getElementById('pa-date');
  if (dateSelector) {
    dateSelector.addEventListener('change', rechargerFiches);
  }
  
  console.log('✅ Filtres Point Accueil initialisés');
}

/**
 * Affiche les fiches Point Accueil
 */
async function afficherFichesPA() {
  const container = document.getElementById('point-accueil-list');
  if (!container) return;
  
  try {
    let fiches = await recupererFichesPA();
    console.log(`📋 ${fiches.length} fiches Point Accueil chargées`);
    
    // Filtre par date sélectionnée
    const selectedDate = document.getElementById('pa-date')?.value;
    if (selectedDate) {
      fiches = fiches.filter(fiche => fiche.date === selectedDate);
      console.log(`📋 ${fiches.length} fiches pour la date ${selectedDate}`);
    }
    
    // Appliquer les filtres
    fiches = applyPAFilters(fiches);
    console.log(`📋 ${fiches.length} fiches après filtrage`);
    
    if (fiches.length === 0) {
      container.innerHTML = '<p class="empty-message">Aucune fiche Point Accueil pour le moment</p>';
      return;
    }
    
    container.innerHTML = fiches.map(fiche => `
      <div class="transmission-card" data-id="${fiche.id}">
        <div class="card-header">
          <h3>${fiche.inconnu ? 'Inconnu' : `${fiche.prenom || ''} ${fiche.nom || ''}`.trim()}</h3>
          <span class="card-date">${formatDatePA(fiche.date)}</span>
        </div>
        <div class="card-body">
          ${fiche.descriptionPhysique ? `<p><strong>Description:</strong> ${fiche.descriptionPhysique}</p>` : ''}
          ${fiche.dateNaissance ? `<p><strong>Date de naissance:</strong> ${formatDatePA(fiche.dateNaissance)}</p>` : ''}
          ${fiche.typologie ? `<p><strong>Typologie:</strong> ${fiche.typologie}</p>` : ''}
          ${fiche.transmission ? `<p>${fiche.transmission}</p>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn-card btn-edit" data-id="${fiche.id}">Compléter</button>
        </div>
      </div>
    `).join('');
    
    // Ajouter les événements aux boutons Modifier
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        modifierFichePA(id);
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'affichage des fiches:', error);
    container.innerHTML = '<p class="error-message">Erreur lors du chargement des fiches</p>';
  }
}

/**
 * Formate une date
 */
function formatDatePA(dateString) {
  if (!dateString) return 'Non spécifiée';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Modifie une fiche Point Accueil pour une personne
 * @param {number} personneId - L'ID de la personne dans la DB centrale
 */
async function modifierFichePA(personneId) {
  const modal = document.getElementById('modal-point-accueil');
  const formPA = document.getElementById('form-point-accueil');
  
  console.log('📝 Compléter fiche PA pour personne ID:', personneId);
  
  if (!modal || !formPA) {
    console.error('Modal ou formulaire PA non trouvé');
    return;
  }
  
  try {
    // Charger la personne depuis la DB centrale
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
    const allFiches = await recupererFichesPA();
    const existingFiche = allFiches.find(f => 
      f.personneId === personneId && f.date === selectedDate
    );
    
    console.log('📋 Fiche PA existante:', existingFiche ? `ID ${existingFiche.id}` : 'Aucune');
    
    // Remplir le formulaire avec les infos de la personne
    document.getElementById('form-pa-nom').value = personne.nom || '';
    document.getElementById('form-pa-prenom').value = personne.prenom || '';
    document.getElementById('form-pa-ddn').value = personne.dateNaissance || '';
    document.getElementById('form-pa-description').value = personne.descriptionPhysique || '';
    document.getElementById('form-pa-inconnu').checked = personne.inconnu || false;
    document.getElementById('form-pa-departement').value = personne.departement || '';
    document.getElementById('form-pa-typologie').value = personne.typologie || '';
    document.getElementById('form-pa-nb-personnes').value = personne.nbPersonnes || '';
    document.getElementById('form-pa-mineurs').value = personne.mineurs || '';
    
    if (existingFiche) {
      // MODE ÉDITION : charger toutes les données de la fiche
      console.log('✅ Fiche existante pour cette date - MODE ÉDITION');
      document.getElementById('form-pa-type-transmission').value = existingFiche.typeTransmission || '';
      document.getElementById('form-pa-date').value = existingFiche.date || '';
      document.getElementById('form-pa-adresse').value = existingFiche.adresse || '';
      document.getElementById('form-pa-ville').value = existingFiche.ville || '';
      document.getElementById('form-pa-signalement').value = existingFiche.signalement || '';
      document.getElementById('form-pa-premier-contact').checked = existingFiche.premierContact || false;
      document.getElementById('form-pa-personne-presente').checked = existingFiche.personnePresente || false;
      document.getElementById('form-pa-pnt').checked = existingFiche.pnt || false;
      document.getElementById('form-pa-maraude').checked = existingFiche.maraude || false;
      document.getElementById('form-pa-veille').checked = existingFiche.veille || false;
      document.getElementById('form-pa-refus-contact').checked = existingFiche.refusContact || false;
      document.getElementById('form-pa-accomp-ecoute').checked = existingFiche.accompEcoute || false;
      document.getElementById('form-pa-accomp-orientation').checked = existingFiche.accompOrientation || false;
      document.getElementById('form-pa-accomp-admin').checked = existingFiche.accompAdmin || false;
      document.getElementById('form-pa-accomp-medical').checked = existingFiche.accompMedical || false;
      document.getElementById('form-pa-accomp-hebergement').checked = existingFiche.accompHebergement || false;
      document.getElementById('form-pa-accomp-autre').checked = existingFiche.accompAutre || false;
      document.getElementById('form-pa-distrib-alimentaire').checked = existingFiche.distribAlimentaire || false;
      document.getElementById('form-pa-distrib-vestimentaire').checked = existingFiche.distribVestimentaire || false;
      document.getElementById('form-pa-distrib-hygiene').checked = existingFiche.distribHygiene || false;
      document.getElementById('form-pa-distrib-couvertures').checked = existingFiche.distribCouvertures || false;
      document.getElementById('form-pa-distrib-duvet').checked = existingFiche.distribDuvet || false;
      document.getElementById('form-pa-distrib-autre').checked = existingFiche.distribAutre || false;
      document.getElementById('form-pa-transmission').value = existingFiche.transmission || '';
      
      formPA.dataset.editId = existingFiche.id;
      console.log('🔖 editId défini à:', existingFiche.id);
    } else {
      // MODE CRÉATION : réinitialiser les champs spécifiques
      console.log('➕ Pas de fiche pour cette date - MODE CRÉATION');
      document.getElementById('form-pa-type-transmission').value = '';
      document.getElementById('form-pa-date').value = selectedDate || '';
      document.getElementById('form-pa-adresse').value = '';
      document.getElementById('form-pa-ville').value = '';
      document.getElementById('form-pa-signalement').value = '';
      document.getElementById('form-pa-transmission').value = '';
      
      // Décocher toutes les checkboxes sauf inconnu
      document.querySelectorAll('#modal-point-accueil input[type="checkbox"]:not(#form-pa-inconnu)').forEach(cb => cb.checked = false);
      
      delete formPA.dataset.editId;
      console.log('🔖 editId supprimé - création nouvelle fiche');
    }
    
    formPA.dataset.personneId = personneId;
    console.log('🔖 personneId défini à:', personneId);
    
    // Ouvrir la modale
    modal.classList.add('show');
  } catch (error) {
    console.error('Erreur lors du chargement de la fiche:', error);
    alert('Erreur lors du chargement de la fiche');
  }
}

// Initialisation au chargement de la page - UNIQUEMENT pour exports
if (typeof window !== 'undefined') {
  // Export des fonctions pour utilisation globale
  window.initPointAccueilForm = initPointAccueilForm;
  window.afficherFichesPA = afficherFichesPA;
  window.modifierFichePA = modifierFichePA;
  window.applyPAFilters = applyPAFilters;
  window.initPAFilters = initPAFilters;
  window.getDateParDefaut = getDateParDefaut;
}

// Export pour Node.js (tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPointAccueilForm,
    afficherFichesPA,
    modifierFichePA,
    formatDatePA,
    applyPAFilters,
    initPAFilters,
    getDateParDefaut
  };
}
