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
