# Intégration des illustrations Stitch — 5 novembre 2026

Le porteur fournit stitch_agropulse_visual_assets_collection.zip et demande d’essayer les images sur le site. Les 58 images de l’archive ont été inventoriées et examinées sur quatre planches. Plusieurs étaient déjà présentes dans les fichiers de maquette, mais des substitutions anciennes ou des associations génériques empêchaient leur affichage à l’emplacement attendu.

## Intégration

55 illustrations sont préparées dans public/assets/stitch : WebP qualité 80, dimension maximale 1280 px, proportions conservées et aucune retouche de la scène. Elles totalisent 6 997 130 octets, contre 96 499 491 octets pour les PNG sélectionnés. Le ZIP original reste intact et hors du commit. La provenance, les empreintes et les dimensions sont dans [le manifeste](../assets/stitch-visual-assets-2026-11-05.json).

scripts/visual-assets.mjs associe les images aux pages et sections : huit pôles, cartes d’accueil et d’Expertises, À propos, YIDA-Cashew, AGIR-IA, Partenaires, Ressources et Contact. Les visuels des pôles sont maintenant choisis par sujet : centre de formation, systèmes d’information, analyse IA, climat, incubation, études, experts et mécanisation. Le fond d’accueil utilise le paysage agricole connecté fourni. La mise en page, les contenus et les dernières retouches de texte sont conservés.

Les portraits collectifs de dirigeants, la signature institutionnelle avec logos et la scène présentée comme bureaux ne sont pas sélectionnés pour représenter des identités ou implantations réelles. Les noms confirmés de l’équipe restent accompagnés d’une scène générique de terrain, sans portrait individuel inventé. Les images sont des illustrations ; elles ne sont pas des preuves de formations réalisées, de locaux, de partenariats ou de résultats.

## Vérifications exécutées

- Génération de la maquette, contrôles des contenus et 30 tests du site réussis.
- Toutes les références d’images maquette et Stitch du HTML sont contrôlées, sans suppression des vérifications existantes.
- 32 parcours de page et format : 16 pages en français à 1440 px et en anglais à 375 px. Les fonds principaux utilisent la collection fournie ; aucune image manquante, réponse image en erreur, erreur JavaScript ou largeur dépassée observée. Les huit cartes sont conservées sur Accueil et Expertises.
- Captures examinées pour les fonds d’accueil, Formation et Mécanisation sur ordinateur et Formation sur mobile. Les polices externes sont bloquées et les images sont chargées immédiatement pour cette vérification ; il ne s’agit pas d’une mesure de performance réseau ni d’un audit exhaustif de cadrage.

Les pages légales, les droits d’édition et la publication ne changent pas. Les documents préexistants et les données locales du pilote restent hors du lot.