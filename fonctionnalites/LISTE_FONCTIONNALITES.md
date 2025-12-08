# Liste des Fonctionnalités à compléter - Application Maraudes

---

## Statistiques

| Fichier | Description |
|---------|-------------|
| `statistiques_complet/affichage_fiche_complete/scenario.feature` | Affichage de la fiche complète depuis les Statistiques (avec commentaires) |
| `statistiques_complet/filtrage_par_type_intervention/scenario.feature` | Filtrage par type d'intervention dans les statistiques |
| `statistiques_complet/selection_periode_jour/scenario.feature` | Sélection de période par jour |
| `statistiques_complet/selection_periode_mois/scenario.feature` | Sélection de période par mois |
| `statistiques_complet/historique_rencontres/scenario.feature` | Historique des rencontres par personne (avec commentaires) |

---

## ADP 

| Fichier | Description |
|---------|-------------|
| `adp_complet/ajout_personne_complete/scenario.feature` | Ajout d'une personne ADP avec toutes les informations |
| `adp_complet/ajout_personne_inconnue/scenario.feature` | Ajout d'une personne inconnue dans ADP |
| `adp_complet/gestion_point_accueil/scenario.feature` | Gestion du point d'accueil |

---

## Transmissions Quotidiennes

| Fichier | Description |
|---------|-------------|
| `transmissions_complet/affichage_page/scenario.feature` | Affichage de la page des transmissions |
| `transmissions_complet/ajout_transmission_complete/scenario.feature` | Ajout d'une transmission complète |
| `transmissions_complet/ajout_transmission_minimale/scenario.feature` | Ajout d'une transmission minimale |
| `transmissions_complet/filtrage_par_nom/scenario.feature` | Filtrage des transmissions par nom |
| `transmissions_complet/modification_transmission/scenario.feature` | Modification d'une transmission existante |
| `transmissions_complet/suppression_transmission/scenario.feature` | Suppression d'une transmission |
| `transmissions_complet/gestion_inconnus/scenario.feature` | Gestion des personnes inconnues dans Transmissions Quotidiennes |

---

## Navigation

| Fichier | Description |
|---------|-------------|
| `navigation_complet/affichage_onglet_par_defaut/scenario.feature` | Affichage de l'onglet par défaut |
| `navigation_complet/navigation_entre_tous_onglets/scenario.feature` | Navigation entre tous les onglets |
| `navigation_complet/navigation_vers_adp/scenario.feature` | Navigation vers l'onglet ADP |
| `navigation_complet/navigation_vers_statistiques/scenario.feature` | Navigation vers l'onglet Statistiques |
| `navigation_complet/trois_onglets_principaux/scenario.feature` | Trois onglets : Maraudes Départementales / ADP / Point Accueil |

---

## Formulaires

| Fichier | Description |
|---------|-------------|
| `formulaires_complet/autocompletion_champs/scenario.feature` | Autocomplétion des champs de formulaire |
| `formulaires_complet/selection_multiple_checkboxes/scenario.feature` | Sélection multiple avec checkboxes |
| `formulaires_complet/localisation_aeroport/scenario.feature` | Localisation par aéroport (plutôt que ville) |
| `formulaires_complet/identification_salaries/scenario.feature` | Identification des salariés |
| `formulaires_complet/champs_obligatoires/scenario.feature` | Champs obligatoires + Option N/C (Non Communiqué) |
| `formulaires_complet/vulnerabilites_situations/scenario.feature` | Vulnérabilités (psy, sociales, médicales, sans papiers) |
| `formulaires_complet/filtres_age_genre/scenario.feature` | Filtres par âge / genre + cases Décédé / Disparu |
| `formulaires_complet/suivi_domiciliation/scenario.feature` | Suivi social, domiciliation, suivi médical (avec indication du lieu) |
| `formulaires_complet/ressources_personne/scenario.feature` | Ressources financières de la personne |

---

## Interface

| Fichier | Description |
|---------|-------------|
| `interface_complet/affichage_fenetre_maximisee/scenario.feature` | Affichage de la fenêtre maximisée |
| `interface_complet/gestion_modales/scenario.feature` | Gestion des modales |
| `interface_complet/renommage_carte_fiche/scenario.feature` | Renommer "carte" en "fiche" |
| `interface_complet/date_creation_fiche/scenario.feature` | Date de création des fiches |
| `interface_complet/informations_couleur/scenario.feature` | Informations en couleur (jaune=signalement, bleu=nouveau, rouge=violent, gris=décès) |
| `interface_complet/duplication_fiche/scenario.feature` | Duplication des fiches |
| `interface_complet/portage_mobile/scenario.feature` | Portage application tablette / mobile |
| `interface_complet/desactivation_suppression/scenario.feature` | Désactivation de la possibilité de supprimer |
| `interface_complet/archivage_restauration/scenario.feature` | Système d'archivage avec restauration |
| `interface_complet/recherche_globale/scenario.feature` | Recherche par nom sur tous les dispositifs + système d'alerte |
| `interface_complet/liaison_fiches_existantes/scenario.feature` | Création de fiches pour personnes déjà dans les tableaux |

---

## Persistance

| Fichier | Description |
|---------|-------------|
| `persistance_complet/sauvegarde_transmission/scenario.feature` | Sauvegarde des transmissions |
| `persistance_complet/recuperation_donnees/scenario.feature` | Récupération des données |

---