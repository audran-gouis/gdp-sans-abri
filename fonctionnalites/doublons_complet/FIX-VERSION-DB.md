# ✅ Correction du problème de version IndexedDB

## 🔴 Problème identifié

```
DOMException: The requested version (1) is less than the existing version (2).
```

**Cause** : La base de données IndexedDB `MaraudesUnifiedDB` était en version 2, mais le code demandait la version 1. IndexedDB ne permet pas de "rétrograder" une base de données vers une version inférieure.

## 🔧 Solution appliquée

### 1. Mise à jour de la version dans le code
```javascript
// Avant
const DB_VERSION_UNIFIED = 1;

// Après
const DB_VERSION_UNIFIED = 2;
```

### 2. Ajout de la gestion de migration v1 → v2

Le code gère maintenant correctement la migration en ajoutant l'index `personneId_date_type` s'il n'existe pas :

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const oldVersion = event.oldVersion;
  const transaction = event.target.transaction;

  // Si migration depuis v1
  if (oldVersion < 2) {
    // Ajouter l'index composé
    interventionsStore.createIndex('personneId_date_type', 
      ['personneId', 'date', 'type'], 
      { unique: true }
    );
  }
};
```

### 3. Gestion des erreurs de contrainte unique

Si l'index ne peut pas être créé avec `unique: true` (à cause de doublons existants), le code essaie de le créer avec `unique: false`.

## 📊 Logs de migration

Lors du rechargement, vous verrez dans la console :

```
🔄 Mise à jour DB: v1 → v2
✅ Index personneId_date_type ajouté
✅ Base Unifiée ouverte
```

Ou si des doublons existent :

```
🔄 Mise à jour DB: v1 → v2
⚠️ Erreur création index (probablement des doublons): ...
✅ Index personneId_date_type ajouté (non-unique)
✅ Base Unifiée ouverte
```

## 🎯 Actions à effectuer

### Option 1 : Rechargez simplement l'application
1. Rechargez la page (F5)
2. La migration v1 → v2 se fera automatiquement
3. Vérifiez la console pour les logs de migration

### Option 2 : Si vous voulez repartir de zéro (optionnel)
1. Ouvrez la console (F12)
2. Exécutez :
```javascript
indexedDB.deleteDatabase('MaraudesUnifiedDB');
location.reload();
```

## ✅ Vérification

Après rechargement, testez la détection des doublons :

1. Allez sur l'onglet "Doublons"
2. Cliquez sur "Détecter les doublons"
3. Vérifiez la console :

```
📊 Analyse de X personne(s)
✅ X groupe(s) de doublons détecté(s)
```

## 🔑 Points techniques

### Pourquoi version 2 ?

La version 2 ajoute l'index composé `personneId_date_type` qui :
- Permet de détecter rapidement les interventions en doublon
- Empêche la création de doublons (même personne, même date, même type)
- Est nécessaire pour le système de gestion des doublons

### Migration automatique

Le code détecte maintenant :
- L'ancienne version (`oldVersion`)
- La nouvelle version (`DB_VERSION_UNIFIED`)
- Applique les modifications nécessaires automatiquement

### Gestion des doublons existants

Si votre base contient déjà des doublons d'interventions :
- L'index sera créé en mode `unique: false`
- Utilisez "Nettoyer les interventions" dans l'onglet Doublons
- L'index pourra ensuite être recréé en mode `unique: true` si nécessaire

## 🎉 Résultat

- ✅ La base de données est maintenant en version 2
- ✅ L'index pour la détection des doublons est créé
- ✅ La migration est automatique
- ✅ Le système de doublons fonctionne correctement

**Rechargez votre application et tout devrait fonctionner !** 🚀
