# language: fr

Fonctionnalité: Gestion des Transmissions Quotidiennes
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir supprimer une transmission
  Afin de retirer les entrées erronées

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Transmissions Quotidiennes"
    Et que j'ai ajouté une transmission

  Scénario: Suppression d'une transmission
    Lorsque je clique sur "Supprimer"
    Et que je confirme la suppression
    Alors la carte devrait disparaître de la liste

