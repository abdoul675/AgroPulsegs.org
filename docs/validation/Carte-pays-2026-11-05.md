# Carte des pays d’intervention — 5 novembre 2026

Demande du porteur : remettre la carte d’Afrique en Contact et proposer sa présence sur l’accueil. Les trois pays retenus restent Côte d’Ivoire, Sénégal et Guinée-Bissau. La carte est distincte du globe des partenaires et réutilise les tracés et points projetés de la maquette existante.

## Comportement

- Contact : section « Retrouvez nos pays d’intervention » avant le formulaire, carte complète et trois fiches de contact.
- Accueil : section « Un ancrage régional, des liens de proximité », version plus compacte avant le globe des partenaires.
- Les trois pays sont en vert ; le pays sélectionné reçoit un contraste renforcé. La sélection fonctionne par pays dessiné, repère ou fiche. Les boutons natifs sont utilisables au clavier avec un focus visible et aria-pressed.
- Le bouton de Contact atteint le formulaire ; celui de l’accueil ouvre Contact. Aucun envoi n’est déclenché et aucune donnée personnelle n’est ajoutée au formulaire.
- Les titres et textes des fiches sont accessibles dans Pilotage visuel via la section pays-intervention. Les trois pays et leur géométrie restent définis dans le code. Les cartes rejoignent les sélecteurs de styles et de réorganisation existants. Aucun contenu déjà enregistré dans le CMS n’est écrasé.

Les informations connues indiquent les pays d’intervention, pas des adresses de bureaux ou un historique de réalisations par pays. Les textes invitent donc à présenter un besoin ; ils n’inventent pas de projet réalisé. Le porteur pourra compléter des actions concrètes validées dans le CMS.

## Vérifications exécutées

30 tests du site et contrôles des pages réussis. La génération répétée donne un HTML identique. Huit parcours navigateur ont réussi : Contact et Accueil, sur les aperçus 4191 et 4188, français à 1440 px et anglais à 375 px. Contrôles : trois repères, tracés existants, sélection au clic et au clavier, contraste de l’état choisi, indépendance du globe, destinations du bouton, absence de débordement et d’erreur JavaScript. Les polices externes sont bloquées et le mouvement réduit activé. L’essai attend la stabilisation après lecture asynchrone des contenus du CMS. Ces vérifications ne constituent pas un audit exhaustif d’accessibilité.

Le résultat synthétique est dans [Carte-pays-2026-11-05.json](Carte-pays-2026-11-05.json). Les travaux documentaires préexistants restent hors du commit.