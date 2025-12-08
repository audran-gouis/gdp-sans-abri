# language: fr

@interface @duplication_fiche
Fonctionnalité: Duplication des fiches
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir dupliquer une fiche existante
  Afin de créer rapidement une nouvelle fiche avec des informations similaires

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches enregistrées

  Scénario: Bouton de duplication visible sur chaque fiche
    Lorsque je consulte la liste des fiches
    Alors chaque fiche devrait avoir un bouton "Dupliquer"
    Et le bouton devrait être représenté par une icône de copie

  Scénario: Duplication d'une fiche Transmission
    Étant donné une fiche Transmission avec les informations complètes
    Lorsque je clique sur le bouton "Dupliquer"
    Alors une nouvelle modale devrait s'ouvrir
    Et tous les champs devraient être pré-remplis avec les données de la fiche originale
    Et la date devrait être mise à jour à aujourd'hui
    Et je devrais pouvoir modifier les informations avant d'enregistrer

  Scénario: Duplication d'une fiche ADP
    Étant donné une fiche ADP avec les informations complètes
    Lorsque je clique sur le bouton "Dupliquer"
    Alors une nouvelle modale devrait s'ouvrir
    Et les informations de la personne devraient être copiées
    Et les informations d'accompagnement devraient être copiées
    Et la date devrait être mise à jour à aujourd'hui

  Scénario: Modification après duplication
    Étant donné que j'ai dupliqué une fiche
    Lorsque je modifie le champ "Commentaires"
    Et que je clique sur "Enregistrer"
    Alors une nouvelle fiche devrait être créée
    Et la fiche originale devrait rester inchangée

  Scénario: Duplication avec changement de personne
    Étant donné une fiche avec plusieurs informations d'intervention
    Lorsque je duplique la fiche
    Et que je change le nom en "Nouveau Nom"
    Et que je clique sur "Enregistrer"
    Alors la nouvelle fiche devrait avoir le nouveau nom
    Et les autres informations devraient être conservées

  Scénario: Historique de duplication
    Étant donné une fiche dupliquée
    Lorsque je consulte les détails de la nouvelle fiche
    Alors je devrais voir une mention "Dupliquée depuis fiche #X"





