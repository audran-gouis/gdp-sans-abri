# language: fr

@formulaires @localisation_aeroport
Fonctionnalité: Localisation par aéroport plutôt que par ville
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir sélectionner un aéroport comme localisation
  Afin de préciser le lieu exact de la rencontre dans le contexte aéroportuaire

  Contexte:
    Étant donné que l'application est ouverte
    Et que le formulaire de saisie est ouvert

  Scénario: Affichage du sélecteur d'aéroport
    Lorsque je consulte le formulaire
    Alors je devrais voir un champ "Aéroport" au lieu de "Ville"
    Et le champ devrait proposer une liste d'aéroports

  Scénario: Liste des aéroports disponibles
    Lorsque je clique sur le sélecteur d'aéroport
    Alors je devrais voir les options suivantes:
      | Aéroport                          |
      | CDG - Terminal 1                  |
      | CDG - Terminal 2A                 |
      | CDG - Terminal 2B                 |
      | CDG - Terminal 2C                 |
      | CDG - Terminal 2D                 |
      | CDG - Terminal 2E                 |
      | CDG - Terminal 2F                 |
      | CDG - Terminal 2G                 |
      | CDG - Terminal 3                  |
      | Orly - Terminal 1                 |
      | Orly - Terminal 2                 |
      | Orly - Terminal 3                 |
      | Orly - Terminal 4                 |
      | Le Bourget                        |

  Scénario: Sélection d'un aéroport avec autocomplétion
    Lorsque je commence à taper "CDG" dans le champ aéroport
    Alors je devrais voir les suggestions commençant par "CDG"
    Et je devrais pouvoir sélectionner "CDG - Terminal 2E"

  Scénario: Enregistrement avec localisation aéroport
    Lorsque je sélectionne l'aéroport "CDG - Terminal 2F"
    Et que je complète les autres champs requis
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher "CDG - Terminal 2F" comme localisation

  Scénario: Filtrage par aéroport dans les statistiques
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je filtre par aéroport "Orly - Terminal 1"
    Alors je devrais voir uniquement les fiches de cet aéroport





