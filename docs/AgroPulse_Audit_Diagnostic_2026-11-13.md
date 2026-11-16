# AgroPulse — diagnostic initial d’audit

**Date des contrôles : 13 novembre 2026 (UTC)**
**Périmètre :** dépôt à `856f251`, réponses publiques HTTP, CMS et état visible dans hPanel.
**Statut : CERTIFICATION REFUSÉE — ACTIONS RESTANTES**

Ce diagnostic précède toute correction fonctionnelle. Aucun code métier, réglage distant, contenu CMS, DNS ou réglage CDN n’a été modifié pendant l’audit. Le seul changement réalisé dans cette phase est ce rapport; il n’a pas été poussé.

## Résumé de décision

Le site et le CMS sont opérationnels en partie : les certificats TLS sont acceptés, le site canonique répond, l’API conserve les demandes avant notification, les API publiques de contenu répondent et l’aperçu CMS est actuellement chargé sur l’origine canonique. Les tests du dépôt et le build Strapi réussissent.

La production ne peut pas être certifiée : les URL `.html` sous `www` ne redirigent pas, le script public servi porte une ancienne référence de cache malgré la purge hPanel, les pages HTML statiques n’ont pas les mêmes en-têtes de sécurité que la racine, le domaine principal n’envoie pas HSTS, cinq avis npm de niveau élevé restent dans l’installation du CMS et plusieurs opérations de bout en bout ne sont pas vérifiées dans cette session.

## État Git et changements locaux

- Branche `main`; `HEAD` et `origin/main` sont synchronisés sur `856f2514bd5987586a126a0d81868d00b9acd911`.
- `856f251` ne change que le rapport de production; le dernier commit applicatif est `660afcb`. hPanel avait affiché les déploiements du site et du CMS terminés sur `660afcb`. L’état de déploiement après le commit documentaire n’a pas été confirmé par un écran détaillant le commit.
- `public/style-policy.js` apparaît modifié dans `git status`, mais son contenu haché correspond au blob suivi et `git diff`/`git diff --raw` ne montrent aucune différence. Le fichier est laissé intact; sa marque de statut demeure inexpliquée.
- Aucun changement local non demandé n’a été supprimé ou réinitialisé.

## Architecture examinée

- Site institutionnel : fichiers sous `public/`, serveur Node dans [`scripts/serve.mjs`](../scripts/serve.mjs), soumissions dans [`scripts/contact-handler.mjs`](../scripts/contact-handler.mjs).
- Contenus publiés : pont serveur-à-serveur vers Strapi, code dans [`scripts/home-content.mjs`](../scripts/home-content.mjs) et [`scripts/page-content.mjs`](../scripts/page-content.mjs). Sans configuration CMS, le site sert délibérément le contenu de référence.
- CMS : Strapi 5.61.0, configurations dans `pilot/cms/config/`, modèles et API sous `pilot/cms/src/`. Le manifeste requiert Node.js 22 ou supérieur; le rapport d’exploitation indique Node 22 pour le CMS et Node 20 pour le site.
- Formulaires : la route `/api/contact` valide la requête, puis stocke la demande via `/api/inquiries/intake` avant tout appel à Resend. Le jeton d’ingestion est comparé en temps constant; les routes d’ingestion ne fournissent pas de liste publique.
- Les noms de variables de production sont documentés dans [`.env.example`](../.env.example); aucune valeur de secret n’est consignée dans ce rapport. Les valeurs réellement configurées chez Hostinger ne sont pas exposées ni vérifiées par le dépôt.

## Anomalies et risques observés

