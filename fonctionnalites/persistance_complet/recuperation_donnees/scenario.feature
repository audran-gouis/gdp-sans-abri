# language: fr

Fonctionnalité: Persistance des données avec IndexedDB
  En tant qu'utilisateur de l'application de maraudes
  Je veux récupérer mes données au redémarrage
  Afin de retrouver toutes mes transmissions

  Contexte:
    Étant donné que j'ai ajouté des transmissions précédemment

  Scénario: Récupération des transmissions au chargement
    Lorsque je ferme et rouvre l'application
    Alors toutes mes transmissions devraient être affichées
    Et les données devraient être identiques à celles enregistrées

