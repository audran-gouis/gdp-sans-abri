/**
 * Hooks - Cycle de vie des tests Cucumber
 * Gère l'initialisation et le nettoyage avant/après chaque test
 */

const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

let electronApp;
let page;
let tempUserDataDir;

/**
 * Crée un dossier temporaire unique pour les données utilisateur Electron
 */
function createTempUserDataDir() {
  const tempDir = path.join(os.tmpdir(), `electron-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Supprime un dossier et son contenu récursivement
 */
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        try {
          fs.unlinkSync(curPath);
        } catch (e) {
          // Ignorer les erreurs de suppression
        }
      }
    });
    try {
      fs.rmdirSync(folderPath);
    } catch (e) {
      // Ignorer les erreurs de suppression
    }
  }
}

/**
 * Configuration avant tous les tests
 */
BeforeAll(async function() {
  console.log('🚀 Initialisation de l\'environnement de test BDD...');
});

/**
 * Configuration avant chaque scénario
 * Lance une nouvelle instance de l'application Electron avec un dossier de données isolé
 */
Before({ timeout: 60000 }, async function(scenario) {
  console.log(`\n📋 Démarrage du scénario: ${scenario.pickle.name}`);
  
  try {
    // Créer un dossier temporaire unique pour ce test
    tempUserDataDir = createTempUserDataDir();
    
    // Lancer l'application Electron avec un dossier de données isolé
    electronApp = await electron.launch({
      args: [
        'main.js',
        `--user-data-dir=${tempUserDataDir}`
      ],
      cwd: process.cwd()
    });
    
    // Obtenir la première fenêtre
    page = await electronApp.firstWindow();
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('domcontentloaded');
    
    // Attendre que l'UI soit prête (les onglets sont visibles)
    await page.waitForFunction(() => {
      return document.querySelector('.tab-button') !== null;
    }, { timeout: 30000 });
    console.log('✅ Application complètement initialisée (tous les scripts chargés)');
    
    // Rendre la page et l'app disponibles dans le contexte du scénario
    this.electronApp = electronApp;
    this.page = page;
    this.tempUserDataDir = tempUserDataDir;
    
    console.log('✅ Application Electron lancée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du lancement de l\'application:', error);
    throw error;
  }
});

/**
 * Nettoyage après chaque scénario
 * Prend une capture d'écran en cas d'échec
 */
After({ timeout: 30000 }, async function(scenario) {
  const scenarioName = scenario.pickle.name;
  const scenarioStatus = scenario.result.status;
  
  if (scenarioStatus === Status.FAILED) {
    console.log(`❌ Échec du scénario: ${scenarioName}`);
    
    // Prendre une capture d'écran en cas d'échec
    if (this.page) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
        console.log('📸 Capture d\'écran ajoutée au rapport');
      } catch (error) {
        console.error('⚠️  Impossible de prendre une capture d\'écran:', error.message);
      }
    }
    
    // Capturer l'état de la base de données
    if (this.page) {
      try {
        const dbData = await this.getDatabaseData();
        this.attach(JSON.stringify(dbData, null, 2), 'application/json');
        console.log('💾 Données de la base capturées');
      } catch (error) {
        console.error('⚠️  Impossible de capturer les données:', error.message);
      }
    }
  } else {
    console.log(`✅ Succès du scénario: ${scenarioName}`);
  }
  
  // Fermer l'application Electron
  if (this.electronApp) {
    try {
      await this.electronApp.close();
      console.log('🔒 Application Electron fermée');
    } catch (error) {
      console.error('⚠️  Erreur lors de la fermeture:', error.message);
    }
  }
  
  // Nettoyer le dossier temporaire
  if (this.tempUserDataDir) {
    // Attendre un peu que les fichiers soient libérés
    await new Promise(resolve => setTimeout(resolve, 500));
    deleteFolderRecursive(this.tempUserDataDir);
  }
});

/**
 * Nettoyage après tous les tests
 */
AfterAll(async function() {
  console.log('\n🏁 Fin des tests BDD');
});

// Export pour utilisation dans les step definitions (si nécessaire)
module.exports = {
  getPage: function() {
    return page;
  },
  getElectronApp: function() {
    return electronApp;
  }
};
