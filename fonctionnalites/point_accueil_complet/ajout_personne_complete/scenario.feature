# language: fr

@point_accueil @ajout_personne_complete
Fonctionnalité: Ajout d'une personne complète au Point d'Accueil
  En tant qu'utilisateur du Point d'Accueil
  Je veux pouvoir ajouter une fiche complète pour une personne rencontrée
  Afin de documenter son passage au point d'accueil

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Point Accueil"

  Scénario: Ouverture du formulaire Point Accueil
    Lorsque je clique sur "Nouvelle fiche Point Accueil"
    Alors une modale devrait s'ouvrir
    Et le titre devrait être "Nouvelle fiche Point d'Accueil"

  Scénario: Remplissage complet d'une fiche Point Accueil
    Lorsque je clique sur "Nouvelle fiche Point Accueil"
    Et que je remplis le champ "Nom" avec "Martin"
    Et que je remplis le champ "Prénom" avec "Sophie"
    Et que je sélectionne la date de naissance "15/03/1985"
    Et que je sélectionne le point d'accueil "Point Accueil 1"
    Et que je sélectionne la date "08/12/2024"
    Et que je coche "Personne présente"
    Et que je coche "Écoute" dans Accompagnement
    Et que je coche "Alimentaire" dans Distribution
    Et que je saisis "Première visite au point d'accueil" dans Commentaires
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait être enregistrée avec succès
    Et je devrais voir la fiche dans la liste Point Accueil

  Scénario: Vérification des informations sur la fiche créée
    Étant donné une fiche Point Accueil créée pour "Sophie Martin"
    Lorsque je consulte la liste des fiches Point Accueil
    Alors je devrais voir une fiche contenant "Sophie Martin"
    Et la fiche devrait afficher le point d'accueil "Point Accueil 1"
    Et la fiche devrait afficher la date "08/12/2024"
    Et la fiche devrait afficher "Écoute" dans les accompagnements

