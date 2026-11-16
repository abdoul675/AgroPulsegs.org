# Rapport final de sécurité AgroPulse

Date : 16 novembre 2026  
Périmètre : dépôt AgroPulse, routes publiques examinées, CMS Strapi et dépendances de production.

## 1. Résumé exécutif

L’examen approfondi n’a pas confirmé les principales alertes de code Herozion comme des vulnérabilités exploitables : les secrets repérés sont des fixtures de test ou des secrets générés à l’exécution, les données signalées proviennent de tests, et les contrôles `postMessage`, les filtres publics et les requêtes SQL examinés disposent déjà de protections adaptées.

Un risque de cloisonnement a toutefois été confirmé : le même jeton serveur autorisait l’enregistrement d’une demande et la modification de son état de livraison. Ces opérations utilisent désormais deux jetons indépendants, avec des tests vérifiant qu’un jeton ne peut pas remplacer l’autre. Les exemples de configuration et le générateur d’environnement ont été mis à jour en conséquence.

Les vulnérabilités npm du graphe Strapi restent présentes. Les mises à jour proposées par l’audit impliquent une rétrogradation majeure vers Strapi 4 ou des changements majeurs de dépendances; elles n’ont donc pas été appliquées sans validation de compatibilité. Aucun commit, push ni déploiement n’a été effectué.

## 2. État initial

Résultat Herozion initial fourni pour le projet :

| Indicateur | Audit initial |
|---|---:|
| Score | 0/100 |
| Critiques | 3 |
| Élevées | 66 |
| Moyennes | 15 |
| Total | 84 |

Le worktree contenait déjà des modifications et documents non liés à cet audit. Ils ont été conservés; aucune réinitialisation, suppression ou modification de ces travaux n’a été effectuée.

## 3. Vulnérabilités réellement confirmées

### Cloisonnement du jeton des demandes

Avant le changement, `AGROPULSE_FORM_INGEST_TOKEN` autorisait à la fois la création d’une demande et la mise à jour de son état de livraison. Une compromission de ce jeton aurait donc donné davantage de droits que nécessaire. La route de mise à jour utilise maintenant `AGROPULSE_FORM_DELIVERY_TOKEN`, distinct du jeton d’ingestion. L’absence de ce jeton est signalée dans les journaux et la mise à jour est refusée par le CMS.

### Avis des dépendances CMS

`npm audit --omit=dev` confirme **29 avis de dépendances de production** : 5 élevés, 22 modérés et 2 faibles. Parmi les paquets concernés figurent `@strapi/core`, `@strapi/types`, `koa-body`, `koa-session` et `zod`. La présence d’un paquet vulnérable dans l’arbre ne prouve pas à elle seule qu’un chemin exploitable existe dans AgroPulse.

- Les versions Strapi installées sont en 5.61.0. Les correctifs proposés automatiquement par npm conduisent notamment à Strapi 4.26.2, une rétrogradation majeure incompatible avec la configuration actuelle.
- `koa-body` est en 6.0.1; les versions 6 publiées consultées ne fournissent pas de version corrigée, et les versions plus récentes changent de majeure.
- Les copies imbriquées de Zod sont en 3.25.76. L’avis GHSA-mrhx-c7xc-m3w5 concerne les versions inférieures à 4.6.6. Forcer Zod 4 dans des consommateurs prévus pour Zod 3 n’a pas été jugé sûr.
- Le test `check:cms-security` confirme que les consommateurs Zod concernés valident la configuration de confiance, et non les collections fournies dans les requêtes publiques. Il confirme aussi que les routes médias fermées rejettent les requêtes avant l’analyse du corps. Ces contrôles réduisent la portée constatée, sans annuler les avis npm.

Aucune mise à jour de dépendance n’a été appliquée; le nombre d’avis npm reste donc inchangé.

## 4. Faux positifs et limites de validation

Les alertes Herozion détaillées suivantes ont été examinées et ne correspondent pas à des vulnérabilités confirmées dans le contexte analysé :

- `scripts/inquiry-intake.test.mjs` : valeur fictive utilisée comme jeton de test, pas un secret de production.
- `scripts/page-content.test.mjs` : réponse de test, sans donnée sensible réelle.
- `scripts/prepare-institutional-env.mjs` : les valeurs signalées sont créées avec `randomBytes` lors de l’exécution et écrites dans des fichiers d’environnement; elles ne sont pas des secrets fixes intégrés au dépôt.
- `pilot/cms/src/admin/components/VisualEditor.jsx` : les messages contrôlent notamment l’origine et la source attendues.
- `pilot/cms/src/api/expertise/controllers/expertise.js` : les routes examinées sont des lectures publiques filtrées; aucune écriture arbitraire correspondante n’a été trouvée.
- Les occurrences SQL examinées utilisent des requêtes fixes avec paramètres ou des filtres issus de spécifications internes; aucune injection SQL n’a été confirmée.

Le scan gratuit ne détaille pas 76 des 86 constats et ne permet donc pas de les confirmer ou de les invalider individuellement. Il a également ignoré `pilot/cms/package-lock.json` (782 Ko, au-dessus de sa limite de 500 Ko). Le résultat Herozion ne doit pas être interprété comme une validation complète du lockfile ni de chaque constat caché.

