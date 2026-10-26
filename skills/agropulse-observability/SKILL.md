---
name: agropulse-observability
description: Concevoir ou vérifier les logs, contrôles de santé et alertes utiles à l’exploitation du site AgroPulse.
---

# Observabilité AgroPulse

Partir des parcours réellement activés et des responsabilités d’exploitation. Prioriser disponibilité du site et du CMS, réception des demandes, erreurs de services et réussite des sauvegardes. Ne pas déployer une plateforme de télémétrie disproportionnée au besoin sans décision.

Ne pas journaliser noms, courriels, motivations, messages, jetons ou pièces de candidature. Utiliser des identifiants de corrélation non sensibles et des codes d’erreur utiles ; préserver le lien diagnostic sans recopier les corps privés.

Distinguer processus vivant, service prêt et dépendance dégradée. Un contrôle de santé ne doit pas déclencher de courriel réel ni créer une candidature. Un CMS accessible ne prouve pas que le formulaire fonctionne.

Définir le destinataire et l’action attendue de chaque alerte. Les objectifs de disponibilité, délai d’intervention et rétention des logs doivent venir du cadrage, pas d’une valeur implicite du fournisseur.

Pour les courriels, distinguer acceptation de l’API, livraison et rebond quand ces événements sont disponibles. Pour les sauvegardes, suivre date, portée et essai de restauration ; une tâche planifiée n’est pas une sauvegarde réussie.

Vérifier le signal avec un scénario contrôlé et documenter les limites. Ne pas installer de suivi marketing ou collecte non essentielle sous prétexte d’observabilité technique.
