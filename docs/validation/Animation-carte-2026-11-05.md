# Animation de la carte régionale — 5 novembre 2026

Le porteur demande une présentation moins ordinaire et animée de l’ancrage. Le composant garde ses informations, ses pays et sa géométrie, avec un habillage plus distinctif : trame légère, compteur des trois pays, bandeau de sélection et mise en valeur de la fiche active.

Seuls le signal lumineux le long de la liaison du pays choisi et son halo de repérage sont animés en continu. Les pays ne changent pas automatiquement. Les positions géographiques restent fixes. Les animations respectent la pause générale du site et prefers-reduced-motion ; la carte reste alors utilisable et lisible sans mouvement. Aucun service externe ni nouvelle dépendance n’est ajouté.

Un ancien blocage universel des animations CSS empêchait le premier essai. Les deux animations demandées ont une autorisation CSS limitée à la carte, uniquement lorsque le mouvement normal est préféré et que la pause générale n’est pas activée. Les autres animations du site ne sont pas réactivées par cette correction.

Le pays sélectionné est conservé en mémoire pour chaque page pendant les réaffichages du contenu CMS. Cette mémoire ne contient qu’un code pays public et n’est pas stockée de manière persistante. Les textes, brouillons et publications existants ne sont pas modifiés.

Huit parcours navigateur réussis sur Accueil et Contact : aperçu de référence FR ordinateur avec mouvement normal ; aperçu CMS EN mobile avec mouvement normal ; aperçu de référence FR mobile en mouvement réduit ; aperçu CMS FR ordinateur en mouvement réduit. Le déplacement réel du signal a été constaté par variation du décalage de trait, la pause et la reprise vérifiées, ainsi que l’absence d’animation en mouvement réduit, la sélection au clavier, le maintien du pays après réaffichage, l’absence de débordement et d’erreur JavaScript. Les polices externes sont bloquées. Résultats dans [Animation-carte-2026-11-05.json](Animation-carte-2026-11-05.json).