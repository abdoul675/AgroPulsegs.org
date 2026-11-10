# AgroPulse — Administration des contenus v1.0

**26 octobre 2026 — Lot local de préparation des contenus.**

Le CMS dispose maintenant des six modèles complémentaires à l’expertise du premier pilote : paramètres du site, pages, programmes, campagnes, ressources et partenaires. Les contenus restent fictifs. Les pages finales des maquettes ne sont pas encore raccordées ; ce travail n’a pas modifié le site statique existant.

La réalisation fait suite à la demande du porteur de poursuivre la préparation des contenus. Elle ne vaut pas validation éditoriale de Mme Hélène Nichy, personne désignée pour la validation client.

## Ce qui est disponible

| Contenu | Configuration et comportement vérifié |
| --- | --- |
| Paramètres du site | Nom, slogan, navigation, coordonnées publiques, réseaux et logo ; brouillon FR enregistré, publication refusée sans logo. |
| Pages | Identité de page, titre, URL, résumé, blocs structurés et SEO ; une page fictive publiée et relue en FR/EN. |
| Programmes | Fellowship et AGIR-IA distingués par leur identité ; objectif, public, durée libre, texte structuré, SEO et relations. Un exemple Fellowship est publié en FR/EN. |
| Campagnes | État fermé par défaut, dates, critères et messages FR/EN ; une campagne fictive fermée est publiée. Les candidatures ne sont pas activées. |
| Ressources | Langue, titre, description, fichier, format/taille réservés aux données dérivées et version ; brouillons possibles, publication de fichiers désactivée dans ce lot. |
| Partenaires | Identité partagée, nom/description FR/EN, confirmation, logo et site ; un exemple confirmé publié et un exemple non confirmé laissé en brouillon. Aucun partenaire réel n’a été ajouté. |

Onze composants structurent les contenus : SEO, navigation, coordonnées publiques, réseau social, texte FR/EN partagé, visuel, service, bloc principal, texte, grille de cartes et appel à l’action. Ils préparent les données nécessaires aux maquettes ; leur existence dans le CMS ne définit pas l’apparence du futur site.

Les relations programme–expertise, programme–campagnes et programme–partenaires sont déclarées dans les schémas. Le premier modèle d’expertise conserve ses champs de démonstration et reçoit la relation réciproque vers les programmes ; il doit encore être enrichi avec les champs métier complets du modèle de conception.

## Règles exécutées côté serveur

- Un brouillon peut être incomplet. Les champs nécessaires sont contrôlés au moment de publier, y compris pour les blocs et leurs données SEO.
- L’Éditeur ne publie aucun des nouveaux contenus. Il ne modifie ni état, dates ou circuit d’une campagne, ni confirmation d’un partenaire. Les permissions de champs et un contrôle des appels directs appliquent cette restriction.
- Les clés métier déjà renseignées restent stables. Un autre document ne peut pas reprendre la même clé, même lors de deux créations simultanées. Le contrôle utilise une transaction PostgreSQL et un verrou par identité.
- Le Publieur ne peut pas publier un partenaire non confirmé. La publication d’un programme est refusée si un partenaire associé n’est pas publié et confirmé dans la langue du programme.
- Une campagne doit référencer un programme publié dans les deux langues et posséder son message FR/EN. Les dates inversées empêchent la publication. L’ouverture reste refusée tant que les conditions approuvées et le circuit de candidature ne sont pas raccordés.
- Les lectures serveur exposent uniquement la version publiée et des champs/blocs autorisés. Les paramètres de population fournis par l’appelant ne permettent pas d’ajouter arbitrairement des relations ou de choisir leurs brouillons.
- Une ressource sans fichier ne se publie pas et ne produit pas de faux téléchargement. Les imports et modifications de médias par HTTP sont fermés dans ce lot, même pour l’administrateur technique.

La dernière mesure est une limite volontaire du lot : elle ne constitue pas un stockage privé opérationnel. Le circuit d’import de médias publics autorisés, le calcul réel du format et de la taille, les contrôles des logos et la gestion éventuelle de documents confidentiels restent à réaliser. Ne pas téléverser de dossier privé dans le stockage public de Strapi.

## Adaptations entre conception et Strapi

| Conception v1.0 | Configuration exécutable | Motif |
| --- | --- | --- |
| `site-settings` | Type `site-setting`, pluriel `site-settings` | Strapi impose la cohérence du nom singulier avec le dossier de type. |
| Partenaire : `status` | `confirmationStatus` | `status` est réservé au brouillon/publié avec Draft & Publish. |
| Partenaire : clé UID non traduite | Chaîne contrôlée, non traduite | Strapi traite les champs UID comme localisés même si leur option de localisation est désactivée. La chaîne partagée conserve l’identité prévue. |
| Ressource : format/taille dérivés | Champs non modifiables, publication suspendue | Aucune valeur fictive de format ou de taille n’est présentée comme issue d’un vrai fichier. |

