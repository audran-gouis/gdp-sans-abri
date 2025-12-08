# language: fr

@interface @renommage_carte_fiche
Fonctionnalité: Renommer "carte" en "fiche" dans toute l'application
  En tant qu'utilisateur de l'application de maraudes
  Je veux que le terme "carte" soit remplacé par "fiche"
  Afin d'avoir une terminologie cohérente et professionnelle

  Contexte:
    Étant donné que l'application est ouverte

  Scénario: Affichage du terme "fiche" dans l'onglet Transmissions
    Lorsque je suis sur l'onglet "Transmissions Quotidiennes"
    Alors je devrais voir le terme "fiche" au lieu de "carte"
    Et le bouton devrait afficher "Nouvelle fiche"
    Et le message vide devrait indiquer "Aucune fiche"

  Scénario: Affichage du terme "fiche" dans l'onglet ADP
    Lorsque je suis sur l'onglet "ADP"
    Alors je devrais voir le terme "fiche" au lieu de "carte"
    Et le bouton devrait afficher "Nouvelle fiche ADP"

  Scénario: Affichage du terme "fiche" dans l'onglet Statistiques
    Lorsque je suis sur l'onglet "Statistiques"
    Alors les résultats devraient afficher "X fiches" au lieu de "X cartes"

  Scénario: Confirmation avec le terme "fiche"
    Lorsque je crée une nouvelle entrée
    Et que je clique sur "Enregistrer"
    Alors le message de confirmation devrait contenir "Fiche enregistrée"





