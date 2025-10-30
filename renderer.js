// Script du processus de rendu
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser le sélecteur de date à la date du jour
  // Si entre minuit et 3h, utiliser la veille
  const dateInput = document.getElementById('transmissions-date');
  if (dateInput) {
    const today = new Date();
    const currentHour = today.getHours();
    
    // Si entre 0h et 3h (minuit à 3h du matin), utiliser la veille
    if (currentHour >= 0 && currentHour < 3) {
      today.setDate(today.getDate() - 1);
    }
    
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;
  }

  // Gestion des onglets
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Désactiver tous les onglets et boutons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Activer l'onglet sélectionné
      button.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });

  // Gestion de la modal
  const modal = document.getElementById('modal-ajout');
  const btnAjouter = document.getElementById('btn-ajouter');
  const btnAnnuler = document.getElementById('btn-annuler');
  const modalClose = document.querySelector('.modal-close');
  const btnExpand = document.getElementById('btn-expand');
  const modalContent = document.querySelector('.modal-content');
  const formTransmission = document.getElementById('form-transmission');

  // Ouvrir la modal
  btnAjouter.addEventListener('click', () => {
    modal.classList.add('show');
  });

  // Fermer la modal
  const closeModal = () => {
    modal.classList.remove('show');
    modalContent.classList.remove('fullscreen');
    btnExpand.textContent = '⛶';
    btnExpand.title = 'Agrandir';
    formTransmission.reset();
  };

  // Basculer plein écran
  btnExpand.addEventListener('click', () => {
    modalContent.classList.toggle('fullscreen');
    if (modalContent.classList.contains('fullscreen')) {
      btnExpand.textContent = '⛉';
      btnExpand.title = 'Réduire';
    } else {
      btnExpand.textContent = '⛶';
      btnExpand.title = 'Agrandir';
    }
  });

  btnAnnuler.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // Fermer en cliquant sur le fond
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Soumettre le formulaire
  formTransmission.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      nom: document.getElementById('form-nom').value,
      prenom: document.getElementById('form-prenom').value,
      dateNaissance: document.getElementById('form-ddn').value,
      typologie: document.getElementById('form-typologie').value,
      nbPersonnes: document.getElementById('form-nb-personnes').value,
      mineurs: document.getElementById('form-mineurs').value,
      adresse: document.getElementById('form-adresse').value,
      ville: document.getElementById('form-ville').value,
      signalement: document.getElementById('form-signalement').value,
      transmission: document.getElementById('form-transmission').value
    };

    console.log('Données du formulaire:', formData);
    // TODO: Traiter les données (sauvegarder, envoyer, etc.)
    
    closeModal();
  });

  // Gestion automatique des champs selon la typologie de ménage
  const typologieSelect = document.getElementById('form-typologie');
  const nbPersonnesSelect = document.getElementById('form-nb-personnes');
  const mineursSelect = document.getElementById('form-mineurs');

  typologieSelect.addEventListener('change', () => {
    const typologie = typologieSelect.value;

    if (typologie === 'homme-seul' || typologie === 'femme-seule') {
      // Pour homme seul ou femme seule : 1 personne, 0 mineur, champs désactivés
      nbPersonnesSelect.value = '1';
      nbPersonnesSelect.disabled = true;
      mineursSelect.value = '0';
      mineursSelect.disabled = true;
    } else if (typologie === 'groupe-adultes-sans-enfant') {
      // Pour groupe sans enfant : nombre de personnes libre, 0 mineur (désactivé)
      nbPersonnesSelect.disabled = false;
      if (!nbPersonnesSelect.value) {
        nbPersonnesSelect.value = '';
      }
      mineursSelect.value = '0';
      mineursSelect.disabled = true;
    } else {
      // Pour les autres typologies : réactiver tous les champs
      nbPersonnesSelect.disabled = false;
      mineursSelect.disabled = false;
      // Réinitialiser si vide
      if (!nbPersonnesSelect.value) {
        nbPersonnesSelect.value = '';
      }
      if (!mineursSelect.value) {
        mineursSelect.value = '';
      }
    }
  });

  // Exemple d'utilisation de l'API Electron (si disponible)
  if (window.electronAPI) {
    console.log('API Electron disponible');
  }
});

