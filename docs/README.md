# Documents AgroPulse

Documents de référence au 26 octobre 2026 :

- [Cahier des charges fonctionnel v0.5](AgroPulse_Cahier_des_charges_v0.5.docx) — proposition validée par le porteur avec conditions d’activation ; [lecture HTML](AgroPulse_Cahier_des_charges_v0.5.html).
- [Cadrage technique L3 v1.0](AgroPulse_Cadrage_technique_L3_v1.0.docx) — orientation Next.js, Strapi Community, PostgreSQL, Docker Compose et GitHub Actions ; proposition OVHcloud et Brevo, budget indicatif et tâches suivantes ; [lecture HTML](AgroPulse_Cadrage_technique_L3_v1.0.html).
- [Modèle Strapi et droits v1.0](AgroPulse_Modele_Strapi_et_droits_v1.0.docx) — sept types de contenus, relations, FR/EN, rôles et scénarios du pilote à exécuter ; [lecture HTML](AgroPulse_Modele_Strapi_et_droits_v1.0.html) et [spécification JSON de conception](architecture/agropulse-strapi-design.v1.json). Ce JSON n’est pas un schéma Strapi exécutable.
- [Contexte actuel](PROJECT_CONTEXT.md) — sources, limites et prochaine étape.
- [Compte rendu du pilote technique v1.0](AgroPulse_Pilote_technique_v1.0.md) — essai local FR/EN, rôles, brouillons et preview ; 77 assertions techniques réussies, couverture et limites ; [lecture HTML](AgroPulse_Pilote_technique_v1.0.html) et [guide de lancement](../pilot/README.md).
- [Administration des contenus v1.0](AgroPulse_Administration_contenus_v1.0.md) — six modèles complémentaires, blocs et règles de publication ; état local et limites des médias ; [lecture HTML](AgroPulse_Administration_contenus_v1.0.html).

Le cadrage L3 complète les options techniques encore ouvertes dans le cahier des charges. Il consigne l’accord du porteur sur la proposition 2, sans commande de services ni approbation distincte de Mme Hélène Nichy. Configuration exacte, devis, responsabilités et dates restent à confirmer.

Les copies HTML sont destinées à la revue dans un navigateur. Le contenu des fichiers Word a été contrôlé structurellement ; leur rendu visuel n’a pas pu être vérifié, faute de moteur LibreOffice disponible dans le runtime de cette session.

Les documents antérieurs et le questionnaire restent conservés comme historique. Leurs noms de validateurs, propositions techniques ou dates ne remplacent pas les décisions consignées dans les versions ci-dessus.

## Sources complémentaires reçues le 3 novembre 2026

- [Dossier de présentation](projet/AgroPulse_Dossier_Presentation.docx) — document de travail interne ; ses chiffres et projections ne sont pas corroborés par le cahier v0.5 et ne sont pas repris sur le site.
- [Formulaire de validation](validation/Formulaire_validation_AgroPulse.docx) — conservé comme pièce de validation, sans présumer d’une signature ou d’un accord supplémentaire.
- [Revue YIDA-Cashew no 1](ressources/La%20Revue%20YIDA-Cashew%20AgroPulse_N01.pdf) et [collection d’images AgroPulse](ressources/AgroPulse_Maquette_Images_Uniques.zip), [collection Stitch](ressources/stitch_agropulse_visual_assets_collection.zip) — ressources de référence, non publiées automatiquement.
- [Cahier des charges v0.1](archive/AgroPulse_Cahier_des_charges_v0.1.docx) — version historique ; la v0.5 demeure la référence fonctionnelle la plus récente déjà intégrée.
- La [maquette HTML intégrée](../.work/maquettes/AgroPulse_Maquette_Images_Integrees_Directement.html) est un support de travail ignoré par Git. Ses nouveaux chiffres, promesses, logos, partenaires, huit expertises et jeu ne sont pas des validations éditoriales.

Le chronogramme v0.2 fourni est identique à la copie déjà conservée dans `docs/AgroPulse_Chronogramme_v0.2.docx` ; aucune copie supplémentaire n’a été créée. Les documents v0.2 à v0.5 et le cahier de référence existants n’ont pas été remplacés.

## Skills AgroPulse

Les sources partageables sont dans `skills/` à la racine du dépôt. Les instructions se réfèrent au workspace AgroPulse courant et aux documents de cet index, sans importer les contraintes de Talent-Job.

- `agropulse-project-context` : reprendre le projet et retrouver les décisions.
- `agropulse-functional-analysis` : cadrer les comportements et critères observables.
- `agropulse-strapi-modeling` : concevoir contenus, langues et permissions Strapi.
- `agropulse-ui-review` : analyser les maquettes par rapport aux besoins.
- `agropulse-delivery-planning` : préparer lots, coûts, recette et livraison.
- `agropulse-nextjs-development` : réaliser le frontend Next.js et sa connexion au CMS.
- `agropulse-strapi-development` : implémenter modèles, rôles et validations Strapi.
- `agropulse-api-design` : définir les contrats des contenus et formulaires.
- `agropulse-testing` : préparer et exécuter des vérifications avec preuves.
- `agropulse-security-review` : examiner les accès, secrets et données privées.
- `agropulse-accessibility-responsive` : vérifier clavier, mobile et accessibilité.
- `agropulse-i18n-seo` : vérifier FR/EN, routes et référencement.
- `agropulse-database-review` : examiner PostgreSQL, migrations et restauration.
- `agropulse-deployment` : mettre en œuvre Docker, CI/CD et procédures de livraison.
- `agropulse-observability` : préparer santé, logs et alertes d’exploitation.
- `agropulse-code-review` : revoir un patch selon les exigences du projet.
- `agropulse-documentation` : maintenir les documents, décisions et preuves.
- `agropulse-architecture-decisions` : évaluer et consigner les changements d’architecture.

