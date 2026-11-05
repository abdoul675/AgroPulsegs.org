# Pilotage visuel de la maquette existante

Statut : implémenté ; décision issue de la demande du porteur du 4 novembre 2026. Le site public approuvé reste la maquette Node.js. Le pilote Next.js reste distinct.

## Choix

Une page d’administration Strapi affiche un aperçu du site et utilise les API natives Content Manager avec les droits de l’utilisateur connecté. Les modèles Page, Expertise et Programme reçoivent deux champs JSON localisés : siteText (textes autorisés) et siteLayout (ordre de sections et indices des cartes). Ces champs sont cachés dans les formulaires ordinaires afin de ne pas demander une saisie JSON.

La présentation est validée côté serveur : clés autorisées, limites de taille, identifiants simples et indices entiers. Aucun style libre, HTML, code, lien ou sélecteur arbitraire n’est accepté. Les messages entre CMS et aperçu vérifient l’origine et la fenêtre source. L’aperçu reçoit uniquement les textes et l’ordre du brouillon ouvert, sans jeton.

Le site lit uniquement les documents publiés, par identité métier et langue. Le jeton est conservé côté serveur ; les contrôleurs CMS imposent également la publication. Les documents inconnus, ambigus ou d’une autre langue sont refusés. Sans document publié, la référence approuvée reste disponible. En cas de panne du CMS, le site garde la référence ; aucun détail de configuration n’est renvoyé.

## Publication et limites

L’enregistrement ne publie pas. Le rôle Éditeur conserve ses droits de création/modification ; le Publieur conserve la publication native. Le déplacement réordonne une grille ou les sections de la page ; les images, le nombre de cartes et les composants restent définis dans la maquette. Les liens de navigation et le pied de page ne sont pas un constructeur libre. Ce choix protège le design et le responsive sans introduire de fournisseur ou de bibliothèque de constructeur supplémentaire.

Le bootstrap institutionnel prépare les langues et rôles sans créer de comptes fictifs ni importer les données locales du pilote. Les fixtures restent limitées à HOST=127.0.0.1 et à la base agropulse_pilot ; AGROPULSE_PILOT_MODE=false désactive ce mode explicitement.

## Extension acceptée le 4 novembre, vérifiée le 5 novembre

Le porteur a demandé à la fois des réglages d’apparence simples et la possibilité de saisir du CSS. Cela remplace l’exclusion générale du CSS mentionnée plus haut, sans autoriser du HTML ou du JavaScript.

Les réglages sont stockés dans siteLayout.styles, déjà localisé et protégé par les droits natifs. Il n’y a pas de nouvelle table ni de migration de données. Une politique ESM sans dépendance est partagée par le CMS et son interface ; le générateur en copie une version publique utilisée par l’aperçu et l’adaptateur du site. Cette politique compile une grammaire CSS réduite et préfixe chaque règle par #app. Seuls les composants identifiés, des propriétés d’apparence autorisées et des règles de largeur responsive bornées sont acceptés. Les imports et ressources distantes sont interdits.

Le choix d’une grammaire réduite garde un contrôle vérifiable sur les règles sans ajouter un constructeur ou une dépendance de parsing. Il implique une compatibilité partielle avec le langage CSS général, documentée dans le guide. Les styles par défaut sont vides, donc le design approuvé reste la référence. L’aperçu est actualisé après une temporisation de 120 ms pour regrouper les saisies ; les styles d’une page sont retirés avant la navigation suivante. Les styles restent privés jusqu’à publication, et les contrôles serveur rejettent les règles interdites même si l’interface est contournée.
