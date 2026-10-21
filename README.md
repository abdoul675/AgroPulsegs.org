# AgroPulse Global Solutions

Première interface du site institutionnel français–anglais. Le design est provisoire : les maquettes Google Stitch retenues serviront de référence pour l’interface finale.

## Lancer le site

Node.js 20 ou supérieur, sans installation de dépendances :

```sh
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. Vérifications : `npm run check`.

## Périmètre actuel

Accueil, présentation, six expertises avec leurs détails, Fellowship et AGIR-IA distincts, navigation mobile, changement FR/EN et préparation locale d’une demande. Le logo v2 est une proposition générée à partir du logo du document fourni ; son choix définitif reste à confirmer. L’original est conservé dans `public/assets/logo.jpeg`. Le paysage SVG est une illustration, pas une photographie de projet.

Aucun formulaire n’est transmis. Aucun CMS, collecte de candidature, newsletter, outil de suivi ou téléchargement de brochure n’est actif. Les coordonnées, services d’envoi et ressources doivent être validés avant raccordement. Le site n’est pas encore une version de production.

## Organisation

- `public/` : fichiers du site, directement déployables sur un hébergement statique.
- `scripts/` : serveur de développement et vérifications de cohérence.
- `docs/` : document source, cahier des charges et chronogramme de trois semaines.

Les textes et traductions restent à valider par Mme Hélène Nichy. Ne pas ajouter de secrets ou de données de candidature au dépôt. Le serveur local est réservé au développement.
