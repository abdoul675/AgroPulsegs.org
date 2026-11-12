# Contexte AgroPulse

État au 26 octobre 2026. Lire cet état avec les demandes plus récentes du porteur.

## Sources et accords

- `docs/README.md` indexe les documents actuels.
- Le cahier des charges v0.5 porte F01 à F12, RF01 à RF12, AC01 à AC11 et les conditions CF01 à CF06. Le porteur a validé la proposition fonctionnelle dans la conversation ; les informations d’activation manquantes restent à fournir.
- Le cadrage L3 v1.0 consigne l’orientation Next.js, React, TypeScript, Strapi Community, PostgreSQL, Docker Compose et GitHub Actions. Express est conditionnel à une responsabilité spécifique.
- OVHcloud et Brevo sont les services proposés ; aucune souscription, capacité, localisation ou enveloppe définitive n’est engagée. Les 20 à 40 €/mois sont une estimation d’infrastructure, hors développement, maintenance humaine et autres postes explicités dans le cadrage.
- La personne de validation désignée par le porteur est **Mme Hélène Nichy**. Les mentions historiques d’un autre validateur ne prévalent pas. Ne pas fabriquer sa signature ou lui attribuer l’accord du porteur.
- Le modèle Strapi et les droits v1.0 constituent une proposition de conception, pas une instance CMS configurée ni un test exécuté.
- Son premier lot exécutable est maintenant dans `pilot/cms/src/` : expertise réduite du pilote et six modèles complémentaires. `docs/AgroPulse_Administration_contenus_v1.0.md` distingue les schémas et règles testés des fonctions encore suspendues. Le document de conception historique ne représente pas à lui seul l’état d’exécution.

## Produit

Site institutionnel français–anglais pour présenter AgroPulse et ses six pôles, programmes et ressources, puis recevoir des contacts et demandes de devis. Pays d’intervention indiqués : Côte d’Ivoire, Sénégal et Guinée-Bissau ; cela ne prouve pas l’existence de bureaux.

Fellowship et AGIR-IA restent distincts. La source indique une formation Fellowship de 2 à 3 mois ; sa durée totale et une éventuelle immersion de six mois restent à confirmer. Les candidatures sont fermées tant que calendrier et critères ne sont pas approuvés. AGIR-IA est décrit dans la source comme une formation du 26 septembre 2026 pour 20 femmes agripreneures ; toute nouvelle édition doit être confirmée séparément.

Seule Fondation AWI est indiquée comme partenaire confirmé. Aucun chiffre de résultat, nom de client, implantations, garantie d’emploi ou délai de réponse n’est déduit d’une maquette. Les illustrations ne sont pas des preuves de projets réels.

## Limites actuelles

Le cadrage technique et le modèle de contenu sont suivis d’un pilote local dans `pilot/`, réalisé le 26 octobre 2026. Strapi Community 5.59.0, PostgreSQL 17.10 portable et Next.js 16.4.3 fonctionnent sur une expertise fictive FR/EN. Trois suites finales totalisent 77 assertions réussies : droits administratifs, brouillons/publication, liens de preview, langues et parcours navigateur. Lire `docs/AgroPulse_Pilote_technique_v1.0.md` pour les preuves et limites. Les campagnes, relations et médias privés, formulaires, Docker et hébergement ne sont pas vérifiés par ce pilote.

Les fichiers de `public/` restent un aperçu statique existant ; les envois, candidatures et newsletter ne sont pas déclarés opérationnels. Plusieurs changements locaux du site proviennent d’autres travaux : les examiner avant toute modification ou commit et préserver les fichiers hors du périmètre demandé. Les fichiers du pilote ne sont pas encore commités ni poussés sur GitHub.

