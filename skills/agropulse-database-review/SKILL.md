---
name: agropulse-database-review
description: Examiner les schémas PostgreSQL, migrations et opérations de données AgroPulse dans leur relation avec Strapi et les règles métier.
---

# Données PostgreSQL AgroPulse

Lire la version du modèle, les versions Strapi et PostgreSQL et le schéma réellement présent. Les JSON de conception ne constituent pas des migrations. Utiliser les mécanismes de schéma supportés par la version CMS avant de modifier directement ses tables internes.

Vérifier identités métier, documentId, locales, relations et statuts de publication. Une unicité de code appliquée naïvement à chaque traduction peut bloquer FR/EN ; définir et tester l’invariant au niveau approprié.

Séparer contenus publics et dossiers privés. Le navigateur n’accède pas directement à PostgreSQL. Si la conservation de demandes n’est pas décidée, ne pas créer un stockage définitif ou une durée arbitraire par convenance technique.

Avant migration, établir la portée, les données existantes, la sauvegarde et la reprise. Ne pas supprimer une base ou réinitialiser un volume pour résoudre un échec. Le retour à une ancienne image ne garantit pas le retour à un ancien schéma.

Pour une opération sensible, estimer verrouillages, volume, cohérence et compatibilité des versions. Les requêtes sont paramétrées ; les logs et fixtures ne contiennent pas de dossiers client réels.

Rapporter contrôles réalisés et essai de restauration s’il a eu lieu. Une sauvegarde créée mais non restaurée n’est pas une preuve de reprise. N’exécuter les opérations que dans l’environnement couvert par la demande.
