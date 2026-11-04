# Contrôle de livraison AgroPulse — 4 novembre 2026

## Résultat

Le site statique bilingue est constructible et ses contrôles passent. Il n’est pas encore prêt pour une mise en production : la réception réelle des formulaires, la connexion au CMS institutionnel, les vulnérabilités du pilote CMS, la validation éditoriale complète de la revue et la configuration de déploiement restent ouvertes.

Branche : `integration-maquette-finale`. Commit de code : `5d73a1ab37ab71910f6ea7b0d314b1e98d8021ac`. Aucun push ni déploiement n’a été réalisé.

## Contrôles réussis

- `npm.cmd run build` : réussi.
- `npm.cmd run check` : réussi, 13 tests automatisés ; les vérifications statiques couvrent 15 pages, les liens et ancres, les traductions, les alternatives d’images, huit pôles, les libellés, les informations YIDA-Cashew et l’absence du PDF dans les ressources publiques.
- `git diff --check` : réussi.
- Le serveur du projet a renvoyé `200` et le contenu de référence pour `/api/home-content?locale=fr` sans configuration CMS ; l’ancienne URL publique du PDF a renvoyé `404`.
- Dans le navigateur, la page YIDA-Cashew a été observée à 1365×900 et 390×844, en français et en anglais. Le rendu mobile n’a pas débordé (375 px de largeur document pour 390 px de viewport). Sur cette page, aucune image cassée ni image sans attribut `alt` n’a été relevée.
- Le menu mobile a été ouvert au clavier ; Échap l’a refermé et le focus est revenu au bouton du menu. Un clic réel dans le menu mobile a mené à Contact. La page affiche le formulaire, ses champs requis, ses quatre catégories de demande et le consentement obligatoire. Le formulaire n’a pas été soumis.
- La page Expertises affiche les huit pôles en anglais et les liens `#p-pole-1` à `#p-pole-8`. Les contrôles statiques vérifient leurs destinations ; tous les huit parcours n’ont pas été cliqués manuellement.

Les contrôles navigateur ont utilisé un serveur déjà actif pour le rendu. Ce processus ne possédait pas la nouvelle route CMS ; ses réponses ne constituent donc pas une preuve d’intégration CMS. Le serveur du code courant a été testé séparément sur un port local temporaire.

## Limites et blocages

### Contenu de la revue YIDA-Cashew

La première page de la revue interne a été consultée visuellement : elle confirme l’édition n° 01 d’octobre 2026 et une origine liée à des jeunes et à « Des Chiffres et Des Jeunes ». Le texte complet n’a pas pu être extrait dans cet environnement. Les autres détails affichés sur la page, notamment les objectifs, publics et étapes du parcours, restent à confronter à l’ensemble de la source avant validation éditoriale finale.

Le dossier temporaire créé lors de la tentative d’installation de l’extracteur PDF a été conservé, conformément au refus de suppression antérieur. Son chemin et sa taille sont communiqués séparément au porteur ; aucune suppression ni réinstallation de cet outil n’a été faite.

### Formulaires et CMS

Les 13 tests unitaires automatisés vérifient notamment les validations, les erreurs fournisseur et l’absence d’envoi quand la configuration manque. Aucun courriel réel n’a été envoyé et aucun destinataire officiel n’a été confirmé. Le fonctionnement réel des formulaires n’est donc pas établi.

Les variables Strapi sont optionnelles et restent vides dans `.env.example`. Aucun CMS institutionnel n’était configuré. Les ports locaux du pilote (PostgreSQL 55437, Strapi 1338 et serveur d’intégration 4175) étaient fermés au contrôle ; le parcours réel brouillon/publication/affichage du pilote n’a pas été rejoué pendant cette vérification.

### Dépendances CMS

`npm audit --omit=dev` a signalé 44 vulnérabilités dans l’arbre de dépendances du pilote CMS : 2 faibles, 13 modérées, 26 élevées et 3 critiques. L’installation locale indique Strapi `5.59.0`, DOMPurify `3.4.16` (critique), markdown-it `14.3.1` (élevée), Nodemailer `9.0.1` et Vite `6.4.3` (élevées).

`npm audit fix --dry-run --omit=dev` a échoué avec `ERESOLVE` et proposait des changements hors des versions déclarées, dont Strapi `5.61.0` et une version de plugin signalée comme breaking. Aucun paquet, manifeste ou fichier lock n’a été modifié. Les alertes demeurent ouvertes ; le pilote CMS ne doit pas être présenté comme prêt pour la production.

### Recette et mise en service

- Aucun test de copie propre n’a été exécuté ; les contrôles ont tourné dans l’arbre de travail existant.
- Le parcours complet du site n’a pas été examiné manuellement pour chaque page et chaque taille d’écran. Le contrôle statique couvre les pages générées ; l’examen navigateur a ciblé l’accueil, Expertises, YIDA-Cashew et Contact.
- Aucun audit WCAG automatisé ni mesure Lighthouse n’a été exécuté.
- Aucun service, compte, destinataire de formulaire ou environnement de préproduction n’a été configuré ; aucune donnée fictive n’a été publiée sur le site institutionnel.

## Espace disque

L’espace disque est tombé à zéro pendant l’essai d’audit npm. Après autorisation explicite, seules les 66 entrées récemment modifiées du cache npm ont été supprimées (52 426 024 octets). Le dossier temporaire de l’extracteur PDF est resté intact. Aucun autre cache, document ou fichier du projet n’a été supprimé.
