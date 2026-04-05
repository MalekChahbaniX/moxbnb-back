# Scripts de Seed pour MongoDB

Ce dossier contient des scripts pour peupler votre base de données MongoDB avec les données des fichiers mock.

## Fichiers de seed disponibles

### 1. `seed-users.ts`
- **Source**: `Moxbnb-App/bnb/src/mocks/users.json`
- **Contenu**: 8 utilisateurs avec différents rôles (HOST, GUEST, PROVIDER)
- **Usage**: `npm run seed:users` ou `npx ts-node scripts/seed-users.ts`

### 2. `seed-listings.ts`
- **Source**: `Moxbnb-App/bnb/src/mocks/listings.json`
- **Contenu**: 5 logements (appartements, villas, chambres, cabanes)
- **Usage**: `npm run seed:listings` ou `npx ts-node scripts/seed-listings.ts`

### 3. `seed-experiences.ts`
- **Source**: `Moxbnb-App/bnb/src/mocks/experiences.json`
- **Contenu**: 5 expériences (gastronomie, poterie, randonnée, cuisine, plongée)
- **Usage**: `npm run seed:experiences` ou `npx ts-node scripts/seed-experiences.ts`

### 4. `seed-services.ts`
- **Source**: `Moxbnb-App/bnb/src/mocks/services.json`
- **Contenu**: 6 services (chef privé, massage, coach sportif, photographe, traiteur, coiffeur)
- **Usage**: `npm run seed:services` ou `npx ts-node scripts/seed-services.ts`

### 5. `seed-mongodb.ts` (existant)
- **Contenu**: Script de seed complet avec toutes les données
- **Usage**: `npm run seed` ou `npx ts-node scripts/seed-mongodb.ts`

## Comment utiliser les scripts

### Installation des dépendances
```bash
npm install
```

### Exécuter un script spécifique
```bash
# Pour les utilisateurs
npx ts-node scripts/seed-users.ts

# Pour les logements
npx ts-node scripts/seed-listings.ts

# Pour les expériences
npx ts-node scripts/seed-experiences.ts

# Pour les services
npx ts-node scripts/seed-services.ts
```

### Exécuter tous les scripts en séquence
```bash
# 1. D'abord les utilisateurs
npx ts-node scripts/seed-users.ts

# 2. Ensuite les logements
npx ts-node scripts/seed-listings.ts

# 3. Puis les expériences
npx ts-node scripts/seed-experiences.ts

# 4. Enfin les services
npx ts-node scripts/seed-services.ts
```

## Structure des données

### Users
- **Rôles**: HOST (hôte), GUEST (invité), PROVIDER (prestataire)
- **Champs**: nom, email, mot de passe, avatar, téléphone, préférences, statistiques

### Listings
- **Types**: apartment, villa, room, cabin
- **Champs**: titre, description, localisation, prix, capacité, équipements, règles

### Experiences
- **Catégories**: food, workshop, adventure, cooking, sport
- **Champs**: titre, description, localisation, prix, durée, capacité, difficulté

### Services
- **Catégories**: cuisine, wellness, sport, photography, catering, beauty
- **Champs**: titre, description, localisation, prix, durée, capacité, prérequis

## Configuration MongoDB

Les scripts utilisent la chaîne de connexion MongoDB suivante:
```
mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/
```

## Notes importantes

1. **Ordre d'exécution**: Exécutez d'abord `seed-users.ts` car les autres collections peuvent avoir des références aux utilisateurs
2. **Nettoyage**: Chaque script supprime d'abord les données existantes de sa collection
3. **Validation**: Les données sont validées selon les schémas Mongoose définis dans les modèles
4. **Logs**: Chaque script affiche des logs détaillés pendant l'exécution

## Personnalisation

Pour modifier les données:
1. Éditez les fichiers JSON dans `Moxbnb-App/bnb/src/mocks/`
2. Régénérez les scripts de seed si nécessaire
3. Ou modifiez directement les scripts TypeScript

## Dépannage

Si vous rencontrez des erreurs:
1. Vérifiez votre connexion MongoDB
2. Assurez-vous que les modèles Mongoose sont correctement définis
3. Vérifiez que les types correspondent aux schémas attendus
