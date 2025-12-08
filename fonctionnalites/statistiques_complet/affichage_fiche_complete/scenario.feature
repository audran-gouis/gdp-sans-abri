# language: fr

@statistiques @affichage_fiche_complete
Fonctionnalité: Affichage de la fiche complète depuis les Statistiques
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir cliquer sur une fiche dans les statistiques pour voir tous les détails
  Afin de consulter les informations complètes incluant les commentaires

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Statistiques"
    Et qu'il existe des fiches enregistrées

  Scénario: Affichage d'une fiche complète en cliquant dessus
    Lorsque je clique sur une fiche dans la liste des statistiques
    Alors une modale devrait s'ouvrir avec les détails complets
    Et je devrais voir le nom et prénom de la personne
    Et je devrais voir la date de naissance
    Et je devrais voir la description physique
    Et je devrais voir les informations d'accompagnement
    Et je devrais voir les commentaires associés

  Scénario: Fermeture de la modale de détails
    Étant donné que la modale de détails est ouverte
    Lorsque je clique sur le bouton de fermeture
    Alors la modale devrait se fermer
    Et je devrais revenir à la vue des statistiques

  Scénario: Navigation entre les fiches depuis la modale
    Étant donné que la modale de détails est ouverte
    Lorsque je clique sur "Fiche suivante"
    Alors les détails de la fiche suivante devraient s'afficher
    Et les commentaires de cette nouvelle fiche devraient être visibles





