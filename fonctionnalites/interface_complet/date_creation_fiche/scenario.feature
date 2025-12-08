# language: fr

@interface @date_creation_fiche
Fonctionnalité: Affichage de la date de création des fiches
  En tant qu'utilisateur de l'application de maraudes
  Je veux voir la date de création de chaque fiche
  Afin de suivre l'historique des enregistrements

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches enregistrées

  Scénario: Affichage de la date de création sur les fiches Transmissions
    Lorsque je suis sur l'onglet "Transmissions Quotidiennes"
    Alors chaque fiche devrait afficher sa date de création
    Et la date devrait être au format "JJ/MM/AAAA HH:MM"

  Scénario: Affichage de la date de création sur les fiches ADP
    Lorsque je suis sur l'onglet "ADP"
    Alors chaque fiche devrait afficher sa date de création
    Et la date devrait être au format "JJ/MM/AAAA HH:MM"

  Scénario: Enregistrement automatique de la date de création
    Lorsque je crée une nouvelle fiche
    Et que je clique sur "Enregistrer"
    Alors la date et l'heure actuelles devraient être enregistrées automatiquement
    Et cette date devrait apparaître sur la fiche créée

  Scénario: Date de création distincte de la date de la transmission
    Étant donné une fiche créée le "15/03/2024"
    Et que la date de transmission est le "14/03/2024"
    Alors je devrais voir les deux dates distinctement
    Et la date de création devrait être "15/03/2024"
    Et la date de transmission devrait être "14/03/2024"





