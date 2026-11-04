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
