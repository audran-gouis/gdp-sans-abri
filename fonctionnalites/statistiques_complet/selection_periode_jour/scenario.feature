# language: fr

Fonctionnalité: Statistiques et Rapports
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir consulter des statistiques pour un jour précis
  Afin d'analyser les données d'une journée spécifique

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Statistiques"

  Scénario: Statistiques pour un jour précis
    Lorsque je sélectionne le type de période "Jour précis"
    Et que je sélectionne la date "2025-11-20"
    Et que je clique sur "Appliquer"
    Alors je devrais voir les statistiques pour le "2025-11-20"

