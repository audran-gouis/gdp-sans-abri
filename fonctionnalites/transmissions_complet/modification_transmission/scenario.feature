# language: fr

Fonctionnalité: Gestion des Transmissions Quotidiennes
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir modifier une transmission existante
  Afin de corriger ou compléter les informations

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Transmissions Quotidiennes"
    Et que j'ai ajouté une transmission avec le nom "Dupont"

  Scénario: Modification d'une transmission
    Lorsque je clique sur "Compléter"
    Et que je change le nom en "Durand"
    Et que je clique sur "Enregistrer"
    Alors la carte devrait afficher le nom "Durand"

