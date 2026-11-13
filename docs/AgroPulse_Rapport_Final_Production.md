# AgroPulse — rapport de vérification production

## Résumé

Le périmètre de cette vérification est la finalisation technique d’AgroPulse : HTTPS, sécurité, formulaires, CMS et tests. Les maquettes approuvées, leurs images, leur présentation et le contenu visible n’ont pas été refaits.

Les tests locaux sont verts et les essais de brouillon CMS effectués précédemment ont été restaurés sans publication. L’utilisateur a choisi `https://agropulsegs.org` comme domaine canonique ; le code correspondant est poussé, mais la redirection n’est pas uniforme en production : des routes racine/API redirigent en 308, tandis que des pages statiques `.html` sous `www` répondent encore 200. La référence cache publique reste également ancienne. Les contenus CMS publiés sont incomplets selon les réponses observées, et les consoles Hostinger, Resend et Gmail n’étaient pas disponibles.

**Conclusion : le site est vérifié en partie, mais la fin de production n’est pas certifiée.**

## État du dépôt et changements

Au contrôle du 13 novembre, `main`, `origin/main` et `HEAD` pointaient tous vers `9962f5733c5dfe4c1f1277954f25163dc1926e60` (`9962f57`). Ce commit était présent sur GitHub.

Les correctifs fonctionnels poussés sont :

- `0c63cfe` — journalise les échecs HTTP et réseau de mise à jour de l’historique d’envoi, sans consigner de détails privés, avec des tests associés.
- `4a91465` — renouvelle la référence de cache du script d’aperçu dans `public/index.html`. Ce changement ne modifie ni les textes visibles, ni les styles, ni les images ou leur disposition.
- `5201f0f` — redirige l’hôte exact `www.agropulsegs.org` vers `https://agropulsegs.org` avec un 308, en conservant chemin et paramètres ; l’aperçu CMS n’envoie et n’accepte désormais les messages que depuis l’origine configurée, sans essayer l’alias `www`.

Le rapport de production a été poussé dans `f6efa5f`.

`public/style-policy.js` est encore indiqué comme modifié par Git dans l’arbre de travail, mais `git diff` ne montre aucun changement de contenu. Il a été laissé intact.

### Déploiement Hostinger

Le HTML public, même avec une requête anti-cache, sert encore l’ancienne référence `editorial-client.js?v=f74b72f10361`, au lieu de la référence attendue `4a22630ce00a`. `https://www.agropulsegs.org/` et certaines routes app/API répondent maintenant 308 vers l’apex, mais `https://www.agropulsegs.org/contact.html` et `/yida-cashew.html` répondent encore 200. Les réponses indiquent `Server: hcdn` ; les pages `.html` semblent servies par une couche statique qui ne passe pas par la redirection du serveur Node. La règle CDN/Hostinger doit donc couvrir ces chemins aussi. Le build CMS local incluant la restriction de l’aperçu a réussi, mais le contenu de l’éditeur actuellement déployé n’a pas pu être confirmé. L’accès aux journaux et aux écrans Hostinger n’était pas disponible ; aucun réglage manuel n’a été effectué.

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
- Le domaine canonique choisi est `agropulsegs.org`. La racine `www` et les routes `/healthz` et `/api/...` contrôlées redirigent en 308, mais les URL de pages statiques `.html` répondent toujours 200 sous `www` : la canonicalisation de tout le site n’est pas achevée.
- L’en-tête HSTS n’a pas été observé sur les réponses du site public contrôlées.
- L’administration CMS répond en HTTPS ; `/_health` répond 204 et l’administration émet HSTS `max-age=31536000; includeSubDomains`.
- Le prévol CMS autorise `https://agropulsegs.org` (204 avec `Access-Control-Allow-Origin`) et ne renvoie pas d’en-tête d’autorisation pour `https://www.agropulsegs.org`. Des avertissements `postMessage` liés aux variantes d’origine ont été observés précédemment. Le code CMS poussé n’accepte maintenant que l’origine configurée ; confirmer son activation dans l’éditeur après déploiement.
- Avant d’activer HSTS ou `includeSubDomains` pour le site, vérifier tous les sous-domaines. Ne pas élargir les origines CORS.
- Les routes privées de demandes ne doivent pas être rendues publiques pour résoudre un 404 de test : vérifier le véritable parcours POST et conserver les contrôles d’authentification.
- Un ancien token Strapi à accès étendu est mentionné dans les rapports d’exploitation. Son usage n’a pas été audité ici ; ne pas le révoquer avant d’avoir identifié ses consommateurs et préparé un remplacement.

## Formulaires, Resend et Gmail

Le rapport de reprise du 12 novembre documente deux notifications de test marquées **Delivered** par Resend (formulaires Contact et Ressources), ainsi que des soumissions de test conservées dans Strapi. `Delivered` atteste la remise au serveur destinataire, pas la lecture ni le classement dans Gmail.

Aucun nouvel envoi réel, contrôle de boîte Gmail, examen des journaux Hostinger ou contrôle de configuration Resend n’a été effectué pendant cette vérification. Il n’est donc pas possible de certifier l’état actuel de ces services ni l’arrivée des messages dans la boîte de réception. Ne pas afficher ni copier de secret dans le rapport ou le chat.

## Actions nécessaires pour clôturer

1. Dans Hostinger, régler la redirection CDN de `www` pour couvrir tous les chemins, y compris les pages `.html`, puis confirmer le déploiement du site. Vérifier que chaque page testée redirige en 308 et que le HTML sert la nouvelle référence cache.
2. Reconstruire/redéployer l’administration CMS avec `VITE_AGROPULSE_SITE_URL=https://agropulsegs.org`, puis vérifier le parcours de l’aperçu et l’absence de messages vers l’alias.
3. Vérifier les sous-domaines avant toute politique HSTS côté site.
4. Depuis les vrais formulaires publics, tester Contact, Ressources et les autres parcours actifs avec des données explicitement fictives ; confirmer l’enregistrement Strapi et l’état de notification sans laisser de demandes de test confondues avec de vraies demandes.
5. Dans Resend, vérifier la configuration et le statut des essais ; dans Gmail, confirmer la réception et le classement. Les preuves historiques `Delivered` ne remplacent pas ces contrôles.
6. Dans l’administration CMS, confirmer les pages et langues qui doivent être gérées, publier uniquement les contenus approuvés par le propriétaire, puis vérifier leur lecture publique. Les réponses `reference` ne prouvent pas une publication CMS.
7. Contrôler les sauvegardes et une procédure de restauration ; auditer les utilisateurs, rôles et l’ancien token à accès étendu avant tout retrait.

À ce stade, aucune modification DNS, révocation de token, publication de contenu, suppression locale ou intervention manuelle Hostinger n’a été effectuée.
