# AgroPulse — rapport de vérification production

## Résumé

Le périmètre de cette vérification est la finalisation technique d’AgroPulse : HTTPS, sécurité, formulaires, CMS et tests. Les maquettes approuvées, leurs images, leur présentation et le contenu visible n’ont pas été refaits.

Les tests locaux sont verts et les essais de brouillon CMS effectués précédemment ont été restaurés sans publication. L’utilisateur a choisi `https://agropulsegs.org` comme domaine canonique ; le code correspondant est poussé et Hostinger indique que les déploiements du site et du CMS sont terminés sur `660afcb`. La redirection reste incomplète en production : la racine et l’API sous `www` redirigent en 308, les pages statiques `.html` sous `www` répondent 200 et `/healthz` sous `www` a répondu 503 lors du dernier contrôle. La référence cache publique reste ancienne malgré une purge du cache du site dans hPanel. Les contenus CMS publiés sont incomplets selon les réponses observées ; Resend et Gmail restent à vérifier.

**Conclusion : le site est vérifié en partie, mais la fin de production n’est pas certifiée.**

## État du dépôt et changements

Avant cette mise à jour du rapport, `main`, `origin/main` et `HEAD` pointaient vers `660afcb` (`Clarify production canonical redirect coverage`), présent sur GitHub.

Les correctifs fonctionnels poussés sont :

- `0c63cfe` — journalise les échecs HTTP et réseau de mise à jour de l’historique d’envoi, sans consigner de détails privés, avec des tests associés.
- `4a91465` — renouvelle la référence de cache du script d’aperçu dans `public/index.html`. Ce changement ne modifie ni les textes visibles, ni les styles, ni les images ou leur disposition.
- `5201f0f` — redirige l’hôte exact `www.agropulsegs.org` vers `https://agropulsegs.org` avec un 308, en conservant chemin et paramètres ; l’aperçu CMS n’envoie et n’accepte désormais les messages que depuis l’origine configurée, sans essayer l’alias `www`.

Le rapport de production a été mis à jour dans `660afcb`.

`public/style-policy.js` est encore indiqué comme modifié par Git dans l’arbre de travail, mais `git diff` ne montre aucun changement de contenu. Il a été laissé intact.

### Déploiement Hostinger

Le HTML public, même avec une requête anti-cache, sert encore l’ancienne référence `editorial-client.js?v=f74b72f10361`, au lieu de la référence attendue `4a22630ce00a`. Hostinger confirme dans hPanel que les déploiements du site principal et du CMS sont terminés sur `660afcb` (Node 20.x pour le site principal). Une purge du cache du site a réussi dans hPanel, sans changer la référence observée ensuite. Le CDN Hostinger est actif automatiquement ; la page CDN présente une action de purge, mais son exécution n’a pas pu être confirmée. Le CDN n’a pas été désactivé.

Lors du dernier contrôle HTTP, `https://www.agropulsegs.org/` et `/api/page-content?page=fellowship&locale=fr` répondaient 308 vers l’apex, `/contact.html` et `/yida-cashew.html` répondaient 200, et `/healthz` répondait 503. Les pages `.html` et le point de santé ne suivent donc pas le même comportement que les routes app/API. Les pages statiques répondent avec `Server: hcdn` et semblent contourner la redirection du serveur Node. Aucune modification DNS ou règle incertaine n’a été faite.

Le build CMS local incluant la restriction de l’aperçu a réussi et le déploiement du CMS est marqué terminé dans hPanel. Le parcours de l’aperçu sur ce bundle déployé reste à confirmer.

## Maquettes et apparence

Aucune refonte ni réorganisation visuelle n’a été effectuée dans les commits listés ci-dessus. La seule modification de fichier web est un identifiant de cache de script dans le HTML ; aucune capture avant/après n’a été produite. Les validations navigateur rapportées précédemment ont couvert 15 pages, en français et en anglais, aux largeurs 375, 768 et 1440 px : 90 contrôles sans échec, débordement horizontal ou erreur de page.

Le fichier de maquette portant exactement le nom `AgroPulse_Maquette_Images_Integrees_Directement(2).html` n’a pas été retrouvé dans le dépôt. Une variante sans `(2)` est présente dans `.work/maquettes`. Aucune comparaison pixel par pixel avec le fichier exact demandé n’est donc attestée ici.

## Vérifications locales

- `npm run check` : 70 tests réussis et contrôles statiques des pages et ressources réussis, y compris le test de redirection 308.
- `npm run check:cms-security` : 3 tests réussis.
- `node --test scripts/contact-handler.test.mjs` : 27 tests réussis, notamment les échecs HTTP/réseau du suivi de notification.
- `npm --prefix pilot/cms run build` : build Strapi réussi après la restriction de l’origine d’aperçu.
- Les tests automatiques de formulaires et de sécurité ne remplacent pas un nouvel envoi réel en production.

## CMS et contenus publiés en production

Les routes publiques ont été testées avec les paramètres attendus (`page` et `locale`). Réponses HTTP 200 observées :

