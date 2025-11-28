# language: fr

@adp @ajout_personne_complete
Fonctionnalité: Gestion ADP (Accès Droits Personnes)
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir ajouter une personne ADP complète
  Afin d'enregistrer toutes les informations nécessaires

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "ADP"

  Scénario: Ajout d'une nouvelle personne ADP avec toutes les informations
    Lorsque je clique sur le bouton "Ajouter" dans l'onglet ADP
    Et que je remplis le champ "Nom" avec "Lefebvre"
    Et que je remplis le champ "Prénom" avec "Marie"
    Et que je sélectionne la date de naissance "1985-03-10"
    Et que je remplis "Description Physique" avec "Cheveux bruns, 1m65"
    Et que je sélectionne le département "94 - Val-de-Marne"
    Et que je sélectionne la typologie "Femme seule"
    Et que je sélectionne "1" personne
    Et que je sélectionne "0" mineur
    Et que je sélectionne le type de transmission "Jour"
    Et que je coche "Point Accueil"
    Et que je remplis l'adresse avec "5 avenue du Général de Gaulle"
    Et que je sélectionne la ville "Créteil A (MONDOR/ECHAT/MOSQUEE)"
    Et que je coche "1er contact"
    Et que je coche "Orientation" dans l'accompagnement
    Et que je coche "Hygiène" dans la distribution
    Et que je saisis "Première rencontre avec Marie" dans les commentaires
    Et que je clique sur "Enregistrer"
    Alors la modale devrait se fermer
    Et une nouvelle carte ADP devrait apparaître dans la liste
    Et la carte devrait contenir les informations "Marie Lefebvre"
