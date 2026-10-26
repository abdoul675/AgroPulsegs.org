---
name: agropulse-code-review
description: Revoir un patch ou une pull request AgroPulse par rapport aux exigences, contenus publiables, droits et vérifications pertinentes.
---

# Revue de code AgroPulse

Lire le diff demandé et les sources fonctionnelles ou techniques qui gouvernent les chemins touchés. Le contexte local peut contenir des changements d’autres travaux ; ne pas les attribuer au patch ni les réécrire implicitement.

Chercher d’abord les défauts de comportement, accès, données et régressions : FR/EN, statut de campagne, champs des formulaires, brouillons, relations CMS, cache et confirmations d’envoi. Ne pas traiter un contrôle uniquement côté navigateur comme une règle serveur satisfaite.

Vérifier que l’implémentation suit les rôles AgroPulse et ne réutilise pas le rôle Strapi Editor avec publication. Les jetons restent côté serveur et les médias privés ne deviennent pas publics par le stockage choisi.

Séparer défaut démontrable, hypothèse nécessitant une preuve et suggestion d’amélioration. Chaque constat actionnable précise emplacement, déclencheur, effet utilisateur et correction attendue. Éviter les remarques de style sans impact.

Les tests sont rapportés avec leur exécution réelle et leurs limites. Une revue ne constitue pas un accord éditorial de Mme Hélène Nichy, un audit exhaustif ou une autorisation de fusion. Si aucun défaut actionnable n’est trouvé, le dire et préciser les limites restantes sans inventer de constat.
