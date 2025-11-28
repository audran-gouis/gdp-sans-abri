# language: fr

Fonctionnalité: Statistiques et Rapports
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir filtrer par type d'intervention
  Afin d'analyser les différents types d'actions menées

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Statistiques"

  Scénario: Filtrage par type d'intervention - Maraude
    Lorsque je coche "Maraude" dans les types d'intervention
    Et que je clique sur "Appliquer"
    Alors je devrais voir les statistiques des maraudes

