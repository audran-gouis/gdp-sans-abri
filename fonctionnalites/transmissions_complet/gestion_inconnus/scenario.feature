# language: fr

@transmissions @gestion_inconnus
Fonctionnalité: Gestion des personnes inconnues dans Transmissions Quotidiennes
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir enregistrer des personnes inconnues dans les transmissions quotidiennes
  Afin de documenter les rencontres même sans connaître l'identité

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "Transmissions Quotidiennes"

  Scénario: Cocher "Inconnu" pour une personne
    Lorsque je clique sur "Nouvelle fiche"
    Et que je coche la case "Inconnu"
    Alors les champs "Nom" et "Prénom" devraient être désactivés
    Et le champ "Description physique" devrait rester actif
    Et je devrais pouvoir saisir une description physique

  Scénario: Enregistrement d'une personne inconnue
    Lorsque je crée une fiche avec "Inconnu" coché
    Et que je remplis "Description Physique" avec "Homme âgé, barbe blanche, bonnet rouge"
    Et que je complète les autres informations requises
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait être enregistrée
    Et la fiche devrait afficher "Inconnu" à la place du nom

  Scénario: Filtrage des personnes inconnues
    Étant donné qu'il existe des fiches avec des personnes inconnues
    Lorsque je coche le filtre "Inconnus uniquement"
    Alors je devrais voir seulement les fiches de personnes inconnues

  Scénario: Décocher "Inconnu" réactive les champs
    Étant donné que la case "Inconnu" est cochée
    Lorsque je décoche la case "Inconnu"
    Alors les champs "Nom" et "Prénom" devraient redevenir actifs
    Et je devrais pouvoir saisir un nom et un prénom

  Scénario: Identification ultérieure d'une personne inconnue
    Étant donné une fiche existante avec "Inconnu" coché
    Lorsque je modifie cette fiche
    Et que je décoche "Inconnu"
    Et que je remplis "Nom" avec "Dupont"
    Et que je remplis "Prénom" avec "Jean"
    Et que je clique sur "Enregistrer"
    Alors la fiche devrait afficher "Jean Dupont"
    Et la description physique devrait être conservée





