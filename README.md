# AgroPulse Global Solutions

Site institutionnel français–anglais conservant le modèle de la page d’accueil d’origine : mêmes styles, polices, palette, sections, cartes et boutons. Les changements de contenu portent sur les textes et les images. Les pages internes reprennent les composants de cet accueil.

## Lancer le site

Node.js 20 ou supérieur, sans installation de dépendances :

```sh
npm run build
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. Lancer `npm run start` sur un hébergement Node.js. Vérifications : `npm run check`.

`npm run build` met à jour les pages bilingues ainsi que les contenus de la maquette approuvée. La page d’accueil et les pages prioritaires utilisent le fichier de maquette comme interface unique ; les URL historiques redirigent vers les sections correspondantes.

## Périmètre actuel

14 URL HTML : accueil, à propos, catalogue des expertises, six pages d’expertise, programmes, Fellowship, AGIR-IA, contact et ancienne URL `fellowship-concept.html` conservée comme alias du Fellowship. Navigation mobile, changement FR/EN conservé entre pages et préparation locale d’une demande. Les descriptions complètes des services sont accessibles dans les blocs dépliables. Les seuls indicateurs de programme proviennent du contenu existant (2 à 3 mois, 20 femmes, 26 septembre 2026).

Le logo v2 reste une proposition à confirmer ; l’original est conservé dans `public/assets/logo.jpeg`. Les neuf nouveaux visuels sont des scènes fictives créées avec l’outil intégré imagegen, signalées comme illustrations, et optimisées en WebP (environ 100 à 440 Ko). Ils ne prouvent aucune réalisation ni aucun partenariat. Leurs prompts et fichiers sont consignés dans `docs/visuels-generation.json`. Le SVG d’origine reste disponible. Les polices initiales sont conservées.

Les feuilles d’origine `public/styles.css` et `public/refinements.css` restent inchangées. `public/content-media.css` ajuste uniquement les images de remplacement et les contenus internes aux composants existants. Les nouvelles variantes de mise en page ont été retirées. Les maquettes de travail restent dans `.work/stitch-source/` ; elles ne sont pas déployées et leurs fonctionnalités non raccordées ne sont pas présentées comme actives.

Les formulaires de contact, d’intérêt pour YIDA-Cashew/AGIR-IA et de devis transmettent les demandes à l’API du serveur, qui les envoie par Resend. Configurer `AGROPULSE_RECIPIENT_EMAIL`, `EMAIL_FROM` (adresse d’envoi vérifiée par Resend) et `RESEND_API_KEY` dans l’environnement de déploiement ; `.env.example` ne contient que des valeurs vides et le serveur ne charge pas automatiquement les fichiers `.env`. Sans ces réglages, l’API répond que l’envoi n’est pas configuré. L’adresse officielle destinataire reste à confirmer.

## Organisation

- `public/` : fichiers front-end du site et visuels exportés à l’identique depuis la maquette.
- `scripts/` : serveur Node.js, API de contact et vérifications.
- `docs/` : document source, cahier des charges et chronogramme de trois semaines.

Les textes et traductions restent à valider par Mme Hélène Nichy. Ne pas ajouter de secrets ou de données de candidature au dépôt. Le déploiement doit prendre en charge le serveur Node.js, car l’envoi des formulaires ne fonctionne pas sur un hébergement statique seul.

## Pilote CMS local

Un essai isolé dans [`pilot/`](pilot/README.md) vérifie une expertise fictive FR/EN, les trois rôles administratifs, les brouillons, la publication et la prévisualisation. Il ne remplace pas le site statique décrit ci-dessus. Consulter le [compte rendu du pilote](docs/AgroPulse_Pilote_technique_v1.0.md) pour les 77 assertions techniques réussies et les scénarios restant à couvrir. Aucun formulaire ni déploiement de production n’est activé par cet essai.

Le [lot d’administration des contenus](docs/AgroPulse_Administration_contenus_v1.0.md) ajoute les six modèles complémentaires et leurs règles. Les pages et programmes fictifs se publient en FR/EN ; les candidatures et imports de médias restent désactivés. Les maquettes demeurent la référence pour la prochaine intégration visuelle.
