/**
 * Script de build pour assembler les fichiers HTML partiels
 * Usage: node build-html.js
 * 
 * Ce script assemble les fichiers HTML modulaires en un seul index.html
 */

const fs = require('fs');
const path = require('path');

// Configuration des fichiers partiels
const partials = {
    navigation: 'fonctionnalites/navigation_complet/navigation-tabs.html',
    transmissionsTab: 'fonctionnalites/transmissions_complet/affichage_page/transmissions-tab.html',
    adpTab: 'fonctionnalites/adp_complet/adp-tab.html',
    statistiquesTab: 'fonctionnalites/statistiques_complet/statistiques-tab.html',
    modalTransmission: 'fonctionnalites/interface_complet/gestion_modales/modal-transmission.html',
    modalAdp: 'fonctionnalites/adp_complet/modal-adp.html',
    footer: 'fonctionnalites/interface_complet/footer.html'
};

// Fonction pour lire un fichier partial
function readPartial(partialPath) {
    try {
        return fs.readFileSync(partialPath, 'utf8');
    } catch (error) {
        console.error(`Erreur lecture ${partialPath}:`, error.message);
        return `<!-- Erreur: ${partialPath} non trouvé -->`;
    }
}

// Fonction pour indenter le contenu
function indent(content, spaces = 8) {
    const indentation = ' '.repeat(spaces);
    return content.split('\n').map(line => indentation + line).join('\n');
}

// Template principal
const template = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
    <title>App Finale Maraudes</title>
    
    <!-- Styles de base -->
    <link rel="stylesheet" href="fonctionnalites/interface_complet/base.css">
    <link rel="stylesheet" href="fonctionnalites/interface_complet/content-card.css">
    
    <!-- Navigation -->
    <link rel="stylesheet" href="fonctionnalites/navigation_complet/navigation-tabs.css">
    
    <!-- Modales -->
    <link rel="stylesheet" href="fonctionnalites/interface_complet/gestion_modales/modal.css">
    <link rel="stylesheet" href="fonctionnalites/interface_complet/gestion_modales/modal-header.css">
    <link rel="stylesheet" href="fonctionnalites/interface_complet/gestion_modales/modal-body.css">
    
    <!-- Formulaires -->
    <link rel="stylesheet" href="fonctionnalites/formulaires_complet/form-grid.css">
    <link rel="stylesheet" href="fonctionnalites/formulaires_complet/form-inputs.css">
    <link rel="stylesheet" href="fonctionnalites/formulaires_complet/form-buttons.css">
    <link rel="stylesheet" href="fonctionnalites/formulaires_complet/form-section-collapse.css">
    <link rel="stylesheet" href="fonctionnalites/formulaires_complet/modal-footer.css">
    <link rel="stylesheet" href="fonctionnalites/formulaires_complet/selection_multiple_checkboxes/checkbox-group.css">
    
    <!-- Transmissions -->
    <link rel="stylesheet" href="fonctionnalites/transmissions_complet/affichage_page/date-selector.css">
    <link rel="stylesheet" href="fonctionnalites/transmissions_complet/affichage_page/transmission-card.css">
    <link rel="stylesheet" href="fonctionnalites/transmissions_complet/affichage_page/empty-state.css">
    <link rel="stylesheet" href="fonctionnalites/transmissions_complet/filtrage_par_nom/filtres.css">
    <link rel="stylesheet" href="fonctionnalites/transmissions_complet/ajout_transmission_minimale/btn-add.css">
    <link rel="stylesheet" href="fonctionnalites/transmissions_complet/modification_transmission/card-actions.css">
    
    <!-- Statistiques -->
    <link rel="stylesheet" href="fonctionnalites/statistiques_complet/stats-source-selector.css">
    <link rel="stylesheet" href="fonctionnalites/statistiques_complet/stats-filter-actions.css">
    <link rel="stylesheet" href="fonctionnalites/statistiques_complet/selection_periode_jour/stats-date-selector.css">
    <link rel="stylesheet" href="fonctionnalites/statistiques_complet/filtrage_par_type_intervention/stats-filters.css">
    <link rel="stylesheet" href="fonctionnalites/statistiques_complet/filtrage_par_type_intervention/stats-checkbox.css">
</head>
<body>
    <div id="app">
        <!-- Navigation (from: fonctionnalites/navigation_complet/navigation-tabs.html) -->
{{NAVIGATION}}

        <main class="app-main">
            <!-- Transmissions Tab (from: fonctionnalites/transmissions_complet/affichage_page/transmissions-tab.html) -->
{{TRANSMISSIONS_TAB}}

            <!-- ADP Tab (from: fonctionnalites/adp_complet/adp-tab.html) -->
{{ADP_TAB}}

            <!-- Statistiques Tab (from: fonctionnalites/statistiques_complet/statistiques-tab.html) -->
{{STATISTIQUES_TAB}}
        </main>

        <!-- Footer (from: fonctionnalites/interface_complet/footer.html) -->
{{FOOTER}}
    </div>

    <!-- Modal Transmission (from: fonctionnalites/interface_complet/gestion_modales/modal-transmission.html) -->
{{MODAL_TRANSMISSION}}

    <!-- Modal ADP (from: fonctionnalites/adp_complet/modal-adp.html) -->
{{MODAL_ADP}}

    <!-- Scripts fonctionnels -->
    <script src="fonctionnalites/persistance_complet/database.js"></script>
    <script src="fonctionnalites/transmissions_complet/affichage_page/code.js"></script>
    <script src="fonctionnalites/transmissions_complet/ajout_transmission_minimale/code.js"></script>
    <script src="fonctionnalites/adp_complet/ajout_personne_complete/code.js"></script>
    <script src="fonctionnalites/navigation_complet/affichage_onglet_par_defaut/code.js"></script>
    
    <!-- Script principal -->
    <script src="renderer.js"></script>
</body>
</html>`;

// Build
console.log('🔨 Assemblage des fichiers HTML...');

let output = template;

// Remplacer les placeholders
output = output.replace('{{NAVIGATION}}', indent(readPartial(partials.navigation), 8));
output = output.replace('{{TRANSMISSIONS_TAB}}', indent(readPartial(partials.transmissionsTab), 12));
output = output.replace('{{ADP_TAB}}', indent(readPartial(partials.adpTab), 12));
output = output.replace('{{STATISTIQUES_TAB}}', indent(readPartial(partials.statistiquesTab), 12));
output = output.replace('{{FOOTER}}', indent(readPartial(partials.footer), 8));
output = output.replace('{{MODAL_TRANSMISSION}}', indent(readPartial(partials.modalTransmission), 4));
output = output.replace('{{MODAL_ADP}}', indent(readPartial(partials.modalAdp), 4));

// Écrire le fichier
fs.writeFileSync('index.html', output, 'utf8');
console.log('✅ index.html généré avec succès!');
console.log('');
console.log('Fichiers sources utilisés:');
Object.entries(partials).forEach(([name, path]) => {
    console.log(`  - ${name}: ${path}`);
});

