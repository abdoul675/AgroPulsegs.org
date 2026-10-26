---
name: agropulse-api-design
description: Définir ou revoir les contrats API AgroPulse pour les contenus, formulaires, campagnes et intégrations serveur.
---

# Contrats API AgroPulse

Partir des parcours et règles du cahier des charges courant, puis lire le modèle Strapi et les droits. Distinguer API d’administration, lecture éditoriale, preview et soumission de demandes ; un même jeton ne reçoit pas tous ces accès.

Décrire champs requis et facultatifs, formats, erreurs, autorisations, résultat de succès et conditions d’indisponibilité. Contact et devis ont des champs différents. La V1 des candidatures n’impose ni CV ni exigences académiques ajoutées par une maquette.

Ne pas utiliser les routes de création publiques du CMS comme substitut implicite à une API de formulaire. Valider côté serveur, limiter les données et les envois, traiter les doublons et erreurs de prestataire. Distinguer acceptation technique d’une demande et livraison effective dans la boîte cible.

Le dépôt Fellowship vérifie campagne publiée, état, dates et prérequis opérationnels sur l’horloge serveur. La fermeture doit s’appliquer aux appels directs. Les corps de réponse n’exposent ni données d’autres candidats ni configuration interne.

Limiter explicitement champs, relations et statuts des lectures ; examiner les paramètres de filtre et populate plutôt que transmettre une requête arbitraire vers Strapi. Décrire la stratégie de compatibilité si une URL ou un champ existant change.

Livrer un contrat et des cas observables rattachés aux exigences. Les exemples utilisent des données fictives. Toute nouvelle collecte ou finalité reste un arbitrage métier, pas une décision de contrat technique.
