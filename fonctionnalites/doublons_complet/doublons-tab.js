(function() {
  'use strict';

  // Initialisation au chargement de l'onglet
  function initDoublonsTab() {
    // Bouton Détecter
    const btn = document.getElementById('btn-detecter-doublons');
    if (btn) {
      btn.addEventListener('click', detecterDoublons);
      console.log('✅ Onglet Doublons initialisé');
    }
  }

  // Détecter les doublons
  async function detecterDoublons() {
    const btn = document.getElementById('btn-detecter-doublons');
    const container = document.getElementById('doublons-results-content');
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Détection en cours...';
    
    container.innerHTML = `
      <div class="doublons-loading">
        <div class="spinner"></div>
        <p>Analyse de la base de données...</p>
      </div>
    `;

    try {
      console.log('🔍 Début de la détection des doublons');
      
      // Vérifier que la fonction existe
      if (typeof window.genererRapportDoublons !== 'function') {
        throw new Error('La fonction genererRapportDoublons n\'est pas disponible');
      }
      
      const rapport = await window.genererRapportDoublons();
      
      console.log('📊 Rapport généré:', rapport);
      
      // Afficher les résultats
      afficherResultats(rapport);
      
    } catch (error) {
      console.error('❌ Erreur lors de la détection:', error);
      container.innerHTML = `
        <div class="alert alert-danger">
          <span class="alert-icon">❌</span>
          <div>
            <strong>Erreur lors de la détection</strong>
            <p>${error.message}</p>
          </div>
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Détecter les doublons';
    }
  }

  // Afficher les résultats
  function afficherResultats(rapport) {
    const container = document.getElementById('doublons-results-content');
    
    const totalDoublons = rapport.doublonsPersonnes.nombre;
    const totalInterventions = rapport.doublonsInterventions.nombre;
    
    if (totalDoublons === 0 && totalInterventions === 0) {
      container.innerHTML = `
        <div class="doublons-empty">
          <div class="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3>Aucun doublon détecté</h3>
          <p>Votre base de données ne contient pas de fiches en doublon</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="doublons-resultats">';
    
    // Résumé
    html += `
      <div class="alert alert-warning">
        <span class="alert-icon">⚠</span>
        <div>
          <strong>Détection terminée</strong>
          <p>${totalDoublons} groupe(s) de doublons de personnes détecté(s)</p>
          <p>${totalInterventions} groupe(s) d'interventions en doublon détecté(s)</p>
        </div>
      </div>
    `;
    
    // Détails des doublons de personnes
    if (totalDoublons > 0) {
      html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #333;">Doublons de personnes</h3>';
      
      rapport.doublonsPersonnes.groupes.forEach((groupe, index) => {
        html += `
          <div class="doublon-group">
            <div class="doublon-group-header">
              <h4 style="margin: 0; color: #92400e;">
                <span class="warning-icon">⚠</span>
                Groupe ${index + 1} - ${groupe.personnes.length} fiches similaires
                <span class="confidence-badge">${Math.round(groupe.scoreConfiance * 100)}% similarité</span>
              </h4>
            </div>
            <div class="personnes-grid">
              ${groupe.personnes.map(personne => `
                <div class="personne-card-simple">
                  <h4>${personne.nom || '(vide)'} ${personne.prenom || '(vide)'}</h4>
                  <div class="personne-details">
                    <div class="detail-row">
                      <span class="detail-label">ID :</span>
                      <span class="detail-value">#${personne.id}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Date naissance :</span>
                      <span class="detail-value">${personne.dateNaissance || 'Non renseignée'}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Interventions :</span>
                      <span class="detail-value">${personne.nbInterventions}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
    }
    
    // Détails des doublons d'interventions
    if (totalInterventions > 0) {
      html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #333;">Doublons d\'interventions</h3>';
      
      rapport.doublonsInterventions.groupes.forEach((groupe, index) => {
        html += `
          <div class="doublon-group">
            <div class="doublon-group-header">
              <h4 style="margin: 0; color: #92400e;">
                <span class="warning-icon">⚠</span>
                ${groupe.interventions.length} interventions en doublon
              </h4>
            </div>
            <div style="padding: 1.25rem;">
              ${groupe.interventions.map((interv, iIndex) => `
                <div class="intervention-doublon-item ${iIndex === 0 ? 'to-keep' : ''}">
                  <div class="intervention-doublon-info">
                    <strong>ID: #${interv.id}</strong>
                    <span>Type: ${interv.type}</span>
                    <span>Date: ${interv.date}</span>
                    ${iIndex === 0 ? '<span class="keep-badge">À CONSERVER</span>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
    }
    
    html += '</div>';
    
    container.innerHTML = html;
  }

  // Initialiser quand l'onglet devient actif
  document.addEventListener('DOMContentLoaded', () => {
    // Observer les changements d'onglet
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const doublonsTab = document.getElementById('doublons-tab');
          if (doublonsTab && doublonsTab.classList.contains('active')) {
            initDoublonsTab();
            observer.disconnect();
          }
        }
      });
    });

    const doublonsTab = document.getElementById('doublons-tab');
    if (doublonsTab) {
      if (doublonsTab.classList.contains('active')) {
        initDoublonsTab();
      } else {
        observer.observe(doublonsTab, { attributes: true });
      }
    }
  });

  console.log('📦 Module Doublons Tab chargé');
})();
