# Support - Infrastructure de test

Ce dossier contient l'infrastructure nécessaire pour exécuter les tests Cucumber avec Playwright.

## 📁 Fichiers

### `hooks.js` 
**Cycle de vie des tests**

Gère l'initialisation et le nettoyage avant/après chaque test :
- Lance une nouvelle instance Electron avant chaque scénario
- Prend des captures d'écran en cas d'échec
- Capture les données de la base pour debugging
- Ferme proprement l'application après chaque test

### `world.js`
**Contexte partagé Cucumber**

Fournit un contexte partagé entre tous les steps d'un scénario :
- Variables d'état (`transmissions`, `filters`, `formData`, etc.)
- Méthodes utilitaires (délègue à `helpers.js`)
- Accès à `this.page` et `this.electronApp`

### `helpers.js` ⭐ NOUVEAU
**Fonctions utilitaires réutilisables**

Contient des fonctions helper utilisables dans tous les tests :

#### Interactions DOM
```javascript
await helpers.clickElement(page, '#btn-submit');
await helpers.fillInput(page, '#form-name', 'John');
await helpers.selectOption(page, '#form-city', 'Paris');
await helpers.checkCheckbox(page, '#form-accept');
```

#### Vérifications
```javascript
const visible = await helpers.isVisible(page, '#modal');
const hasActiveClass = await helpers.hasClass(page, '.btn', 'active');
const text = await helpers.getText(page, '.message');
```

#### Base de données
```javascript
await helpers.clearDatabase(page);
const data = await helpers.getDatabaseData(page);
const id = await helpers.addTestTransmission(page, { nom: 'Test' });
```

#### Debug
```javascript
await helpers.takeScreenshot(page, 'debug.png');
const logs = helpers.setupConsoleLogging(page);
```

### `common_steps.js`
**Steps communs** (actuellement vide)

Réservé pour des steps Cucumber partagés par **tous** les scénarios.
⚠️ Évitez d'ajouter des steps ici sauf s'ils sont vraiment universels.

## 🔄 Flux d'exécution

```
1. BeforeAll
   └─> Initialisation globale de l'environnement

2. Before (pour chaque scénario)
   ├─> Lance Electron
   ├─> Attend le chargement
   └─> Injecte page dans le contexte

3. Scénario (steps)
   ├─> Utilise world.js pour le contexte
   ├─> Utilise helpers.js pour les actions
   └─> Utilise code.js pour la logique métier

4. After (pour chaque scénario)
   ├─> Capture d'écran si échec
   ├─> Capture des données DB si échec
   └─> Ferme Electron

5. AfterAll
   └─> Nettoyage final
```

## 💡 Utilisation

### Dans un fichier steps.js

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const helpers = require('../support/helpers');

// Utiliser le contexte world
Given('je suis sur la page', async function() {
  // this.page est fourni par world.js via hooks.js
  await this.page.goto('http://localhost');
});

// Utiliser les helpers directement
When('je clique sur {string}', async function(texte) {
  await helpers.clickElement(this.page, `button:has-text("${texte}")`);
});

// Utiliser les méthodes du world
Then('la base devrait contenir des données', async function() {
  const data = await this.getDatabaseData();
  expect(data.length).toBeGreaterThan(0);
});
```

### Dans un fichier code.js

Les fichiers `code.js` contiennent la logique métier et **ne doivent pas** importer `helpers.js` directement, car ils sont aussi utilisés par l'application (browser).

Les helpers sont uniquement pour l'infrastructure de test.

## 🎯 Bonnes pratiques

1. **Hooks** : Ne pas modifier sauf pour des changements d'infrastructure
2. **World** : Ajouter des propriétés d'état, déléguer les actions à helpers
3. **Helpers** : Ajouter des fonctions réutilisables par plusieurs tests
4. **Common steps** : Utiliser avec parcimonie pour éviter les conflits

## 🔍 Debugging

En cas d'échec de test, vérifiez le rapport Cucumber qui contient :
- 📸 Capture d'écran de la page au moment de l'échec
- 💾 État de la base de données
- 📋 Logs de la console (si configuré)














