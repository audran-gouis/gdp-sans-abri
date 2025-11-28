# language: fr

Fonctionnalité: Navigation entre les onglets
  En tant qu'utilisateur de l'application
  Je veux pouvoir naviguer entre les différents onglets
  Afin d'accéder aux différentes fonctionnalités

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur la page d'accueil

  Scénario: Navigation entre tous les onglets
    Lorsque je clique sur l'onglet "ADP"
    Et que je clique sur l'onglet "Statistiques"
    Et que je clique sur l'onglet "Transmissions Quotidiennes"
    Alors l'onglet "Transmissions Quotidiennes" devrait être actif
    Et je devrais voir le contenu des transmissions quotidiennes

