# language: fr

@interface @liaison_fiches_existantes
Fonctionnalité: Création de fiches pour personnes déjà dans les tableaux
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir créer de nouvelles rencontres pour des personnes déjà enregistrées
  Afin d'enrichir l'historique sans créer de doublons

  Contexte:
    Étant donné que l'application est ouverte
    Et qu'il existe des personnes enregistrées dans la base de données

  # === CRÉATION DEPUIS UNE FICHE EXISTANTE ===

  Scénario: Bouton "Nouvelle rencontre" sur une fiche existante
    Étant donné une fiche existante pour "Marie Martin"
    Lorsque je consulte cette fiche
    Alors je devrais voir un bouton "Nouvelle rencontre"
    Et ce bouton devrait permettre d'ajouter une nouvelle rencontre pour cette personne

  Scénario: Création d'une nouvelle rencontre pour personne existante
    Étant donné une fiche existante pour "Jean Dupont"
    Lorsque je clique sur "Nouvelle rencontre"
    Alors un formulaire devrait s'ouvrir
    Et les informations de la personne devraient être pré-remplies (nom, prénom, date de naissance)
    Et je devrais pouvoir saisir les informations de la nouvelle rencontre

  Scénario: Informations pré-remplies
    Étant donné que je crée une nouvelle rencontre pour une personne existante
    Alors les champs suivants devraient être pré-remplis:
      | Champ                 |
      | Nom                   |
      | Prénom                |
      | Date de naissance     |
      | Description physique  |
      | Genre                 |
    Et ces champs devraient être modifiables si besoin

  Scénario: Date de la nouvelle rencontre
    Étant donné que je crée une nouvelle rencontre
    Alors la date devrait être pré-remplie avec la date du jour
    Et je devrais pouvoir la modifier si la rencontre était antérieure

  # === RECHERCHE ET LIAISON ===

  Scénario: Recherche de personne existante lors de la création
    Lorsque je clique sur "Nouvelle fiche"
    Alors je devrais voir un champ de recherche "Rechercher une personne existante"
    Et je devrais pouvoir rechercher par nom, prénom ou description

  Scénario: Sélection d'une personne existante
    Lorsque je recherche "Dupont" dans le champ de recherche
    Et que je sélectionne "Jean Dupont" dans les résultats
    Alors les informations de Jean Dupont devraient remplir le formulaire
    Et je devrais pouvoir compléter les informations de la rencontre

  Scénario: Création pour une nouvelle personne
    Lorsque je recherche une personne qui n'existe pas
    Alors je devrais voir le message "Aucune personne trouvée"
    Et je devrais avoir l'option "Créer une nouvelle personne"

  # === LIAISON INTER-DISPOSITIFS ===

  Scénario: Personne existante dans un autre dispositif
    Étant donné "Marie Martin" enregistrée dans ADP
    Lorsque je suis dans "Maraudes Départementales"
    Et que je recherche "Marie Martin"
    Alors je devrais voir qu'elle existe dans ADP
    Et je devrais pouvoir créer une rencontre liée

  Scénario: Affichage de l'historique multi-dispositifs
    Étant donné une personne avec des rencontres dans plusieurs dispositifs
    Lorsque je consulte sa fiche
    Alors je devrais voir l'historique de tous les dispositifs
    Et chaque rencontre devrait indiquer son dispositif d'origine

  # === GESTION DE L'IDENTITÉ ===

  Scénario: Mise à jour des informations de la personne
    Étant donné une nouvelle rencontre pour une personne existante
    Lorsque je modifie le champ "Description physique"
    Et que je clique sur "Enregistrer"
    Alors la description physique devrait être mise à jour
    Et l'historique devrait garder trace de l'ancienne description

  Scénario: Signalement de changement important
    Étant donné une personne avec un historique
    Lorsque je crée une nouvelle rencontre
    Et que je modifie des informations significatives
    Alors un message devrait demander confirmation
    Et je devrais pouvoir indiquer le motif du changement

  # === PERSONNES INCONNUES ===

  Scénario: Identification ultérieure d'une personne inconnue
    Étant donné une fiche "Inconnu" avec description "Homme âgé, barbe blanche"
    Lorsque je découvre son identité "Pierre Duval"
    Et que je modifie la fiche pour ajouter le nom
    Alors la fiche devrait être mise à jour
    Et l'historique devrait montrer qu'il était précédemment "Inconnu"

  Scénario: Fusion de fiches "Inconnu" avec personne identifiée
    Étant donné une fiche "Inconnu" avec 3 rencontres
    Et que je découvre que c'est "Jean Dupont" (fiche existante)
    Lorsque je fusionne les deux fiches
    Alors les 3 rencontres devraient être ajoutées à l'historique de Jean Dupont
    Et la fiche "Inconnu" devrait être archivée

  # === STATISTIQUES ===

  Scénario: Statistiques de personnes vs rencontres
    Étant donné que je suis sur l'onglet "Statistiques"
    Alors je devrais voir:
      | Statistique                        |
      | Nombre de personnes distinctes     |
      | Nombre total de rencontres         |
      | Moyenne de rencontres par personne |
      | Personnes vues une seule fois      |
      | Personnes vues plus de 5 fois      |

  Scénario: Liste des personnes les plus rencontrées
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je consulte "Personnes les plus rencontrées"
    Alors je devrais voir un classement des personnes par nombre de rencontres





