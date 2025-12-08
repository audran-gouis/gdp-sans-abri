# language: fr

@formulaires @identification_salaries
Fonctionnalité: Identification des salariés
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir identifier le salarié qui effectue la saisie
  Afin de tracer qui a créé ou modifié chaque fiche

  Contexte:
    Étant donné que l'application est ouverte

  Scénario: Sélection du salarié lors de la création d'une fiche
    Lorsque je clique sur "Nouvelle fiche"
    Alors je devrais voir un champ "Salarié" obligatoire
    Et le champ devrait proposer une liste de salariés

  Scénario: Liste des salariés disponibles
    Lorsque je clique sur le sélecteur de salarié
    Alors je devrais voir la liste des salariés enregistrés
    Et je devrais pouvoir en sélectionner un

  Scénario: Enregistrement du salarié sur la fiche
    Lorsque je sélectionne le salarié "Martin Sophie"
    Et que je complète les autres informations
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher "Créé par: Martin Sophie"
    Et l'heure de création devrait être enregistrée

  Scénario: Affichage du salarié sur les fiches existantes
    Étant donné une fiche créée par "Durand Pierre"
    Lorsque je consulte cette fiche
    Alors je devrais voir "Salarié: Durand Pierre"

  Scénario: Traçabilité des modifications
    Étant donné une fiche créée par "Martin Sophie"
    Lorsque "Durand Pierre" modifie cette fiche
    Et clique sur "Enregistrer"
    Alors la fiche devrait afficher "Créé par: Martin Sophie"
    Et la fiche devrait afficher "Modifié par: Durand Pierre"
    Et la date de modification devrait être enregistrée

  Scénario: Filtrage par salarié dans les statistiques
    Étant donné que je suis sur l'onglet "Statistiques"
    Lorsque je filtre par salarié "Martin Sophie"
    Alors je devrais voir uniquement les fiches créées par ce salarié

  Scénario: Gestion des salariés
    Étant donné que je suis administrateur
    Lorsque j'accède à la gestion des salariés
    Alors je devrais pouvoir ajouter un nouveau salarié
    Et je devrais pouvoir modifier un salarié existant
    Et je devrais pouvoir désactiver un salarié





