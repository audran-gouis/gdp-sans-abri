# language: fr

Fonctionnalité: Validation et comportement des formulaires
  En tant qu'utilisateur de l'application de maraudes
  Je veux bénéficier de l'autocomplétion
  Afin de saisir plus rapidement les informations

  Contexte:
    Étant donné que l'application est ouverte
    Et que je suis sur le formulaire de transmission

  Scénario: Autocomplétion des champs d'identité
    Lorsque je commence à saisir dans le champ "Nom"
    Alors le navigateur devrait proposer l'autocomplétion avec l'attribut "family-name"
    Lorsque je commence à saisir dans le champ "Prénom"
    Alors le navigateur devrait proposer l'autocomplétion avec l'attribut "given-name"
    Lorsque je commence à saisir dans le champ "Adresse"
    Alors le navigateur devrait proposer l'autocomplétion avec l'attribut "street-address"