| Priorité | Sujet | Preuve observée | État / action requise |
|---|---|---|---|
| ÉLEVÉE (avis de dépendance; exploitabilité non établie) | Dépendances CMS | `npm audit --omit=dev` échoue avec **29 avis : 5 élevés, 22 modérés, 2 faibles**. Les alertes élevées incluent Zod `<4.6.6` transitif dans `koa-body` et `koa-session`. npm propose avec `--force` une installation de `@strapi/strapi@4.26.2`, rétrogradation majeure. | Ne pas exécuter `audit fix --force`. Établir des mises à jour amont compatibles avec Strapi 5, puis tester et déployer séparément. La revue de sécurité du code n’a pas établi de vulnérabilité exploitable dans les surfaces examinées; les avis du registre restent toutefois présents. |
| MOYENNE | Canonicalisation `www` | Contrôles HTTPS : la racine et une route API sous `www` répondent 308 vers l’apex; `/contact.html` et `/yida-cashew.html` sous `www` répondent 200. | Règle de redirection Hostinger/CDN à déterminer pour les fichiers statiques. Aucun changement de DNS ou de configuration distante n’a été appliqué. |
| MOYENNE | Cache / artefact publié | Le HTML de `https://agropulsegs.org/`, avec requête anti-cache, référence `editorial-client.js?v=f74b72f10361`; le dépôt attend `4a22630ce00a`. Réponse `Server: hcdn`, statut cache `DYNAMIC`; aucun `Age`, `ETag` ou `Cache-Control` utile n’a été observé dans la réponse contrôlée. La purge du cache du site dans hPanel avait réussi, mais n’a pas changé la référence; une purge CDN distincte n’est pas confirmée. | Comparer artefact et commit effectivement déployés, puis demander à Hostinger quelle couche sert l’ancien HTML. Ne pas désactiver le CDN. |
| MOYENNE | En-têtes de sécurité du site | La racine contrôlée envoie `X-Content-Type-Options`, `Referrer-Policy` et une CSP. Les réponses `HEAD` des pages HTML statiques Contact et YIDA-Cashew ne montraient pas ces en-têtes. HSTS et `Permissions-Policy` n’ont pas été observés sur les réponses publiques du domaine principal contrôlées. | Confirmer quelle couche sert les pages statiques et configurer des en-têtes cohérents à cette couche. Auditer les sous-domaines avant HSTS et ne pas ajouter `includeSubDomains` sans preuve. |
| MOYENNE | Contenus Strapi incomplets | Réponses courantes : accueil FR/EN = `reference`; YIDA-Cashew FR = `published`, EN = `reference`; AGIR-IA FR/EN = `reference`. HTTP 200 ne signifie donc pas que chaque contenu est publié dans Strapi. | Faire valider les contenus/langues attendus par le propriétaire, puis publier uniquement avec son autorisation. Aucune publication n’a été faite. |
| À CONFIRMER | Aperçu et origines CMS | L’aperçu authentifié affiche actuellement une iframe sur `https://agropulsegs.org/?lang=fr&editor=1#p-agir-ia`; le bouton d’enregistrement de brouillon est désactivé (aucune modification en attente). Des avertissements `postMessage` antérieurs mentionnent des origines CMS, apex et `www`; le code source actuel ne cible que l’origine configurée et valide la source ainsi que l’origine des messages. | Le chargement de l’iframe est confirmé; un cycle sauvegarde/rechargement de brouillon sur le bundle actuel ne l’est pas. Examiner les journaux navigateur après un chargement propre. Aucun brouillon n’a été changé ni publié pendant cet audit. |
| À CONFIRMER | CORS | Le prévol de `cms.agropulsegs.org` depuis `https://agropulsegs.org` répond 204; celui depuis `https://www.agropulsegs.org` répond 200 sans autorisation CORS. | Comportement cohérent avec l’origine canonique choisie. Ne pas ajouter `www` aux origines de confiance. |
| À CONFIRMER | Formulaires, Resend, Gmail | Les documents de reprise du 12 novembre enregistrent des tests fictifs sur les formulaires publics, des demandes en base et deux notifications Resend `Delivered`. Ils précisent que Gmail n’a pas été vérifié et que `Delivered` ne prouve pas l’arrivée en boîte de réception. Aucun nouvel envoi n’a été déclenché dans cet audit. | Faire un essai end-to-end seulement avec accord juste avant l’envoi, données fictives identifiées, accès Resend/Gmail et procédure de repérage/nettoyage des tests. |
| FAIBLE / À SUIVRE | Limitation par rafale | Le garde de rafale compte l’adresse de connexion du serveur (`req.socket.remoteAddress`) à 60 requêtes/minute; derrière un proxy partagé, des visiteurs peuvent partager ce quota. Le quota normal est distinct et par email validé. | Vérifier les adresses réellement vues côté Hostinger avant tout ajustement; ne pas faire confiance aux en-têtes de transfert fournis par le client. |
| BLOQUÉ | Sauvegarde/restauration et token Strapi | Les sources locales ne prouvent ni sauvegarde récente/restauration testée sur la production ni consommateurs et permissions réels de l’ancien token Full Access mentionné dans les rapports d’exploitation. | Recueillir une preuve de sauvegarde/restauration; inventorier les consommateurs du token, préparer un remplacement à privilèges minimaux. Ne pas révoquer sans validation. |

