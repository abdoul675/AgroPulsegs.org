# AgroPulse Global Solutions

Site institutionnel français–anglais conservant le modèle de la page d’accueil d’origine : mêmes styles, polices, palette, sections, cartes et boutons. Les changements de contenu portent sur les textes et les images. Les pages internes reprennent les composants de cet accueil.

## Lancer le site

Node.js 20 ou supérieur, sans installation de dépendances :

```sh
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. Vérifications : `npm run check`.

`npm run build` régénère les pages internes statiques depuis `scripts/build-pages.mjs`, le header, le contact et le footer de l’accueil, et les contenus métier bilingues de `public/app.js`. Après modification des éléments partagés, relancer cette commande. Les pages générées sont livrées dans `public/` : aucun build n’est nécessaire sur l’hébergement.

## Périmètre actuel

14 URL HTML : accueil, à propos, catalogue des expertises, six pages d’expertise, programmes, Fellowship, AGIR-IA, contact et ancienne URL `fellowship-concept.html` conservée comme alias du Fellowship. Navigation mobile, changement FR/EN conservé entre pages et préparation locale d’une demande. Les descriptions complètes des services sont accessibles dans les blocs dépliables. Les seuls indicateurs de programme proviennent du contenu existant (2 à 3 mois, 20 femmes, 26 septembre 2026).

Le logo v2 reste une proposition à confirmer ; l’original est conservé dans `public/assets/logo.jpeg`. Les neuf nouveaux visuels sont des scènes fictives créées avec l’outil intégré imagegen, signalées comme illustrations, et optimisées en WebP (environ 100 à 440 Ko). Ils ne prouvent aucune réalisation ni aucun partenariat. Leurs prompts et fichiers sont consignés dans `docs/visuels-generation.json`. Le SVG d’origine reste disponible. Les polices initiales sont conservées.

Les feuilles d’origine `public/styles.css` et `public/refinements.css` restent inchangées. `public/content-media.css` ajuste uniquement les images de remplacement et les contenus internes aux composants existants. Les nouvelles variantes de mise en page ont été retirées. Les maquettes de travail restent dans `.work/stitch-source/` ; elles ne sont pas déployées et leurs fonctionnalités non raccordées ne sont pas présentées comme actives.

Aucun formulaire n’est transmis. Aucun CMS, collecte de candidature, newsletter, outil de suivi ou téléchargement de brochure n’est actif. Les coordonnées, services d’envoi et ressources doivent être validés avant raccordement. Le site n’est pas encore une version de production.

## Organisation

- `public/` : fichiers du site, directement déployables sur un hébergement statique.
- `scripts/` : serveur de développement et vérifications de cohérence.
- `docs/` : document source, cahier des charges et chronogramme de trois semaines.

Les textes et traductions restent à valider par Mme Hélène Nichy. Ne pas ajouter de secrets ou de données de candidature au dépôt. Le serveur local est réservé au développement.

## Pilote CMS local

Un essai isolé dans [`pilot/`](pilot/README.md) vérifie une expertise fictive FR/EN, les trois rôles administratifs, les brouillons, la publication et la prévisualisation. Il ne remplace pas le site statique décrit ci-dessus. Consulter le [compte rendu du pilote](docs/AgroPulse_Pilote_technique_v1.0.md) pour les 77 assertions techniques réussies et les scénarios restant à couvrir. Aucun formulaire ni déploiement de production n’est activé par cet essai.

Le [lot d’administration des contenus](docs/AgroPulse_Administration_contenus_v1.0.md) ajoute les six modèles complémentaires et leurs règles. Les pages et programmes fictifs se publient en FR/EN ; les candidatures et imports de médias restent désactivés. Les maquettes demeurent la référence pour la prochaine intégration visuelle.
