# language: fr

@interface @desactivation_suppression
Fonctionnalité: Désactivation de la possibilité de supprimer les fiches
  En tant qu'administrateur de l'application de maraudes
  Je veux empêcher la suppression des fiches
  Afin de préserver l'intégrité des données et l'historique complet

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des fiches enregistrées

  Scénario: Absence du bouton supprimer sur les fiches
    Lorsque je consulte une fiche
    Alors je ne devrais pas voir de bouton "Supprimer"
    Et seuls les boutons "Modifier" et "Dupliquer" devraient être visibles

  Scénario: Absence de l'option supprimer dans le menu contextuel
    Lorsque je fais un clic droit sur une fiche
    Alors le menu contextuel ne devrait pas contenir "Supprimer"

  Scénario: Protection des données contre la suppression accidentelle
    Étant donné que je suis un utilisateur standard
    Lorsque je consulte la liste des fiches
    Alors aucune option de suppression ne devrait être disponible

  Scénario: Alternative à la suppression - Archivage
    Lorsque je souhaite "supprimer" une fiche
    Alors je devrais voir l'option "Archiver" à la place
    Et un message devrait expliquer "Les fiches ne peuvent pas être supprimées, mais peuvent être archivées"

  Scénario: Traçabilité maintenue
    Étant donné une fiche archivée
    Alors l'historique complet devrait être conservé
    Et les statistiques devraient pouvoir inclure ou exclure les fiches archivées

  Scénario: Rôle administrateur - Aucune suppression possible
    Étant donné que je suis administrateur
    Lorsque je consulte une fiche
    Alors je ne devrais pas non plus avoir de bouton "Supprimer"
    Et seul l'archivage devrait être possible

  Scénario: Message explicatif sur la politique de non-suppression
    Lorsque je cherche comment supprimer une fiche
    Alors je devrais voir un message explicatif
    Et le message devrait indiquer "Pour des raisons légales et de suivi, les fiches ne peuvent pas être supprimées"
    Et le message devrait suggérer l'archivage comme alternative





