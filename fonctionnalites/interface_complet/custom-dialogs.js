/**
 * Système de dialogues personnalisés pour remplacer alert() et confirm()
 */

(function() {
  'use strict';

  /**
   * Crée le conteneur des dialogues s'il n'existe pas
   */
  function ensureDialogContainer() {
    let container = document.getElementById('custom-dialog-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'custom-dialog-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Affiche un message d'alerte personnalisé
   * @param {string} message - Le message à afficher
   * @param {string} type - Type de message : 'info', 'success', 'warning', 'error'
   * @returns {Promise<void>}
   */
  function customAlert(message, type = 'info') {
    return new Promise((resolve) => {
      const container = ensureDialogContainer();
      
      // Icônes selon le type
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      
      const colors = {
        info: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      };

      const overlay = document.createElement('div');
      overlay.className = 'custom-dialog-overlay';
      overlay.innerHTML = `
        <div class="custom-dialog custom-alert">
          <div class="custom-dialog-header" style="background-color: ${colors[type] || colors.info}">
            <span class="custom-dialog-icon">${icons[type] || icons.info}</span>
            <span class="custom-dialog-title">Message</span>
          </div>
          <div class="custom-dialog-body">
            <p>${message}</p>
          </div>
          <div class="custom-dialog-footer">
            <button class="custom-dialog-btn custom-dialog-btn-primary" data-action="ok">OK</button>
          </div>
        </div>
      `;
      
      container.appendChild(overlay);
      
      // Fermeture
      const closeDialog = () => {
        overlay.classList.add('closing');
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 200);
      };
      
      // Events
      overlay.querySelector('[data-action="ok"]').addEventListener('click', closeDialog);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDialog();
      });
      
      // Animation d'entrée
      setTimeout(() => overlay.classList.add('show'), 10);
    });
  }

  /**
   * Affiche un dialogue de confirmation personnalisé
   * @param {string} message - Le message à afficher
   * @param {string} confirmText - Texte du bouton de confirmation
   * @param {string} cancelText - Texte du bouton d'annulation
   * @returns {Promise<boolean>}
   */
  function customConfirm(message, confirmText = 'Confirmer', cancelText = 'Annuler') {
    return new Promise((resolve) => {
      const container = ensureDialogContainer();

      const overlay = document.createElement('div');
      overlay.className = 'custom-dialog-overlay';
      overlay.innerHTML = `
        <div class="custom-dialog custom-confirm">
          <div class="custom-dialog-header" style="background-color: #f59e0b">
            <span class="custom-dialog-icon">⚠️</span>
            <span class="custom-dialog-title">Confirmation</span>
          </div>
          <div class="custom-dialog-body">
            <p>${message}</p>
          </div>
          <div class="custom-dialog-footer">
            <button class="custom-dialog-btn custom-dialog-btn-secondary" data-action="cancel">${cancelText}</button>
            <button class="custom-dialog-btn custom-dialog-btn-danger" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;
      
      container.appendChild(overlay);
      
      // Fermeture
      const closeDialog = (result) => {
        overlay.classList.add('closing');
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 200);
      };
      
      // Events
      overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => closeDialog(true));
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => closeDialog(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDialog(false);
      });
      
      // Escape pour annuler
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', handleEscape);
          closeDialog(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Animation d'entrée
      setTimeout(() => overlay.classList.add('show'), 10);
      
      // Focus sur le bouton annuler
      setTimeout(() => {
        overlay.querySelector('[data-action="cancel"]').focus();
      }, 100);
    });
  }

  /**
   * Affiche un message de succès temporaire
   * @param {string} message - Le message à afficher
   * @param {number} duration - Durée d'affichage en ms
   */
  function showToast(message, type = 'success', duration = 3000) {
    const container = ensureDialogContainer();
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.backgroundColor = colors[type] || colors.success;
    toast.innerHTML = `
      <span class="custom-toast-icon">${icons[type] || icons.success}</span>
      <span class="custom-toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Retrait automatique
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Exposer les fonctions globalement
  window.customAlert = customAlert;
  window.customConfirm = customConfirm;
  window.showToast = showToast;

  console.log('✅ Custom dialogs chargés');
})();






