# AgroPulse Global Solutions

Site institutionnel bilingue français–anglais construit à partir de la maquette approuvée `AgroPulse_Maquette_Images_Integrees_Directement.html`. Sa palette, ses styles, ses composants, ses images et sa disposition servent de référence visuelle ; les contenus validés et les formulaires sont intégrés dans cette structure.

## Lancer le site

Node.js 20 ou supérieur, sans installation de dépendances :

```sh
npm run build
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. Lancer `npm run start` sur un hébergement Node.js. Vérifications : `npm run check`.

`npm run build` met à jour les contenus de la maquette approuvée et les pages HTML conservées pour compatibilité. La maquette est l’interface unique ; les anciennes URL de programmes et d’expertises redirigent vers les sections correspondantes. Le serveur requiert Node.js 20 ou supérieur et doit être démarré avec `npm run start`.

## QR code et statistiques agrégées

`index.html` est la page prospectus publiée sur GitHub Pages; `public/acces.html` est sa version destinée au domaine AgroPulse. Les fichiers imprimables sont `public/assets/agropulse-access-qr.png` (PNG haute résolution) et `public/assets/agropulse-access-qr.svg` (vectoriel), et le QR mène à `https://abdoul675.github.io/AgroPulsegs.org/`. La page présente les activités d’AgroPulse, les expertises, YIDA-Cashew et AGIR-IA, les liens de contact et les réseaux. Le flyer fourni est disponible dans `public/assets/yida-cashew-flyer.pdf`. Les canaux YIDA-Cashew ajoutés sont Facebook, LinkedIn et WhatsApp. Pour régénérer le QR après une modification de destination : installer les dépendances de développement avec `npm install`, puis lancer `npm run qr:generate`. Le QR intègre l’emblème AgroPulse au centre.

