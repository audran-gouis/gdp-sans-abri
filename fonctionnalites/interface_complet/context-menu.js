/**
 * Gestionnaire du menu contextuel (clic droit) pour les fiches
 * Permet d'accéder rapidement aux actions : Dupliquer, Compléter, Supprimer
 */

(function() {
  let currentMenu = null;
  let currentCard = null;

  /**
   * Crée le menu contextuel HTML
   */
  function createContextMenu() {
    const existingMenu = document.getElementById('card-context-menu');
    if (existingMenu) {
      return existingMenu;
    }

    const menu = document.createElement('div');
    menu.id = 'card-context-menu';
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button class="context-menu-item duplicate" data-action="duplicate">
        <span>Doublon</span>
      </button>
      <button class="context-menu-item archive" data-action="archive">
        <span>Archiver</span>
      </button>
    `;

    document.body.appendChild(menu);
    return menu;
  }

  /**
   * Positionne le menu à la position de la souris
   */
  function positionMenu(menu, x, y) {
    const menuWidth = menu.offsetWidth || 180;
    const menuHeight = menu.offsetHeight || 150;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Ajuster la position si le menu sort de l'écran
    let posX = x;
    let posY = y;

    if (x + menuWidth > windowWidth) {
      posX = windowWidth - menuWidth - 10;
    }

    if (y + menuHeight > windowHeight) {
      posY = windowHeight - menuHeight - 10;
    }

    menu.style.left = `${posX}px`;
    menu.style.top = `${posY}px`;
  }

  /**
   * Affiche le menu contextuel
   */
  function showContextMenu(event, card) {
    event.preventDefault();
    event.stopPropagation();

    hideContextMenu();

    currentCard = card;
    currentMenu = createContextMenu();

    positionMenu(currentMenu, event.pageX, event.pageY);
    currentMenu.classList.add('visible');

    // Ajouter les événements aux items du menu
    attachMenuItemEvents();
  }

  /**
   * Cache le menu contextuel
   */
  function hideContextMenu() {
    if (currentMenu) {
      currentMenu.classList.remove('visible');
      currentCard = null;
    }
  }

  /**
   * Attache les événements aux items du menu
   */
  function attachMenuItemEvents() {
    if (!currentMenu) return;

    const items = currentMenu.querySelectorAll('.context-menu-item');
    items.forEach(item => {
      item.addEventListener('click', handleMenuItemClick);
    });
  }

  /**
   * Gère le clic sur un item du menu
   */
  function handleMenuItemClick(event) {
    const action = event.currentTarget.dataset.action;
    
    if (!currentCard) {
      hideContextMenu();
      return;
    }

    // Récupérer le personneId depuis le bouton dans la carte
    const btnEdit = currentCard.querySelector('.btn-edit');
    const personneId = btnEdit?.dataset.personneId || currentCard.dataset.personId;
    const type = btnEdit?.dataset.type || 'transmissions';

    if (!personneId) {
      console.error('❌ Aucun personneId trouvé dans la carte');
      alert('Erreur : impossible de récupérer les informations de la fiche');
      hideContextMenu();
      return;
    }

    // Gérer les actions
    if (action === 'duplicate') {
      handleDuplicate(personneId, type);
    } else if (action === 'archive') {
      handleArchive(personneId);
    }

    hideContextMenu();
  }

  /**
   * Gère la duplication d'une fiche
   */
  async function handleDuplicate(personneId, type) {
    console.log('Ouverture modale doublons pour personne:', { personneId, type });

    try {
      // Ouvrir la modale de gestion des doublons
      if (typeof window.ouvrirModaleDoublons === 'function') {
        const personneIdNum = parseInt(personneId);
        window.ouvrirModaleDoublons(personneIdNum);
      } else {
        console.error('❌ Fonction ouvrirModaleDoublons non disponible');
        alert('Erreur : impossible d\'ouvrir la modale de gestion des doublons');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la modale:', error);
      alert('Erreur lors de l\'ouverture de la modale');
    }
  }

  /**
   * Gère l'archivage d'une fiche
   */
  async function handleArchive(personneId) {
    try {
      const personneIdNum = parseInt(personneId);
      const personne = await window.getPersonneById(personneIdNum);
      
      if (!personne) {
        alert('Erreur : Personne non trouvée');
        return;
      }
      
      const nom = personne.inconnu ? 'Inconnu' : `${personne.prenom || ''} ${personne.nom || ''}`.trim();
      
      if (!confirm(`Voulez-vous archiver la fiche de ${nom} ?\n\nLa fiche ne sera plus visible dans les listes et ne comptera plus dans les statistiques.\n\nVous pourrez la restaurer depuis l'onglet Archives.`)) {
        return;
      }
      
      // Archiver la personne
      await window.updatePersonne(personneIdNum, {
        archive: true,
        dateArchivage: new Date().toISOString()
      });
      
      console.log('✅ Personne archivée:', personneIdNum);
      
      // Rafraîchir l'affichage
      if (typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
        await window.afficherToutesLesPersonnesTransmissions();
      }
      if (typeof window.afficherToutesLesPersonnesADP === 'function') {
        await window.afficherToutesLesPersonnesADP();
      }
      if (typeof window.afficherToutesLesPersonnesPA === 'function') {
        await window.afficherToutesLesPersonnesPA();
      }
      
      alert(`Fiche archivée !\n\n${nom} a été déplacé(e) vers les archives.`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage:', error);
      alert('Erreur lors de l\'archivage : ' + error.message);
    }
  }

  /**
   * Duplique une transmission
   */
  async function duplicateTransmission(personneId) {
    console.log('🔄 Duplication transmission pour personneId:', personneId);
    
    try {
      // Ouvrir simplement la modale d'édition qui va créer une nouvelle transmission
      // La duplication se fait en ouvrant la modale pour cette personne
      if (typeof window.editTransmission === 'function') {
        const personneIdNum = parseInt(personneId);
        
        // Charger la personne depuis la DB
        const personne = await window.getPersonneById(personneIdNum);
        
        if (!personne) {
          alert('Personne non trouvée');
          return;
        }
        
        // Marquer qu'on est en mode duplication
        window.IS_DUPLICATING = true;
        
        // Ouvrir la modale d'édition
        window.editTransmission(personneIdNum);
        
        console.log('✅ Modale ouverte en mode duplication');
      } else {
        alert('Fonction de duplication non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur duplication transmission:', error);
      alert('Erreur lors de la duplication de la fiche');
    }
  }

  /**
   * Duplique une fiche ADP
   */
  async function duplicateAdp(personneId) {
    console.log('🔄 Duplication ADP pour personneId:', personneId);
    
    try {
      if (typeof window.editTransmissionAdp === 'function') {
        const personneIdNum = parseInt(personneId);
        
        const personne = await window.getPersonneById(personneIdNum);
        
        if (!personne) {
          alert('Personne non trouvée');
          return;
        }
        
        window.IS_DUPLICATING_ADP = true;
        window.editTransmissionAdp(personneIdNum);
        
        console.log('✅ Modale ADP ouverte en mode duplication');
      } else {
        alert('Fonction de duplication ADP non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur duplication ADP:', error);
      alert('Erreur lors de la duplication de la fiche ADP');
    }
  }

  /**
   * Duplique une fiche Point Accueil
   */
  async function duplicatePointAccueil(personneId) {
    console.log('🔄 Duplication Point Accueil pour personneId:', personneId);
    
    try {
      if (typeof window.modifierFichePA === 'function') {
        const personneIdNum = parseInt(personneId);
        
        const personne = await window.getPersonneById(personneIdNum);
        
        if (!personne) {
          alert('Personne non trouvée');
          return;
        }
        
        window.IS_DUPLICATING_PA = true;
        window.modifierFichePA(personneIdNum);
        
        console.log('✅ Modale PA ouverte en mode duplication');
      } else {
        alert('Fonction de duplication Point Accueil non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur duplication Point Accueil:', error);
      alert('Erreur lors de la duplication de la fiche Point Accueil');
    }
  }

  /**
   * Gère l'édition d'une fiche
   */
  function handleEdit(personneId, type) {
    const personneIdNum = parseInt(personneId);

    if (type === 'transmissions') {
      if (typeof window.editTransmission === 'function') {
        window.editTransmission(personneIdNum);
      }
    } else if (type === 'adp') {
      if (typeof window.editTransmissionAdp === 'function') {
        window.editTransmissionAdp(personneIdNum);
      }
    } else if (type === 'pointAccueil') {
      if (typeof window.modifierFichePA === 'function') {
        window.modifierFichePA(personneIdNum);
      }
    }
  }

  /**
   * Gère la suppression d'une fiche
   */
  function handleDelete(personneId, type) {
    const confirmMsg = 'Êtes-vous sûr de vouloir supprimer cette personne et toutes ses interventions ?';
    
    if (!confirm(confirmMsg)) {
      return;
    }

    const personneIdNum = parseInt(personneId);

    // Supprimer la personne (cela supprimera aussi toutes ses interventions)
    if (typeof window.deletePersonne === 'function') {
      window.deletePersonne(personneIdNum).then(() => {
        console.log('✅ Personne supprimée');
        
        // Rafraîchir l'affichage selon le type
        if (type === 'transmissions' && typeof window.afficherToutesLesPersonnesTransmissions === 'function') {
          window.afficherToutesLesPersonnesTransmissions();
        } else if (type === 'adp' && typeof window.afficherToutesLesPersonnesADP === 'function') {
          window.afficherToutesLesPersonnesADP();
        } else if (type === 'pointAccueil' && typeof window.afficherToutesLesPersonnesPA === 'function') {
          window.afficherToutesLesPersonnesPA();
        }
      }).catch(error => {
        console.error('❌ Erreur suppression:', error);
        alert('Erreur lors de la suppression');
      });
    }
  }

  /**
   * Initialise le menu contextuel pour toutes les cartes
   */
  function initContextMenu() {
    // Cacher le menu lors d'un clic ailleurs
    document.addEventListener('click', hideContextMenu);
    
    // Cacher le menu lors d'un clic droit ailleurs
    document.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('.transmission-card')) {
        hideContextMenu();
      }
    });

    // Cacher le menu lors du scroll
    document.addEventListener('scroll', hideContextMenu, true);

    console.log('✅ Menu contextuel initialisé');
  }

  /**
   * Attache le menu contextuel à une carte
   */
  function attachContextMenuToCard(card) {
    if (!card) return;

    card.addEventListener('contextmenu', (e) => {
      showContextMenu(e, card);
    });
  }

  /**
   * Attache le menu contextuel à toutes les cartes existantes
   */
  function attachContextMenuToAllCards() {
    const cards = document.querySelectorAll('.transmission-card');
    cards.forEach(card => {
      // Éviter d'attacher plusieurs fois
      if (!card.hasAttribute('data-context-menu-attached')) {
        attachContextMenuToCard(card);
        card.setAttribute('data-context-menu-attached', 'true');
      }
    });
  }

  /**
   * Observer pour attacher le menu aux nouvelles cartes
   */
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.classList && node.classList.contains('transmission-card')) {
              attachContextMenuToCard(node);
            } else {
              // Chercher les cartes dans les enfants
              const cards = node.querySelectorAll?.('.transmission-card');
              cards?.forEach(attachContextMenuToCard);
            }
          }
        });
      });
    });

    // Observer les conteneurs de cartes
    const containers = [
      'transmissions-list',
      'adp-list',
      'point-accueil-list'
    ];

    containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true
        });
      }
    });
  }

  // Initialiser au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initContextMenu();
      attachContextMenuToAllCards();
      setupMutationObserver();
    });
  } else {
    initContextMenu();
    attachContextMenuToAllCards();
    setupMutationObserver();
  }

  // Exposer les fonctions globalement
  window.initContextMenu = initContextMenu;
  window.attachContextMenuToCard = attachContextMenuToCard;
  window.attachContextMenuToAllCards = attachContextMenuToAllCards;

  console.log('✅ Module menu contextuel chargé');
})();