### Contrôles HTTP actuels

Contrôles `curl` réalisés le 13 novembre :

- TLS : vérification réussie (`ssl_verify_result=0`) sur les URLs HTTPS contrôlées.
- `http://agropulsegs.org/` et `http://www.agropulsegs.org/` : 301 vers HTTPS; `https://www.agropulsegs.org/` : 308 vers l’apex.
- Apex : `/`, `/contact.html`, `/yida-cashew.html`, `/api/page-content?page=fellowship&locale=fr` et `/healthz` répondent 200.
- `www` : racine, route API et `/healthz` répondent 308; les pages HTML Contact et YIDA répondent 200 au lieu de rediriger.
- La précédente réponse 503 de `/healthz` sous `www` n’a pas été reproduite : lors du contrôle courant elle redirige en 308. Le 503 antérieur reste un événement historique, non un résultat courant.
- CMS : `/admin` répond 200 et `/_health` 204. Ces réponses incluent HSTS `max-age=31536000; includeSubDomains`; vérifier les sous-domaines de `cms.agropulsegs.org` avant de présumer que cette portée est sans risque.

## Sécurité du code et dépendances

La revue en lecture seule des implémentations de requêtes, des fonctions Strapi, du CORS, de la prévisualisation, des origines postMessage, des en-têtes et de la configuration des secrets ne révèle pas de vulnérabilité exploitable. Les routes de réception exigent un jeton, valident les champs, refusent les accès non autorisés et ne publient aucune route de lecture des demandes; les formulaires limitent la taille, valident et échappent le contenu email et ne révèlent pas les secrets du fournisseur.

Cette conclusion ne couvre ni les valeurs secrètes chez Hostinger, ni les permissions effectives en production, ni l’intégralité du graphe d’exploitation Strapi. Les 29 avis npm subsistent même si le chemin d’attaque des cinq avis élevés n’a pas été démontré.

## Tests exécutés

| Contrôle | Résultat |
|---|---|
| `npm.cmd run check` | **VALIDÉ** — 70 tests passés, contrôles statiques des pages et ressources passés. |
| `npm.cmd run check:cms-security` | **VALIDÉ** — 3 tests passés. |
| `npm.cmd --prefix pilot/cms run build` | **VALIDÉ** — compilation Strapi réussie; un avertissement signale que `STRAPI_DISABLE_UPDATE_NOTIFICATION` n’est plus pris en charge. |
| `npm.cmd --prefix pilot/cms audit --omit=dev` | **ÉCHEC** — 29 avis (5 élevés, 22 modérés, 2 faibles); aucune correction automatique appliquée. |
| Vérification navigateur responsive FR/EN | **NON REFAITE dans cette phase**. Une preuve historique du rapport précédent mentionne 90 contrôles sans débordement/échec; aucun changement visuel n’est inclus dans le commit applicatif examiné. La tentative de recontrôle n’a pas produit de mesures : l’environnement Playwright n’exposait pas le constructeur `URL`, puis le nouvel identifiant de page n’a pas été reconnu. |
| Résultat Gmail, sauvegarde/restauration, consommateur réel de token | **NON TESTÉ** dans cette phase. |

## Tableau de certification

Les statuts suivent uniquement `VALIDÉ`, `ÉCHEC`, `BLOQUÉ` ou `NON TESTÉ`.