Après accord oral du porteur pour poursuivre, six modèles ont été ajoutés : paramètres, pages, programmes, campagnes, ressources et partenaires, avec onze composants. La suite finale des nouveaux modèles comporte 75 assertions réussies, dont publications FR/EN, partenaire non confirmé, identité immuable et créations concurrentes. Les preuves d’interface comportent 8 assertions réussies, avec `completed: true` ; le parcours initial a également été revérifié. L’Éditeur ne publie pas et ne modifie pas dates/état de campagne ou confirmation de partenaire. Le pilote conserve les médias fermés à l’import et les candidatures inactives ; la publication de ressources et des paramètres avec logo n’est pas finalisée.

Adaptations Strapi : type `site-setting` pour les paramètres ; `confirmationStatus` pour éviter le champ réservé `status` ; clé de partenaire en chaîne non localisée, car Strapi localise toujours les UID. Sauvegarde locale à froid réalisée avant migration, restauration non testée. Respecter la limitation native des connexions administratives lors des suites répétées, sans désactiver la protection.

La dernière archive `files.zip` revue contient deux aperçus HTML et un ZIP de site avec configuration Decap CMS. Cette configuration ne remplace pas le choix Strapi retenu pour le cadrage. Consulter l’archive effectivement fournie pour toute nouvelle revue ; le nom du fichier peut rester identique alors que son contenu change.

## Prochaine étape

Compléter le circuit des médias publics autorisés et ses métadonnées, puis les champs métier complets de l’expertise. Reprendre les scénarios MC non exécutés ou partiels avant la recette globale ; relier ensuite les blocs aux maquettes retenues et intégrer les éléments communs et l’accueil. Les maquettes restent la référence visuelle, comme rappelé au porteur pendant la conversation vocale. Préparer Docker, préproduction et restauration dans un lot distinct, avec les services et responsabilités confirmés. Les succès locaux ne valent pas validation client ni mise en production.

## Réunion et échéance — mise à jour du 27 octobre 2026

Le porteur demande une réunion de vingt minutes centrée sur la validation des maquettes. M. Dongo est le décideur annoncé pour cette réunion ; Mme Hélène Nichy sera absente. Cela ne modifie pas les validations historiques. Le support court est `AgroPulse_Reunion_technique_20_minutes_v1.0.html` ; les détails restent dans les annexes.

**Fin du projet prévue le 12 novembre 2026**, rappelée explicitement par le porteur. Fixer les dates intermédiaires, la recette et les contenus à fournir en fonction de cette échéance. La mise en ligne reste conditionnée aux vérifications, à l’hébergement et à l’accord de lancement ; aucun de ces accords n’est présumé.

Le CMS propose une saisie directe des pages (grand titre, introduction, texte principal), avec synchronisation vers les blocs existants. Les libellés personnalisés suivent désormais la langue du profil plutôt que de mélanger les deux langues. Le français est le choix initial ; l’anglais est disponible. La langue du contenu reste distincte et ne déclenche aucune traduction automatique. Les suites `simple-entry-tests.json` (13 assertions) et `editorial-ui-tests.json` (14 assertions) sont terminées avec succès. Le compte utilisé pour l’essai de langue a été remis en français.

Le porteur a demandé de pousser tout le travail du projet : cela inclut l’aperçu statique existant, le pilote et le dossier. Les secrets, accès locaux et sauvegardes restent exclus du dépôt. Les mentions précédentes « non commité » décrivent l’état antérieur ; vérifier Git pour l’état courant.

Planning hebdomadaire proposé dans le support de réunion : semaine 1 du 26 octobre au 1er novembre (validation, corrections, contenus et vérification du CMS) ; semaine 2 du 2 au 8 novembre (intégration et environnement de test) ; semaine 3 du 9 au 12 novembre (recette, corrections, formation et livraison). Ce découpage est une proposition à confirmer, sans accord client présumé ; l’échéance du 12 novembre est celle rappelée par le porteur.

## Validation et début d’intégration — 27 octobre 2026

Le porteur a demandé « considérons que c’est validé, donc continuons ». Cette décision autorise la poursuite de l’intégration à partir des dernières maquettes ; elle ne constitue pas une signature attribuée à M. Dongo ou à Mme Hélène Nichy. L’échéance du 12 novembre est conservée.

