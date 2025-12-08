# language: fr

@formulaires @suivi_domiciliation
Fonctionnalité: Suivi social, domiciliation et suivi médical avec indication du lieu
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir renseigner les informations de suivi social, domiciliation et médical
  Afin de documenter précisément l'accompagnement de chaque personne

  Contexte:
    Étant donné que l'application est ouverte
    Et que le formulaire de saisie est ouvert

  # === SUIVI SOCIAL ===

  Scénario: Section Suivi Social dans le formulaire
    Lorsque je consulte le formulaire
    Alors je devrais voir une section "Suivi Social"
    Et cette section devrait contenir une case à cocher "Suivi social en cours"

  Scénario: Indication du lieu de suivi social
    Lorsque je coche "Suivi social en cours"
    Alors un champ "Lieu du suivi social" devrait apparaître
    Et je devrais pouvoir saisir le nom de la structure

  Scénario: Autocomplétion des structures de suivi social
    Lorsque je commence à taper dans le champ "Lieu du suivi social"
    Alors je devrais voir des suggestions de structures connues
    Et je devrais pouvoir sélectionner une structure existante
    Ou saisir une nouvelle structure

  Scénario: Enregistrement du suivi social avec lieu
    Lorsque je coche "Suivi social en cours"
    Et que je saisis "CCAS de Roissy" dans le champ lieu
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher "Suivi social: CCAS de Roissy"

  Scénario: Informations complémentaires suivi social
    Lorsque je coche "Suivi social en cours"
    Alors je devrais pouvoir saisir:
      | Champ                      |
      | Nom de l'assistant social  |
      | Téléphone de contact       |
      | Date de début du suivi     |

  # === DOMICILIATION ===

  Scénario: Section Domiciliation dans le formulaire
    Lorsque je consulte le formulaire
    Alors je devrais voir une section "Domiciliation"
    Et cette section devrait contenir une case à cocher "Domiciliation active"

  Scénario: Indication du lieu de domiciliation
    Lorsque je coche "Domiciliation active"
    Alors un champ "Lieu de domiciliation" devrait apparaître
    Et je devrais pouvoir saisir l'adresse de domiciliation

  Scénario: Types de domiciliation disponibles
    Lorsque je coche "Domiciliation active"
    Alors je devrais pouvoir sélectionner le type:
      | Type de domiciliation     |
      | CCAS                      |
      | Association               |
      | CPAM                      |
      | Autre organisme           |

  Scénario: Enregistrement de la domiciliation avec adresse
    Lorsque je coche "Domiciliation active"
    Et que je sélectionne le type "Association"
    Et que je saisis "Association Emmaüs - 15 rue de la Solidarité, 93290 Tremblay"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher les informations de domiciliation complètes

  Scénario: Date de validité de la domiciliation
    Lorsque je renseigne une domiciliation
    Alors je devrais pouvoir saisir la date d'expiration
    Et une alerte devrait apparaître si la domiciliation expire bientôt

  # === SUIVI MÉDICAL ===

  Scénario: Section Suivi Médical dans le formulaire
    Lorsque je consulte le formulaire
    Alors je devrais voir une section "Suivi Médical"
    Et cette section devrait contenir une case à cocher "Suivi médical en cours"

  Scénario: Indication du lieu de suivi médical
    Lorsque je coche "Suivi médical en cours"
    Alors un champ "Lieu du suivi médical" devrait apparaître
    Et je devrais pouvoir saisir le nom de l'établissement

  Scénario: Types d'établissements médicaux
    Lorsque je coche "Suivi médical en cours"
    Alors je devrais pouvoir sélectionner le type d'établissement:
      | Type                        |
      | Hôpital                     |
      | Centre de santé             |
      | Médecin traitant            |
      | PASS (Permanence d'accès)   |
      | CMP (Centre médico-psy)     |
      | CSAPA (Addictologie)        |
      | Autre                       |

  Scénario: Enregistrement du suivi médical avec détails
    Lorsque je coche "Suivi médical en cours"
    Et que je sélectionne "Hôpital"
    Et que je saisis "Hôpital Robert Ballanger - Aulnay-sous-Bois"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher "Suivi médical: Hôpital Robert Ballanger"

  Scénario: Couverture santé
    Lorsque je consulte la section médicale
    Alors je devrais voir des options pour la couverture santé:
      | Option                      |
      | Sécurité sociale active     |
      | CMU-C / CSS                 |
      | AME                         |
      | Aucune couverture           |
      | En cours de régularisation  |

  # === AFFICHAGE ET STATISTIQUES ===

  Scénario: Affichage des suivis sur la fiche
    Étant donné une fiche avec suivi social, domiciliation et suivi médical
    Lorsque je consulte cette fiche
    Alors je devrais voir une section récapitulative des suivis
    Et chaque suivi devrait afficher le lieu associé

  Scénario: Filtrage par type de suivi
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je filtre par "Suivi social actif"
    Alors je devrais voir les personnes avec un suivi social en cours

  Scénario: Statistiques des suivis
    Étant donné que je suis sur l'onglet "Statistiques"
    Alors je devrais voir:
      | Statistique                           |
      | Nombre de personnes avec suivi social |
      | Nombre de personnes domiciliées       |
      | Nombre de personnes suivies médicalement |