| Contrôle | Résultat | Preuve / réserve |
|---|---|---|
| TLS | VALIDÉ | Certificats acceptés par les contrôles HTTP. |
| Redirections HTTP vers HTTPS | VALIDÉ | 301 sur les deux racines HTTP testées. |
| Domaine canonique | ÉCHEC | Les pages `.html` `www` répondent 200. |
| CDN et cache | ÉCHEC | Ancienne référence servie; cause de couche non isolée. |
| Pages publiques / responsive | BLOQUÉ | Preuve historique de 90 contrôles, pas de recontrôle complet de cette phase. |
| API de contenus | VALIDÉ | Réponses et états `published`/`reference` vérifiés; publication attendue incomplète. |
| CMS / aperçu | BLOQUÉ | Iframe canonique chargée; sauvegarde/rechargement non retesté. |
| Formulaires / stockage | BLOQUÉ | Preuves fictives historiques; pas de nouveau test end-to-end. |
| Resend | BLOQUÉ | `Delivered` historique; état courant non vérifié. |
| Gmail | NON TESTÉ | Boîte non consultée. |
| En-têtes site public | ÉCHEC | En-têtes hétérogènes; HSTS et `Permissions-Policy` absents des réponses du domaine principal contrôlées. |
| Dépendances CMS | ÉCHEC | 5 avis de niveau élevé et 24 autres avis npm. |
| Build et tests locaux | VALIDÉ | 70 tests, 3 tests sécurité CMS, build Strapi réussi. |
| Sauvegarde et restauration | NON TESTÉ | Aucune preuve récente de restauration de production. |
| Jeton Strapi Full Access | BLOQUÉ | Consommateurs/permissions réels non identifiés. |

**Décision : CERTIFICATION REFUSÉE — ACTIONS RESTANTES.**

## Plan ordonné, risques et critères de sortie

1. **Déploiement/cache Hostinger** — déterminer quel artefact et quelle couche servent `f74b72f10361`; confirmer après correction le tag `4a22630ce00a` avec requêtes anti-cache. Risque : cache ou artefact erroné persistant. Aucune désactivation du CDN.
2. **Redirection `www` des fichiers statiques** — demander à Hostinger une règle hôte couvrant chaque chemin HTML et paramètres; valider par 308 et destination apex. Risque : boucle ou impact sur un autre sous-domaine; ne pas toucher au DNS.
3. **En-têtes HTTP et HSTS** — appliquer à la couche qui sert réellement toutes les pages; auditer les sous-domaines avant HSTS. Sortie : mêmes en-têtes de sécurité sur les pages testées et vérification des sous-domaines.
4. **Dépendances CMS** — obtenir des versions Strapi 5 compatibles qui corrigent les avis, construire et retester en préproduction; refuser tout downgrade Strapi proposé automatiquement. Risque : incompatibilité ou migration de base.
5. **CMS** — tester l’aperçu, l’enregistrement puis le rechargement d’un brouillon identifié et le restaurer; aucune publication. Confirmer les contenus/langues attendus auprès du propriétaire.
6. **Formulaires/Resend/Gmail** — avec confirmation juste avant soumission réelle, envoyer uniquement des données fictives marquées TEST; vérifier Strapi et Resend, puis la boîte Gmail et le nettoyage/étiquetage des enregistrements.
7. **Sauvegardes et accès** — documenter une restauration vérifiée; inventaire des rôles et consommateurs du token avant migration vers un jeton minimal.
8. **Clôture** — répéter les tests HTTP et la matrice navigateur FR/EN à 375/768/1440 px, vérifier les images, liens et erreurs console, puis actualiser ce tableau de certification.

## Limites d’intervention

Aucune redirection CDN, règle DNS, modification d’origine CORS, activation HSTS du site, révocation de token, publication Strapi, soumission de formulaire ou envoi email n’a été effectué. Les actions qui modifient ces services ou créent des demandes/messages exigent une confirmation propre au moment de l’opération. Aucun changement de code applicatif n’a été réalisé pendant cet audit.
