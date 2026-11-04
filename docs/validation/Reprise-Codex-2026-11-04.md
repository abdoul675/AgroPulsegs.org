# Reprise AgroPulse — 4 novembre 2026

## Échéance et périmètre

Le porteur demande la livraison pour vendredi 6 novembre 2026. Cela remplace l’ancienne échéance de travail du 12 novembre dans le suivi courant ; aucune mise en production n’est présumée.

## Source YIDA-Cashew

Les cinq pages de la revue n° 01 ont été extraites et lues intégralement avec le runtime Python déjà fourni. Le dossier de présentation a également été lu. Aucun nouvel extracteur n’a été installé.

La page présente désormais l’origine DCLI et le rôle d’Evariste Dongo, les étapes décrites par la revue, la création d’AgroPulse le 14 juillet 2026, les objectifs, les publics, le parcours, la durée de formation de 2 à 3 mois, l’objectif de 500+ Fellows à l’horizon 2030 et la prévision d’une cohorte pilote de 50 Fellows. Les effectifs prévus ne sont pas présentés comme des résultats obtenus. Les 330 000 emplois concernent explicitement le cadre WEECAP et ne sont pas attribués à YIDA-Cashew.

Les organismes cités dans l’histoire ne sont pas ajoutés à la liste des partenaires confirmés. Le comité est décrit comme pressenti, sans composition définitive. Les candidatures restent fermées et le PDF source reste interne.

## Vérifications acquises avant ce nouveau contenu

Le commit fb7cab5 a été exporté dans une copie propre, sans fichiers non suivis : build et check réussis, 13 tests. Un navigateur Edge a parcouru les huit pôles par activation au clavier, en FR/EN, à 1440 et 375 px, puis les pages YIDA-Cashew et Ressources. Aucun débordement ni erreur JavaScript n’a été relevé. L’ancienne URL du PDF retourne 404, les sources internes sont inaccessibles et l’envoi non configuré retourne 503 sans faux succès. Les requêtes de polices externes ont été bloquées pendant ces essais ; ce n’est pas une comparaison visuelle au pixel ni un audit WCAG complet.

## Fonctionnalités terminées

- Informations YIDA-Cashew enrichies en FR/EN, sans téléchargement ni réouverture des candidatures.
- Éditeur visuel Strapi : textes, cartes et sections, glisser-déposer, clavier, aperçu mobile, création de brouillons depuis le site et création FR/EN sur un même document métier.
- Lecture côté serveur des versions publiées par identité et langue ; validation des données de présentation et séparation Éditeur/Publieur conservées.
- Strapi 5.61.0 et correctifs compatibles : zéro critique, cinq élevées, vingt-deux modérées et deux faibles dans l’audit npm final. Voir le rapport de sécurité pour les limites.
- Guides de pilotage, lancement, sauvegarde/restauration et génération des clés internes sans affichage de secrets.

## Vérifications finales sur le workspace

| Vérification | Résultat observé |
| --- | --- |
| Build et check du site | Réussite ; 20 tests automatisés |
| Build CMS après les derniers changements | Réussite |
| Modèles, droits et publications CMS | 77 contrôles réussis |
| Saisie simplifiée | 13 contrôles réussis |
| Raccordement accueil FR/EN | 20 contrôles réussis |
| Parcours complet de pilotage visuel dans Edge | 33 contrôles réussis, dont déplacement réel à la souris, clavier, publication et création bilingue privée |
| Parcours publics | Huit pôles atteints au clavier en FR/EN à 1440 et 375 px ; pages YIDA-Cashew et Ressources, menu mobile et absence de débordement vérifiés |
| Protection documentaire | Ancienne URL PDF, variante encodée et source interne : 404 |
| Envoi non configuré | 503 explicite, sans faux succès ; aucun courriel réel envoyé |
| Sauvegarde froide | Copie extraite et redémarrée sur le port isolé 55438 ; trois comptes, deux rôles AgroPulse, quatre lignes de pages, quatre de programmes et langues FR/EN lisibles |
| Instance institutionnelle neuve isolée | Démarrage réussi, zéro compte et contenu importé ; rôles et FR/EN créés. Aucun jeton local du pilote importé. Strapi crée ses deux jetons natifs par défaut ; leur retrait est prévu dans la procédure |
| Configuration privée | Fichiers générés multiligne, deux APP_KEYS et clés aléatoires vérifiées sans afficher les secrets |

Les essais interrompus par la limite de connexions ont été repris après expiration, sans désactiver cette protection. Le refus de publication d’une fiche fictive incomplète a été corrigé dans la préparation du test ; le contrôle de publication n’a pas été supprimé. Le test portable du pilotage se trouve dans pilot/tools/test-visual-editor.mjs. Les preuves générées restent dans les emplacements locaux ignorés ; le présent rapport ne contient ni jeton, ni mot de passe, ni sauvegarde.

## Rejouer les tests CMS

Utiliser exclusivement la base locale agropulse_pilot et les comptes fictifs ; ne jamais viser une instance client avec les tests de fixtures. Démarrer la base et le CMS selon pilot/README.md. Le serveur du site de test doit écouter sur 4188 avec les variables CMS locales et AGROPULSE_CMS_ENABLE_PAGES=true ; le CMS doit avoir été construit avec VITE_AGROPULSE_SITE_URL=http://127.0.0.1:4188. Le test visuel utilise Playwright 1.62.1 et Edge. Il charge le package playwright installé pour les essais ; AGROPULSE_PLAYWRIGHT_MODULE peut désigner un package externe déjà installé. Aucun chemin personnel n’est inscrit dans le test.

Exécuter test-content-models.mjs, test-simple-entry.mjs et test-home-connection.mjs (AGROPULSE_TEST_SITE_URL=http://127.0.0.1:4188), puis test-visual-editor.mjs. Espacer les séries si la limite de connexions natives répond 429. Les fiches du pilote sont modifiées par ces tests ; l’entrée de test du pilotage est retirée de la lecture publique en fin de parcours.

## Limites et mise en service

Ces vérifications ne sont ni une validation client, ni un audit WCAG complet, ni une mesure Lighthouse. Les polices distantes ont été bloquées lors des parcours de référence. Il n’y a pas eu de déploiement distant, de test de courrier réel, d’installation Docker ou d’essai pg_dump/pg_restore sur l’hébergement cible. La restauration vérifiée est la sauvegarde froide locale ; la procédure de sauvegarde logique doit encore être exécutée sur la cible.

Les alertes CMS restantes nécessitent traitement ou acceptation explicite avant exposition publique de l’administration. Les coordonnées et informations légales officielles attendent confirmation. L’éditeur réorganise les grilles et sections existantes ; les médias, liens, formulaires et champs globaux ne sont pas tous pilotés par l’interface. Les guides exposent ces limites.

Les modifications documentaires préexistantes restent hors du lot. Le correctif déjà local du test de référencement CMS est repris car il vérifie le comportement actuel de génération des métadonnées. Aucune donnée locale, clé, sauvegarde, source PDF interne ou type généré n’est ajouté au commit.

La liste unique des éléments à fournir pour l’exploitation se trouve dans ../AgroPulse_Exploitation_2026-11-04.md. Le contrôle de la copie propre issue du commit sera consigné après export, avant push.
