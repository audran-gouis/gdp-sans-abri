# language: fr

@point_accueil @ajout_personne_inconnue
Fonctionnalité: Ajout d'une personne inconnue au Point d'Accueil
  En tant qu'utilisateur du Point d'Accueil
  Je veux pouvoir enregistrer une personne dont je ne connais pas l'identité
  Afin de documenter toutes les visites même sans identification

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Point Accueil"

  Scénario: Cocher la case "Inconnu" désactive les champs identité
    Lorsque je clique sur "Nouvelle fiche Point Accueil"
    Et que je coche la case "Inconnu"
    Alors les champs "Nom" et "Prénom" devraient être désactivés
    Et le champ "Description physique" devrait rester actif

  Scénario: Enregistrement d'une personne inconnue avec description
    Lorsque je clique sur "Nouvelle fiche Point Accueil"
    Et que je coche la case "Inconnu"
    Et que je remplis "Description physique" avec "Homme, environ 40 ans, veste bleue"
    Et que je sélectionne le point d'accueil "Point Accueil 2"
    Et que je sélectionne la date "08/12/2024"
    Et que je coche "Alimentaire" dans Distribution
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait être enregistrée
    Et la fiche devrait afficher "Inconnu" dans la liste

  Scénario: Décocher "Inconnu" réactive les champs
    Lorsque je clique sur "Nouvelle fiche Point Accueil"
    Et que je coche la case "Inconnu"
    Et que je décoche la case "Inconnu"
    Alors les champs "Nom" et "Prénom" devraient être réactivés

  Scénario: Identification ultérieure d'une personne inconnue
    Étant donné une fiche Point Accueil avec "Inconnu" coché
    Lorsque je modifie cette fiche
    Et que je décoche "Inconnu"
    Et que je remplis "Nom" avec "Durand"
    Et que je remplis "Prénom" avec "Paul"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher "Paul Durand"
    Et la description physique devrait être conservée

