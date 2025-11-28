# language: fr

Fonctionnalité: Navigation entre les onglets
  En tant qu'utilisateur de l'application
  Je veux pouvoir naviguer entre les différents onglets
  Afin d'accéder aux différentes fonctionnalités

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur la page d'accueil

  Scénario: Navigation vers l'onglet ADP
    Lorsque je clique sur l'onglet "ADP"
    Alors l'onglet "ADP" devrait être actif
    Et je devrais voir le contenu de l'ADP
    Et l'onglet "Transmissions Quotidiennes" ne devrait plus être actif

