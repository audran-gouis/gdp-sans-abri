# 🐛 Fix - L'historique était écrasé lors des modifications

## Problème identifié

Lorsqu'on modifiait les informations personnelles d'une personne (département, typologie, etc.), **tout l'historique était écrasé** au lieu d'ajouter une nouvelle version.

## Cause racine

Dans le code de soumission du formulaire, on créait un objet `personneData` qui contenait **à la fois** :
1. Les nouveaux champs historisés (`departement`, `typologie`, `nbPersonnes`, `mineurs`)
2. Le nouvel historique (`infoHistorique`)

Ensuite, on appelait `updatePersonne(personneId, personneData)`, ce qui **écrasait tous les champs**, y compris l'historique.

### Code problématique (AVANT)

```javascript
const personneData = {
  nom: ...,
  prenom: ...,
  departement: document.getElementById('form-departement').value,  // ❌ PROBLÈME
  typologie: document.getElementById('form-typologie').value,       // ❌ PROBLÈME
  nbPersonnes: document.getElementById('form-nb-personnes').value,  // ❌ PROBLÈME
  mineurs: document.getElementById('form-mineurs').value            // ❌ PROBLÈME
};

// Plus tard...
personneData.infoHistorique = window.ajouterVersionInfos(...);
await window.updatePersonne(personneId, personneData); // ❌ ÉCRASE TOUT
```

Le problème : `updatePersonne` recevait un objet avec les **nouvelles valeurs directes** qui écrasaient les anciennes + l'historique.

## Solution

### 1. Ne plus inclure les champs historisés dans `personneData`

```javascript
const personneData = {
  nom: document.getElementById('form-nom').value,
  prenom: document.getElementById('form-prenom').value,
  dateNaissance: document.getElementById('form-ddn').value,
  descriptionPhysique: document.getElementById('form-description')?.value || '',
  inconnu: document.getElementById('form-inconnu')?.checked || false
  // ✅ PAS de departement, typologie, nbPersonnes, mineurs ici
};
```

### 2. Gérer les champs historisés séparément

```javascript
// Récupérer les valeurs depuis le formulaire
const nouvellesInfos = {
  departement: document.getElementById('form-departement')?.value || '',
  typologie: document.getElementById('form-typologie').value,
  nbPersonnes: document.getElementById('form-nb-personnes').value,
  mineurs: document.getElementById('form-mineurs').value
};

// Mettre à jour l'historique
const historiqueMAJ = window.ajouterVersionInfos(
  personneExistante, 
  selectedDate, 
  nouvellesInfos
);

// ✅ Ajouter UNIQUEMENT l'historique à personneData
personneData.infoHistorique = historiqueMAJ;
```

### 3. Code correct (APRÈS)

```javascript
// Mode édition
if (personneId) {
  const personneExistante = await window.getPersonneById(personneId);
  
  const nouvellesInfos = {
    departement: document.getElementById('form-departement')?.value || '',
    typologie: document.getElementById('form-typologie').value,
    nbPersonnes: document.getElementById('form-nb-personnes').value,
    mineurs: document.getElementById('form-mineurs').value
  };
  
  const historiqueMAJ = window.ajouterVersionInfos(
    personneExistante, 
    selectedDate, 
    nouvellesInfos
  );
  
  // ✅ On met à jour UNIQUEMENT l'historique
  personneData.infoHistorique = historiqueMAJ;
  
  await window.updatePersonne(personneId, personneData);
}

// Mode création
else {
  finalPersonneId = await window.creerOuRecupererPersonne(personneData);
  
  const personneCreee = await window.getPersonneById(finalPersonneId);
  const infosInitiales = { ... };
  
  const historiqueInit = window.ajouterVersionInfos(
    personneCreee,
    selectedDate,
    infosInitiales
  );
  
  // ✅ On met à jour UNIQUEMENT l'historique
  await window.updatePersonne(finalPersonneId, { infoHistorique: historiqueInit });
}
```

## Comportement attendu

### Avant le fix ❌
1. Personne créée le 15/01/2024 avec Département "75"
2. Modification le 15/06/2024 : changement Département à "93"
3. **Résultat** : L'historique est écrasé, seule la version du 15/06 existe
4. En consultant une intervention du 15/01, on voit "93" (incorrect)

### Après le fix ✅
1. Personne créée le 15/01/2024 avec Département "75"
2. Modification le 15/06/2024 : changement Département à "93"
3. **Résultat** : Deux versions dans l'historique :
   - Version 1 : 15/01/2024 → Département "75"
   - Version 2 : 15/06/2024 → Département "93"
4. En consultant une intervention du 15/01, on voit "75" (correct) ✅
5. En consultant une intervention du 15/06, on voit "93" (correct) ✅

## Fonction `ajouterVersionInfos`

Cette fonction gère intelligemment l'historique :
- ✅ Vérifie si une version existe déjà pour la date → met à jour
- ✅ Détecte si les valeurs ont changé → ajoute nouvelle version
- ✅ Si aucun changement → ne fait rien
- ✅ Trie l'historique par date
- ✅ Retourne l'historique complet

## Tests à effectuer

### Test 1 : Création puis modification
1. Créer une personne le 15/01/2024 : Département "75"
2. Vérifier l'historique : 1 version (15/01/2024)
3. Modifier le 15/06/2024 : Département "93"
4. Vérifier l'historique : 2 versions (15/01 et 15/06)
5. ✅ L'historique n'est PAS écrasé

### Test 2 : Affichage des anciennes interventions
1. Après le test 1, sélectionner la date 15/01/2024
2. Vérifier que la carte affiche "Département : 75"
3. Sélectionner la date 15/06/2024
4. Vérifier que la carte affiche "Département : 93"
5. ✅ Les bonnes valeurs sont affichées selon la date

### Test 3 : Modification sans changement
1. Ouvrir une fiche existante
2. Ne rien modifier
3. Enregistrer
4. Vérifier l'historique : pas de nouvelle version
5. ✅ Aucune version inutile créée

### Test 4 : Modification multiple
1. Modifier Département, Typologie, Nb Personnes en même temps
2. Vérifier l'historique : une seule nouvelle version avec tous les changements
3. ✅ Tous les changements sont dans la même version

## Impact

**Fichiers modifiés :**
- `fonctionnalites/transmissions_complet/ajout_transmission_minimale/code.js`

**Lignes modifiées :**
- Lignes 334-345 : Suppression des champs historisés de `personneData`
- Lignes 386-436 : Gestion correcte de l'historisation

**Rétrocompatibilité :** ✅ Totale (fonctionne avec les anciennes et nouvelles données)

## Prochaines étapes

- [ ] Appliquer le même fix à ADP (`ajout_personne_complete/code.js`)
- [ ] Appliquer le même fix à Point Accueil (`point-accueil-init.js`)
- [ ] Tester en conditions réelles

---

**Date du fix :** Décembre 2024  
**Statut :** ✅ Corrigé pour Transmissions  
**À faire :** Appliquer à ADP et Point Accueil

