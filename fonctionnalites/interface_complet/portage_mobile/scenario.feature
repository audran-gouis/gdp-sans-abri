# language: fr

@interface @portage_mobile
Fonctionnalité: Portage de l'application sur tablette et mobile
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir utiliser l'application sur tablette et téléphone mobile
  Afin de saisir les informations directement sur le terrain

  Contexte:
    Étant donné que l'application est accessible sur appareil mobile

  Scénario: Interface responsive sur tablette
    Étant donné que j'utilise une tablette (écran 768px - 1024px)
    Lorsque j'ouvre l'application
    Alors l'interface devrait s'adapter à la taille de l'écran
    Et les onglets devraient être facilement cliquables
    Et le formulaire devrait être lisible et utilisable

  Scénario: Interface responsive sur mobile
    Étant donné que j'utilise un téléphone (écran < 768px)
    Lorsque j'ouvre l'application
    Alors l'interface devrait s'adapter à la taille de l'écran
    Et la navigation devrait être accessible via un menu hamburger
    Et les fiches devraient s'afficher en pleine largeur

  Scénario: Saisie tactile optimisée
    Étant donné que j'utilise un écran tactile
    Lorsque je remplis le formulaire
    Alors les zones de saisie devraient être suffisamment grandes
    Et les boutons devraient avoir une taille minimum de 44px
    Et l'espacement entre les éléments devrait éviter les erreurs de saisie

  Scénario: Mode hors-ligne sur mobile
    Étant donné que je n'ai pas de connexion internet
    Lorsque je crée une nouvelle fiche
    Alors la fiche devrait être enregistrée localement
    Et un indicateur devrait montrer "Mode hors-ligne"
    Et la synchronisation devrait se faire automatiquement au retour de la connexion

  Scénario: Synchronisation des données
    Étant donné des fiches créées hors-ligne
    Lorsque la connexion internet est rétablie
    Alors les fiches devraient être synchronisées automatiquement
    Et je devrais voir un message de confirmation
    Et les conflits éventuels devraient être signalés

  Scénario: Installation comme application native (PWA)
    Étant donné que j'utilise un navigateur compatible PWA
    Lorsque je visite l'application
    Alors je devrais pouvoir l'installer sur l'écran d'accueil
    Et l'application devrait fonctionner sans barre de navigateur
    Et l'icône devrait apparaître sur l'écran d'accueil

  Scénario: Performance sur mobile
    Étant donné que j'utilise un appareil mobile
    Lorsque je navigue dans l'application
    Alors le temps de chargement devrait être inférieur à 3 secondes
    Et les animations devraient être fluides
    Et l'application ne devrait pas consommer excessivement la batterie

  Scénario: Orientation de l'écran
    Étant donné que j'utilise une tablette
    Lorsque je change l'orientation (portrait/paysage)
    Alors l'interface devrait s'adapter automatiquement
    Et aucune donnée ne devrait être perdue

  Scénario: Notifications push
    Étant donné que l'application est installée sur mobile
    Lorsque de nouvelles données sont synchronisées
    Alors je devrais recevoir une notification
    Et je devrais pouvoir cliquer pour voir les nouveautés





