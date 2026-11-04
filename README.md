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