Lot commencé : éléments communs et accueil Next.js FR/EN, à partir de `files.zip / apercu-agropulse-accueil.html`. Les images embarquées sélectionnées sont extraites localement ; aucun script fourni par la maquette n’est exécuté. L’ancien aperçu `public/` est conservé. Les écrans du pilote d’expertise restent disponibles à leur adresse existante.

L’accueil utilise la référence visuelle par défaut. Le raccordement à un vrai document d’accueil publié est prévu par `CMS_HOME_DOCUMENT_ID` et `CMS_CONTENT_READ_TOKEN`, côté serveur. Ne pas y brancher automatiquement la page fictive des tests. Les sections interactives avancées de la maquette (globe, jeu, simulations) et les pages intérieures ne sont pas déclarées intégrées par ce premier lot. Contact et candidatures restent inactifs. Les tests du lot sont à consulter dans les preuves datées ; aucun résultat n’est présumé avant leur exécution.

Vérifications du premier lot d’accueil : construction Next.js réussie ; 25 assertions du parcours d’accueil (FR/EN, 375/768/1440 px, images, menu, ancres, clavier, langue inconnue et absence de secret) réussies avec `completed: true`. Les 27 assertions du parcours historique de lecture et preview sont également réussies. Les polices externes ont été bloquées pendant les captures d’accueil ; le rendu des polices de secours est vérifié, pas une équivalence visuelle au pixel. Le raccordement du contenu institutionnel réel, les pages intérieures, les médias et interactions avancées restent les étapes suivantes.

## Correction de fidélité à la maquette — 27 octobre 2026

Le porteur signale que l’accueil ne ressemble pas à la maquette. Le premier lot avait simplifié plusieurs sections sans autorisation suffisante. La composition complète de l’accueil fourni est rétablie dans Next.js : en-tête, bandeau, circuit, questions des six pôles, laboratoire Fellowship, jeu illustratif, AGIR-IA, galerie, globe des partenaires, carte et contact en deux colonnes, puis pied de page. Le logo superposé au hero reste retiré selon la dernière demande explicite ; l’icône d’onglet transparente est conservée.

Le gabarit HTML/CSS et les interactions proviennent de la source remise, revue et identifiée par son empreinte, avec images extraites localement. L’importeur n’exécute pas les scripts de la source. Les interactions livrées sont adaptées explicitement : pas de faux accusé de réception, pas de récupération du fichier de CMS embarqué, changement de langue par URL, pas de collecte de candidature, pas de certification délivrée par le jeu. Les données de programme incertaines restent signalées ; seuls les partenaires confirmés sont présentés et aucune implantation non confirmée n’est annoncée. Les liens de l’accueil pointent vers les sections correspondantes ; les pages intérieures distinctes restent à intégrer.

Le CMS peut toujours fournir le hero via un document publié explicitement configuré ; le reste de ce gabarit n’est pas encore administré intégralement depuis Strapi. La comparaison de styles calculés confirme en-tête, typographie du hero, colonnes du contact et pied de page à 1440 et 375 px, avec polices externes bloquées. Il ne s’agit pas d’une comparaison visuelle au pixel ni d’un audit d’accessibilité complet. Voir les preuves `home-reference-comparison.json` et `home-browser-tests.json`. Les résultats finaux datés font foi.

## Révision éditoriale demandée par le porteur — 27 octobre 2026

Le porteur juge les pages trop répétitives et demande moins d’informations, moins d’onglets à ouvrir et des polices plus simples. Il confirme que le contenu de l’accueil lui convient. Cette demande autorise une simplification des maquettes précédentes ; elle remplace l’exigence de reproduire leurs onglets à l’identique pour ce lot.

Révision appliquée : menu commun à cinq entrées (Accueil, À propos, Expertises, Programmes, Contacts), retrait de l’action de devis répétée dans l’en-tête, police Arial sans téléchargement externe. Les sections et les textes principaux de l’accueil sont conservés. À propos présente l’identité, trois rôles, les pays d’intervention et un accès au contact. La liste des expertises affiche six liens visibles ; chaque pôle présente trois services, son public et un accès au contact commun. Les onglets, carrousels, textes repliés, statistiques provisoires, galeries répétées, sous-menus et formulaires dupliqués sont retirés des pages intérieures.

