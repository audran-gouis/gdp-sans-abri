# language: fr

Fonctionnalité: Gestion des Transmissions Quotidiennes
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir ajouter une transmission complète
  Afin d'enregistrer toutes les informations d'une intervention

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Transmissions Quotidiennes"

  Scénario: Ajout d'une nouvelle transmission complète
    Lorsque je clique sur le bouton "Ajouter"
    Et que je remplis le champ "Nom" avec "Dupont"
    Et que je remplis le champ "Prénom" avec "Jean"
    Et que je sélectionne la date de naissance "1980-05-15"
    Et que je sélectionne la typologie "Homme Seul"
    Et que je sélectionne "1" personne
    Et que je sélectionne "0" mineur
    Et que je sélectionne le type de transmission "Jour"
    Et que je remplis l'adresse avec "12 rue de la Paix"
    Et que je sélectionne la ville "Créteil A (MONDOR/ECHAT/MOSQUEE)"
    Et que je coche "Personne présente"
    Et que je coche "Écoute" dans l'accompagnement
    Et que je coche "Alimentaire" dans la distribution
    Et que je saisis "Transmission de test" dans le contenu
    Et que je clique sur "Enregistrer"
    Alors la modale devrait se fermer
    Et une nouvelle carte devrait apparaître dans la liste
    Et la carte devrait contenir les informations "Jean Dupont"

