# language: fr

@navigation @trois_onglets_principaux
Fonctionnalité: Trois onglets principaux - Maraudes Départementales / ADP / Point Accueil
  En tant qu'utilisateur de l'application de maraudes
  Je veux avoir trois onglets distincts pour les différents types d'interventions
  Afin de mieux organiser les données selon le contexte

  Contexte:
    Étant donné que l'application est ouverte

  Scénario: Affichage des trois onglets principaux
    Lorsque je consulte la barre de navigation
    Alors je devrais voir l'onglet "Maraudes Départementales"
    Et je devrais voir l'onglet "ADP"
    Et je devrais voir l'onglet "Point Accueil"

  Scénario: Onglet Maraudes Départementales par défaut
    Lorsque je lance l'application
    Alors l'onglet "Maraudes Départementales" devrait être actif par défaut
    Et je devrais voir le contenu des maraudes départementales

  Scénario: Navigation vers l'onglet ADP
    Lorsque je clique sur l'onglet "ADP"
    Alors l'onglet "ADP" devrait devenir actif
    Et je devrais voir la liste des fiches ADP
    Et je devrais pouvoir ajouter une nouvelle fiche ADP

  Scénario: Navigation vers l'onglet Point Accueil
    Lorsque je clique sur l'onglet "Point Accueil"
    Alors l'onglet "Point Accueil" devrait devenir actif
    Et je devrais voir la liste des fiches Point Accueil
    Et je devrais pouvoir ajouter une nouvelle fiche Point Accueil

  Scénario: Séparation des données entre les onglets
    Étant donné une fiche créée dans "Maraudes Départementales"
    Et une fiche créée dans "Point Accueil"
    Lorsque je consulte chaque onglet
    Alors les fiches devraient être affichées dans leur onglet respectif
    Et les fiches ne devraient pas être mélangées entre les onglets

  Scénario: Statistiques globales combinant les trois sources
    Lorsque je vais sur l'onglet "Statistiques"
    Alors je devrais pouvoir filtrer par source de données
    Et je devrais voir un filtre "Maraudes Départementales"
    Et je devrais voir un filtre "ADP"
    Et je devrais voir un filtre "Point Accueil"
    Et je devrais voir un filtre "Toutes sources"

  Scénario: Formulaire spécifique pour chaque onglet
    Lorsque je crée une fiche dans "Maraudes Départementales"
    Alors le formulaire devrait être adapté aux maraudes
    Lorsque je crée une fiche dans "Point Accueil"
    Alors le formulaire devrait être adapté au point d'accueil