Les huit pages sont rendues côté serveur en FR/EN. Leur contenu reste issu du gabarit éditorial ; il n’est pas encore intégralement administré par Strapi. Le prototype d’expertise et ses preuves historiques restent distincts. Les formulaires de l’accueil préparent seulement un brouillon et ne transmettent rien. L’échéance du 12 novembre est conservée.

Vérifications actuelles : construction Next.js et parcours de la version concise réussis (`pilot/evidence/concise-ui-tests.json`, `completed: true`). Navigation, langues, lisibilité mobile, absence de texte replié et conservation des sections de l’accueil ont été vérifiées. Les comparaisons avec la maquette initiale et les essais d’onglets appartiennent à la version antérieure, conservée comme historique ; ils ne décrivent pas cette nouvelle direction éditoriale.

## Direction actuelle : présentation simple inspirée de SMAG — 27 octobre 2026

À la demande explicite du porteur, la présentation évolue vers des sections courtes, des photographies et des informations directement visibles, en prenant https://smag.tech/ comme référence d’organisation visuelle. Cette demande remplace la conservation intégrale de l’ancien accueil mentionnée plus haut. La marque, les textes et les images restent ceux d’AgroPulse ; aucun témoignage ou profil de SMAG n’est repris.

L’accueil comporte les expertises, les programmes, une courte présentation et le contact. Le menu conserve cinq entrées et la police Arial. À propos présente l’identité de l’entreprise, sa mission et les compétences de l’équipe, sans répéter les six expertises. Les noms et fonctions des membres restent à fournir et à valider. Les huit pages intérieures existent en français et en anglais ; leurs informations ne nécessitent ni onglets ni textes à déplier. Le logo reste dans l’en-tête et le pied de page.

Les preuves actuelles sont `pilot/evidence/business-home-tests.json` et `pilot/evidence/concise-ui-tests.json`. Les captures et contrôles de l’ancienne composition sont historiques. Ces contrôles locaux ne constituent pas une validation client ni un audit d’accessibilité complet. Le raccordement intégral des pages à Strapi et l’envoi réel des formulaires restent à réaliser ; le contact prépare seulement un brouillon local et les candidatures restent fermées. L’échéance reste le 12 novembre 2026.

## Comparaison des sources reçues le 3 novembre 2026

Le cahier des charges v0.1, le chronogramme v0.2, le dossier de présentation, le formulaire de validation, la revue YIDA-Cashew et les deux collections d’images ont été rapprochés des fichiers déjà présents. Le chronogramme est identique à la copie existante. Le cahier v0.1 est conservé dans `docs/archive/` : il confirme les six pôles et les besoins initiaux, mais ne remplace ni les décisions ni les conditions d’activation de la v0.5.

Le dossier de présentation contient des chiffres et projections qui ne sont pas corroborés par les décisions de contenu ; ils restent exclus de la publication jusqu’à validation explicite. La maquette finale propose notamment huit expertises, de nouveaux chiffres, des promesses, des logos, un répertoire de partenaires et un jeu. Ces éléments ne sont pas des validations ; l’intégration de l’accueil conserve les six expertises approuvées et les contenus existants. Seule la direction visuelle est reprise.

Le dossier `AGROPULSE GLOBALE SOLUTION` est un clone du dépôt sur le même commit de base, avec des changements locaux non commités (documentation, pages publiques, script, contrôles et suppression de deux SVG). Ces changements n’ont pas été copiés en bloc : seuls les documents complémentaires classés et la maquette demandée ont été repris, sans remplacer de fichiers plus récents du dépôt.

## Refonte statique de l’accueil — consigne actuelle

