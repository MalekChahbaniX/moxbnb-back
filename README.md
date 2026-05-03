# Moxbnb Backend API 🏠

Bienvenue dans le backend de Moxbnb ! Notre plateforme de location, expériences et services en Tunisie.

> **Note pour l'équipe** : Ce backend est le cœur de notre application Moxbnb. Il gère tout ce qui concerne la logique métier, les données, et l'intégration avec nos services externes.

## 🎯 Ce que fait notre backend

Notre backend gère :
- **Gestion des utilisateurs** : Inscription, connexion, profils
- **Logements** : CRUD complet pour les annonces de location
- **Expériences** : Activités et services proposés en Tunisie
- **Réservations** : Gestion complète des bookings
- **Paiements** : Intégration avec les solutions tunisiennes (Konnect, Flouci, Clicktopay) et internationales (Stripe)
- **Notifications** : Emails et communications utilisateurs

## 🛠️ Stack Technique

- **Node.js + TypeScript** : Pour un code robuste et typé
- **Express.js** : Notre framework web principal
- **MongoDB + Mongoose** : Base de données NoSQL flexible
- **JWT** : Authentification sécurisée avec refresh tokens
- **Cloudinary** : Stockage des images et fichiers
- **Redis** : Cache pour les performances
- **Winston** : Logging structuré pour le debugging

## 📁 Structure du Projet

```
src/
├── config/          # Configuration (DB, JWT, Cloudinary, etc.)
├── controllers/     # Logique métier - C'est ici qu'on traite les requêtes
├── middleware/      # Middleware Express (Auth, validation, errors)
├── models/          # Schémas Mongoose pour MongoDB
├── routes/          # Définition des routes API
├── services/        # Services externes (Emails, Paiements, Upload)
├── utils/           # Fonctions utilitaires réutilisables
├── types/           # Types TypeScript personnalisés
└── scripts/         # Scripts de seed et migrations
```

> **Pour l'équipe** : Quand vous ajoutez une nouvelle feature, suivez cette structure !
> - **Model** d'abord dans `models/`
> - **Controller** dans `controllers/`
> - **Route** dans `routes/`
> - **Tests** dans `tests/` (si existant)

## � Démarrage Rapide (Pour l'équipe)

### Prérequis
- Node.js 18+ 
- MongoDB (local ou Docker)
- Redis (optionnel pour le cache)

### Installation

1. **Cloner et installer**
```bash
git clone <repository-url>
cd Moxbnb-Backend
npm install
```

2. **Configuration**
```bash
cp .env.example .env
# Éditez .env avec vos clés API et configurations
```
3. **Lancer le serveur**
```bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm run build
npm start
```

> **Conseil équipe** : Utilisez toujours `npm run dev` pour le développement. Le serveur redémarre automatiquement quand vous modifiez les fichiers !

## � API Endpoints (Guide pratique)

### URLs
- **Développement** : `http://localhost:3000`
- **Production** : `https://api.moxbnb.tn`

### Authentification 🔐
```bash
POST /api/auth/register    # Créer un compte
POST /api/auth/login       # Se connecter
POST /api/auth/logout      # Se déconnecter
GET  /api/auth/me          # Voir son profil
```

### Logements 🏠
```bash
GET    /api/listings           # Tous les logements (avec filtres)
GET    /api/listings/:id       # Détails d'un logement
POST   /api/listings           # Ajouter une annonce (auth requis)
PUT    /api/listings/:id       # Modifier son annonce
DELETE /api/listings/:id       # Supprimer son annonce
```

### Réservations 📅
```bash
GET    /api/bookings           # Mes réservations (auth requis)
POST   /api/bookings           # Créer une réservation
PUT    /api/bookings/:id       # Modifier une réservation
DELETE /api/bookings/:id       # Annuler une réservation
```

### Paiements 💳 (Spécial Tunisie !)
```bash
GET  /api/payments/providers           # Solutions disponibles
POST /api/payments/create-intent       # Initier un paiement
POST /api/payments/confirm             # Confirmer le paiement
GET  /api/payments/history             # Historique
POST /api/payments/webhook/:provider   # Webhooks (Konnect, Flouci, etc.)
```

> **Note équipe** : Tous les endpoints protégés nécessitent un header `Authorization: Bearer <token>`

## �️ Scripts Utiles (Pour tous les jours)

