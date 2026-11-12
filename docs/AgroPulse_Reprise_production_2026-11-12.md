# Reprise production — 12 novembre 2026

La demande du porteur du 12 novembre remplace les orientations historiques d’hébergement : site Node 20 sur agropulsegs.org, Strapi 5.61.0 Node 22 et base MySQL existante sur cms.agropulsegs.org. Le nouveau domaine et le déplacement visuel des sections restent reportés.

## Diagnostic constaté sur Hostinger

Les journaux du déploiement f901b868 montrent plusieurs lancements simultanés, un démarrage réussi après 297142 ms, puis un autre processus échouant sur la création de la table agropulse_inquiries déjà existante. SIGTERM déclenchait aussi deux destructions du plugin content-manager. Ces observations justifient un verrou MySQL partagé pendant le chargement/synchronisation/bootstrap et un seul gestionnaire de fermeture. Aucune table n’est supprimée ou recréée manuellement.

## Correctifs

- Le lanceur prend GET_LOCK sur une connexion MySQL temporaire avant app.load, puis libère ce verrou. Les instances concurrentes attendent leur tour. Le pool reste min 0, max 5, idle 30000 ms, reap 1000 ms.
- Le lanceur retire uniquement les gestionnaires de signaux installés par createStrapi et effectue une fermeture idempotente. Une erreur fatale ferme le processus au lieu de laisser un serveur 503 actif.
- Une soumission valide doit être conservée par Strapi avant tout appel e-mail. Un CMS indisponible ou un token invalide ne peut plus produire un faux succès via Resend.
- L’absence ou l’échec de Resend conserve la demande et déclenche une mise à jour du statut. Une erreur de mise à jour ne supprime pas la demande.
- Ingestion privée POST/PATCH : Bearer comparé en temps constant, données validées, corps limité à 16 Kio après le parseur Strapi, erreurs internes non exposées.
- Les rôles éditoriaux existants reçoivent lecture et traitement des demandes ; seuls workflowStatus, internalNotes et handledAt sont modifiables par ces rôles. Aucune route publique de liste/lecture n’est ajoutée.

## Configuration et vérification

Le même secret d’ingestion fort a été configuré dans les deux applications via les variables Hostinger. Sa valeur n’est ni enregistrée dans ce dépôt ni affichée dans le rapport. Le destinataire demandé reste programsagropulsegs@gmail.com. EMAIL_FROM et RESEND_API_KEY restent en attente.

Commande exécutée : npm run check — 52 tests réussis et contrôles statiques des pages/assets réussis. Les essais d’ingestion utilisent un magasin simulé ; ils ne constituent pas à eux seuls une preuve MySQL. La preuve finale de démarrage et d’enregistrement doit être vérifiée dans les journaux et l’interface de production après le déploiement de ce correctif. Le premier npm ci local a échoué sur la chaîne de certification ; nouvelle tentative avec les certificats système, sans désactiver TLS.

## Preuves de production observées le 12 novembre

Les deux applications Hostinger affichent le commit c7c3763 comme déploiement terminé et actuel. Journaux CMS : Strapi is ready après 2144 à 2275 ms ; arrêt SIGTERM propre sans double destruction. Des connexions MySQL périmées produisent encore des avertissements ECONNRESET, suivis de requêtes réussies ; aucune perte de demande n’a été observée.

Contact réel de test : POST intake 201, PATCH du statut 200 ; référence AGP-9284c642-e5d8-430b-9d49-ec4f072104a6, visible dans le Content Manager avec les données TEST, workflowStatus new, deliveryStatus not_configured et événements received puis not_configured. Les formulaires Partenariat, YIDA-Cashew et Devis ont également affiché la réception positive. AGIR-IA vérifié séparément à 06:11 UTC avec une adresse explicitement de test et le même message de réception. Le dernier contrôle visuel de la demande Ressources et de la liste complète reste à effectuer : la session administrateur a expiré après une interruption.