La consigne la plus récente demande de refaire uniquement l’accueil statique sur `integration-maquette-finale`, en utilisant les documents comme source métier et la maquette HTML intégrée comme référence de design, structure et images. Elle remplace, pour `public/index.html`, les descriptions précédentes d’un accueil simplifié ou basé sur l’ancien contenu. Les autres pages ne sont pas modifiées.

`public/index.html` utilise maintenant `public/homepage.css` et `public/homepage.js`, sans les feuilles ou le script partagés avec les anciennes pages. Le contenu reprend les six pôles exacts de la v0.5. Le Fellowship mentionne uniquement la formation de 2 à 3 mois, sans garantie d’emploi ; les candidatures restent fermées tant que dates et critères ne sont pas confirmés. AGIR-IA reste distinct et aucune nouvelle édition n’est annoncée. La revue YIDA-Cashew no 1, datée d’octobre 2026, n’a pas de lien de téléchargement tant que sa diffusion n’est pas validée. Le questionnaire de validation est vierge. Aucun formulaire de contact n’est actif et aucun destinataire, délai de réponse, chiffre non corroboré ou partenariat non confirmé n’est inventé.

Les images de l’accueil sont extraites des URI intégrées à la maquette et conservées dans `public/assets/home/`. Elles sont signalées comme illustratives ; leur autorisation de diffusion reste à valider. Les prototypes de jeu, globe et candidatures de la maquette ne sont pas activés. Le contrôle statique couvre désormais la page dédiée en français/anglais, ses six pôles, ses liens et ses médias ; cela ne vaut pas validation éditoriale ni approbation de publication.

## Téléchargements — 4 novembre 2026

Le porteur demande explicitement le téléchargement des documents après avoir fourni la revue YIDA-Cashew n° 01. Le fichier original est intégré sans modification à un catalogue public explicite, accessible depuis Ressources et YIDA-Cashew. La revue est en français ; les libellés du site sont bilingues. Cette demande ne vaut pas publication des dossiers internes, ni validation automatique des huit expertises et des objectifs ou organismes mentionnés dans la revue. Les descriptions antérieures de l’absence de téléchargement sont historiques pour cette revue.

Vérifications du téléchargement : génération et contrôles du projet réussis (7 tests), puis téléchargements au clavier sur Ressources et YIDA-Cashew en FR/EN à 375 et 1440 px. Aucun débordement ni erreur JavaScript détecté ; fichiers téléchargés identiques au PDF original (SHA-256 fd93a5e7ea629bf105c1097add78f58d6bc3f7fffd8989528fa2710e83124aa0, 1 070 191 octets). Réponses GET/HEAD, type PDF, nom de téléchargement, document absent et exclusion du dossier interne vérifiés. Captures examinées ; polices externes bloquées pendant les contrôles navigateur. Ce résultat concerne la copie locale et ne vaut pas déploiement.

## Décisions du porteur — reprise du 4 novembre 2026

La dernière instruction remplace les descriptions antérieures de six pôles et de téléchargement de la revue. Le site présente huit pôles distincts, selon les intitulés demandés dans la conversation. Les programmes sont regroupés sous Initiatives et YIDA-Cashew garde exactement cette graphie.

YIDA-Cashew est une page vitrine de programme : origine, objectifs, publics et parcours sont présentés sur la page en FR/EN à partir de la revue. Le document source demeure interne ; le PDF est retiré du catalogue et des fichiers publics, et son ancienne URL est refusée par le serveur. Les candidatures restent fermées ; seul un renseignement peut être demandé. Ces décisions ne valident pas un calendrier, un partenaire supplémentaire, une promesse d’emploi ou une mise en production.


## Reprise production — 12 novembre 2026

La demande actuelle du porteur fixe Hostinger, les domaines agropulsegs.org / cms.agropulsegs.org, Strapi 5.61.0 et MySQL existant. Elle remplace les propositions historiques d’hébergement. Priorité : démarrage stable et conservation des demandes avant notification e-mail ; domaine futur et déplacement des sections reportés. Voir AgroPulse_Reprise_production_2026-11-12.md pour le diagnostic observé, les changements et les limites des preuves.