Le suivi de première partie ne stocke que des compteurs agrégés par jour, page et source, ainsi que le total des clics vers chaque réseau social depuis le site. Il ne crée ni identifiant visiteur, ni cookie, ni parcours individuel; il ne compte donc pas les personnes uniques. Le tableau de bord est `https://agropulsegs.org/statistiques.html` et requiert `AGROPULSE_ANALYTICS_ADMIN_TOKEN` (secret aléatoire d’au moins 32 caractères, côté serveur uniquement; génération possible avec `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). Les événements sont enregistrés dans `var/analytics.json` ou dans le chemin persistant indiqué par `AGROPULSE_ANALYTICS_FILE`; le dossier `var/` est ignoré par Git. Le stockage JSON convient à une seule instance Node; plusieurs instances nécessiteraient un stockage partagé transactionnel. Les liens vers AgroPulse publiés sur les réseaux peuvent utiliser `?utm_source=facebook`, `?utm_source=x`, `?utm_source=tiktok` ou `?utm_source=youtube` pour distinguer leur provenance. Les plateformes sociales ne transmettent pas les parcours de leurs utilisateurs à ce tableau.

Avant activation en production : définir le chemin de stockage persistant, la durée de conservation et les règles de sauvegarde/suppression; vérifier les journaux du fournisseur d’hébergement; faire valider la politique de confidentialité et protéger l’accès au tableau de bord sur HTTPS. Les statistiques de pages vues ne sont pas une mesure certifiée des personnes uniques.


## QR YIDA-Cashew

Le QR dédié YIDA-Cashew est disponible en PNG et SVG dans `public/assets/yida-cashew-qr.*`. Il ouvre `yida-cashew.html`, une page avec les liens WhatsApp, Facebook, LinkedIn, l’accès Fellowship et le prospectus PDF. Le lien Fellowship est présenté comme « Page complète YIDA-Cashew ». Pour régénérer les fichiers après un changement de destination, lancer `npm run qr:yida:generate`.

## Périmètre actuel

La maquette intégrée couvre l’accueil, À propos, les huit expertises, YIDA-Cashew, AGIR-IA, Contact, Partenaires et Ressources. Les candidatures YIDA-Cashew sont fermées ; les dates et critères restent à confirmer. La Fondation AWI est présentée comme partenaire confirmé d’AGIR-IA ; les détails des sessions ne sont pas annoncés. YIDA-Cashew est un programme présenté directement sur sa page ; la revue sert de source interne et n’est pas proposée au téléchargement.

Les demandes de contact, partenariat, formation/programme, devis et intérêt pour les ressources sont transmises à l’API du serveur, qui les envoie par Resend. Une demande d’information sur les ressources n’inscrit pas automatiquement à une liste de diffusion. Configurer `AGROPULSE_RECIPIENT_EMAIL`, `EMAIL_FROM` (adresse d’envoi vérifiée par Resend) et `RESEND_API_KEY` dans l’environnement de déploiement ; `.env.example` ne contient que des valeurs vides et le serveur ne charge pas automatiquement les fichiers `.env`. Sans ces réglages, l’API indique que l’envoi n’est pas configuré. L’adresse officielle destinataire reste à confirmer.

## Organisation

- `public/` : page de la maquette intégrée et fichiers d’images associés.
- `scripts/` : serveur Node.js, API de contact et vérifications.
- `docs/` : document source, cahier des charges et chronogramme de trois semaines.

Les textes et traductions restent à valider par Mme Hélène Nichy. Ne pas ajouter de secrets ou de données de candidature au dépôt. Le déploiement doit prendre en charge le serveur Node.js, car l’envoi des formulaires ne fonctionne pas sur un hébergement statique seul.

## Contenu d’accueil dans Strapi

Le site public reste la maquette servie par `scripts/serve.mjs` ; le pilote Next.js de `pilot/web/` ne la remplace pas. La page d’accueil peut lire dans Strapi le titre principal et son introduction, en français et en anglais. Chaque langue doit être saisie et publiée séparément ; aucune traduction automatique n’est faite. La structure, les images, les boutons et les autres interactions restent ceux de la maquette. Sans réglages CMS, le texte de référence validé reste affiché.

Pour activer la lecture, configurer `AGROPULSE_CMS_URL`, `AGROPULSE_CMS_HOME_DOCUMENT_ID` et `AGROPULSE_CMS_READ_TOKEN` dans l’environnement du serveur. L’adresse de Strapi et l’identifiant du document d’accueil restent à fournir ; utiliser un jeton Strapi de lecture seule. La route `/api/home-content` ne lit que les versions publiées et ne renvoie au navigateur que le titre et l’introduction du hero. Le jeton ne quitte jamais le serveur. Les brouillons restent privés ; seul le rôle Publieur peut publier depuis l’administration Strapi.

`.env.example` documente les noms de réglages sans valeurs ni secrets. Le serveur ne charge pas automatiquement les fichiers `.env`. Les vérifications locales de ce raccordement doivent utiliser uniquement l’instance isolée du pilote dans [`pilot/`](pilot/README.md) et ses contenus fictifs ; elles ne publient aucun contenu sur le site institutionnel.

Le pilote local vérifie également les rôles, les brouillons, la publication et la prévisualisation. Il ne remplace pas le site maquette. Consulter le [compte rendu du pilote](docs/AgroPulse_Pilote_technique_v1.0.md) et le [lot d’administration des contenus](docs/AgroPulse_Administration_contenus_v1.0.md) pour ses autres capacités et limites.

## Informations sur les programmes

La page YIDA-Cashew présente le programme, sa genèse, ses objectifs, ses publics et le parcours prévu. Les candidatures restent fermées ; le formulaire sert uniquement à demander des renseignements. La revue source reste interne et son ancienne URL de téléchargement répond 404. Le catalogue public est vide.

Les huit pôles et leurs intitulés sont définis dans `scripts/editorial-content.mjs`, partagé par les générateurs. Le menu regroupe les programmes sous « Initiatives ». Le design et les URL de navigation sont conservés.

## Pilotage visuel et livraison du 4 novembre 2026

Le CMS propose maintenant un aperçu avec déplacement des sections et cartes, saisie des textes FR/EN et enregistrement privé en brouillon. La publication reste native et réservée au rôle autorisé. Activer AGROPULSE_CMS_ENABLE_PAGES=true, configurer AGROPULSE_CMS_URL et le jeton serveur AGROPULSE_CMS_READ_TOKEN ; le nouvel accès trouve chaque page par identité métier, sans identifiant local. Configurer aussi AGROPULSE_CMS_ADMIN_ORIGIN côté site et VITE_AGROPULSE_SITE_URL à la construction du CMS. Le raccordement historique limité au hero reste compatible.

- [Guide du pilotage](docs/AgroPulse_Guide_pilotage_visuel.md).
- [Configuration, lancement, sauvegarde et restauration](docs/AgroPulse_Exploitation_2026-11-04.md).
- [Alertes CMS restantes](docs/AgroPulse_Securite_CMS_2026-11-04.md).
- [Choix de conception](docs/decisions/ADR-2026-11-04-pilotage-visuel.md).
- [Vérifications et limites de cette reprise](docs/validation/Reprise-Codex-2026-11-04.md).

La liste à faire compléter avant mise en ligne est disponible dans [les informations à fournir](docs/Mise-en-ligne-elements-a-fournir.md). Le contrôle complémentaire des frontières de sécurité du CMS se lance avec `npm run check:cms-security`, après installation des dépendances CMS.

La [vérification indépendante du CMS](docs/validation/Preparation-mise-en-ligne-2026-11-04.md) confirme désormais installation, compilation et démarrage sans importer les données du pilote. La mise en ligne attend l’identification de l’hébergement et les informations officielles.

## Compléments du 5 novembre 2026

Le pilotage comporte des réglages d’apparence et un CSS avancé limité aux composants de chaque page, avec brouillon/publication et restauration du design initial. Voir le [guide](docs/AgroPulse_Guide_pilotage_visuel.md), le [rapport de sécurité local](security_best_practices_report.md) et la [proposition d’hébergement](docs/Proposition-hebergement-AgroPulse-2026-11-04.md). La cible de déploiement reste vendredi 6 novembre, sous réserve de validation de l’offre, du domaine et des accès.
