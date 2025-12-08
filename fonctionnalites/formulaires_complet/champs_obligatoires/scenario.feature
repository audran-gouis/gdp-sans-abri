# language: fr

@formulaires @champs_obligatoires
Fonctionnalité: Gestion des champs obligatoires et option N/C
  En tant qu'utilisateur de l'application de maraudes
  Je veux que certains champs soient obligatoires avec une option N/C (Non Communiqué)
  Afin de garantir la qualité des données tout en permettant la saisie incomplète

  Contexte:
    Étant donné que l'application est ouverte
    Et que le formulaire de saisie est ouvert

  Scénario: Indication visuelle des champs obligatoires
    Lorsque je consulte le formulaire
    Alors les champs obligatoires devraient être marqués d'un astérisque rouge
    Et la légende devrait indiquer "* Champs obligatoires"

  Scénario: Liste des champs obligatoires
    Lorsque je consulte le formulaire
    Alors les champs suivants devraient être obligatoires:
      | Champ                    |
      | Date                     |
      | Aéroport                 |
      | Type de transmission     |
      | Nombre de personnes      |
      | Salarié                  |

  Scénario: Option N/C dans les menus déroulants
    Lorsque je clique sur un menu déroulant
    Alors je devrais voir l'option "N/C" (Non Communiqué) en premier
    Et cette option devrait être sélectionnable

  Scénario: Validation avec champs obligatoires vides
    Lorsque je laisse un champ obligatoire vide
    Et que je clique sur "Enregistrer"
    Alors un message d'erreur devrait s'afficher
    Et le champ vide devrait être mis en évidence en rouge
    Et le message devrait indiquer "Ce champ est obligatoire"

  Scénario: Validation avec option N/C sélectionnée
    Lorsque je sélectionne "N/C" pour le champ "Typologie"
    Et que je remplis tous les autres champs obligatoires
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait être enregistrée avec succès
    Et le champ devrait afficher "N/C" sur la fiche

  Scénario: Enregistrement réussi avec tous les champs obligatoires remplis
    Lorsque je remplis tous les champs obligatoires
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait être enregistrée avec succès
    Et je devrais voir un message de confirmation

  Scénario: Option N/C distincte de valeur vide
    Étant donné une fiche avec "Typologie" défini à "N/C"
    Lorsque je consulte cette fiche
    Alors le champ Typologie devrait afficher "N/C"
    Et cela devrait être différent d'un champ non renseigné