Contrôles HTTP à la reprise : site et /admin 200, /_health 204. GET /api/inquiries retourne 404 ; POST intake sans token et avec un token invalide retourne 401. Le destinataire a été vérifié dans Hostinger : programsagropulsegs@gmail.com. Les notifications restent en attente de EMAIL_FROM et RESEND_API_KEY. Les demandes identifiées TEST sont conservées pour la preuve et ne sont pas des demandes commerciales.

Le dernier ajustement du lanceur garantit un code de sortie 1 sur erreur fatale, et 0 lors d’un arrêt normal. Les 52 tests et les contrôles statiques ont été relancés après cet ajustement. L’installation locale complète de Strapi n’a pas été menée à terme ; le démarrage réel avec inquiry a été vérifié sur Hostinger/MySQL.

## Activation des notifications — état courant du 12 novembre

Le porteur a ensuite autorisé explicitement les trois ajouts DNS nécessaires à Resend et la création d’une clé limitée à l’envoi. Cette autorisation remplace l’interdiction initiale de modifier les DNS pour ces seuls ajouts : TXT `resend._domainkey`, CNAME `rsend` vers `rsend-euw1.forge.rmta.net`, CNAME `send` vers `send.forge.rmta.net`, TTL 3600. Les enregistrements du site et du CMS ont été conservés. Aucun domaine n’a été acheté ou migré.

Resend confirme le domaine `agropulsegs.org` vérifié, région Irlande. La clé « AgroPulse website notifications » a les droits `Sending access`, limités à ce domaine. Sa valeur est conservée dans la variable Hostinger `RESEND_API_KEY` de l’application publique ; elle ne figure pas dans le dépôt. L’expéditeur `EMAIL_FROM` est `AgroPulse <notifications@agropulsegs.org>` et le destinataire reste `programsagropulsegs@gmail.com`. La configuration a été appliquée et le redéploiement public `01a1cf93-46c3-7046-8ecc-43066cc5cd5e` est terminé.

Deux nouvelles demandes TEST ont été envoyées depuis les formulaires publics :

