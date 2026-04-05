import mongoose from 'mongoose';
import { Listing } from '../src/models';

// Données extraites du fichier listings.json
const listingsData = [
  {
    title: "Appartement de luxe à Sidi Bou Said",
    description: "Magnifique appartement avec vue sur la mer, entièrement meublé et équipé. Idéal pour des vacances inoubliables.",
    type: "apartment",
    category: "entire_place",
    location: {
      address: "Rue Hedi Zarrouk, Sidi Bou Said",
      city: "Sidi Bou Said",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8667,
        longitude: 10.3417
      }
    },
    price: {
      basePrice: 120,
      currency: "TND",
      weekendPrice: 150,
      cleaningFee: 30
    },
    capacity: {
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1
    },
    amenities: ["WiFi", "Climatisation", "Parking", "Cuisine", "Machine à laver", "Vue mer"],
    houseRules: "Non fumeur, Pas de fêtes, Pas d'animaux",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
    ],
    host: {
      id: "host1",
      name: "Karim Ben Ali",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      isSuperhost: true
    },
    rating: 4.8,
    reviewsCount: 124,
    status: "published",
    isFeatured: true,
    available: true,
    availability: {
      instantBook: true,
      minStay: 2,
      maxStay: 30,
      checkIn: "15:00",
      checkOut: "11:00"
    }
  },
  {
    title: "Villa traditionnelle à Hammamet",
    description: "Superbe villa avec piscine privée, jardin méditerranéen et architecture traditionnelle tunisienne.",
    type: "villa",
    category: "entire_place",
    location: {
      address: "Route de la Plage, Hammamet",
      city: "Hammamet",
      country: "Tunisia",
      coordinates: {
        latitude: 36.4000,
        longitude: 10.6167
      }
    },
    price: {
      basePrice: 250,
      currency: "TND",
      weekendPrice: 300,
      cleaningFee: 50
    },
    capacity: {
      maxGuests: 8,
      bedrooms: 4,
      beds: 4,
      bathrooms: 3
    },
    amenities: ["WiFi", "Piscine", "Jardin", "Parking", "Cuisine", "Barbecue", "Terrasse"],
    houseRules: "Non fumeur, Pas de fêtes bruyantes, Dépôt de garantie requis",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1580234849851-31629d98d24a?w=800"
    ],
    host: {
      id: "host2",
      name: "Sonia Masmoudi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      isSuperhost: true
    },
    rating: 4.9,
    reviewsCount: 89,
    status: "published",
    isFeatured: true,
    available: true,
    availability: {
      instantBook: false,
      minStay: 3,
      maxStay: 60,
      checkIn: "16:00",
      checkOut: "10:00"
    }
  },
  {
    title: "Chambre d'hôtes à la Medina de Tunis",
    description: "Charme traditionnel dans le cœur de la médina. Pièce historique rénovée avec tout le confort moderne.",
    type: "room",
    category: "private_room",
    location: {
      address: "Rue du Pacha, Medina de Tunis",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      }
    },
    price: {
      basePrice: 65,
      currency: "TND",
      weekendPrice: 80,
      cleaningFee: 20
    },
    capacity: {
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1
    },
    amenities: ["WiFi", "Petit-déjeuner", "Climatisation", "Salle de bain privative"],
    houseRules: "Non fumeur, Pas de visites après 22h, Respect du voisinage",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1551880047-8c22dbac3ec5?w=800"
    ],
    host: {
      id: "host3",
      name: "Youssef Trabelsi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isSuperhost: false
    },
    rating: 4.6,
    reviewsCount: 67,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: true,
      minStay: 1,
      maxStay: 15,
      checkIn: "14:00",
      checkOut: "12:00"
    }
  },
  {
    title: "Cabane écologique à Cap Bon",
    description: "Hébergement unique en pleine nature, construction écologique avec matériaux locaux. Parfait pour déconnexion.",
    type: "cabin",
    category: "unique_stay",
    location: {
      address: "Route des Côtiers, Cap Bon",
      city: "Cap Bon",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8333,
        longitude: 10.9167
      }
    },
    price: {
      basePrice: 85,
      currency: "TND",
      weekendPrice: 100,
      cleaningFee: 25
    },
    capacity: {
      maxGuests: 3,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1
    },
    amenities: ["WiFi", "Terrasse", "Cuisine extérieure", "Paniers solaires", "Douche extérieure"],
    houseRules: "Écologie obligatoire, Pas de déchets plastiques, Respect de la nature",
    images: [
      "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800",
      "https://images.unsplash.com/photo-1447837027022-945938ecd0cd?w=800",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"
    ],
    host: {
      id: "host4",
      name: "Leïla Ben Salem",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      isSuperhost: false
    },
    rating: 4.7,
    reviewsCount: 45,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: true,
      minStay: 2,
      maxStay: 7,
      checkIn: "15:00",
      checkOut: "11:00"
    }
  },
  {
    title: "Appartement moderne à Sfax",
    description: "Appartement récemment rénové au centre-ville de Sfax. Proche des commerces et transports.",
    type: "apartment",
    category: "entire_place",
    location: {
      address: "Avenue Habib Bourguiba, Sfax",
      city: "Sfax",
      country: "Tunisia",
      coordinates: {
        latitude: 34.7406,
        longitude: 10.7603
      }
    },
    price: {
      basePrice: 75,
      currency: "TND",
      weekendPrice: 90,
      cleaningFee: 25
    },
    capacity: {
      maxGuests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1
    },
    amenities: ["WiFi", "Climatisation", "Ascenseur", "Cuisine équipée", "Machine à laver", "Balcon"],
    houseRules: "Non fumeur, Pas de fêtes, Calme après 21h",
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1f8cb6bc?w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
    ],
    host: {
      id: "host5",
      name: "Mohamed Karray",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      isSuperhost: false
    },
    rating: 4.5,
    reviewsCount: 92,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: true,
      minStay: 2,
      maxStay: 30,
      checkIn: "15:00",
      checkOut: "11:00"
    }
  }
];

async function seedListings() {
  console.log('🏠 Starting listings seed...');

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing listings
    console.log('🗑️  Clearing existing listings...');
    await Listing.deleteMany({});

    // Insert listings
    console.log('🏠 Creating listings...');
    const createdListings = await Listing.insertMany(listingsData);
    
    console.log(`✅ Created ${createdListings.length} listings`);
    console.log('\n📊 Listings seeded successfully!');
    
    createdListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.price.basePrice} TND/nuit`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedListings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
