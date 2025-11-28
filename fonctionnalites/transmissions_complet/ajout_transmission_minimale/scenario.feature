# language: fr

Fonctionnalité: Gestion des Transmissions Quotidiennes
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir ajouter une transmission avec informations minimales
  Afin de gagner du temps lors des saisies rapides

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Transmissions Quotidiennes"

  Scénario: Ajout d'une transmission avec informations minimales
    Lorsque je clique sur le bouton "Ajouter"
    Et que je remplis le champ "Nom" avec "Martin"
    Et que je clique sur "Enregistrer"
    Alors la modale devrait se fermer
    Et une nouvelle carte devrait apparaître dans la liste
    Et la carte devrait contenir le nom "Martin"

