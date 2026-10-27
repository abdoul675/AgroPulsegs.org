# Pilote technique AgroPulse

Essai local du 26 octobre 2026, isolé du site statique `public/`. Une expertise fictive, deux langues et trois rôles permettent de vérifier la chaîne PostgreSQL → Strapi → Next.js. Ce dossier n’est pas la version de production du site ni la validation graphique des maquettes.

## Consulter le résultat

- Site du pilote : http://127.0.0.1:3100
- Administration : http://127.0.0.1:1338/admin
- [Compte rendu et limites](../docs/AgroPulse_Pilote_technique_v1.0.md).
- [Preuves automatisées](evidence/) et captures des pages et des trois rôles.

Comptes fictifs : `admin@agropulse.test`, `editor@agropulse.test`, `publisher@agropulse.test`. Les mots de passe correspondants sont les champs `adminPassword`, `editorPassword` et `publisherPassword` du fichier local `pilot/.local/runtime.json`. Ce fichier, la base et les jetons sont exclus de Git. Aucun mot de passe commun n’est fourni dans le dépôt.

## Installation reproductible

Node.js 24 est requis pour reproduire cet essai. Dans PowerShell, depuis la racine du projet :

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm ci --prefix pilot/tools
npm ci --prefix pilot/cms
npm ci --prefix pilot/web
node pilot/tools/runtime.mjs
```

`--use-system-ca` a permis d’utiliser les certificats de confiance de Windows dans cet environnement, sans désactiver la vérification TLS. Les fichiers de verrouillage fixent les dépendances. Si npm demande une approbation pour un script d’installation, examiner le paquet concerné ; aucun contournement global n’est nécessaire pour l’essai vérifié.

Lancer PostgreSQL dans un premier terminal et le laisser ouvert :

```powershell
node pilot/tools/start-database.mjs
```

Dans un deuxième terminal :

```powershell
npm run build --prefix pilot/cms
npm run start --prefix pilot/cms
```

Le premier démarrage crée les comptes fictifs, les rôles, les langues et l’expertise. Il prépare `pilot/web/.env.local`. Les démarrages suivants réutilisent la base et l’identité du document, sans réinitialisation.

Dans un troisième terminal, après le démarrage du CMS :

```powershell
npm run build --prefix pilot/web
npm run start --prefix pilot/web
```

Les trois services écoutent uniquement sur `127.0.0.1` : PostgreSQL 55437, CMS 1338, site 3100. Arrêter chacun avec Ctrl+C et conserver `pilot/.local/` pour retrouver les données. Ne pas supprimer ce dossier pour résoudre un incident.

## Rejouer les contrôles

Les contrôles modifient uniquement l’expertise fictive : ils publient FR/EN, puis laissent une nouvelle révision FR en brouillon avec le texte `BROUILLON_CONFIDENTIEL_PILOTE`. Ils créent aussi un brouillon temporaire, supprimé après son contrôle. Les exécuter exclusivement contre ce pilote.

```powershell
node pilot/tools/test-cms.mjs
node pilot/tools/test-web.mjs
```

Le contrôle navigateur nécessite Playwright et Edge. Dans cette session, Playwright provenait du runtime fourni par Codex ; son chemin a été affecté à `NODE_PATH`. Sur une autre machine, installer la dépendance de test dans `pilot/tools` avant utilisation. Puis :

```powershell
node pilot/tools/test-browser.mjs
```

Les résultats datés sont écrits dans `pilot/evidence/*-tests.json`. `completed: true` indique que la suite s’est terminée ; la présence d’un fichier de résultats seul ne suffit pas. Les captures utilisent exclusivement les données fictives du pilote.

## Observer la prévisualisation

Se connecter comme Éditeur, ouvrir l’expertise FR et utiliser Preview. Le lien signé est limité à ce document et à cinq minutes. La page affiche le brouillon avec une bannière. Le lien « Quitter la prévisualisation » rétablit la version publiée. Une fenêtre privée sans lien autorisé voit toujours le contenu publié.

## Extension des modèles de contenus

Le [lot d’administration des contenus](../docs/AgroPulse_Administration_contenus_v1.0.md) ajoute six modèles et onze composants au premier essai. Les pages, programmes et partenaires fictifs sont disponibles en FR/EN ; une campagne fictive fermée est publiée. Les paramètres et ressources restent en brouillon tant que les médias ne sont pas raccordés. Le premier rapport demeure l’historique du pilote initial.

Les nouveaux schémas sont présents dans le dépôt. Pour les recréer dans une copie neuve du pilote, `node pilot/tools/create-content-models.mjs` les vérifie et refuse d’écraser un fichier existant différent. Ils sont chargés au prochain démarrage de Strapi ; ne pas réinitialiser une base existante.

Après démarrage du CMS :

```powershell
node pilot/tools/test-content-models.mjs
node pilot/tools/test-content-browser.mjs
```

La seconde commande requiert Playwright/Edge, comme la suite navigateur précédente. Les fixtures sont conservées dans le dossier local ignoré. Les nouveaux essais modifient uniquement les contenus fictifs de ce pilote et nettoient le document temporaire du contrôle de concurrence.

Exécuter les contrôles de préparation des contenus avant les contrôles de lecture et de preview, sans les lancer simultanément. Réutiliser les sessions et espacer les relances : Strapi limite nativement les connexions administratives à cinq sur cinq minutes par identité et adresse. Cette protection reste active. Les preuves finales sont `evidence/content-model-tests.json` et `evidence/content-browser-tests.json` avec `completed: true`.

L’import et la modification des médias sont fermés par HTTP dans ce lot. Les dates/état de campagne et la confirmation des partenaires ne sont pas modifiables par l’Éditeur. Les ressources ne sont pas présentées comme téléchargeables sans circuit de fichiers vérifié ; aucune candidature ne peut être déposée.

Une copie locale à froid a été créée avant cette évolution dans `pilot/.local/backups/`. Pour en créer une autre, arrêter d’abord Strapi, puis PostgreSQL proprement avec son outil natif ; `node pilot/tools/checkpoint.mjs` refuse de copier une base dont le fichier de serveur actif est présent. Les copies contiennent les accès locaux et restent exclues de Git. La restauration n’a pas été testée.

Les médias privés, formulaires, Docker et hébergement restent hors de ce lot. L’interface finale conforme aux maquettes reste à intégrer.

## Saisie simple et langues

Les pages proposent le grand titre, l’introduction et le texte principal sans assembler les blocs techniques. Les cartes et boutons existants sont conservés. Le référencement est dérivé des textes quand il n’est pas fourni explicitement. Un brouillon incomplet peut être conservé ; les contrôles de publication restent actifs.

La langue du profil détermine les menus et les libellés personnalisés (français initial, anglais disponible). Le sélecteur de langue du contenu ouvre la version FR ou EN du document : il ne traduit pas automatiquement les textes. Les noms métier de certaines collections et les codes d’énumérations restent ceux du modèle ; cela ne change pas les valeurs enregistrées.

Vérifications complémentaires : `node pilot/tools/test-simple-entry.mjs` (13 assertions) et `node pilot/tools/test-editorial-ui.mjs` (14 assertions, Playwright/Edge requis). Preuves datées dans `pilot/evidence/`, avec `completed: true`. L’essai visuel modifie uniquement la page fictive et remet la préférence de langue à sa valeur initiale.
