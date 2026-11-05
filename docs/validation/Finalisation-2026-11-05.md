# Finalisation locale — 5 novembre 2026

## Version vérifiée

Source applicative : 595c6d01f2a0156566308b76a8f7fe2491dff859. Les correctifs précédents sont b70f227 (confinement des requêtes HTTP invalides) et 0a1ceea (origines CORS limitées). Le lot 595c6d0 ajoute les réglages d’apparence et le CSS avancé contrôlé dans le pilotage visuel. Le design de référence reste le défaut. Aucun déploiement distant n’a été effectué.

## Preuves de vérification

- Archive Git de 595c6d0 exportée dans un répertoire neuf, sans fichiers applicatifs non suivis ni configuration privée du développement. Génération du site réussie et 30 tests réussis, avec vérifications des contenus et des liens.
- Construction de l’administration CMS réussie sur les sources de cette archive. Les dépendances proviennent de l’installation indépendante par npm ci déjà vérifiée le 4 novembre : elles sont réutilisées par jonction, sans nouvelle installation npm ci pour ce lot. Le verrou de dépendances est inchangé. Le premier essai a été bloqué par les permissions du poste sur les bibliothèques natives et la configuration utilisateur ; le second a réussi avec l’accès requis.
- Test de portée des schémas Zod réussi sur cette copie et ces dépendances indépendantes. Ce constat ne supprime pas les alertes de dépendances.
- Parcours navigateur de la copie propre : huit pôles, menus au clavier, YIDA-Cashew, liens et absence de débordement en FR/EN, aux largeurs 1440 et 375 px ; aucune erreur JavaScript observée. Les polices Google sont bloquées. Ce contrôle ne constitue pas un audit exhaustif d’accessibilité ou de performance.
- Sur le pilote CMS local : 43 contrôles du pilotage visuel réussis, notamment glisser-déposer, clavier, style privé, CSS manuel, refus des imports et styles globaux, sauvegarde, publication par le bon rôle, remise à l’origine, séparation FR/EN et retrait de la fiche fictive publique. Une première compilation pointait vers l’adresse d’aperçu par défaut ; après configuration de l’adresse locale, le parcours complet réussit.
- Les 77 contrôles des modèles et permissions CMS ont réussi sur le pilote le 5 novembre à 2026-11-05T06:21:27.577Z. Ils ont précédé le dernier déplacement visuel du panneau d’apparence, qui ne change ni les modèles ni les droits.
- Régression HTTP : trois tests réussis depuis l’archive du commit b70f227, puis inclus dans les 30 tests de la version complète. Une cible malformée renvoie 400 et le serveur reste vivant ; les chemins privés et traversées sont refusés.
- CORS : contrôle de configuration depuis l’archive du commit 0a1ceea et contrôle HTTP réel après redémarrage du CMS ; absence d’autorisation pour le domaine étranger et autorisation conservée pour le site de prévisualisation.

La preuve synthétique associée est [Finalisation-2026-11-05.json](Finalisation-2026-11-05.json). Les comptes, jetons, captures de travail et données de test restent locaux.

## Résultat fonctionnel

Le CMS permet de modifier les textes, de déplacer sections et cartes, puis de régler couleurs, arrondis, espacements et ombres par page et langue. Le CSS avancé cible une liste de composants ; il ne permet ni import externe, ni HTML, ni modification globale de l’administration. Enregistrement en brouillon et publication restent distincts. Le rôle Éditeur ne peut pas publier. Le retour à l’apparence initiale conserve textes et ordre des cartes ; le retour à la disposition initiale conserve les styles.

Les huit pôles, Initiatives et l’écriture YIDA-Cashew sont harmonisés. Le programme est présenté sur sa page ; les objectifs 500+ Fellows d’ici 2030 et 50 pour la cohorte pilote sont identifiés comme prévisionnels. Les candidatures restent fermées et la revue demeure interne.

## Conditions restantes pour vendredi 6 novembre

L’audit conserve 29 alertes de dépendances, dont zéro critique et cinq élevées, avec portée et limites documentées dans le [rapport de sécurité](../../security_best_practices_report.md). Aucune migration majeure forcée n’a été appliquée. La protection de l’administration et le traitement ou l’acceptation des risques restent à prévoir pour son exposition.

La mise en ligne attend le domaine, l’offre d’hébergement, les accès sécurisés, les coordonnées et mentions officielles, les validations éditoriales et la configuration d’envoi. Voir la [liste unique à faire compléter](../Mise-en-ligne-elements-a-fournir.md) et la [proposition d’hébergement](../Proposition-hebergement-AgroPulse-2026-11-04.md). Le choix de l’offre et aucun achat ne sont faits ici.

Sur la cible, il restera à vérifier HTTPS/DNS, accès au CMS, courrier réellement reçu, sauvegarde/restauration et parcours publics. Les essais locaux n’ont envoyé aucun courrier réel. Aucune attaque tierce, brute force ou charge massive n’a été effectuée. Les travaux documentaires préexistants restent hors de ce lot. Aucun changement sur main.
