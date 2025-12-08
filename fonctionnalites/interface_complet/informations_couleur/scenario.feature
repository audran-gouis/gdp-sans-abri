# language: fr

@interface @informations_couleur
Fonctionnalité: Mise en couleur des informations importantes
  En tant qu'utilisateur de l'application de maraudes
  Je veux que les informations importantes soient mises en évidence par des couleurs
  Afin d'identifier rapidement les situations prioritaires

  Contexte:
    Étant donné que l'application est ouverte

  Scénario: Signalement affiché en jaune
    Étant donné une fiche avec un signalement actif
    Lorsque je consulte la liste des fiches
    Alors la fiche devrait avoir un indicateur jaune
    Et le badge "Signalement" devrait être de couleur jaune

  Scénario: Nouvelle personne rencontrée affichée en bleu
    Étant donné une fiche marquée comme "1er contact"
    Lorsque je consulte la liste des fiches
    Alors la fiche devrait avoir un indicateur bleu
    Et le badge "Nouvelle rencontre" devrait être de couleur bleue

  Scénario: Personne violente affichée en rouge
    Étant donné une fiche avec la mention "violent" cochée
    Lorsque je consulte la liste des fiches
    Alors la fiche devrait avoir un indicateur rouge
    Et le badge "Violent" devrait être de couleur rouge
    Et cette fiche devrait être mise en évidence pour alerter

  Scénario: Décès affiché en gris
    Étant donné une fiche avec la mention "décès" cochée
    Lorsque je consulte la liste des fiches
    Alors la fiche devrait avoir un indicateur gris
    Et le badge "Décès" devrait être de couleur grise
    Et la fiche devrait apparaître en grisé

  Scénario: Affichage de plusieurs indicateurs couleur
    Étant donné une fiche avec "signalement" et "1er contact"
    Lorsque je consulte la liste des fiches
    Alors la fiche devrait afficher les deux badges colorés
    Et le badge jaune "Signalement" devrait être visible
    Et le badge bleu "Nouvelle rencontre" devrait être visible

  Scénario: Légende des couleurs
    Lorsque je consulte l'interface de l'application
    Alors je devrais voir une légende explicative des couleurs
    Et la légende devrait indiquer "Jaune = Signalement"
    Et la légende devrait indiquer "Bleu = Nouvelle rencontre"
    Et la légende devrait indiquer "Rouge = Violent"
    Et la légende devrait indiquer "Gris = Décès"





