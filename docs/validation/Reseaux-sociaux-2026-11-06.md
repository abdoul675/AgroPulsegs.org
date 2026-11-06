# Réseaux sociaux AgroPulse — 6 novembre 2026

Le porteur fournit les destinations Facebook, X et TikTok dans la conversation. Elles sont intégrées au pied de page commun de l’aperçu, en remplacement des icônes inactives. Aucun lien LinkedIn ou YouTube non fourni n’est inventé.

- Facebook : le lien de partage fourni est conservé, car aucune adresse canonique n’a pu être résolue automatiquement.
- X et TikTok : les paramètres de partage sont retirés ; les identifiants des profils sont conservés.
- Chaque lien dispose d’une icône, d’un libellé accessible FR/EN précisant l’ouverture d’un nouvel onglet, d’une cible tactile d’au moins 44 px et d’un focus visible. Les nouveaux onglets sont isolés du site d’origine.
- Les destinations sont définies dans `scripts/social-links.mjs` et conservées lors de la génération. Aucun compte social, contenu CMS ou réglage d’hébergement n’est modifié.

## Vérifications et limites

La génération répétée produit le même HTML. Le navigateur vérifie les trois liens sur Accueil et Contact, en FR/EN et à 375/1440 px : destinations, activation clavier, nouvel onglet, absence d’accès à la fenêtre d’origine, dimensions tactiles et absence de débordement. La preuve JSON associée détaille les quatre configurations et les limites.

Les navigations externes sont interceptées dans le test afin de contrôler les destinations sans effectuer de requêtes aux plateformes. Leur contenu et leur disponibilité effective ne sont pas certifiés : Facebook, X et TikTok empêchent la lecture automatique utilisée ici. Aucun message ni aucune publication n’a été envoyé.

L’aperçu de référence local, arrêté au moment des essais, est relancé sur son port habituel, sans CMS ni messagerie réelle. La génération et les 30 tests du site sont également vérifiés sur une copie contenant seulement les fichiers commités avant le push sur la branche d’intégration.
