# AgroPulse — audit local et correctifs du 5 novembre 2026

## Résultat

Les essais autorisés sur le code et le pilote local ont reproduit une possibilité d’arrêt du serveur, corrigée et couverte par une régression. Une politique CORS trop permissive a également été restreinte. Les essais de contenus HTML malveillants, d’accès aux brouillons et de publication sans droits ont été bloqués. Cela ne constitue ni une certification générale ni un audit de la future infrastructure, qui n’est pas encore connue.

## SEC-01 — Élevée : arrêt du serveur par cible HTTP malformée

**Emplacement :** scripts/serve.mjs, entrée handleRequest, ligne 35 ; confinement asynchrone, lignes 116–130. **Statut : corrigé, vérifié.**

Avant correction, la construction de l’URL avait lieu dans un callback async sans confinement extérieur. Sur un processus jetable lancé sur un port local attribué automatiquement, une seule requête avec une cible URI invalide a produit une erreur Invalid URL puis la sortie du processus avec le code 1. Aucun essai destructif n’a été fait sur le serveur de démonstration ou une cible distante.

**Impact :** un client non authentifié pouvant transmettre cette requête à Node pouvait rendre l’instance indisponible. Un reverse proxy peut filtrer certaines cibles, mais cette mitigation n’était pas démontrée et ne remplace pas le traitement applicatif.

Le parseur renvoie maintenant 400 sans recopier la cible dans la réponse. Les rejets asynchrones sont également confinés dans le gestionnaire HTTP, avec une réponse générique ou une fermeture de connexion si des en-têtes sont déjà partis. Les mêmes cibles malformées sont refusées et /healthz répond encore après chacune. Le test scripts/serve-security.test.mjs couvre ce scénario, les chemins de traversée et les en-têtes de protection. Le probe initial rejoué sur le correctif constate un processus toujours actif et aucune erreur Invalid URL non interceptée.

## SEC-02 — Faible : autorisation CORS inutilement étendue

**Emplacement :** pilot/cms/config/middlewares.js, lignes 3–9. **Statut : durci, vérifié sur le CMS redémarré.**

Avant correction, une demande d’initialisation avec une origine étrangère recevait Access-Control-Allow-Origin reflétant ce domaine et Access-Control-Allow-Credentials=true. Aucune fuite de contenu privé ou de session n’a été démontrée : les authentifications et permissions restent des protections séparées.

La configuration autorise maintenant les origines exactes du CMS et du site de prévisualisation, sans joker, avec un cache de préflight réduit. Après redémarrage, la même origine inconnue n’obtient plus d’en-tête d’autorisation ; l’origine du site de prévisualisation reste autorisée. Ce contrôle de navigateur ne remplace pas l’authentification et ne prétend pas bloquer les clients HTTP capables de forger leurs en-têtes.

## SEC-03 — Défense supplémentaire : intégration et en-têtes

**Emplacement :** scripts/serve.mjs, lignes 116–125. **Statut : ajouté et vérifié.**

Les réponses incluent nosniff et une politique de référent. La politique CSP interdit les objets intégrés et les bases HTML et limite les parents d’iframe au site et au CMS configuré, afin de préserver l’aperçu autorisé. Il s’agit d’une politique partielle : le script de la maquette reste intégré au HTML et une CSP stricte de scripts n’est pas revendiquée. Aucun HSTS ou cookie Secure n’a été imposé au développement HTTP local.

## SEC-04 — CSS administrable : nouvelle frontière contrôlée

**Emplacement :** pilot/cms/src/domain/style-policy.mjs ; site-presentation-policy.js, lignes 8–12 ; scripts/page-content.mjs ; public/editorial-client.js. **Statut : contrôles implémentés et testés.**

Le porteur a demandé un champ CSS avancé. Les données sont validées côté CMS et à leur lecture publique, puis compilées pour des sélecteurs de composants sous #app. URL, imports, HTML, échappements, sélecteurs d’attributs, styles globaux et propriétés non autorisées sont refusés. L’insertion utilise textContent, sans interprétation HTML. Les styles restent en brouillon jusqu’à publication. Le contrôle direct de l’API refuse des styles globaux, et le parcours navigateur prouve le refus d’un CSS externe, l’affichage privé, l’application après publication et le retour à l’origine sans modifier les textes.

## Contrôles négatifs exécutés

- HTML hostile dans le titre, l’introduction et une carte : rendu comme texte, sans exécution observée.
- Faux message de brouillon envoyé à une page autonome : ignoré.
- Fragments d’URL contenant des balises ou chemins : aucune exécution observée.
- Traversée encodée, fichiers de source, configuration Git et URL de documents internes : aucune donnée privée retournée.
- Lecture API anonyme et lecture de brouillons avec le jeton de lecture : refusées.
- Publication par l’Éditeur, confirmation de partenaire et ouverture de candidatures par le mauvais rôle : refusées.
- Lien exécutable dans un brouillon : publication refusée ; la version déjà publiée reste intacte.
- Import de médias et faux téléchargement : toujours fermés.
- Formulaires : tests de validation, origine, taille, fréquence, honeypot et erreur d’envoi ; aucun courriel réel envoyé.

Les contrôles sont reliés aux 30 tests du site, aux 77 contrôles des modèles CMS et aux 43 contrôles du pilotage visuel. Les versions publiées temporairement par les essais restent des fiches fictives locales ; la fiche de pilotage est retirée de la lecture publique après vérification. Les polices distantes sont bloquées dans les essais navigateur de référence.

## Alertes et limites restantes

L’inventaire npm de dépendances n’a pas été supprimé ni réduit par une migration forcée. Le rapport docs/AgroPulse_Securite_CMS_2026-11-04.md distingue les alertes transitives et les usages Zod de configuration testés. Les alertes restantes doivent être surveillées et prises en compte pour l’exposition de l’administration.

L’hébergement, le domaine et les accès de production restent à confirmer. HTTPS, protection du CMS, pare-feu, comportement derrière proxy, sauvegardes et restauration devront être vérifiés sur la cible. Il n’y a pas eu de test de charge massif, de brute force, d’attaque sur une infrastructure tierce ni d’essai de livraison réelle de courrier. Aucune absence totale de faille n’est garantie.
