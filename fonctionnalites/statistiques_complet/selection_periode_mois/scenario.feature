# language: fr

Fonctionnalité: Statistiques et Rapports
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir consulter des statistiques mensuelles
  Afin d'analyser les données d'un mois complet

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Statistiques"

  Scénario: Statistiques pour un mois
    Lorsque je sélectionne le type de période "Mois"
    Et que je sélectionne le mois "2025-11"
    Et que je clique sur "Appliquer"
    Alors je devrais voir les statistiques pour novembre 2025