Ces adaptations ont été fondées sur le code de Strapi installé et sur des essais réels. Le JSON de conception d’origine reste inchangé et conserve sa fonction de document historique, sans être chargé comme schéma d’exécution.

## Preuves du lot

La suite [content-model-tests.json](../pilot/evidence/content-model-tests.json) comporte **77 assertions techniques réussies** lors de son exécution finale. Elle couvre les publications FR/EN, les quatre types de blocs, les données SEO, les interdictions de rôle, les partenaires non confirmés, l’identité stable, la création concurrente, les campagnes fermées et dates inversées, les ressources absentes, les imports fermés et les lectures publiées.

La vérification des écrans comporte **8 assertions réussies** dans [content-browser-tests.json](../pilot/evidence/content-browser-tests.json), avec `completed: true` : pages et campagnes de l’Éditeur, état/dates non modifiables, programme et commande du Publieur. Les captures associées sont : [page — Éditeur](../pilot/evidence/content-page-editor.png), [campagne — Éditeur](../pilot/evidence/content-campaign-editor.png), [programme — Publieur](../pilot/evidence/content-programme-publisher.png). Les titres d’administration utilisent le titre, le nom ou la clé du contenu plutôt qu’un identifiant technique.

Les vérifications de l’expertise et du frontend du premier pilote ont été reprises après l’ajout des modèles. Leurs preuves restent dans [cms-tests.json](../pilot/evidence/cms-tests.json), [web-tests.json](../pilot/evidence/web-tests.json) et [browser-tests.json](../pilot/evidence/browser-tests.json). Le premier [compte rendu du pilote](AgroPulse_Pilote_technique_v1.0.md) est conservé comme état de l’étape précédente.

Les essais ont rencontré la limitation native des connexions administratives, après plusieurs relances rapprochées. La protection est conservée ; les tests navigateur réutilisent leur session et doivent respecter la fenêtre de limitation. Les contrôles de préparation des contenus et de lecture de preview doivent aussi être exécutés dans l’ordre, puisqu’ils utilisent la même expertise fictive.

Ces preuves ne constituent pas une recette globale du site. Les médias privés, la disponibilité positive d’une ressource avec fichier, les candidatures, les envois, l’hébergement et la restauration n’ont pas été validés dans ce lot.

## Préservation des données et accès

Une copie à froid de la base PostgreSQL et des fichiers locaux de configuration a été réalisée avant l’évolution du schéma, après arrêt propre du serveur. Elle se trouve dans le dossier local ignoré `pilot/.local/backups/`. La base existante a été conservée et le document d’expertise du premier pilote garde son identité. La présence de cette copie ne prouve pas qu’une restauration a été testée.

L’administration reste locale : [ouvrir le CMS](http://127.0.0.1:1338/admin). Les comptes fictifs et le démarrage sont décrits dans le [guide du pilote](../pilot/README.md). Aucun secret ou contenu de la sauvegarde n’est destiné au dépôt Git.

Les schémas et composants sont dans `pilot/cms/src/`. Le générateur explicite `pilot/tools/create-content-models.mjs` vérifie les fichiers existants et refuse d’écraser un schéma différent. Les scripts du lot sont `test-content-models.mjs` et `test-content-browser.mjs`. La construction de l’administration Strapi a réussi ; aucun achat, déploiement ni push n’a été effectué.

## Suite concrète

1. Terminer le circuit des médias publics autorisés et les métadonnées de fichiers, puis vérifier la publication des ressources et paramètres avec des fichiers de test adaptés.
2. Enrichir l’expertise avec les besoins, publics, services, visuels et SEO prévus ; vérifier les relations réciproques et les parcours encore partiels.
3. Reprendre les maquettes retenues, fixer la correspondance entre leurs blocs et les données CMS, puis intégrer les éléments communs et l’accueil avant les pages internes. La mise en page, les couleurs et les composants des maquettes restent la référence ; aucune refonte visuelle n’a été introduite par ce lot.
4. Brancher les pages et leur prévisualisation sur ces modèles, faire valider les vrais textes FR/EN, puis préparer les intégrations et la préproduction selon le cadrage L3.

Les campagnes réelles restent fermées jusqu’à clarification des dates, critères et responsabilités déjà identifiés dans le cahier des charges. Les exemples fictifs ne remplacent aucune de ces décisions.
