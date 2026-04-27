# Moxbnb Backend API

Backend API pour la plateforme Moxbnb - Location, expériences et services en Tunisie.

## 🚀 Features

- **Architecture Scalable** : Node.js + TypeScript + Express
- **Base de données** : MongoDB avec Mongoose ODM
- **Authentification** : JWT avec refresh tokens
- **Upload de fichiers** : Cloudinary
- **Paiements** : Multi-fournisseurs (Stripe, Konnect, Flouci, Clicktopay)
- **Emails** : Nodemailer
- **Cache** : Redis
- **Logging** : Winston
- **Validation** : Joi
- **Rate Limiting** : Express-rate-limit
- **Sécurité** : Helmet, CORS, Compression

## 📁 Structure du Projet

```
src/
├── config/          # Configuration de l'application
├── controllers/     # Logique métier
├── middleware/      # Middleware Express
├── models/          # Modèles Mongoose
├── routes/          # Routes API
├── services/        # Services externes
├── utils/           # Utilitaires
├── types/           # Types TypeScript
└── scripts/         # Scripts (seed, migrations)
```

## 🛠️ Installation

1. Cloner le projet
```bash
git clone <repository-url>
cd Moxbnb-Backend
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. Démarrer MongoDB
```bash
# Avec Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Ou installer MongoDB localement
sudo systemctl start mongod
```

5. Démarrer le serveur
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 📚 Documentation API

### Base URL
- Développement : `http://localhost:3000`
- Production : `https://api.moxbnb.tn`

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur

#### Logements
- `GET /api/listings` - Liste des logements
- `GET /api/listings/:id` - Détails d'un logement
- `POST /api/listings` - Créer un logement
- `PUT /api/listings/:id` - Modifier un logement
- `DELETE /api/listings/:id` - Supprimer un logement

#### Expériences
- `GET /api/experiences` - Liste des expériences
- `GET /api/experiences/:id` - Détails d'une expérience
- `POST /api/experiences` - Créer une expérience
- `PUT /api/experiences/:id` - Modifier une expérience

#### Services
- `GET /api/services` - Liste des services
- `GET /api/services/:id` - Détails d'un service
- `POST /api/services` - Créer un service
- `PUT /api/services/:id` - Modifier un service

#### Réservations
- `GET /api/bookings` - Liste des réservations
- `POST /api/bookings` - Créer une réservation
- `PUT /api/bookings/:id` - Modifier une réservation
- `DELETE /api/bookings/:id` - Annuler une réservation

#### Paiements
- `GET /api/payments/providers` - Liste des fournisseurs de paiement disponibles
- `POST /api/payments/create-intent` - Créer une intention de paiement (Stripe/Konnect/Flouci/Clicktopay)
- `POST /api/payments/confirm` - Confirmer un paiement
- `GET /api/payments/history` - Historique des paiements
- `GET /api/payments/booking/:bookingId` - Détails d'un paiement
- `POST /api/payments/refund` - Remboursement (admin)
- `POST /api/payments/webhook/:provider` - Webhook pour les fournisseurs

## 🔧 Scripts Disponibles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer en production
- `npm test` - Lancer les tests
- `npm run lint` - Linter le code
- `npm run seed` - Peupler la base de données

## 🏗️ Architecture

### Pattern MVC
- **Models** : Schémas Mongoose
- **Views** : Réponses JSON
- **Controllers** : Logique métier

### Services
- **AuthService** : Gestion authentification
- **EmailService** : Envoi d'emails
- **PaymentService** : Intégration multi-fournisseurs (Stripe, Konnect, Flouci, Clicktopay)
- **UploadService** : Gestion fichiers
- **CacheService** : Gestion Redis

### Middleware
- **AuthMiddleware** : Vérification JWT
- **ValidationMiddleware** : Validation Joi
- **ErrorMiddleware** : Gestion erreurs
- **RateLimitMiddleware** : Limitation requêtes

## 🛡️ Sécurité

- **JWT** : Tokens d'accès et refresh
- **Helmet** : Sécurisation headers HTTP
- **CORS** : Configuration cross-origin
- **Rate Limiting** : Protection contre abus
- **Input Validation** : Validation stricte
- **Password Hashing** : Bcrypt
- **HTTPS** : En production

## 📊 Monitoring

- **Winston** : Logs structurés
- **Health Check** : Endpoint `/health`
- **Error Tracking** : Centralisation erreurs
- **Performance** : Temps de réponse

## 🚀 Déploiement

### Docker
```bash
docker build -t moxbnb-backend .
docker run -p 3000:3000 moxbnb-backend
```

### Environment Variables
Variables requises :
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`

Variables de paiement (optionnelles - au moins une requise) :
- `STRIPE_SECRET_KEY` - Pour Stripe
- `STRIPE_PUBLISHABLE_KEY` - Pour Stripe
- `STRIPE_WEBHOOK_SECRET` - Pour Stripe webhooks
- `KONNECT_API_KEY` - Pour Konnect (Tunisie)
- `KONNECT_BASE_URL` - URL API Konnect (défaut: https://api.konnect.tn)
- `FLOUCI_API_KEY` - Pour Flouci (Tunisie)
- `FLOUCI_BASE_URL` - URL API Flouci (défaut: https://api.flouci.com)
- `CLICKTOPAY_API_KEY` - Pour Clicktopay (Tunisie)
- `CLICKTOPAY_MERCHANT_ID` - ID marchand Clicktopay
- `CLICKTOPAY_BASE_URL` - URL API Clicktopay (défaut: https://api.clicktopay.tn)
- `FRONTEND_URL` - URL frontend pour les redirections de paiement

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Créer une Pull Request

## 📝 License

MIT License - voir le fichier LICENSE