Exemples d’invocation : `$agropulse-strapi-modeling` pour revoir le modèle et les droits ; `$agropulse-ui-review` pour une nouvelle archive de maquettes. La création de skills ne modifie pas les configurations CMS et n’autorise pas de publication ni d’achat.

Le pack comprend 18 skills. `scripts/install-agropulse-skills.ps1` installe les fichiers dans le dossier personnel Codex, conserve les copies identiques et refuse d’écraser un skill local différent. La validation structurelle des skills ne prouve pas les résultats des futurs travaux techniques.

## Réunion de vingt minutes

- [Support court à suivre pendant la réunion](AgroPulse_Reunion_technique_20_minutes_v1.0.html) : déroulé, validation des maquettes, CMS FR/EN, planning sur trois semaines et compte rendu vierge.
- [Annexes détaillées](AgroPulse_Reunion_technique_annexes_v1.0.html) : informations à consulter seulement en cas de besoin.
- Échéance de fin rappelée par le porteur : **12 novembre 2026**. Les dates intermédiaires restent à convenir.
- Dernière vérification CMS : 13 assertions de saisie simplifiée et 14 assertions d’interface FR/EN réussies ; médias, candidatures et déploiement restent à terminer.

## Intégration en cours

Le porteur autorise la poursuite à partir des maquettes le 27 octobre 2026. Le premier lot d’accueil Next.js est accessible localement sur le port 3100, en `/fr` et `/en` : menu, grand visuel, expertises, programmes et pied de page. Les preuves sont dans `pilot/evidence/home-browser-tests.json` (25 contrôles réussis) et `web-tests.json` (27 contrôles du parcours historique réussis). Le [guide du pilote](../pilot/README.md) précise la configuration et les limites. Cela ne constitue pas une validation client de la réalisation ni une livraison complète.

L’accueil simplifié est remplacé par la composition complète de la maquette : laboratoire, jeu illustratif, galerie, globe, carte et contact en deux colonnes. Le retrait demandé du logo dans le hero est conservé. Les 46 contrôles de l’accueil et la comparaison de styles avec la source sont consignés dans `pilot/evidence/`. Les pages intérieures et l’administration intégrale du gabarit restent à raccorder.

## Maquettes simplifiées — révision actuelle

À la demande du porteur : accueil conservé, menu limité à cinq entrées, police Arial, À propos raccourci et expertises sans onglets ni carrousel. Huit pages FR/EN sont disponibles dans l’application Next.js : `/a-propos`, `/expertises` et `/pole-1` à `/pole-6`, sous `/fr` ou `/en`. Le parcours de revue actuel est consigné dans `pilot/evidence/concise-ui-tests.json`. Les preuves de reproduction de la maquette initiale sont historiques et ne remplacent pas la dernière consigne éditoriale.

Présentation actuelle du 27 octobre : accueil et huit pages intérieures simplifiés en FR/EN, inspirés de l’organisation visuelle de SMAG. À propos contient identité, mission et équipe, sans liste de services répétée. Voir la dernière section de `PROJECT_CONTEXT.md` et les preuves `pilot/evidence/business-home-tests.json` / `pilot/evidence/concise-ui-tests.json`. Les comparaisons avec l’ancienne maquette sont historiques.

## Dernière consigne relative à l’accueil statique

La page `public/index.html` est refondue seule sur la branche `integration-maquette-finale`. Elle reprend la composition visuelle et les images de l’accueil de la maquette finale, avec un style et un script dédiés (`public/homepage.css`, `public/homepage.js`) ; les pages intérieures et `public/app.js` restent isolés de cette refonte.

Le contenu métier s’appuie d’abord sur le cahier des charges v0.5 : six pôles, Fellowship et AGIR-IA distincts, pays indiqués et informations de programme limitées à ce qui est documenté. Les candidatures restent fermées ; les dates et critères incertains, chiffres non corroborés, partenariats non confirmés et promesses d’emploi ne sont pas repris. La revue YIDA-Cashew no 1 (octobre 2026) est identifiée, mais son téléchargement n’est pas activé avant validation de publication et des droits. Le formulaire de validation reçu est vierge. Les coordonnées, le destinataire des demandes et les contenus légaux restent à compléter ; aucun formulaire ni envoi n’est activé dans cet aperçu.

Les visuels locaux de `public/assets/home/` proviennent des images intégrées à la maquette et sont présentés comme illustratifs, pas comme preuves de réalisations. Leur autorisation de diffusion doit être confirmée avant mise en ligne. Les jeux, globe et autres extensions de la maquette ne sont pas activés.

## Publications téléchargeables — 4 novembre 2026

- Revue YIDA-Cashew n° 01 : téléchargement public depuis Ressources et YIDA-Cashew, fichier français original dans `public/documents/revue-yida-cashew-n01.pdf`. Catalogue et procédure d’ajout dans le README racine. Les autres documents restent internes sauf demande de publication.

## Consigne actuelle — 4 novembre 2026

Huit pôles distincts, navigation Initiatives et page informative YIDA-Cashew en FR/EN. La revue est une source interne, sans téléchargement public. Cette instruction remplace les mentions historiques contraires ; voir la dernière section de PROJECT_CONTEXT.md.