## 5. Corrections effectuées

- Séparation des autorisations d’ingestion et de mise à jour de livraison, côté CMS et côté site.
- Refus des opérations avec le mauvais jeton ou sans jeton de livraison configuré.
- Journalisation explicite lorsque la mise à jour de l’historique de livraison n’est pas configurée.
- Ajout des deux variables d’environnement dans les exemples CMS/site.
- Mise à jour du générateur d’environnement pour créer deux secrets indépendants et recopier chaque secret uniquement dans les fichiers CMS et site correspondants. Les valeurs ne sont pas affichées.
- Ajout de tests de non-régression couvrant l’isolation des jetons et la configuration manquante.

## 6. Fichiers modifiés pour cet audit

- [`.env.example`](../.env.example)
- [`pilot/cms/.env.example`](../pilot/cms/.env.example)
- [`pilot/cms/src/api/inquiry/controllers/intake.js`](../pilot/cms/src/api/inquiry/controllers/intake.js)
- [`scripts/contact-handler.mjs`](../scripts/contact-handler.mjs)
- [`scripts/contact-handler.test.mjs`](../scripts/contact-handler.test.mjs)
- [`scripts/inquiry-intake.test.mjs`](../scripts/inquiry-intake.test.mjs)
- [`scripts/prepare-institutional-env.mjs`](../scripts/prepare-institutional-env.mjs)

Les autres changements déjà présents dans le worktree n’ont pas été inclus dans cette liste et n’ont pas été modifiés par cet audit.

## 7. Tests exécutés

| Vérification | Résultat |
|---|---|
| `npm run check` | Réussi : 72 tests, 0 échec; contrôles de contenu réussis |
| `npm run check:cms-security` | Réussi : 3 tests, 0 échec |
| `npm run build --prefix pilot\cms` | Réussi |
| Générateur d’environnement | Réussi : les deux jetons sont distincts et chacun correspond entre site et CMS |
| `git diff --check` | Réussi |
| `npm audit --omit=dev` | 29 avis : 5 élevés, 22 modérés, 2 faibles |

Le build Strapi a affiché un avertissement concernant l’option obsolète `STRAPI_DISABLE_UPDATE_NOTIFICATION`; le build s’est néanmoins terminé correctement.

## 8. Nouvel audit Herozion

Commande exécutée : `npx.cmd herozion@latest scan .`  
Version affichée : 2.0.20  
Identifiant : `1a945b547c07`

| Indicateur | Audit initial fourni | Nouvel audit |
|---|---:|---:|
| Score | 0/100 | 0/100 |
| Critiques | 3 | 5 |
| Élevées | 66 | 66 |
| Moyennes | 15 | 15 |
| Total | 84 | 86 |

Herozion affiche 10 constats détaillés et indique que 76 autres sont réservés au plan payant; sa sortie précise 70 constats confirmés et 14 de confiance moyenne. Les cinq alertes critiques affichées comprennent les fixtures de test et la génération de secrets décrites plus haut. La hausse de deux alertes critiques et du total par rapport aux chiffres initiaux n’est donc pas une preuve de régression de sécurité; elle reflète notamment le comptage de plusieurs lignes de génération comme secrets codés en dur. Le score reste inchangé.

## 9. Risques restant à traiter

1. Les 29 avis npm, dont 5 élevés, restent présents. Leur correction sûre dépend de versions compatibles avec Strapi 5 ou d’une campagne de mise à niveau et de validation distincte.
2. Les 76 constats Herozion non détaillés n’ont pas pu être évalués individuellement; le lockfile CMS n’a pas été scanné par Herozion.
3. Le déploiement actuel doit recevoir `AGROPULSE_FORM_DELIVERY_TOKEN` dans l’environnement CMS et dans celui du site, avec la même valeur pour cette paire et une valeur différente de `AGROPULSE_FORM_INGEST_TOKEN`. Sans ce réglage, les demandes et courriels restent traités, mais leur historique de livraison ne sera pas mis à jour.
4. Les tests et le build ne remplacent pas une validation des paramètres Hostinger, des rôles de production, de la base réelle et des intégrations externes après déploiement.

## 10. Recommandations avant mise en production

- Générer et configurer deux secrets distincts dans les environnements de production CMS et site; ne pas les placer dans Git ni dans des fichiers publics.
- Après configuration, déployer avec autorisation, puis vérifier qu’un jeton d’ingestion ne peut pas appeler la route `PATCH`, qu’un jeton de livraison ne peut pas créer de demande et que l’historique s’actualise avec le bon jeton.
- Attendre des correctifs compatibles Strapi 5 pour les dépendances signalées; avant leur adoption, mettre à jour le lockfile et exécuter les tests CMS et le build sur une branche dédiée.
- Obtenir l’export détaillé des 76 constats Herozion masqués ou faire examiner séparément chaque occurrence non couverte avant de qualifier le score de sécurité.
- Vérifier sauvegarde, restauration, HTTPS, secrets de production, permissions CMS et journaux sans données sensibles avant l’ouverture publique.