| Page | Français | Anglais |
|---|---|---|
| Accueil | Référence | Référence |
| YIDA-Cashew (`fellowship`) | Strapi publié | Référence |
| AGIR-IA (`agir-ia`) | Référence | Référence |

`reference` signifie que cette route sert le contenu de référence du site, et non une entrée CMS publiée. Le contenu anglais de YIDA-Cashew et les contenus d’accueil et d’AGIR-IA ne sont donc pas confirmés comme publiés dans Strapi par ces vérifications.

Un essai de brouillon YIDA-Cashew a été effectué avec l’autorisation de l’utilisateur : déplacement d’une section, puis ajout d’un marqueur fictif à l’introduction. Chaque brouillon a été sauvegardé et vérifié après rechargement ; l’ordre et le texte d’origine ont ensuite été restaurés et revérifiés. Aucun contenu n’a été publié.

Les réponses anonymes 403 des API de lecture protégées sont cohérentes avec une restriction d’accès. Des requêtes directes vers `/api/inquiries` et `/api/inquiries/intake` ont répondu 404 lors des contrôles précédents ; cela ne constitue pas un essai du parcours de soumission réel, qui doit être vérifié depuis chaque formulaire.

## HTTPS et sécurité observés

- Certificats TLS acceptés par le client de vérification ; les variantes HTTP redirigent vers HTTPS.
- Le domaine canonique choisi est `agropulsegs.org`. Au dernier contrôle, la racine et une route API sous `www` redirigeaient en 308, les pages `.html` répondaient 200 et `/healthz` répondait 503 : la canonicalisation de tout le site n’est pas achevée et le point de santé `www` est à diagnostiquer.
- L’en-tête HSTS n’a pas été observé sur les réponses du site public contrôlées.
- L’administration CMS répond en HTTPS ; `/_health` répond 204 et l’administration émet HSTS `max-age=31536000; includeSubDomains`.
- Le prévol CMS autorise `https://agropulsegs.org` (204 avec `Access-Control-Allow-Origin`) et ne renvoie pas d’en-tête d’autorisation pour `https://www.agropulsegs.org`. Des avertissements `postMessage` liés aux variantes d’origine ont été observés précédemment. Le code CMS poussé n’accepte maintenant que l’origine configurée ; le déploiement est marqué terminé dans hPanel, mais le parcours d’aperçu doit encore être confirmé dans l’éditeur.
- Avant d’activer HSTS ou `includeSubDomains` pour le site, vérifier tous les sous-domaines. Ne pas élargir les origines CORS.
- Les routes privées de demandes ne doivent pas être rendues publiques pour résoudre un 404 de test : vérifier le véritable parcours POST et conserver les contrôles d’authentification.
- Un ancien token Strapi à accès étendu est mentionné dans les rapports d’exploitation. Son usage n’a pas été audité ici ; ne pas le révoquer avant d’avoir identifié ses consommateurs et préparé un remplacement.

## Formulaires, Resend et Gmail

Le rapport de reprise du 12 novembre documente deux notifications de test marquées **Delivered** par Resend (formulaires Contact et Ressources), ainsi que des soumissions de test conservées dans Strapi. `Delivered` atteste la remise au serveur destinataire, pas la lecture ni le classement dans Gmail.

Aucun nouvel envoi réel, contrôle de boîte Gmail, examen des journaux Hostinger ou contrôle de configuration Resend n’a été effectué pendant cette vérification. Il n’est donc pas possible de certifier l’état actuel de ces services ni l’arrivée des messages dans la boîte de réception. Ne pas afficher ni copier de secret dans le rapport ou le chat.

## Actions nécessaires pour clôturer

1. Demander à Hostinger comment appliquer une redirection de l’hôte `www` pour tous les chemins servis par le CDN, y compris les pages `.html`, et diagnostiquer le 503 sur `/healthz`. Ne pas désactiver le CDN sans décision explicite. Recontrôler ensuite les réponses 308 et la référence cache.
2. Dans l’administration CMS déployée sur `660afcb`, vérifier le parcours de l’aperçu et l’absence de messages vers l’alias `www`, sans modifier ni publier de contenu.
3. Vérifier les sous-domaines avant toute politique HSTS côté site.
4. Depuis les vrais formulaires publics, tester Contact, Ressources et les autres parcours actifs avec des données explicitement fictives ; confirmer l’enregistrement Strapi et l’état de notification sans laisser de demandes de test confondues avec de vraies demandes.
5. Dans Resend, vérifier la configuration et le statut des essais ; dans Gmail, confirmer la réception et le classement. Les preuves historiques `Delivered` ne remplacent pas ces contrôles.
6. Dans l’administration CMS, confirmer les pages et langues qui doivent être gérées, publier uniquement les contenus approuvés par le propriétaire, puis vérifier leur lecture publique. Les réponses `reference` ne prouvent pas une publication CMS.
7. Contrôler les sauvegardes et une procédure de restauration ; auditer les utilisateurs, rôles et l’ancien token à accès étendu avant tout retrait.

À ce stade, aucune modification DNS, révocation de token, publication de contenu ou suppression locale n’a été effectuée. Le cache du site a été purgé dans hPanel ; aucune autre configuration Hostinger n’a été changée.
