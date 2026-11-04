# Préparation de mise en ligne — 4 novembre 2026

## Vérification indépendante terminée

Après libération de l’espace disque, le commit 859fa2d a été exporté dans un nouveau répertoire. npm ci a installé 1 427 packages, sans jonction vers le node_modules du développement. Le build de l’administration Strapi 5.61.0 a réussi en 76,682 secondes. Ce résultat lève le point de compilation resté ouvert dans le précédent compte rendu ; il ne supprime pas la trace historique de l’essai interrompu.

Le CMS de cette nouvelle installation a ensuite démarré en NODE_ENV=production avec AGROPULSE_PILOT_MODE=false sur une base neuve isolée. Le contrôle retrouve les langues FR/EN et les deux rôles AgroPulse, zéro compte, zéro page et aucun jeton local du pilote importé. Les deux jetons natifs créés par Strapi restent distincts des jetons locaux ; leur retrait après configuration du jeton restreint est prévu dans le guide. La base du développement n’a pas été modifiée et le serveur temporaire de ce contrôle a été arrêté.

Les 20 tests du site sont réussis. Le nouveau contrôle de portée Zod est réussi sur les dépendances du poste et sur celles de l’installation indépendante. Il vérifie que les tableaux des requêtes ne déclenchent pas les schémas d’options serveur concernés ; les requêtes malformées et trop volumineuses sont refusées. L’audit indépendant conserve 29 alertes, dont zéro critique et cinq élevées ; les observations de portée et limites sont exposées dans ../AgroPulse_Securite_CMS_2026-11-04.md. Aucune alerte n’a été supprimée artificiellement.

Les 33 contrôles du pilotage visuel et les parcours publics FR/EN desktop/mobile de la livraison précédente restent la preuve fonctionnelle des composants inchangés. Ils n’ont pas été rejoués pour ces seuls ajouts de documentation et de test de sécurité.

## Reste dépendant de la cible

La préparation locale est terminée ; aucune production distante n’a été configurée ou déployée. Le porteur indique qu’un hébergement pourrait déjà être disponible dans l’organisation, sans nom d’offre, accès ou domaine confirmé. Aucun achat n’est donc engagé. Le responsable informatique doit confirmer la capacité Node.js/PostgreSQL, le domaine disponible et la personne autorisée à ouvrir les accès.

Les informations officielles de contact, de confidentialité et légales ainsi que la configuration réelle d’envoi restent à recevoir. Une fois la cible connue, vérifier HTTPS/DNS, accès restreint au CMS, courrier réellement reçu et sauvegarde/restauration sur cet environnement. La fiche ../Mise-en-ligne-elements-a-fournir.md contient la liste à faire compléter ; aucun mot de passe ou jeton ne doit être envoyé dans le chat.

La preuve synthétique associée est preparation-mise-en-ligne-2026-11-04.json. Les caches npm, secrets, bases et fichiers de compilation restent locaux et hors commit.
