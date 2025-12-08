# language: fr

@formulaires @vulnerabilites_situations
Fonctionnalité: Ajout des vulnérabilités et situations spécifiques
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir renseigner les vulnérabilités psy, situations sociales, médicales et sans papiers
  Afin de mieux documenter la situation de chaque personne rencontrée

  Contexte:
    Étant donné que l'application est ouverte
    Et que le formulaire de saisie est ouvert

  Scénario: Section Vulnérabilités visible dans le formulaire
    Lorsque je consulte le formulaire
    Alors je devrais voir une section "Vulnérabilités et Situations"
    Et cette section devrait contenir plusieurs sous-catégories

  Scénario: Cases à cocher pour les vulnérabilités psychologiques
    Lorsque je consulte la section "Vulnérabilités"
    Alors je devrais voir les options suivantes pour "Vulnérabilité Psy":
      | Option                        |
      | Troubles psychiatriques       |
      | Addiction                     |
      | Dépression                    |
      | Anxiété                       |
      | Troubles du comportement      |
      | Autre vulnérabilité psy       |

  Scénario: Cases à cocher pour les situations sociales
    Lorsque je consulte la section "Situations Sociales"
    Alors je devrais voir les options suivantes:
      | Option                        |
      | Sans domicile fixe            |
      | Hébergement précaire          |
      | Rupture familiale             |
      | Sortie de prison              |
      | Sortie d'hôpital              |
      | Perte d'emploi                |
      | Isolement social              |

  Scénario: Cases à cocher pour les situations médicales
    Lorsque je consulte la section "Situations Médicales"
    Alors je devrais voir les options suivantes:
      | Option                        |
      | Maladie chronique             |
      | Handicap physique             |
      | Handicap mental               |
      | Problèmes de mobilité         |
      | Grossesse                     |
      | Soins en cours                |
      | Besoin de soins urgents       |

  Scénario: Case à cocher pour sans papiers
    Lorsque je consulte le formulaire
    Alors je devrais voir une case "Sans papiers"
    Et cette case devrait permettre de signaler une situation administrative irrégulière

  Scénario: Sélection multiple de vulnérabilités
    Lorsque je coche "Troubles psychiatriques"
    Et que je coche "Sans domicile fixe"
    Et que je coche "Sans papiers"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait enregistrer toutes ces informations
    Et elles devraient être visibles sur la fiche

  Scénario: Affichage des vulnérabilités sur la fiche
    Étant donné une fiche avec plusieurs vulnérabilités cochées
    Lorsque je consulte cette fiche
    Alors les vulnérabilités devraient être affichées avec des badges colorés
    Et je devrais pouvoir identifier rapidement les situations critiques

  Scénario: Filtrage par vulnérabilité dans les statistiques
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je filtre par "Vulnérabilité Psy"
    Alors je devrais voir les statistiques des personnes avec vulnérabilité psy

  Scénario: Champ commentaire pour vulnérabilités
    Lorsque je coche une vulnérabilité
    Alors je devrais pouvoir ajouter un commentaire spécifique
    Et ce commentaire devrait préciser la situation





