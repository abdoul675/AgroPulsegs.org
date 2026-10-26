---
name: agropulse-security-review
description: Examiner un parcours ou changement AgroPulse pour vérifier ses accès, secrets, données privées et frontières de publication.
---

# Revue de sécurité AgroPulse

Définir le périmètre réel et les exigences concernées à partir du contexte et du code courant. Prioriser les chemins exploitables ou fuites démontrables ; ne pas annoncer une conformité générale à partir d’une revue limitée.

Vérifier la séparation administration, lecture publiée, preview et soumissions. Contrôler les droits serveur des rôles AgroPulse et les appels directs, y compris publication, ouverture de campagne et lecture de brouillons. Un rôle nommé correctement ne prouve pas ses permissions.

Examiner les jetons dans bundles, logs, configuration, historique modifié et réponses. Les secrets restent côté serveur et hors dépôt ; rapporter une éventuelle valeur sensible sans la recopier. Les erreurs n’exposent pas le corps privé d’une demande.

Contrôler la sérialisation des champs et relations Strapi, le cache de preview et les URL de médias. Un champ caché dans l’admin et le statut brouillon ne garantissent pas une confidentialité du fichier ou de la réponse.

Pour les formulaires et téléversements, examiner validation serveur, abus, doublons, taille et formats selon les limites retenues. Ne pas inventer une collecte, une durée ou une base juridique ; signaler l’arbitrage compétent nécessaire.

Chaque constat indique prérequis, fichier ou route, scénario, impact et correction testable. Limiter les essais à des environnements autorisés et des données fictives ; une demande de revue ne vaut pas autorisation d’attaquer une infrastructure tierce.
