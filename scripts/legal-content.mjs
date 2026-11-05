const l=(fr,en)=>({fr,en});
const group=(fr,en,paragraphs,bullets=[])=>({title:l(fr,en),text:paragraphs.map(([fr,en])=>l(fr,en)),bullets:bullets.map(([fr,en])=>l(fr,en)),meta:[],points:[]});

// Editorial draft: no invented legal identity, provider, retention period or approval.
export function improveLegalPages(pages){
 const legal=pages['mentions-legales'],privacy=pages.confidentialite;
 for(const page of [legal,privacy]){
  page.noticker=true;page.nosub=true;
  page.hero.notice=l('Version préparatoire · informations à compléter','Draft pending legal review');
  page.hero.aside=[l('Informations officielles à confirmer','Official details to be confirmed'),l('Contenu révisé le 5 novembre 2026','Content revised on 5 November 2026')];
  page.hero.ctas=[];page.hero.scene='';page.hero.image='';page.hero.variant='';
  page.sections=[{id:'s1',type:'legal',title:l('',''),lead:[],groups:[],ctas:[],meta:[]}];
 }
 legal.title=legal.hero.title=l('Mentions légales','Legal notice');
 legal.hero.eyebrow=l('À propos de ce site','About this website');
 legal.hero.lead=[l('Qui présente ce site, qui en est responsable et quelles informations restent à préciser avant sa mise en ligne.','Who presents this website, who is responsible for it and which details still need to be provided before launch.')];
 legal.sections[0].groups=[
  group('Éditeur du site','Website publisher',[
   ['Ce site présente les activités et les initiatives d’AgroPulse Global Solutions. Ce nom ne remplace pas les informations d’identification juridique de l’éditeur.','This website presents the activities and initiatives of AgroPulse Global Solutions. This name does not replace the publisher’s legal identification details.'],
  ],[['À renseigner : dénomination juridique, forme juridique et numéro d’immatriculation applicable.','To be provided: legal name, legal form and applicable registration number.'],['À renseigner : adresse officielle, e-mail public et téléphone.','To be provided: official address, public email and telephone number.']]),
  group('Responsable de publication','Publication manager',[
   ['La personne responsable des contenus publiés doit être désignée par AgroPulse. Aucun nom n’est attribué automatiquement à cette fonction.','AgroPulse must designate the person responsible for published content. No person is automatically assigned to this role.'],
   ['À renseigner : nom, fonction et moyen de contact du responsable de publication.','To be provided: the publication manager’s name, role and contact details.'],
  ]),
  group('Hébergement et domaine','Hosting and domain',[
   ['Le nom de domaine et l’hébergement ne sont pas encore achetés. L’aperçu actuel fonctionne en local ; il ne constitue pas un hébergement public de production.','The domain name and hosting have not yet been purchased. The current preview runs locally and is not public production hosting.'],
   ['À renseigner après le choix de l’offre : raison sociale, adresse et contact de l’hébergeur, ainsi que le domaine officiel du site.','Once a provider has been selected, provide its legal name, address and contact details, together with the website’s official domain.'],
  ]),
  group('Contenus, images et réutilisation','Content, images and reuse',[
   ['Les textes et les illustrations présentent les services et les programmes d’AgroPulse. Les visuels d’illustration ne constituent pas des photographies attestant d’une formation ou d’un résultat.','Texts and illustrations present AgroPulse’s services and programmes. Illustrative images are not photographs establishing that a training session or outcome occurred.'],
   ['Les marques, logos et contenus de tiers restent soumis aux droits de leurs titulaires. Pour une réutilisation, les autorisations nécessaires doivent être vérifiées auprès des ayants droit.','Third-party brands, logos and content remain subject to their owners’ rights. Any reuse requires checking the necessary permissions with the rights holders.'],
  ]),
  group('Informations sur les programmes','Programme information',[
   ['Les objectifs annoncés sont distingués des réalisations documentées. Une présentation de programme ne constitue ni une ouverture de candidatures, ni une garantie d’emploi ou de financement.','Announced targets are distinguished from documented achievements. A programme presentation does not constitute an open application round or a guarantee of employment or funding.'],
   ['Les candidatures YIDA-Cashew restent fermées. Les formulaires de renseignements servent à contacter AgroPulse ; ils ne valent pas inscription à une formation.','YIDA-Cashew applications remain closed. Information-request forms are for contacting AgroPulse and do not constitute training registration.'],
  ]),
  group('Contact et données personnelles','Contact and personal data',[
   ['La page Contact rassemble les moyens de transmettre une demande générale, de partenariat, de formation ou de devis. L’envoi réel dépend de la configuration du service de messagerie.','The Contact page brings together general, partnership, training and quote enquiries. Actual delivery depends on the email service being configured.'],
   ['La politique de confidentialité explique les données demandées et les modalités restant à compléter. Ces mentions devront être complétées et validées avant la mise en ligne.','The privacy policy explains which information is requested and which arrangements remain to be completed. This notice must be completed and reviewed before launch.'],
  ]),
 ];
 privacy.title=privacy.hero.title=l('Politique de confidentialité','Privacy policy');
 privacy.hero.eyebrow=l('Vos informations, en clair','Your information, explained');
 privacy.hero.lead=[l('Comprendre les informations demandées lorsque vous contactez AgroPulse, leur utilisation et les modalités de vos droits.','Understand the information requested when you contact AgroPulse, how it is used and how your rights can be exercised.')];
 privacy.sections[0].groups=[
  group('Qui est responsable de vos données ?','Who is responsible for your data?',[
   ['AgroPulse Global Solutions présente ce site. L’entité juridique responsable du traitement et son adresse de contact pour les données personnelles doivent encore être confirmées.','AgroPulse Global Solutions presents this website. The legal entity responsible for processing and its personal-data contact address still need to be confirmed.'],
   ['À renseigner avant la mise en ligne : identité, adresse et e-mail du responsable du traitement.','Before launch, provide the data controller’s identity, address and email.'],
  ]),
  group('Quelles informations sont demandées ?','What information is requested?',[
   ['Les champs affichés varient selon le formulaire. Ils peuvent comprendre votre nom, votre adresse e-mail, votre organisation, l’objet de votre demande et votre message. Les champs obligatoires sont signalés.','Displayed fields vary by form. They may include your name, email, organisation, enquiry topic and message. Required fields are marked.'],
   ['Les demandes courtes de renseignements sur les programmes utilisent une adresse e-mail et une case de consentement. Ne transmettez pas de mot de passe, de pièce d’identité ou d’information sensible dans un message.','Short programme information requests use an email address and a consent checkbox. Do not include passwords, identity documents or sensitive information in a message.'],
  ]),
  group('À quoi servent ces informations ?','What is this information used for?',[
   ['Les formulaires servent à recevoir et traiter votre demande de contact, de partenariat, de formation, de devis ou de renseignements sur les ressources, puis à permettre à AgroPulse de vous répondre.','Forms are used to receive and handle contact, partnership, training, quote and resource enquiries, allowing AgroPulse to respond.'],
   ['La base juridique de chaque traitement doit être précisée avant la mise en ligne. La case de consentement du formulaire ne vaut ni inscription à une formation ni autorisation générale pour d’autres usages.','The legal basis for each processing activity must be specified before launch. The form’s consent checkbox is neither training registration nor general permission for other uses.'],
  ]),
  group('Qui reçoit les demandes ?','Who receives enquiries?',[
   ['Lorsque l’envoi est configuré, les formulaires transmettent la demande au service d’envoi de courriels, puis à l’adresse destinataire choisie par AgroPulse. Le CMS sert à administrer les contenus ; il ne fournit pas de boîte de réception des messages.','Once configured, forms send the enquiry through the email delivery service to the recipient address selected by AgroPulse. The CMS manages website content and does not provide an enquiry inbox.'],
   ['À préciser : destinataires habilités, prestataires, lieux de traitement et éventuels transferts internationaux. Le service d’envoi et l’hébergement définitifs ne sont pas encore choisis.','To be specified: authorised recipients, providers, processing locations and any international transfers. The final email service and hosting provider have not yet been selected.'],
  ]),
  group('Combien de temps sont-elles conservées ?','How long is information kept?',[
   ['Le serveur du site ne crée pas de dossier de demande dans le CMS. Une fois reçus, les messages peuvent être conservés dans la messagerie destinataire et par les services impliqués dans leur transmission.','The website server does not create an enquiry record in the CMS. Once received, messages may be retained in the recipient mailbox and by services involved in delivery.'],
   ['Les durées de conservation et les règles de suppression des messages, journaux techniques et sauvegardes doivent être fixées et indiquées avant la mise en ligne. Aucune durée définitive n’est annoncée dans cette version.','Retention periods and deletion rules for messages, technical logs and backups must be set and stated before launch. This draft does not announce a final retention period.'],
  ]),
  group('Stockage local et outils de mesure','Local storage and measurement tools',[
   ['Le jeu pédagogique peut mémoriser votre meilleur score sur votre appareil. Ce stockage local peut être effacé dans les réglages de votre navigateur.','The educational game may remember your best score on your device. This local storage can be cleared through your browser settings.'],
   ['Aucun outil publicitaire ni outil de mesure d’audience n’est intégré à la version actuelle. Tout ajout devra être décrit et ses conditions d’activation vérifiées avant utilisation. Les connexions à l’administration du CMS sont distinctes de la navigation publique.','No advertising or audience-measurement tool is integrated into the current version. Any addition must be described and its activation conditions checked before use. CMS administration logins are separate from public browsing.'],
  ]),
  group('Quels sont vos droits ?','What rights do you have?',[
   ['Selon les conditions prévues par la réglementation applicable, vous pouvez demander l’accès à vos données, leur rectification ou leur suppression, et vous opposer à certains traitements. Une demande doit permettre de vous identifier sans transmettre de documents inutiles.','Subject to the conditions of applicable law, you may request access to, correction or deletion of your data and object to certain processing. A request should allow your identity to be established without sending unnecessary documents.'],
   ['Le contact dédié à l’exercice de ces droits doit encore être fourni. Il devra être accessible avant l’activation des formulaires en production.','The dedicated contact for exercising these rights still needs to be provided. It must be available before production forms are activated.'],
  ]),
  group('Version et mises à jour','Version and updates',[
   ['Cette version préparatoire décrit le fonctionnement actuel et les informations restant à confirmer. Elle ne vaut pas validation juridique. La politique devra être actualisée après le choix des prestataires et avant la mise en ligne.','This draft describes current functionality and details still to be confirmed. It does not constitute legal approval. The policy must be updated after providers are selected and before launch.'],
  ]),
 ];
}
