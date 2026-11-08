# Audit de sécurité local AgroPulse — 8 novembre 2026

## Périmètre autorisé

Le porteur confirme vouloir tester la sécurité d’AgroPulse. Revue du serveur Node, des formulaires, du pont de contenus publiés et des styles ; essais bornés sur des serveurs locaux isolés avec données fictives ; réévaluation des dépendances CMS. Aucun test sur Hostinger, AWS, un domaine public, une plateforme sociale ou une infrastructure tierce. Aucun message réel envoyé, aucune base CMS ni donnée utilisateur modifiée.

## Défaut reproduit et corrigé : lien public vers un dossier privé

**Nature :** contrôle incomplet du périmètre des fichiers statiques, conditionnel à la présence d’un lien symbolique ou d’une jonction de répertoire dans le dossier public.

Le serveur vérifiait uniquement le chemin lexical. Dans une copie temporaire contenant un fichier privé fictif, un lien de dossier public pointant vers ce fichier permettait sa lecture en HTTP 200. Aucun lien de ce type n’a été trouvé dans le dossier public réel pendant l’inspection ; aucune fuite de donnée réelle ni compromission n’est démontrée.

Le serveur résout maintenant le chemin réel du dossier public et de la cible, refuse toute sortie de cet arbre en HTTP 403, puis lit la cible résolue. Le test couvre aussi un dossier voisin dont le nom commence par « public », afin d’éviter un simple contrôle de préfixe. Un lien vers une ressource restant dans l’arbre public continue de fonctionner. Le serveur reste disponible après les refus.

Référence technique : [résolution des chemins réels, documentation Node.js](https://nodejs.org/api/fs.html#fspromisesrealpathpath-options). Cette protection suppose que les fichiers de déploiement ne sont pas modifiables par un tiers non autorisé ; elle ne constitue pas une protection contre un administrateur local malveillant ni une analyse exhaustive des courses de fichiers.

## Contrôles exécutés

- Suite du site : **33 tests** après ajout de trois régressions : confinement des liens de fichiers, échappement HTML des demandes et refus d’injection dans l’adresse e-mail. Les autres tests couvrent notamment origine, limitation des soumissions, taille, panne d’envoi, champs privés, contenus publiés, styles autorisés, traversées et cibles HTTP malformées.
- Sous-ensemble de sécurité ciblé : **14 tests**, incluant le contrôle séparé des schémas Zod des middlewares installés. Ce total recoupe la suite du site ; il ne doit pas lui être additionné comme 14 tests indépendants supplémentaires.
- **6 scénarios navigateur** : contenus CMS fictifs contenant du balisage exécutable sur YIDA-Cashew, Confidentialité et un pôle, en FR/EN à 1440/375 px. Le balisage reste du texte ; aucun élément injecté ni exécution du témoin n’est observé. Le CMS est simulé dans le navigateur pour ces scénarios.
- **191 fichiers publics suivis** : aucune correspondance exacte avec les valeurs privées de configuration du pilote contrôlées. Ce scan ne constitue pas un audit de tous les secrets possibles ni de tout l’historique Git.
- Les essais de courriels utilisent un fournisseur simulé ; les destinataires sont fixés côté serveur. Aucun envoi réel ou sollicitation massive n’a été effectué.

Les preuves détaillées sont dans le JSON associé et les tests ajoutés au dépôt. La génération et la suite complète sont contrôlées depuis une copie des fichiers commités avant le push.

## Dépendances CMS : alertes toujours présentes

L’audit npm de production aboutit après utilisation des certificats de confiance du système, **sans désactivation de TLS**. Résultat : **29 alertes, dont 0 critique, 5 élevées, 22 modérées et 2 faibles**. Les alertes propagées aux packages consommateurs ne sont pas 29 failles indépendantes.

- Les cinq alertes élevées restent associées à Zod 3 et à leurs consommateurs. Le test isolé confirme que les schémas d’options observés sont évalués au montage des middlewares, pas sur les tableaux reçus dans les requêtes testées. Cela ne corrige pas la dépendance et ne démontre pas l’absence d’autre chemin exploitable. [Avis Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- deepmerge reste signalé ; l’avis consulté indique qu’aucune version corrigée n’est annoncée, même si npm affiche une correction disponible. Ne pas interpréter cette indication comme la preuve d’un correctif compatible. [Avis deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
- Les autres alertes directes concernent Hono, glob, minimatch, React Router et stream-json, avec propagation à Strapi. Le rapport actuel comprend notamment [l’amplification des filtres stream-json](https://github.com/advisories/GHSA-528h-pc64-c93x) et [le parseur JSONC](https://github.com/advisories/GHSA-hqr4-qq8f-hg3x), en plus de l’avis de pollution de prototype déjà documenté.

Aucun `audit fix --force`, changement majeur, déclassement de Strapi ni mise à jour non vérifiée n’est appliqué. Les indications npm proposent notamment un retour à Strapi 4 ou un changement majeur de routeur, qui ne sont pas des correctifs compatibles à imposer au pilote actuel. Les dépendances sont inchangées.

## Contrôles non exécutés et suite nécessaire

Le CMS local est arrêté : connexions réelles Éditeur/Publieur, refus direct des brouillons, CORS de l’instance et accès authentifiés **non revérifiés dans cette session**. Les tests historiques ne sont pas présentés comme réexécutés. Les suites qui créent ou republient les données fictives n’ont pas été lancées pour préserver les contenus du porteur.

Il reste à vérifier ces parcours sur une instance de recette isolée, puis l’environnement réellement retenu : HTTPS, accès à l’administration, isolation de la base, secrets, sauvegarde/restauration et courriel reçu. Le CMS ne doit pas être déclaré prêt à une exposition publique sur la seule base de cet audit local et du nombre d’alertes critiques nul. Aucune conclusion de conformité générale ou d’absence de toute vulnérabilité n’est formulée.
