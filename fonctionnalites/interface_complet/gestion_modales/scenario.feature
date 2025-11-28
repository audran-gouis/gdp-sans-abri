# language: fr

Fonctionnalité: Interface utilisateur et expérience utilisateur
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir gérer les modales
  Afin d'interagir facilement avec les formulaires

  Contexte:
    Étant donné que l'application est ouverte

  Scénario: Ouverture et fermeture d'une modale
    Lorsque j'ouvre une modale
    Alors je devrais voir le bouton d'agrandissement avec l'icône "⛶"
    Et le bouton devrait avoir le titre "Agrandir"
    Lorsque je clique sur le bouton de fermeture (×)
    Alors la modale devrait se fermer

