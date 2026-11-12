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
