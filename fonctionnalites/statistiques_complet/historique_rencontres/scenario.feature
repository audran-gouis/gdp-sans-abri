# language: fr

@statistiques @historique_rencontres
Fonctionnalité: Historique des rencontres par personne
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir consulter l'historique complet des rencontres pour chaque personne
  Afin de suivre l'évolution de sa situation et les interactions passées

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches pour plusieurs personnes

  Scénario: Accès à l'historique depuis une fiche
    Étant donné une fiche pour "Jean Dupont"
    Lorsque je clique sur "Voir l'historique"
    Alors je devrais voir toutes les rencontres avec "Jean Dupont"
    Et les rencontres devraient être triées par date (plus récente en premier)

  Scénario: Affichage chronologique des rencontres
    Étant donné l'historique de "Marie Martin" ouvert
    Alors je devrais voir une timeline des rencontres
    Et chaque rencontre devrait afficher:
      | Information          |
      | Date de la rencontre |
      | Lieu / Aéroport      |
      | Type d'intervention  |
      | Salarié responsable  |
      | Résumé des actions   |

  Scénario: Consultation des commentaires historiques
    Étant donné l'historique de "Pierre Durand" ouvert
    Lorsque je clique sur une rencontre passée
    Alors je devrais voir le commentaire complet de cette rencontre
    Et je devrais pouvoir lire tous les détails enregistrés

  Scénario: Recherche dans l'historique
    Étant donné l'historique d'une personne avec de nombreuses rencontres
    Lorsque je recherche "hébergement" dans l'historique
    Alors je devrais voir uniquement les rencontres mentionnant ce terme
    Et les résultats devraient être mis en évidence

  Scénario: Export de l'historique
    Étant donné l'historique de "Jean Dupont" ouvert
    Lorsque je clique sur "Exporter l'historique"
    Alors je devrais pouvoir télécharger un document PDF
    Et le document devrait contenir toutes les rencontres
    Et les commentaires devraient être inclus

  Scénario: Statistiques personnelles
    Étant donné l'historique d'une personne ouvert
    Alors je devrais voir un résumé statistique:
      | Statistique                    |
      | Nombre total de rencontres     |
      | Première rencontre             |
      | Dernière rencontre             |
      | Fréquence moyenne              |
      | Types d'interventions reçues   |

  Scénario: Évolution de la situation
    Étant donné l'historique d'une personne avec évolution
    Lorsque je consulte la section "Évolution"
    Alors je devrais voir les changements de situation au fil du temps
    Et les améliorations devraient être mises en évidence en vert
    Et les dégradations devraient être mises en évidence en rouge

  Scénario: Lien entre fiches d'une même personne
    Étant donné une personne avec des fiches dans différentes sources
    Lorsque je consulte son historique
    Alors je devrais voir les fiches de toutes les sources (Maraudes, ADP, Point Accueil)
    Et elles devraient être identifiées par leur source

  Scénario: Ajout de note à l'historique
    Étant donné l'historique d'une personne ouvert
    Lorsque je clique sur "Ajouter une note"
    Et que je saisis "Suivi important à faire"
    Et que je clique sur "Enregistrer"
    Alors la note devrait apparaître dans l'historique
    Et elle devrait être datée et attribuée au salarié connecté

  Scénario: Détection des personnes similaires
    Étant donné une fiche pour une personne "Inconnu" avec description physique
    Lorsque je crée une nouvelle fiche avec une description similaire
    Alors le système devrait suggérer un rapprochement possible
    Et je devrais pouvoir lier les fiches si c'est la même personne





