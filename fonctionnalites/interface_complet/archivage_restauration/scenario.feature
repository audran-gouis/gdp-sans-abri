# language: fr

@interface @archivage_restauration
Fonctionnalité: Système d'archivage avec restauration
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir archiver des fiches et les restaurer si nécessaire
  Afin de garder une base de données propre tout en préservant l'historique

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches enregistrées

  # === ARCHIVAGE ===

  Scénario: Bouton d'archivage sur chaque fiche
    Lorsque je consulte une fiche
    Alors je devrais voir un bouton "Archiver"
    Et le bouton devrait être représenté par une icône de boîte d'archive

  Scénario: Confirmation avant archivage
    Lorsque je clique sur "Archiver" une fiche
    Alors une modale de confirmation devrait apparaître
    Et le message devrait demander "Voulez-vous archiver cette fiche ?"
    Et je devrais voir les options "Confirmer" et "Annuler"

  Scénario: Archivage d'une fiche
    Lorsque je confirme l'archivage d'une fiche
    Alors la fiche devrait être marquée comme archivée
    Et la fiche devrait disparaître de la liste principale
    Et un message devrait confirmer "Fiche archivée avec succès"

  Scénario: Motif d'archivage
    Lorsque je clique sur "Archiver" une fiche
    Alors je devrais pouvoir sélectionner un motif:
      | Motif d'archivage              |
      | Doublon                        |
      | Personne décédée               |
      | Personne non revue depuis 1 an |
      | Erreur de saisie               |
      | Autre                          |
    Et je devrais pouvoir ajouter un commentaire

  Scénario: Date d'archivage enregistrée
    Lorsque j'archive une fiche
    Alors la date et l'heure d'archivage devraient être enregistrées
    Et le nom du salarié ayant archivé devrait être enregistré

  # === ACCÈS AUX ARCHIVES ===

  Scénario: Accès à la section Archives
    Lorsque je consulte le menu de l'application
    Alors je devrais voir une option "Archives"
    Et je devrais pouvoir accéder aux fiches archivées

  Scénario: Affichage des fiches archivées
    Lorsque je suis dans la section "Archives"
    Alors je devrais voir la liste des fiches archivées
    Et chaque fiche devrait afficher la date d'archivage
    Et le motif d'archivage devrait être visible

  Scénario: Recherche dans les archives
    Lorsque je suis dans la section "Archives"
    Et que je recherche "Dupont"
    Alors je devrais voir les fiches archivées correspondantes

  Scénario: Filtrage des archives
    Lorsque je suis dans la section "Archives"
    Alors je devrais pouvoir filtrer par:
      | Critère              |
      | Date d'archivage     |
      | Motif d'archivage    |
      | Source (ADP, etc.)   |
      | Salarié              |

  # === RESTAURATION ===

  Scénario: Bouton de restauration sur fiche archivée
    Étant donné que je suis dans la section "Archives"
    Lorsque je consulte une fiche archivée
    Alors je devrais voir un bouton "Restaurer"

  Scénario: Restauration d'une fiche
    Étant donné une fiche archivée
    Lorsque je clique sur "Restaurer"
    Et que je confirme la restauration
    Alors la fiche devrait réapparaître dans la liste principale
    Et elle devrait être retirée des archives
    Et un message devrait confirmer "Fiche restaurée avec succès"

  Scénario: Historique de restauration
    Étant donné une fiche restaurée
    Lorsque je consulte cette fiche
    Alors je devrais voir une mention "Restaurée le [date]"
    Et l'historique devrait montrer l'archivage et la restauration

  # === STATISTIQUES ET ARCHIVES ===

  Scénario: Exclusion des archives des statistiques par défaut
    Étant donné que je suis sur l'onglet "Statistiques"
    Alors les fiches archivées ne devraient pas être comptées par défaut

  Scénario: Inclusion optionnelle des archives dans les statistiques
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je coche "Inclure les fiches archivées"
    Alors les statistiques devraient inclure les fiches archivées
    Et elles devraient être clairement identifiées

  # === ARCHIVAGE AUTOMATIQUE ===

  Scénario: Suggestion d'archivage automatique
    Étant donné des fiches non modifiées depuis plus d'un an
    Lorsque je consulte la liste des fiches
    Alors un indicateur devrait suggérer "Cette fiche peut être archivée"
    Et je devrais pouvoir archiver en un clic

  Scénario: Rapport d'archivage
    Étant donné que je suis administrateur
    Lorsque je demande un rapport d'archivage
    Alors je devrais voir le nombre de fiches archivées par période
    Et les motifs d'archivage les plus fréquents





