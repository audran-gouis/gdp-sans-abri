# language: fr

Fonctionnalité: Gestion des Transmissions Quotidiennes
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir filtrer les transmissions par nom
  Afin de retrouver rapidement une personne

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Transmissions Quotidiennes"
    Et que j'ai ajouté une transmission avec le nom "Dupont"
    Et que j'ai ajouté une transmission avec le nom "Martin"

  Scénario: Filtrage par nom
    Lorsque je saisis "Dupont" dans le filtre "Nom"
    Alors je devrais voir uniquement la carte contenant "Dupont"
    Et je ne devrais pas voir la carte contenant "Martin"

