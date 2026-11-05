# Modifier le site AgroPulse

Le menu **Pilotage visuel** est l’entrée recommandée. Le CMS conserve ses formulaires classiques dans **Contenus** pour les réglages complémentaires.

1. Choisir une page, puis **Français** ou **English**. Les deux versions sont indépendantes ; aucune traduction automatique n’est publiée.
2. Si la page n’existe pas encore dans le CMS, cliquer sur **Créer le brouillon**. Le contenu du site sert de point de départ. Cette action ne publie rien.
3. Cliquer sur **Modifier** dans une section ou une carte de l’aperçu. Modifier son titre et sa description dans la colonne de gauche.
4. Prendre la poignée pour déplacer un bloc ou une carte. Les boutons fléchés et les touches directionnelles permettent la même opération au clavier. Les cartes restent dans leur grille : une carte peut changer de place à gauche, à droite, plus haut ou plus bas, dans sa section. Les sections peuvent changer d’ordre dans la page. Il ne s’agit pas de positions absolues au pixel.
5. Vérifier **Vue mobile**, puis **Enregistrer le brouillon**. Les visiteurs voient toujours la dernière version publiée.
6. Ouvrir **la fiche et la publication**. Le rôle **AgroPulse Publieur** vérifie la langue et publie. Le rôle **AgroPulse Éditeur** ne peut pas publier.

**Rétablir la disposition** remet l’ordre original sans effacer les textes. Un avertissement protège les modifications non enregistrées lors d’un changement de page ou de langue.

Le design de référence, les images, les liens, les formulaires et le comportement mobile sont conservés. L’éditeur propose maintenant des réglages d’apparence et un champ CSS avancé limité aux composants de la page. Le HTML, les scripts et les imports externes restent exclus. Les sections et cartes obligatoires ne peuvent pas être supprimées par leur réorganisation. Les entrées du catalogue couvrent l’accueil, À propos, Contact, Expertises, les huit pôles, YIDA-Cashew, AGIR-IA, Partenaires, Ressources et les pages légales.

Les textes des sections et cartes sont administrables. Les médias, coordonnées globales du pied de page, options de formulaire et intitulés de navigation restent dans le code de la maquette ; ils ne sont pas tous configurables dans cet éditeur. Le nombre de cartes d’une grille reste défini par la maquette.

## Règles éditoriales

- Garder exactement **YIDA-Cashew** et **Initiatives**.
- Les candidatures YIDA-Cashew restent fermées. Le formulaire est une demande de renseignements.
- L’objectif de 500+ Fellows d’ici 2030 et les 50 Fellows envisagés pour la cohorte pilote sont des prévisions, pas des résultats obtenus.
- La revue YIDA-Cashew est une source interne ; ne pas l’ajouter aux ressources téléchargeables.
- Une organisation citée dans l’histoire n’est pas automatiquement un partenaire confirmé.
- Ne pas publier d’identité juridique, coordonnées, calendrier ou résultat non validé.

## Si l’aperçu ne s’affiche pas

Faire vérifier l’adresse publique du site configurée à la construction du CMS et l’origine du CMS configurée côté serveur du site. L’aperçu n’accepte les messages que de ces origines autorisées. Aucun jeton de lecture n’est transmis dans l’aperçu. Le serveur du site doit fonctionner, même si le catalogue de pages existe déjà dans le CMS.

## Apparence et CSS avancé

Dans la colonne de gauche, ouvrir **Apparence de la page**, juste sous le titre du panneau. Les menus permettent de choisir l’arrondi, l’espacement et l’ombre des cartes. Les sélecteurs de couleur règlent les titres, le fond et la bordure. Une valeur d’origine conserve le design approuvé. Ces choix concernent la page et la langue sélectionnées.

Ouvrir **CSS avancé** pour écrire des règles ciblant .agp-card, .agp-card-grid, .agp-section, .agp-page-title, .agp-section-title ou .agp-intro. Exemple :

.agp-card { border-radius: 24px; border: 1px solid #28752c; }

Les descendants h2, h3, p, img et a sont possibles, ainsi qu’un préfixe de section tel que #sec-faire .agp-card. Les règles @media (max-width: 768px) et min-width sont acceptées entre 320 et 1920 px. Le champ est limité à 10 000 caractères. Il accepte notamment les couleurs, bordures, espacements et propriétés typographiques ; ce n’est pas une feuille CSS générale sans restrictions.

Les imports, URL, HTML, sélecteurs globaux, attributs, !important, positionnement et propriétés non autorisées sont refusés. Un message indique l’erreur et l’enregistrement est désactivé jusqu’à sa correction. La même validation est appliquée côté serveur, y compris lors d’un appel direct à l’API.

Le résultat apparaît dans l’aperçu après une courte actualisation différée. Vérifier la vue mobile et les contrastes, puis **Enregistrer le brouillon** ; le site conserve son apparence publiée tant que le Publieur n’a pas publié. **Rétablir l’apparence d’origine** efface les styles du brouillon sans toucher aux textes ni à l’ordre des cartes. Enregistrer, puis publier cette restauration pour l’appliquer aux visiteurs.

Cliquer sur une section dans la liste de gauche fait maintenant défiler l’aperçu vers cette section, pour retrouver les cartes sans chercher sous le haut de page.
