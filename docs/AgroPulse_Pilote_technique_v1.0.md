# AgroPulse — Compte rendu du pilote technique v1.0

**Date : 26 octobre 2026. Statut : pilote local réalisé ; périmètre limité vérifié.**

Le pilote confirme le fonctionnement local d’une expertise fictive FR/EN, de ses brouillons, de sa publication et de sa prévisualisation avec Next.js, Strapi Community et PostgreSQL. Il ne constitue ni une mise en production ni la recette des sept types de contenus du modèle v1.0.

La personne de validation client désignée reste **Mme Hélène Nichy**. Les résultats ci-dessous sont des observations techniques ; ils ne constituent pas une approbation client ou une signature de sa part.

## Réalisation

Le dossier `pilot/` contient un CMS autonome, un frontend Next.js et les outils de lancement et de vérification. Le site statique existant dans `public/` n’a pas été modifié par ce pilote.

Une seule expertise de démonstration possède deux traductions partageant le même `documentId`. Une version FR et une version EN sont publiées. Une révision FR distincte reste en brouillon pour montrer la séparation entre contenu public et contenu en préparation. Aucun contenu client réel, candidature, envoi de message ou achat de service n’a été utilisé.

| Rôle du pilote | Comportement observé |
| --- | --- |
| Éditeur | Crée et modifie des brouillons incomplets ; prévisualise ; ne publie pas et ne gère pas les rôles. |
| Publieur | Publie FR/EN lorsque titre, slug et résumé sont renseignés ; ne gère pas les rôles. |
| Administrateur technique | Compte natif Super Admin ; accès à la gestion des rôles et bouton de publication disponible. |

Les rôles administratifs sont distincts des permissions de l’API de contenu. Le rôle Editor standard n’a pas été repris tel quel. Le frontend lit le contenu avec un jeton serveur limité aux deux actions de lecture de l’expertise. L’API REST anonyme du CMS est refusée ; le site Next.js reste consultable sans connexion.

La prévisualisation native du CMS produit un lien signé de cinq minutes, limité au document fictif et aux locales FR/EN. Un cookie HttpOnly supplémentaire limite la session à la même durée. Les brouillons ne sont pas servis par l’API publiée et les réponses de prévisualisation ne sont pas mises en cache partagé.

## Versions réellement exécutées

| Composant | Version / constat |
| --- | --- |
| Node.js | 24.11.0 |
| npm | 11.17.0 |
| Strapi Community | 5.59.0 ; plage Node déclarée par le paquet : >=20 à 26.x |
| Next.js | 16.4.3 ; Node minimum déclaré : 20.9 |
| React / React DOM | 18.3.1 dans les applications isolées |
| PostgreSQL | 17.10 ; connexion réelle et migrations Strapi effectuées |
| Pilote SQL Node | pg 8.16.3 |
| Outil PostgreSQL portable | embedded-postgres 17.10.0-beta.17 ; réservé à cet essai |
| Navigateur | Microsoft Edge, mode sans fenêtre, via Playwright du runtime Codex |

Les constructions de l’administration Strapi et du frontend Next.js ont réussi. Next.js signale que le support de React 18 est déprécié : le choix du frontend définitif devra prévoir React 19 et vérifier ses dépendances. Les versions ne sont pas présentées comme un engagement de maintenance à long terme.

Docker n’étant pas installé sur ce poste, PostgreSQL a été lancé en mode portable avec une base persistante dédiée, sans service Windows. Le déploiement Docker Compose retenu dans le cadrage reste à préparer et à tester. Le pilote JavaScript ne remplace pas l’orientation TypeScript de l’application finale.

## Contrôles exécutés

Les preuves datées se trouvent dans `pilot/evidence/`. Chaque suite finale porte `completed: true`.

| Suite | Assertions réussies | Preuve |
| --- | ---: | --- |
| CMS et droits, appels HTTP réels | 37 | [cms-tests.json](../pilot/evidence/cms-tests.json) |
| Pages, signatures, cookies, confidentialité | 27 | [web-tests.json](../pilot/evidence/web-tests.json) |
| Parcours dans Edge et interfaces des rôles | 13 | [browser-tests.json](../pilot/evidence/browser-tests.json) |

Ces **77 assertions techniques** ne correspondent pas à 77 exigences métier. Elles couvrent le périmètre réduit de cet essai.

Ont notamment été observés : création d’un brouillon incomplet, refus HTTP 403 de publication par l’Éditeur, refus HTTP 400 d’une publication incomplète par le Publieur, publication autorisée dans les deux langues et conservation de l’identité métier. Un nouveau brouillon reste introuvable dans la lecture publiée après la tentative de publication interdite.

