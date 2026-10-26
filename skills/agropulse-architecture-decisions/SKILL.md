---
name: agropulse-architecture-decisions
description: Évaluer et consigner les décisions d’architecture AgroPulse quand le CMS, les frontières de données, les services ou l’exploitation évoluent.
---

# Décisions d’architecture AgroPulse

Lire le contexte, le cadrage L3 et les accords récents. Le socle retenu est Next.js, Strapi Community, PostgreSQL, Docker Compose et GitHub Actions ; Express n’est ajouté que pour une responsabilité utile. La reprise des outils Talent-Job ne décide pas de ses frontières de services.

Pour un changement significatif, formuler problème concret, contraintes, options crédibles, choix proposé et conséquences sur données, accès, coûts, charge et réversibilité. Éviter un ADR pour chaque détail réversible d’implémentation.

Ne pas considérer OVHcloud, un dimensionnement ou une estimation mensuelle comme un abonnement souscrit. Vérifier les capacités et licences actuelles du service si elles conditionnent le choix. La présence d’une configuration Decap dans une archive ne remplace pas le cadrage Strapi.

Consigner le statut proposé, accepté, remplacé ou abandonné avec auteur, date et preuve disponible. Un accord général sur le projet ne résout pas toutes les décisions de conservation ou de responsabilité. Enregistrer les questions qui affectent réellement le choix.

Privilégier la solution proportionnée au site institutionnel et aux besoins validés. Ne pas introduire Kubernetes, Kafka, un fournisseur IA ou un découpage microservices sans besoin et arbitrage explicites. Un document de décision n’est pas une autorisation d’achat ou de déploiement.
