# language: fr

Fonctionnalité: Persistance des données avec IndexedDB
  En tant qu'utilisateur de l'application de maraudes
  Je veux que mes transmissions soient sauvegardées
  Afin de ne pas perdre mes données

  Contexte:
    Étant donné que l'application est ouverte
    Et que la base de données IndexedDB est initialisée

  Scénario: Sauvegarde d'une transmission
    Étant donné que je suis sur l'onglet "Transmissions Quotidiennes"
    Lorsque j'ajoute une nouvelle transmission avec le nom "Dupont"
    Alors la transmission devrait être enregistrée dans IndexedDB
    Et un identifiant unique devrait être généré automatiquement
    Et la date de création devrait être enregistrée
    Et la date de transmission devrait être enregistrée

