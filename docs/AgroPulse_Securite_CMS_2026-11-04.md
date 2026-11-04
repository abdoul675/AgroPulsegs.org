# État de sécurité du CMS — 4 novembre 2026

Audit npm des dépendances installées de production, exécuté après installation et construction. L’absence d’alerte critique ne signifie pas absence de risque.

| État | Critiques | Élevées | Modérées | Faibles | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Avant reprise, Strapi 5.59.0 | 3 | 26 | 12 | 2 | 43 |
| Après correctifs, Strapi 5.61.0 | 0 | 5 | 22 | 2 | 29 |

Les trois packages Strapi sont verrouillés ensemble en 5.61.0. React 18 et React Router 6 sont conservés selon les dépendances du framework. Les correctifs compatibles incluent DOMPurify 3.4.17, Nodemailer 10.1.4 et Zod 4.6.6 pour les dépendances utilisant déjà Zod 4. Le verrou npm contient les versions effectivement installées. Le build d’administration et le démarrage sur la base existante ont réussi. Une sauvegarde froide de la base a été réalisée avant la mise à jour ; aucun reset ni migration majeure n’a été exécuté.

## Alertes restantes

- Zod 3.25.76 reste utilisé notamment par koa-body et koa2-swagger-ui. L’avis de consommation excessive de mémoire couvre les versions antérieures à 4.6.6 : cinq packages restent comptés à niveau élevé avec la propagation. Remplacer Zod 3 par 4 sans migration des consommateurs serait incompatible.
- React Router 6.30.6 : redirection via antislash et désérialisation SSR ; correctifs annoncés en 7.18.0. Le nouvel éditeur utilise des destinations de navigation fixes et ne fait pas de SSR React Router. Cela réduit l’exposition de ce parcours, sans corriger la dépendance globale de Strapi.
- @hono/node-server 1.x, glob 13, minimatch 10 et stream-json 1.x : les correctifs identifiés nécessitent un changement majeur des dépendances concernées.
- deepmerge 4.3.1 : aucun correctif publié dans l’avis consulté.

Les totaux incluent des dépendances transitives et ne représentent pas 29 vulnérabilités indépendantes. L’analyse du chemin effectivement exploitable n’est pas complète. L’administration ne doit pas être considérée prête pour une exposition publique sans traitement ou acceptation explicite des risques restants. Prévoir HTTPS, restriction d’accès à l’administration, mises à jour suivies et sauvegardes indépendantes. Aucun audit fix --force ni déclassement de Strapi n’a été appliqué.

## Sources officielles consultées

- [Strapi 5.61.0](https://github.com/strapi/strapi/releases/tag/v5.61.0).
- [DOMPurify](https://github.com/cure53/DOMPurify/security/advisories/GHSA-cg2g-xh64-v4q7).
- [Zod : consommation de mémoire](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- [React Router : redirection](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) et [SSR](https://github.com/advisories/GHSA-337j-9hxr-rhxg).
- [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
- [Hono](https://github.com/advisories/GHSA-rmxm-3fg6-px4f), [glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), [minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249), [stream-json](https://github.com/advisories/GHSA-mjw6-4jj6-33hc).

## Analyse complémentaire des cinq alertes élevées

L’audit d’une installation indépendante par npm ci confirme 29 alertes : zéro critique, cinq élevées, vingt-deux modérées et deux faibles. Les cinq élevées proviennent de deux copies de Zod 3 utilisées par koa-body 6.0.1 et koa-session 7.0.2, avec propagation à leurs consommateurs Strapi. Elles ne sont pas cinq défauts indépendants.

Le code installé et les sources officielles des versions concernées montrent que KoaBodyMiddlewareOptionsSchema.parse valide les options au moment de créer le middleware, avant le gestionnaire de requêtes ; SessionOptions.parse valide de même les options de session au démarrage. Le corps JSON est lu par co-body, pas par ces schémas d’options. Aucune entrée du site ne permet au visiteur de modifier ces options serveur.

Le test pilot/tools/test-security-boundaries.mjs instrumente ces deux schémas dans un serveur local isolé : une validation d’options au montage de chaque middleware, aucune validation d’options supplémentaire lors de deux requêtes contenant des tableaux, refus du JSON malformé en 400 et d’un corps dépassant la limite en 413. Le test ne modifie ni les dépendances installées ni les données du CMS.

Conclusion limitée : le chemin d’épuisement de mémoire décrit par l’avis n’a pas été identifié depuis les requêtes publiques vers ces deux usages. Cette observation ne corrige pas Zod 3, ne supprime pas les alertes npm et ne démontre pas l’absence de tout autre risque. Les usages Zod 4 ont déjà reçu le correctif 4.6.6. Une migration forcée de Zod 3 vers 4 n’est pas justifiée par ce résultat ; surveiller les versions amont compatibles et protéger l’accès au CMS sur la cible.

Sources primaires : [koa-body 6.0.1](https://raw.githubusercontent.com/koajs/koa-body/v6.0.1/src/index.ts), [koa-session 7.0.2](https://raw.githubusercontent.com/koajs/session/v7.0.2/src/index.ts), [correctif Zod 4](https://github.com/colinhacks/zod/commit/a0ebf970f2d752e5f58527cd2942ff48be4f46bd).
