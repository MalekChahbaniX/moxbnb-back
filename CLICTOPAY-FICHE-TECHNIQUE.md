# Document 2 : Fiche Technique — ClicToPay

> **Brouillon à compléter et faire valider par la banque.** Les champs marqués
> « À compléter » ne sont pas établis dans le code. Les URLs marquées
> « proposées, à confirmer » ne doivent pas être transmises comme opérationnelles :
> le webhook ClickToPay et les pages de retour doivent encore être implémentés
> et testés avec la documentation officielle de la banque.

## 1. Renseignements sur le commerçant

- **Numéro Affilié :** À obtenir auprès de la banque
- **Raison sociale :** À compléter selon les documents légaux de l'entreprise
- **Banque :** À compléter
- **Nom et prénom du Webmaster :** À compléter
- **Email du web master :** À compléter

## 2. Informations sur le site Web du commerçant utilisateur de ClicToPay

- **Système d'exploitation du site web :** Linux — hébergement Render prévu dans la configuration du backend ; version exacte de l'OS à confirmer auprès de l'hébergeur
- **URL du serveur web du commerçant :** À confirmer avec le commerçant. L'API de production configurée dans l'application mobile utilise `https://api.moxbnb.com` ; cela ne confirme pas l'URL publique du site Web.
- **E-mail de notification des autorisations accordées :** À compléter avec l'adresse de contact désignée pour recevoir les notifications de la banque
- **URL de notification :** `https://api.moxbnb.com/api/payments/webhook/clicktopay` — **proposée, à confirmer et à activer** après implémentation du webhook suivant les spécifications de la banque
- **URL de retour par défaut si le paiement est accepté :** `https://moxbnb.com/payment/success` — **à confirmer et à implémenter** ; remplacer le domaine par l'URL publique officielle du site
- **URL de retour par défaut si le paiement est refusé ou un problème a eu lieu :** `https://moxbnb.com/payment/cancel` — **à confirmer et à implémenter** ; remplacer le domaine par l'URL publique officielle du site

### Options de sécurité

À faire confirmer par la banque. Le code du projet ne permet pas de déterminer
si le 3-D Secure est activé, obligatoire ou géré automatiquement par la page de
paiement ClickToPay.

- [ ] 3DSecure Pour carte Nationale Obligatoire
- [ ] 3DSecure Pour carte Internationale Obligatoire

## Informations à obtenir avant l'envoi à la banque

1. Numéro affilié attribué par la banque et confirmation de l'identifiant commerçant.
2. Raison sociale légale et coordonnées du webmaster.
3. URL publique officielle du site Web et adresse e-mail de contact.
4. Confirmation de l'URL publique du backend et de son hébergement/OS.
5. Spécifications officielles ClickToPay : environnement de test et de production,
   URL de notification, mécanisme d'authentification, format des retours et
   exigences 3-D Secure.
6. Mise en place et tests du webhook et des pages de retour avant de déclarer
   ces URLs actives.
