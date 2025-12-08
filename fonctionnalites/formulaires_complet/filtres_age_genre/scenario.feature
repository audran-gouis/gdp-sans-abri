# language: fr

@formulaires @filtres_age_genre
Fonctionnalité: Filtres par âge, genre et statut (décédé, disparu)
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir filtrer les fiches par âge, genre et statut spécial
  Afin de cibler rapidement les personnes selon ces critères

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches enregistrées

  # === FILTRE PAR ÂGE ===

  Scénario: Affichage du filtre par âge
    Lorsque je consulte les filtres
    Alors je devrais voir un filtre "Tranche d'âge"
    Et le filtre devrait proposer des tranches prédéfinies

  Scénario: Filtrage par tranche d'âge
    Lorsque je sélectionne la tranche d'âge "18-25 ans"
    Et que je clique sur "Appliquer"
    Alors je devrais voir uniquement les fiches de personnes dans cette tranche

  Scénario: Tranches d'âge disponibles
    Lorsque je clique sur le filtre d'âge
    Alors je devrais voir les options suivantes:
      | Tranche d'âge    |
      | Tous les âges    |
      | Moins de 18 ans  |
      | 18-25 ans        |
      | 26-35 ans        |
      | 36-45 ans        |
      | 46-55 ans        |
      | 56-65 ans        |
      | Plus de 65 ans   |
      | Âge inconnu      |

  Scénario: Filtre par âge personnalisé
    Lorsque je sélectionne "Âge personnalisé"
    Et que je saisis l'âge minimum "30"
    Et que je saisis l'âge maximum "50"
    Et que je clique sur "Appliquer"
    Alors je devrais voir les fiches des personnes entre 30 et 50 ans

  # === FILTRE PAR GENRE ===

  Scénario: Affichage du filtre par genre
    Lorsque je consulte les filtres
    Alors je devrais voir un filtre "Genre"

  Scénario: Options de genre disponibles
    Lorsque je clique sur le filtre de genre
    Alors je devrais voir les options suivantes:
      | Genre           |
      | Tous            |
      | Homme           |
      | Femme           |
      | Non précisé     |

  Scénario: Filtrage par genre
    Lorsque je sélectionne le genre "Femme"
    Et que je clique sur "Appliquer"
    Alors je devrais voir uniquement les fiches de femmes

  # === STATUT DÉCÉDÉ ===

  Scénario: Case à cocher "Décédé" dans le formulaire
    Lorsque je consulte le formulaire de saisie
    Alors je devrais voir une case "Décédé"
    Et cette case devrait être dans une section "Statut"

  Scénario: Marquage d'une personne comme décédée
    Étant donné une fiche existante pour "Jean Dupont"
    Lorsque je modifie la fiche
    Et que je coche "Décédé"
    Et que je saisis la date de décès "15/11/2024"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher le statut "Décédé"
    Et la fiche devrait apparaître en gris

  Scénario: Filtrage pour afficher les personnes décédées
    Lorsque je coche le filtre "Inclure les décédés"
    Alors je devrais voir les fiches des personnes décédées
    Et elles devraient être clairement identifiées

  Scénario: Masquage par défaut des personnes décédées
    Étant donné que des fiches de personnes décédées existent
    Lorsque je consulte la liste sans filtre
    Alors les personnes décédées ne devraient pas apparaître par défaut

  # === STATUT DISPARU ===

  Scénario: Case à cocher "Disparu" dans le formulaire
    Lorsque je consulte le formulaire de saisie
    Alors je devrais voir une case "Disparu"
    Et cette case devrait être dans une section "Statut"

  Scénario: Marquage d'une personne comme disparue
    Étant donné une fiche existante pour "Marie Martin"
    Lorsque je modifie la fiche
    Et que je coche "Disparu"
    Et que je saisis la date de dernière vue "01/10/2024"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher le statut "Disparu"
    Et la fiche devrait avoir un indicateur orange

  Scénario: Filtrage pour afficher les personnes disparues
    Lorsque je coche le filtre "Personnes disparues"
    Alors je devrais voir uniquement les fiches des personnes disparues

  Scénario: Signalement automatique personne non vue depuis longtemps
    Étant donné une personne non rencontrée depuis plus de 3 mois
    Lorsque je consulte sa fiche
    Alors un indicateur devrait suggérer "Pas vue depuis 3 mois"
    Et je devrais pouvoir la marquer comme "Disparue"

  # === COMBINAISON DE FILTRES ===

  Scénario: Combinaison âge + genre
    Lorsque je sélectionne la tranche d'âge "Plus de 65 ans"
    Et que je sélectionne le genre "Homme"
    Et que je clique sur "Appliquer"
    Alors je devrais voir uniquement les hommes de plus de 65 ans

  Scénario: Statistiques par âge et genre
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je consulte les statistiques
    Alors je devrais voir une répartition par tranche d'âge
    Et je devrais voir une répartition par genre





