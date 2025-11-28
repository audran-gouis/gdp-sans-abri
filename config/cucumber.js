module.exports = {
  default: {
    // Charge tous les fichiers nécessaires
    require: [
      'fonctionnalites/support/world.js',
      'fonctionnalites/support/hooks.js',
      'fonctionnalites/**/*_manager.js',
      'fonctionnalites/**/steps.js'
    ],
    
    // Format des rapports
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      '@cucumber/pretty-formatter'
    ],
    
    // Options de publication
    publishQuiet: true,
    
    // PAS de parallélisation pour éviter les conflits de steps
    parallel: 1,
    
    // Retry en cas d'échec (optionnel)
    retry: 0,
    
    // Timeout par défaut (en millisecondes)
    timeout: 120000, // 2 minutes pour Electron
    
    // Langage
    language: 'fr',
    
    // Paths pour les features - UN SEUL SCÉNARIO À LA FOIS
    // Utiliser requireModule pour charger uniquement les steps du scénario en cours
    requireModule: ['ts-node/register'],
    
    // Lancer tous les scénarios mais un par un
    paths: [
      'fonctionnalites/**/*.feature'
    ]
  }
};
