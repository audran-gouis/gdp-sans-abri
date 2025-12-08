# language: fr

@formulaires @ressources_personne
Fonctionnalité: Renseignement des ressources de la personne
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir renseigner si la personne a des ressources financières
  Afin de mieux comprendre sa situation et orienter l'accompagnement

  Contexte:
    Étant donné que l'application est ouverte
    Et que le formulaire de saisie est ouvert

  Scénario: Section Ressources dans le formulaire
    Lorsque je consulte le formulaire
    Alors je devrais voir une section "Ressources"
    Et cette section devrait permettre de documenter la situation financière

  Scénario: Question principale sur les ressources
    Lorsque je consulte la section Ressources
    Alors je devrais voir la question "Y a-t-il des ressources ?"
    Et je devrais pouvoir répondre "Oui", "Non" ou "Ne sait pas"

  Scénario: Types de ressources disponibles
    Lorsque je réponds "Oui" à "Y a-t-il des ressources ?"
    Alors je devrais pouvoir sélectionner les types de ressources:
      | Type de ressource            |
      | RSA                          |
      | AAH                          |
      | Allocation chômage (ARE)     |
      | Minimum vieillesse (ASPA)    |
      | Pension d'invalidité         |
      | Pension de retraite          |
      | Salaire                      |
      | Travail non déclaré          |
      | Manche / Mendicité           |
      | Aide familiale               |
      | Autre                        |

  Scénario: Sélection multiple de ressources
    Lorsque je réponds "Oui" aux ressources
    Et que je coche "RSA"
    Et que je coche "AAH"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher les deux types de ressources

  Scénario: Montant approximatif des ressources
    Lorsque je renseigne les ressources
    Alors je devrais pouvoir indiquer une tranche de revenus:
      | Tranche                |
      | Moins de 500€          |
      | 500€ - 800€            |
      | 800€ - 1000€           |
      | 1000€ - 1500€          |
      | Plus de 1500€          |
      | Ne sait pas            |

  Scénario: Absence de ressources
    Lorsque je réponds "Non" à "Y a-t-il des ressources ?"
    Alors la fiche devrait afficher "Aucune ressource connue"
    Et cette information devrait être mise en évidence

  Scénario: Ressources en cours de demande
    Lorsque je consulte la section Ressources
    Alors je devrais voir une option "Demande en cours"
    Et je devrais pouvoir préciser le type de demande en cours

  Scénario: Compte bancaire
    Lorsque je consulte la section Ressources
    Alors je devrais voir la question "Possède un compte bancaire ?"
    Et je devrais pouvoir répondre "Oui", "Non" ou "Ne sait pas"

  Scénario: Affichage des ressources sur la fiche
    Étant donné une fiche avec des ressources renseignées
    Lorsque je consulte cette fiche
    Alors je devrais voir un récapitulatif des ressources
    Et les ressources devraient être clairement identifiées

  Scénario: Statistiques sur les ressources
    Étant donné que je suis sur l'onglet "Statistiques"
    Alors je devrais voir des statistiques sur les ressources:
      | Statistique                              |
      | Personnes sans ressources                |
      | Personnes avec RSA                       |
      | Personnes avec AAH                       |
      | Répartition par type de ressources       |

  Scénario: Filtrage par ressources
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je filtre par "Sans ressources"
    Alors je devrais voir uniquement les personnes sans ressources connues

  Scénario: Évolution des ressources dans l'historique
    Étant donné une personne avec plusieurs rencontres
    Lorsque je consulte son historique
    Alors je devrais voir l'évolution de ses ressources au fil du temps





