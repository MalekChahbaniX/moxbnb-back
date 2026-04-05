import mongoose from 'mongoose';
import { Experience } from '../src/models';

// Données extraites du fichier experiences.json
const experiencesData = [
  {
    title: "Tour gastronomique dans la Médina de Tunis",
    description: "Découvrez les saveurs authentiques de la cuisine tunisienne à travers une visite guidée des meilleurs restaurants de la médina.",
    category: "food",
    location: {
      address: "Médina de Tunis",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      }
    },
    price: {
      basePrice: 85,
      currency: "TND",
      perPerson: true
    },
    duration: "4 heures",
    capacity: {
      maxGuests: 8,
      minGuests: 1
    },
    requirements: "Avoir faim!, Chaussures confortables",
    inclusions: ["Guide professionnel", "Dégustations", "Boissons", "Assurance"],
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      "https://images.unsplash.com/photo-1525373612132-b3e820b87cea?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
    ],
    host: {
      id: "host6",
      name: "Amine Belhadj",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isSuperhost: true
    },
    rating: 4.9,
    reviewsCount: 156,
    difficulty: "facile",
    languages: ["fr", "ar"],
    status: "published",
    isFeatured: true,
    available: true,
    schedule: {
      startTime: "10:00",
      endTime: "14:00",
      days: ["samedi", "dimanche"]
    }
  },
  {
    title: "Atelier de poterie traditionnelle à Sejnane",
    description: "Apprenez les techniques ancestrales de la poterie berbère avec des artisans locaux. Créez votre propre pièce à emporter.",
    category: "workshop",
    location: {
      address: "Centre artisanal de Sejnane",
      city: "Sejnane",
      country: "Tunisia",
      coordinates: {
        latitude: 37.0667,
        longitude: 9.4167
      }
    },
    price: {
      basePrice: 120,
      currency: "TND",
      perPerson: true
    },
    duration: "6 heures",
    capacity: {
      maxGuests: 6,
      minGuests: 2
    },
    requirements: "Vêtements pouvant être tachés, Patience et créativité",
    inclusions: ["Matériel", "Encadrement", "Votre création", "Collation"],
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
    ],
    host: {
      id: "host7",
      name: "Fatma Ben Ammar",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      isSuperhost: false
    },
    rating: 4.8,
    reviewsCount: 89,
    difficulty: "moyen",
    languages: ["fr", "ar"],
    status: "published",
    isFeatured: false,
    available: true,
    schedule: {
      startTime: "09:00",
      endTime: "15:00",
      days: ["samedi", "dimanche"]
    }
  },
  {
    title: "Randonnée dans les dunes du Grand Erg Oriental",
    description: "Aventure inoubliable dans le désert tunisien. Coucher de soleil sur les dunes et nuit sous les étoiles.",
    category: "adventure",
    location: {
      address: "Porte du désert, Douz",
      city: "Douz",
      country: "Tunisia",
      coordinates: {
        latitude: 33.4500,
        longitude: 9.0167
      }
    },
    price: {
      basePrice: 250,
      currency: "TND",
      perPerson: true
    },
    duration: "2 jours",
    capacity: {
      maxGuests: 12,
      minGuests: 4
    },
    requirements: "Bonne condition physique, Adaptation au climat désertique",
    inclusions: ["Guide désert", "Dromadaires", "Nuit en campement", "Repas", "Transport"],
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800"
    ],
    host: {
      id: "host8",
      name: "Mokhtar Toumi",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      isSuperhost: true
    },
    rating: 4.9,
    reviewsCount: 234,
    difficulty: "difficile",
    languages: ["fr", "ar", "en"],
    status: "published",
    isFeatured: true,
    available: true,
    schedule: {
      startTime: "15:00",
      endTime: "21:00",
      days: ["vendredi", "samedi", "dimanche"]
    }
  },
  {
    title: "Cours de cuisine tunisienne à Djerba",
    description: "Maîtrisez les secrets du couscous, des briks et autres spécialités tunisiennes avec une chef locale.",
    category: "cooking",
    location: {
      address: "Maison d'hôtes La Douira",
      city: "Djerba",
      country: "Tunisia",
      coordinates: {
        latitude: 33.8333,
        longitude: 10.9167
      }
    },
    price: {
      basePrice: 95,
      currency: "TND",
      perPerson: true
    },
    duration: "3 heures",
    capacity: {
      maxGuests: 8,
      minGuests: 2
    },
    requirements: "Avoir faim!, Envie d'apprendre",
    inclusions: ["Ingrédients", "Recettes", "Déjeuner", "Tablier"],
    images: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800"
    ],
    host: {
      id: "host9",
      name: "Nadia Chaabane",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      isSuperhost: true
    },
    rating: 4.9,
    reviewsCount: 178,
    difficulty: "facile",
    languages: ["fr", "ar"],
    status: "published",
    isFeatured: false,
    available: true,
    schedule: {
      startTime: "10:00",
      endTime: "13:00",
      days: ["mardi", "jeudi", "samedi"]
    }
  },
  {
    title: "Plongée sous-marine à Tabarka",
    description: "Explorez les fonds marins magnifiques de Tabarka. Initiation ou perfectionnement, tous niveaux bienvenus.",
    category: "sport",
    location: {
      address: "Centre de plongée Tabarka Plongée",
      city: "Tabarka",
      country: "Tunisia",
      coordinates: {
        latitude: 36.9500,
        longitude: 8.7500
      }
    },
    price: {
      basePrice: 180,
      currency: "TND",
      perPerson: true
    },
    duration: "4 heures",
    capacity: {
      maxGuests: 6,
      minGuests: 1
    },
    requirements: "Certificat médical, Savoir nager",
    inclusions: ["Équipement", "Moniteur certifié", "Assurance", "Boissons chaudes"],
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "https://images.unsplash.com/photo-1530319067432-f2c724c3f0e2?w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
    ],
    host: {
      id: "host10",
      name: "Samir Gharbi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isSuperhost: false
    },
    rating: 4.7,
    reviewsCount: 92,
    difficulty: "moyen",
    languages: ["fr", "en"],
    status: "published",
    isFeatured: false,
    available: true,
    schedule: {
      startTime: "08:00",
      endTime: "12:00",
      days: ["mercredi", "samedi", "dimanche"]
    }
  }
];

async function seedExperiences() {
  console.log('🎯 Starting experiences seed...');

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing experiences
    console.log('🗑️  Clearing existing experiences...');
    await Experience.deleteMany({});

    // Insert experiences
    console.log('🎯 Creating experiences...');
    const createdExperiences = await Experience.insertMany(experiencesData);
    
    console.log(`✅ Created ${createdExperiences.length} experiences`);
    console.log('\n📊 Experiences seeded successfully!');
    
    createdExperiences.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.title} - ${exp.price.basePrice} TND`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedExperiences()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
