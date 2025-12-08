# language: fr

@interface @recherche_globale
Fonctionnalité: Recherche globale par nom sur tous les dispositifs avec système d'alerte
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir rechercher une personne par nom sur tous les dispositifs depuis la page d'accueil
  Afin de retrouver rapidement une personne quel que soit le contexte de la rencontre

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches dans différents dispositifs (ADP, Maraudes Départementales, Point Accueil)

  # === BARRE DE RECHERCHE GLOBALE ===

  Scénario: Barre de recherche visible sur la page d'accueil
    Lorsque je suis sur la page d'accueil
    Alors je devrais voir une barre de recherche globale en haut de page
    Et le placeholder devrait indiquer "Rechercher une personne..."

  Scénario: Recherche dans tous les dispositifs
    Lorsque je saisis "Dupont" dans la barre de recherche globale
    Alors la recherche devrait s'effectuer dans:
      | Dispositif               |
      | ADP                      |
      | Maraudes Départementales |
      | Point Accueil            |
    Et les résultats devraient être regroupés par dispositif

  Scénario: Affichage des résultats de recherche
    Lorsque je recherche "Martin"
    Alors je devrais voir les résultats organisés:
      | Section                  | Résultats           |
      | ADP                      | 2 fiches trouvées   |
      | Maraudes Départementales | 1 fiche trouvée     |
      | Point Accueil            | 3 fiches trouvées   |
    Et chaque résultat devrait afficher un aperçu de la fiche

  Scénario: Recherche par prénom
    Lorsque je saisis "Jean" dans la recherche
    Alors je devrais voir toutes les personnes prénommées Jean
    Et les résultats devraient être triés par pertinence

  Scénario: Recherche par description physique
    Lorsque je saisis "barbe blanche bonnet rouge" dans la recherche
    Alors je devrais voir les fiches correspondant à cette description
    Et cela devrait inclure les personnes "Inconnues"

  # === SYSTÈME D'ALERTE ===

  Scénario: Alerte personne connue lors de la saisie
    Lorsque je crée une nouvelle fiche
    Et que je saisis "Dupont" dans le champ nom
    Alors une alerte devrait apparaître
    Et l'alerte devrait indiquer "Cette personne existe peut-être déjà"
    Et je devrais voir les fiches existantes correspondantes

  Scénario: Alerte avec détails des fiches existantes
    Étant donné que l'alerte "personne existante" est affichée
    Alors je devrais voir pour chaque fiche suggérée:
      | Information             |
      | Nom et prénom           |
      | Date de naissance       |
      | Dernier dispositif      |
      | Date dernière rencontre |

  Scénario: Options suite à l'alerte
    Étant donné que l'alerte "personne existante" est affichée
    Alors je devrais avoir les options:
      | Option                              |
      | Créer quand même une nouvelle fiche |
      | Lier à une fiche existante          |
      | Annuler                             |

  Scénario: Liaison à une fiche existante depuis l'alerte
    Étant donné que l'alerte suggère une fiche existante
    Lorsque je clique sur "Lier à cette fiche"
    Alors la nouvelle rencontre devrait être ajoutée à l'historique de la fiche existante
    Et je ne devrais pas créer de doublon

  # === FILTRES FUSIONNÉS ===

  Scénario: Filtres disponibles sur la recherche globale
    Lorsque je suis dans la recherche globale
    Alors je devrais voir des filtres communs:
      | Filtre                  |
      | Période (dates)         |
      | Dispositif              |
      | Aéroport                |
      | Genre                   |
      | Tranche d'âge           |
      | Statut (actif/archivé)  |

  Scénario: Combinaison recherche + filtres
    Lorsque je recherche "Dupont"
    Et que je filtre par dispositif "ADP"
    Et que je filtre par période "Dernier mois"
    Alors je devrais voir uniquement les fiches Dupont dans ADP du dernier mois

  # === RÉSULTATS ET NAVIGATION ===

  Scénario: Clic sur un résultat de recherche
    Étant donné des résultats de recherche affichés
    Lorsque je clique sur une fiche dans les résultats
    Alors je devrais être redirigé vers cette fiche
    Et le bon onglet (ADP, Maraudes, PA) devrait s'activer

  Scénario: Résultat de recherche vide
    Lorsque je recherche "XXXXXX"
    Et qu'aucune fiche ne correspond
    Alors je devrais voir le message "Aucun résultat trouvé"
    Et je devrais avoir l'option "Créer une nouvelle fiche"

  Scénario: Recherche en temps réel
    Lorsque je tape dans la barre de recherche
    Alors les résultats devraient s'afficher au fur et à mesure
    Et la recherche devrait se déclencher après 2 caractères minimum

  # === DÉTECTION DE DOUBLONS ===

  Scénario: Détection automatique de doublons potentiels
    Étant donné une fiche "Jean Dupont" né le "15/03/1975" dans ADP
    Et une fiche "Jean Dupon" né le "15/03/1975" dans Maraudes
    Lorsque le système analyse les fiches
    Alors une alerte de doublon potentiel devrait être générée
    Et je devrais pouvoir fusionner les fiches si c'est la même personne

  Scénario: Rapport des doublons potentiels
    Étant donné que je suis administrateur
    Lorsque je consulte le rapport de doublons
    Alors je devrais voir la liste des doublons potentiels
    Et je devrais pouvoir les traiter un par un





