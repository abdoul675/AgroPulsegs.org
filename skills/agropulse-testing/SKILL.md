---
name: agropulse-testing
description: Préparer ou exécuter les tests AgroPulse et relier leurs preuves aux parcours, droits CMS et critères de réception.
---

# Tests AgroPulse

Lire les exigences et critères actuels dans `docs/README.md`, notamment AC01–AC11 et les scénarios MC du modèle Strapi. Choisir les contrôles adaptés au changement et aux risques observables ; ne pas créer des tests qui reproduisent uniquement la structure du code.

Distinguer scénario prévu, contrôle exécuté, résultat et preuve. Consigner environnement, versions, commande ou action, données fictives et limite. Un critère présent dans un document n’est pas un test passé.

Pour le pilote CMS, vérifier brouillon FR/EN, impossibilité de publier pour l’Éditeur, publication par le rôle autorisé et refus des brouillons au public. Tester aussi les appels directs, les relations et les médias ; le masquage d’un bouton ne suffit pas.

Pour les formulaires, couvrir validation, échec de service, reprise sans perte de saisie et absence de fausse confirmation. Les essais d’envoi utilisent une boîte de test et l’autorisation nécessaire, jamais des destinataires clients implicites.

Les contrôles responsive portent sur les largeurs définies dans le cahier des charges et sur les interactions. Noter si polices externes, réseau ou animations sont désactivés. Ne pas transformer un contrôle de débordement en audit d’accessibilité ou de performance.

Arrêter les répétitions quand le périmètre est vérifié sans nouvelle modification ou anomalie. Rapporter séparément les échecs produit et les blocages d’environnement. Ne pas lancer des tests destructifs sur des données persistantes ou une production non autorisée.
