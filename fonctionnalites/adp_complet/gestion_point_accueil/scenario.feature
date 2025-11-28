# language: fr

Fonctionnalité: Gestion ADP (Accès Droits Personnes)
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir gérer le Point Accueil
  Afin de suivre les personnes ayant accès à ce service

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "ADP"

  Scénario: Ajout d'une personne avec Point Accueil
    Lorsque je clique sur le bouton "Ajouter" dans l'onglet ADP
    Et que je remplis les informations de base
    Et que je coche "Point Accueil"
    Et que je clique sur "Enregistrer"
    Alors la carte devrait indiquer "Point Accueil" actif