Une lecture publiée avec `populate=*` ne renvoie pas la révision en préparation ni les comptes administratifs. Le jeton de lecture ne peut pas écrire ni demander `status=draft`. Les secrets contrôlés sont absents du HTML public et des fichiers du bundle navigateur inspectés.

Les signatures incorrectes, liens expirés, durées excessives et autres documents sont refusés. Le cookie Next.js seul et une portée expirée ne donnent pas accès au brouillon. Le parcours de preview a aussi été exécuté dans Edge, avec une seconde session indépendante et une sortie vers la version publiée.

Les captures aux largeurs **375, 768 et 1440 px** montrent la page de démonstration sans débordement horizontal. Le premier lien reçoit le focus clavier ; le passage FR/EN conserve l’expertise et modifie correctement `html lang`. Ces contrôles ne constituent pas un audit complet d’accessibilité ou de performance.

Captures : [mobile](../pilot/evidence/public-fr-375.png), [ordinateur](../pilot/evidence/public-fr-1440.png), [brouillon](../pilot/evidence/preview-fr.png), [Éditeur](../pilot/evidence/cms-editor.png), [Publieur](../pilot/evidence/cms-publisher.png), [Administrateur](../pilot/evidence/cms-admin.png).

Deux anomalies rencontrées ont été corrigées puis revérifiées : l’adresse de retour de preview changeait de domaine local ; la navigation FR/EN conservait initialement une mauvaise langue HTML. Les suites finales incluent les contrôles correspondants.

## Couverture des scénarios du modèle v1.0

Le modèle JSON de conception reste une source historique avec ses statuts prévus. Le tableau ci-dessous consigne la couverture effective du pilote, sans modifier rétroactivement cette source.

| Scénario | Résultat sur ce pilote |
| --- | --- |
| MC01 — brouillon incomplet | Vérifié pour l’expertise : création et sauvegarde possibles, publication Éditeur refusée. |
| MC02 — publication directe Éditeur | Vérifié par appel HTTP ; nouveau brouillon toujours absent de la lecture publiée. |
| MC03 — publication autorisée | Vérifié pour les champs simples de l’expertise FR/EN ; autres modèles hors périmètre. |
| MC04 — accès public au brouillon | Vérifié pour le texte ; médias confidentiels non testés. |
| MC05 — équivalence FR/EN | Identité, titre, contenu et langue HTML vérifiés ; services structurés et SEO éditorial complet non testés. |
| MC06 — campagne fermée / dates | Non exécuté : aucune campagne ni candidature implémentée. |
| MC07 — partenaire non confirmé | Non exécuté : modèle et relations absents du pilote. |
| MC08 — ressource ou langue absente | Non exécuté pour les ressources ; les locales non supportées de l’expertise sont refusées. |
| MC09 — accès et cache de preview | Vérifié pour l’expertise et les deux couches CMS/Next.js. |
| MC10 — gestion des comptes / médias | Gestion des rôles refusée à l’Éditeur ; suppression de média non testée. |
| MC11 — population / champs privés | Contrôlé sur l’expertise sans relations ; aucune conclusion sur les futures relations et preuves privées. |
| MC12 — import confidentiel | Non exécuté : aucun média importé. |

## Revue et suite du projet

1. Examiner le pilote local et les rôles, avec les données fictives. Le [guide de lancement](../pilot/README.md) décrit l’accès aux comptes et la reproduction.
2. Compléter les six autres modèles et les règles transversales : paramètres du site, pages, programmes, campagnes, ressources et partenaires. Définir et tester les conditions de publication de chaque modèle.
3. Couvrir les médias, relations privées, ressources absentes et conditions d’ouverture des campagnes, puis reprendre les scénarios partiellement ou non exécutés.
4. Raccorder progressivement les pages des maquettes retenues au CMS et organiser la validation des contenus FR/EN avec Mme Hélène Nichy.
5. Préparer ensuite Docker Compose, la préproduction, les sauvegardes/restaurations, l’envoi de formulaires et la recette de livraison, avec les services et responsabilités confirmés.

Les dates, critères de campagne, contenus réels, abonnements d’hébergement et engagements de coûts restent soumis aux décisions déjà identifiées dans les documents de référence. Aucun déploiement, achat ni push GitHub n’a été effectué pour ce pilote à cette étape.

Références techniques : [Strapi RBAC](https://docs.strapi.io/cms/features/rbac), [Draft & Publish](https://docs.strapi.io/cms/features/draft-and-publish), [Preview](https://docs.strapi.io/cms/features/preview), [Next.js Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode). Les API de rôles, utilisateurs, jetons et preview ont aussi été vérifiées dans le code de Strapi 5.59.0 effectivement installé.
