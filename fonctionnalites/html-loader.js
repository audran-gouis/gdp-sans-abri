/**
 * HTML Loader - Charge les fichiers HTML modulaires dans leurs containers
 * Utilise XMLHttpRequest pour compatibilité avec le protocole file://
 * Chargement en PARALLÈLE pour optimiser la performance
 */

(function() {
    'use strict';

    // Configuration des modules HTML à charger
    const htmlModules = [
        {
            container: 'navigation-container',
            file: 'fonctionnalites/navigation_complet/navigation-tabs.html',
            insertMode: 'replace'
        },
        {
            container: 'transmissions-tab-container',
            file: 'fonctionnalites/transmissions_complet/affichage_page/transmissions-tab.html',
            insertMode: 'replace'
        },
        {
            container: 'adp-tab-container',
            file: 'fonctionnalites/adp_complet/adp-tab.html',
            insertMode: 'replace'
        },
        {
            container: 'point-accueil-tab-container',
            file: 'fonctionnalites/point_accueil_complet/point-accueil-tab.html',
            insertMode: 'replace'
        },
        {
            container: 'statistiques-tab-container',
            file: 'fonctionnalites/statistiques_complet/statistiques-tab.html',
            insertMode: 'replace'
        },
        {
            container: 'archives-tab-container',
            file: 'fonctionnalites/archives_complet/archives-tab.html',
            insertMode: 'replace'
        },
        {
            container: 'footer-container',
            file: 'fonctionnalites/interface_complet/footer.html',
            insertMode: 'replace'
        },
        {
            container: 'modal-transmission-container',
            file: 'fonctionnalites/interface_complet/gestion_modales/modal-transmission.html',
            insertMode: 'replace'
        },
        {
            container: 'modal-adp-container',
            file: 'fonctionnalites/adp_complet/modal-adp.html',
            insertMode: 'replace'
        },
        {
            container: 'modal-point-accueil-container',
            file: 'fonctionnalites/point_accueil_complet/modal-point-accueil.html',
            insertMode: 'replace'
        },
        {
            container: 'modal-doublons-container',
            file: 'fonctionnalites/interface_complet/modal-doublons.html',
            insertMode: 'replace'
        }
    ];

    /**
     * Charge un fichier HTML via XMLHttpRequest (compatible file://)
     */
    function loadHtmlFile(filePath) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error('Erreur chargement ' + filePath + ': ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function() {
                reject(new Error('Erreur réseau pour ' + filePath));
            };
            xhr.send();
        });
    }

    /**
     * Charge un module HTML et l'insère dans son container
     */
    async function loadHtmlModule(module) {
        try {
            const html = await loadHtmlFile(module.file);
            const container = document.getElementById(module.container);
            
            if (!container) {
                console.warn('Container #' + module.container + ' non trouvé');
                return false;
            }

            if (module.insertMode === 'replace') {
                container.outerHTML = html;
            } else {
                container.innerHTML = html;
            }

            return true;
        } catch (error) {
            console.error('Erreur chargement ' + module.file + ':', error.message);
            return false;
        }
    }

    /**
     * Charge tous les modules HTML en PARALLÈLE pour optimiser la performance
     */
    async function loadAllModules() {
        console.log('Chargement des modules HTML...');
        var startTime = performance.now();
        
        // Charger tous les modules en parallèle
        var results = await Promise.all(
            htmlModules.map(function(module) { return loadHtmlModule(module); })
        );

        var successCount = results.filter(function(r) { return r; }).length;
        var duration = Math.round(performance.now() - startTime);
        
        console.log(successCount + '/' + htmlModules.length + ' modules chargés en ' + duration + 'ms');

        // Déclenche un événement pour signaler que le HTML est prêt
        window.dispatchEvent(new CustomEvent('html-modules-loaded'));
        
        return successCount === htmlModules.length;
    }

    // Charger les modules au démarrage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllModules);
    } else {
        loadAllModules();
    }

    // Export pour utilisation externe
    window.HtmlLoader = {
        loadModule: loadHtmlModule,
        loadAll: loadAllModules,
        modules: htmlModules
    };
})();
