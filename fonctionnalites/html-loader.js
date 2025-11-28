/**
 * HTML Loader - Charge les fichiers HTML modulaires dans leurs containers
 * Ce script charge dynamiquement les parties HTML depuis les dossiers de fonctionnalités
 */

(function() {
    'use strict';

    // Configuration des modules HTML à charger
    const htmlModules = [
        {
            container: 'navigation-container',
            file: 'fonctionnalites/navigation_complet/navigation-tabs.html',
            replace: true // Remplace le container par le contenu
        },
        {
            container: 'transmissions-tab-container',
            file: 'fonctionnalites/transmissions_complet/affichage_page/transmissions-tab.html',
            replace: true
        },
        {
            container: 'adp-tab-container',
            file: 'fonctionnalites/adp_complet/adp-tab.html',
            replace: true
        },
        {
            container: 'statistiques-tab-container',
            file: 'fonctionnalites/statistiques_complet/statistiques-tab.html',
            replace: true
        },
        {
            container: 'footer-container',
            file: 'fonctionnalites/interface_complet/footer.html',
            replace: true
        },
        {
            container: 'modal-transmission-container',
            file: 'fonctionnalites/interface_complet/gestion_modales/modal-transmission.html',
            replace: true
        },
        {
            container: 'modal-adp-container',
            file: 'fonctionnalites/adp_complet/modal-adp.html',
            replace: true
        }
    ];

    /**
     * Charge un fichier HTML et l'insère dans son container
     */
    async function loadHtmlModule(module) {
        try {
            const response = await fetch(module.file);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const container = document.getElementById(module.container);
            
            if (!container) {
                console.warn(`Container #${module.container} non trouvé`);
                return false;
            }

            if (module.replace) {
                // Remplace le container par le contenu HTML
                container.outerHTML = html;
            } else {
                // Insère le contenu dans le container
                container.innerHTML = html;
            }

            console.log(`✅ Module chargé: ${module.file}`);
            return true;
        } catch (error) {
            console.error(`❌ Erreur chargement ${module.file}:`, error.message);
            return false;
        }
    }

    /**
     * Charge tous les modules HTML
     */
    async function loadAllModules() {
        console.log('🔄 Chargement des modules HTML...');
        
        const results = await Promise.all(
            htmlModules.map(module => loadHtmlModule(module))
        );

        const successCount = results.filter(r => r).length;
        console.log(`📦 ${successCount}/${htmlModules.length} modules chargés`);

        // Déclenche un événement pour signaler que le HTML est prêt
        window.dispatchEvent(new CustomEvent('html-modules-loaded'));
    }

    // Charger les modules au démarrage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllModules);
    } else {
        loadAllModules();
    }

    // Export pour utilisation externe si nécessaire
    window.HtmlLoader = {
        loadModule: loadHtmlModule,
        loadAll: loadAllModules,
        modules: htmlModules
    };
})();