- Contact : message complet et coordonnées fictives ; confirmation positive affichée ; Resend **Delivered**, message `01a1cf94-986e-76a8-a2f0-ea2a925326d0` ([preuve dans Resend](https://resend.com/emails/01a1cf94-986e-76a8-a2f0-ea2a925326d0)).
- Ressources : adresse fictive et consentement ; confirmation positive affichée ; Resend **Delivered**, message `01a1cf95-754f-7a5c-8851-bb5e68cd00bf` ([preuve dans Resend](https://resend.com/emails/01a1cf95-754f-7a5c-8851-bb5e68cd00bf)).

Les deux notifications ont pour destinataire l’adresse Gmail officielle. `Delivered` confirme la remise au serveur destinataire ; la boîte Gmail elle-même n’a pas été ouverte pour déterminer le dossier de classement. Les journaux d’exécution du CMS montrent les créations `POST /api/inquiries/intake` en 201 et les mises à jour `PATCH /api/inquiries/intake/:documentId` en 200. Les données TEST restent identifiables et conservées. La liste complète dans le Content Manager n’a pas été relue après activation, car sa session administrative demande une authentification ; la preuve antérieure de réception et d’historique reste distincte.

L’activation ne nécessite aucun changement de logique métier : les 52 tests déjà réussis couvrent la sauvegarde prioritaire, l’envoi configuré, l’échec du fournisseur et les mises à jour d’historique. Les nouveaux contrôles sont les deux essais de production ci-dessus. La conservation Strapi précède toujours l’e-mail, et une panne future d’e-mail ne supprime pas la demande enregistrée. Les mentions précédentes « notifications en attente » décrivent les étapes antérieures.

## Correctif de limitation demandé après les essais

Le quota précédent comptait cinq tentatives par adresse de connexion serveur sur quinze minutes, avant validation. Derrière Hostinger ou un CDN, cette adresse peut être celle d’un proxy partagé ; elle ne prouve pas l’identité du visiteur. Le correctif ne fait pas confiance aux en-têtes de transfert fournis par le client.

- Quota normal : cinq demandes distinctes conservées par email validé et normalisé sur quinze minutes. Les erreurs de validation, pièges remplis et échecs de sauvegarde ne le consomment pas. Les identités sont des empreintes SHA-256 avec sel aléatoire par processus.
- Filtre de rafales : soixante requêtes par minute par adresse de connexion serveur avant lecture du corps. Il protège le parseur, mais peut encore limiter temporairement un proxy partagé sous forte rafale ; il ne sert plus d’identité au quota de quinze minutes.
- Déduplication : une demande identique en cours partage le résultat ; les références acceptées sont conservées dix minutes (maximum mille entrées). Un doublon ne déclenche ni nouvelle sauvegarde ni nouvel email dans ce processus. Les demandes simultanées distinctes sont bornées à cent.
- Formulaires actifs et historiques : garde contre les doubles envois, boutons désactivés et état d’attente pendant l’envoi. En cas de 429, attente issue de `Retry-After`/`retryAfter`, arrondie à la minute en FR/EN ; saisies conservées. Le formulaire principal transmet désormais son champ piège caché.

La sauvegarde Strapi avant notification, les contrôles d’origine, le consentement, la validation des champs et la taille maximale de 16 Kio restent obligatoires. Les quotas et la déduplication restent locaux à chaque processus : plusieurs workers ou un redémarrage ne partagent pas ces caches. Ce correctif vise les blocages injustifiés et le spam courant, sans prétendre garantir une unicité distribuée ou arrêter tous les robots.

Validation locale : `npm run build`, génération idempotente, `npm run check` — 64 tests réussis et contrôles statiques réussis. Nouveaux scénarios HTTP : douze emails derrière le même proxy, erreurs/pièges sans consommation du quota normal, email normalisé et en-têtes falsifiés, délai de reprise et expiration, rafale limitée puis reprise, doublons simultanés, reprise après panne du stockage. Tests du code réellement généré et du formulaire historique : doubles clics, attente FR/EN, conservation des champs sur 429 et erreur réseau, libération des contrôles et succès confirmé. Les rafales sont simulées localement, sans charge ni série d’emails en production. Contrôle de production à consigner après déploiement.

### Contrôle de production du correctif

Hostinger affiche le déploiement public `01a1d0aa-38e1-7321-900b-d2e3a794879a` **Terminé / Actuel**, commit `a63d28ba537afe3eed8e097b7c3b213c16bf0400`, à 16:51 UTC. Un formulaire Contact unique, nommé « TEST technique anti-spam AgroPulse », a été envoyé avec des coordonnées fictives et un message explicitement non commercial. Observation réelle : « Envoi en cours… » et bouton désactivé, puis « Votre demande a bien été transmise à AgroPulse. », bouton réactivé et formulaire réinitialisé. Capture locale : `preuves-production-2026-11-12/correctif-antispam-formulaire.png` dans le workspace parent. La garde contre les doubles envois est présente dans le HTML servi. Contrôles HTTP après publication : site 200, CMS `/_health` 204 ; un unique piège de test retourne 202 avec la réponse silencieuse attendue, sans sauvegarde ni notification selon le chemin du code couvert par les tests.

La confirmation du formulaire prouve une réception acceptée par l’API, dont le code exige une sauvegarde préalable. La réponse seule n’établit pas le classement Gmail ni un nouvel état Resend Delivered : l’accès à l’onglet Resend a expiré en délai technique pendant ce contrôle, y compris après tentative de récupération de la fenêtre minimisée. Les preuves Delivered des essais précédents restent distinctes. Aucun test de charge ni série de tentatives valides n’a été exécuté en production.
