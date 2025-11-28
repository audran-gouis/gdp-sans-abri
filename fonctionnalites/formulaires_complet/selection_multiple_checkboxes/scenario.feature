# language: fr

Fonctionnalité: Validation et comportement des formulaires
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir sélectionner plusieurs cases à cocher
  Afin d'enregistrer plusieurs types d'intervention

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur le formulaire de transmission

  Scénario: Sélection multiple de cases à cocher - Type d'intervention
    Lorsque je coche "1er contact"
    Et que je coche "Personne présente"
    Et que je coche "Maraude"
    Alors toutes les cases devraient rester cochées
    Et je devrais pouvoir enregistrer avec plusieurs types d'intervention