```bash
npm run dev          # Développement - le plus utilisé !
npm run build        # Compile le TypeScript
npm start            # Production
npm test             # Lancer les tests unitaires
npm run lint         # Vérifier la qualité du code
npm run seed         # Remplir la BDD avec des données de test
npm run migrate      # Lancer les migrations BDD
```

> **Pro tip** : Avant chaque commit, faites `npm run lint` pour éviter les erreurs de code !

## 🏗️ Comment c'est architecturé ?

### Pattern MVC (Modèle-Vue-Contrôleur)
- **Models** (`src/models/`) : Schémas de données MongoDB
- **Controllers** (`src/controllers/`) : Logique métier, traitement des requêtes
- **Views** : Réponses JSON (pas de templates, c'est une API)

### Services (La logique complexe)
- **AuthService** : Gestion JWT, refresh tokens
- **EmailService** : Notifications utilisateurs
- **PaymentService** : Intégration paiements tunisiens + Stripe
- **UploadService** : Gestion images/fichiers avec Cloudinary
- **CacheService** : Redis pour les performances

### Middleware (Protection et validation)
- **AuthMiddleware** : Vérifie les tokens JWT
- **ValidationMiddleware** : Valide les données avec Joi
- **ErrorMiddleware** : Gestion centralisée des erreurs
- **RateLimitMiddleware** : Protège contre les abus

## � Sécurité (Super important !)

Notre backend est protégé par :
- **JWT** : Tokens d'accès + refresh tokens pour la sécurité
- **Helmet** : Protège les headers HTTP
- **CORS** : Contrôle d'accès cross-origin
- **Rate Limiting** : Protection contre les attaques
- **Validation Joi** : Validation stricte de toutes les données
- **Bcrypt** : Hashage des mots de passe
- **HTTPS** : Obligatoire en production

> **Note équipe** : Ne jamais désactiver la validation ou l'authentification, même pour les tests !

## � Monitoring & Debugging

Pour surveiller et debugger notre backend :
- **Winston** : Logs structurés (check les logs dans `logs/`)
- **Health Check** : `GET /health` pour vérifier que tout va bien
- **Error Tracking** : Centralisation des erreurs dans les logs
- **Performance** : Temps de réponse monitoring

> **Pour l'équipe** : En cas de problème, vérifiez d'abord les logs Winston !

## 🚀 Déploiement
### Variables d'environnement (.env)

**Obligatoires** (le backend ne démarre pas sans) :
```env
MONGODB_URI=mongodb://localhost:27017/moxbnb
JWT_SECRET=votre_secret_super_long_et_unique
CLOUDINARY_CLOUD_NAME=votre_cloud_name
PORT=3000
NODE_ENV=development
```

**Paiements** (au moins un requis) :
```env
# Stripe (international)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Solutions tunisiennes
KONNECT_API_KEY=votre_api_konnect
FLOUCI_API_KEY=votre_api_flouci  
CLICKTOPAY_API_KEY=votre_api_clicktopay
CLICKTOPAY_MERCHANT_ID=votre_merchant_id
```

**Autres** :
```env
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=votre_email
EMAIL_PASS=votre_password
```

## 👥 Comment contribuer (Guide pour l'équipe)

### Notre workflow
1. **Fork** le projet sur votre GitHub
2. **Créer une branche** : `git checkout -b feature/nouvelle-feature`
3. **Coder** votre feature en suivant la structure du projet
4. **Tester** : `npm test` et `npm run lint`
5. **Commit** : `git commit -m "feat: ajoute nouvelle feature"`
6. **Push** : `git push origin feature/nouvelle-feature`
7. **Pull Request** : Sur la branche principale

### Bonnes pratiques
- Suivez la structure MVC établie
- Commentez votre code (surtout la logique complexe)
- Ajoutez des tests pour vos nouvelles features
- Utilisez des messages de commit clairs
- Ne jamais pusher de secrets API dans le code !

### Support
- **Slack** : #backend-moxbnb pour les questions techniques
- **Code Review** : Toute PR doit être reviewée par au moins 1 autre dev
- **Documentation** : Mettez à jour ce README si vous ajoutez des nouvelles features

## 📝 License

MIT License - voir le fichier `LICENSE`

---

**Made with ❤️ by the Moxbnb Team**
