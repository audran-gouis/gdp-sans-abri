# language: fr

Fonctionnalité: Gestion ADP (Accès Droits Personnes)
  En tant qu'utilisateur de l'application de maraudes
  Je veux pouvoir ajouter une personne inconnue
  Afin d'enregistrer les interventions auprès de personnes anonymes

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur l'onglet "ADP"

  Scénario: Ajout d'une personne inconnue (anonyme)
    Lorsque je clique sur le bouton "Ajouter" dans l'onglet ADP
    Et que je coche la case "Inconnu"
    Et que je remplis "Description Physique" avec "Homme âgé, barbe grise"
    Et que je sélectionne le type de transmission "Nuit"
    Et que je clique sur "Enregistrer"
    Alors la modale devrait se fermer
    Et une nouvelle carte ADP devrait apparaître pour une personne inconnue

