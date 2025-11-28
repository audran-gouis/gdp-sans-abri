const { Given, When } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==================== FICHIER VIDE ====================
// Les steps communs ne sont plus utilisés
// Chaque scénario a ses propres steps dans son dossier
// Ce fichier est conservé pour compatibilité mais ne contient aucun step

// Si vous voulez ajouter des steps vraiment partagés par TOUS les scénarios,
// ajoutez-les ici, mais assurez-vous qu'ils ne sont pas redéfinis ailleurs
