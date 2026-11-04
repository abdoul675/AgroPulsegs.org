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

La maquette intégrée couvre l’accueil, À propos, les six expertises, YIDA-Cashew, AGIR-IA, Contact, Partenaires et Ressources. Les candidatures YIDA-Cashew sont fermées ; les dates et critères restent à confirmer. La Fondation AWI est présentée comme partenaire confirmé d’AGIR-IA ; les détails des sessions ne sont pas annoncés. Les ressources téléchargeables ne sont pas encore disponibles.

Les demandes de contact, partenariat, formation/programme, devis et intérêt pour les ressources sont transmises à l’API du serveur, qui les envoie par Resend. Une demande d’information sur les ressources n’inscrit pas automatiquement à une liste de diffusion. Configurer `AGROPULSE_RECIPIENT_EMAIL`, `EMAIL_FROM` (adresse d’envoi vérifiée par Resend) et `RESEND_API_KEY` dans l’environnement de déploiement ; `.env.example` ne contient que des valeurs vides et le serveur ne charge pas automatiquement les fichiers `.env`. Sans ces réglages, l’API indique que l’envoi n’est pas configuré. L’adresse officielle destinataire reste à confirmer.

## Organisation

- `public/` : page de la maquette intégrée et fichiers d’images associés.
- `scripts/` : serveur Node.js, API de contact et vérifications.
- `docs/` : document source, cahier des charges et chronogramme de trois semaines.

Les textes et traductions restent à valider par Mme Hélène Nichy. Ne pas ajouter de secrets ou de données de candidature au dépôt. Le déploiement doit prendre en charge le serveur Node.js, car l’envoi des formulaires ne fonctionne pas sur un hébergement statique seul.

## Pilote CMS local

Un essai isolé dans [`pilot/`](pilot/README.md) vérifie une expertise fictive FR/EN, les trois rôles administratifs, les brouillons, la publication et la prévisualisation. Il ne remplace pas le site statique décrit ci-dessus. Consulter le [compte rendu du pilote](docs/AgroPulse_Pilote_technique_v1.0.md) pour les 77 assertions techniques réussies et les scénarios restant à couvrir. Aucun formulaire ni déploiement de production n’est activé par cet essai.

Le [lot d’administration des contenus](docs/AgroPulse_Administration_contenus_v1.0.md) décrit un pilote distinct ; il ne remplace pas le site déployable décrit ci-dessus.
