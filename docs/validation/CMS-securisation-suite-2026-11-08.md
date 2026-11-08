# Traitement des points ouverts de sécurité — 8 novembre 2026

## Ce qui est maintenant vérifié

Une instance réelle de Strapi 5.61.0 est démarrée avec les fichiers de l’application et une base PostgreSQL neuve, sur des ports de boucle locale distincts. Les secrets et comptes sont générés pour cet essai ; aucun contenu, compte ou mot de passe du pilote utilisateur n’est réutilisé. Aucun e-mail réel n’est envoyé. Les serveurs isolés sont arrêtés et le nouveau répertoire de données PostgreSQL est supprimé après vérification ; le rapport et les journaux privés restent dans le répertoire ignoré du test.

**38 vérifications réussies**, détaillées dans le JSON associé :

- Connexion native des trois comptes fictifs et langues FR/EN.
- Refus des accès anonymes au gestionnaire et à l’API de contenus.
- Jeton de lecture incapable d’écrire.
- Brouillons autorisés pour l’Éditeur, publication refusée par l’API et dans l’interface.
- Publication par le Publieur autorisée par l’API et disponible dans l’interface ; contenu incomplet refusé.
- Les mises à jour non publiées restent privées en FR/EN ; l’ancienne version publiée demeure accessible au jeton autorisé.
- L’Éditeur ne peut pas ouvrir une campagne, modifier sa date d’ouverture ou confirmer un partenaire.
- Les imports restent désactivés, y compris pour l’administrateur.
- CORS autorise l’origine configurée et ne l’accorde pas à une origine inconnue. CORS n’est pas présenté comme un remplacement de l’authentification.
- Le parcours de preview refuse l’absence de secret.

Ces résultats vérifient les rôles configurés par le code sur une nouvelle instance. Ils ne constituent pas une revue des affectations de comptes d’un futur serveur de production, ni une modification ou migration des données existantes du porteur.

## Protections ajoutées

1. **Refus des imports avant analyse de la requête.** Le middleware interdisant les mutations de médias passe avant le parseur de corps. Avant correction, une requête JSON malformée sur cette route interdite atteignait le parseur et retournait 400 ; après correction, elle retourne immédiatement 403. Un test instrumenté confirme zéro appel au parseur pour ces routes et son fonctionnement conservé sur les routes ordinaires. Aucun essai volumineux ou de saturation n’a été effectué.
2. **CMS local par défaut.** Sans réglage explicite, le CMS écoute sur `127.0.0.1`, pas sur toutes les interfaces. Une configuration explicite du réseau reste possible pour un déploiement préparé. Cette valeur par défaut ne protège pas un service qu’un administrateur expose volontairement par un proxy ou par un autre réglage réseau.

Trois tests ciblés de middlewares/configuration réussissent. La suite du site conserve ses 33 tests. Les dépendances ne sont pas modifiées par ces mesures.

## Dépendances : ce qui reste à traiter

L’audit de production reste à **29 alertes : 0 critique, 5 élevées, 22 modérées, 2 faibles**. Les alertes propagées ne sont pas des vulnérabilités indépendantes. Le registre npm vérifié pendant ce lot donne toujours Strapi 5.61.0, React Router 6.30.6 pour la branche 6, et deepmerge 4.3.1 comme dernières versions de ces références. Le précédent rapport conserve les avis et l’analyse des chemins Zod observés.

Il n’y a pas de mise à jour directe compatible identifiée pour fermer automatiquement ce lot. Les suggestions impliquant une autre version majeure de routeur ou un retour de Strapi 5 vers 4 ne sont pas appliquées. Une migration de bibliothèques doit faire l’objet d’un lot isolé, d’une revue de compatibilité et d’une recette complète ; les limites réseau ne suppriment pas les avis de sécurité.

Références : [versions Strapi](https://github.com/strapi/strapi/releases), [avis Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [avis deepmerge sans correctif annoncé](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). Les constats de registre et de tests du présent lot ne valent pas garantie générale de sécurité.

## Hébergement : blocage et conditions d’ouverture

Le porteur confirme ne pas avoir reçu l’invitation Hostinger. Aucun accès au compte, audit du serveur réel, achat ou déploiement n’a été effectué.

À réception de l’accès, vérifier d’abord le nom de l’offre et sa capacité à héberger Node.js et PostgreSQL. Pour l’ouverture, prévoir HTTPS sur le site ; CMS et base sur un réseau privé ou en boucle locale ; accès d’administration restreint par un dispositif adapté à la cible (réseau privé, VPN ou filtrage d’accès) ; secrets de production distincts ; sauvegarde et restauration testées. Ne pas exposer directement les ports du CMS ou de PostgreSQL au public.

Avant activation du serveur réel, les alertes devront être réévaluées avec les versions disponibles à cette date et les mesures de protection effectivement configurées. Les tests de connexion, rôles, brouillons et publication seront rejoués sur la cible préparée. L’absence d’alerte critique ne suffit pas à autoriser l’exposition publique du CMS.

## Rejouer la vérification isolée

Après installation des dépendances verrouillées du CMS et des outils, lancer `node pilot/tools/test-cms-isolated-security.mjs`. Si Playwright est fourni par l’environnement de travail plutôt que par les outils du projet, préciser son emplacement avec `AGROPULSE_PLAYWRIGHT_MODULE`. Le navigateur utilisé est Edge sur Windows. Le script crée sa propre base et ses comptes, refuse le nom de base du pilote utilisateur, puis arrête ses seuls services.
