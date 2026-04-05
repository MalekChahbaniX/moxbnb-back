import mongoose from 'mongoose';
import { Service } from '../src/models';

// Données extraites du fichier services.json
const servicesData = [
  {
    title: "Chef privé à domicile",
    description: "Profitez d'un repas gastronomique préparé par un chef professionnel chez vous. Spécialités tunisiennes et méditerranéennes.",
    category: "cuisine",
    location: {
      address: "À votre domicile",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      },
      cities: ["Tunis", "Sfax", "Sousse", "Hammamet"]
    },
    price: {
      basePrice: 350,
      currency: "TND",
      perSession: true
    },
    duration: "4 heures",
    capacity: {
      maxGuests: 8,
      minGuests: 2
    },
    requirements: "Cuisine équipée, Espace pour 2+ personnes",
    inclusions: ["Courses", "Préparation", "Service", "Nettoyage"],
    images: [
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800"
    ],
    provider: {
      id: "provider1",
      name: "Karim Haddad",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isVerified: true,
      rating: 4.9,
      experience: "10 ans"
    },
    rating: 4.9,
    reviewsCount: 67,
    status: "published",
    isFeatured: true,
    available: true,
    availability: {
      instantBook: false,
      advanceNotice: 48
    }
  },
  {
    title: "Massage bien-être à domicile",
    description: "Séance de massage relaxante et thérapeutique par un professionnel certifié. Détente garantie.",
    category: "wellness",
    location: {
      address: "À votre domicile",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      },
      cities: ["Tunis", "Nabeul", "Hammamet", "Djerba"]
    },
    price: {
      basePrice: 120,
      currency: "TND",
      perSession: true
    },
    duration: "1h30",
    capacity: {
      maxGuests: 1,
      minGuests: 1
    },
    requirements: "Espace calme, Température agréable",
    inclusions: ["Huiles essentielles", "Table de massage", "Musique relaxante"],
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800"
    ],
    provider: {
      id: "provider2",
      name: "Samira Kallel",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      isVerified: true,
      rating: 4.8,
      experience: "8 ans"
    },
    rating: 4.8,
    reviewsCount: 124,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: true,
      advanceNotice: 24
    }
  },
  {
    title: "Coach sportif personnel",
    description: "Programme de fitness personnalisé avec un coach certifié. En ligne ou à domicile selon votre choix.",
    category: "sport",
    location: {
      address: "À domicile ou en ligne",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      },
      cities: ["Tunis", "Sfax", "Sousse", "Monastir"]
    },
    price: {
      basePrice: 80,
      currency: "TND",
      perSession: true
    },
    duration: "1 heure",
    capacity: {
      maxGuests: 1,
      minGuests: 1
    },
    requirements: "Tenue de sport, Espace suffisant",
    inclusions: ["Programme personnalisé", "Conseils nutritionnels", "Suivi"],
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"
    ],
    provider: {
      id: "provider3",
      name: "Walid Ben Jemia",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isVerified: true,
      rating: 4.7,
      experience: "6 ans"
    },
    rating: 4.7,
    reviewsCount: 89,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: true,
      advanceNotice: 12
    }
  },
  {
    title: "Photographe professionnel",
    description: "Shooting photo pour événements spéciaux, portraits ou photos de voyage. Mémoires inoubliables garanties.",
    category: "photography",
    location: {
      address: "Lieu de votre choix",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      },
      cities: ["Tunis", "Sidi Bou Said", "Hammamet", "Djerba", "Sfax"]
    },
    price: {
      basePrice: 200,
      currency: "TND",
      perSession: true
    },
    duration: "2 heures",
    capacity: {
      maxGuests: 6,
      minGuests: 1
    },
    requirements: "Lieu photogénique, Tenue appropriée",
    inclusions: ["Shooting", "Retouche photos", "Photos numériques"],
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    ],
    provider: {
      id: "provider4",
      name: "Mehdi Trabelsi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isVerified: true,
      rating: 4.9,
      experience: "12 ans"
    },
    rating: 4.9,
    reviewsCount: 156,
    status: "published",
    isFeatured: true,
    available: true,
    availability: {
      instantBook: false,
      advanceNotice: 72
    }
  },
  {
    title: "Service de traiteur",
    description: "Traiteur pour événements privés et professionnels. Cuisine tunisienne et internationale de qualité restaurant.",
    category: "catering",
    location: {
      address: "Lieu de votre événement",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      },
      cities: ["Tunis", "Sfax", "Sousse", "Hammamet", "Nabeul"]
    },
    price: {
      basePrice: 45,
      currency: "TND",
      perPerson: true
    },
    duration: "Par personne",
    capacity: {
      maxGuests: 100,
      minGuests: 20
    },
    requirements: "Nombre de convives, Budget",
    inclusions: ["Préparation", "Livraison", "Service", "Nettoyage"],
    images: [
      "https://images.unsplash.com/photo-1525373612132-b3e820b87cea?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
    ],
    provider: {
      id: "provider5",
      name: "Leila Gharbi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      isVerified: true,
      rating: 4.8,
      experience: "15 ans"
    },
    rating: 4.8,
    reviewsCount: 203,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: false,
      advanceNotice: 168
    }
  },
  {
    title: "Coiffeur/Esthéticien à domicile",
    description: "Services de coiffure et de beauté à domicile pour hommes et femmes. Produits professionnels garantis.",
    category: "beauty",
    location: {
      address: "À votre domicile",
      city: "Tunis",
      country: "Tunisia",
      coordinates: {
        latitude: 36.8065,
        longitude: 10.1815
      },
      cities: ["Tunis", "Sfax", "Sousse", "Hammamet"]
    },
    price: {
      basePrice: 90,
      currency: "TND",
      perSession: true
    },
    duration: "1h30",
    capacity: {
      maxGuests: 1,
      minGuests: 1
    },
    requirements: "Espace bien éclairé, Table et chaise",
    inclusions: ["Produits de qualité", "Conseils personnalisés", "Séchage"],
    images: [
      "https://images.unsplash.com/photo-1560066985-278c9a52d6b9?w=800",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
    ],
    provider: {
      id: "provider6",
      name: "Rania Masmoudi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      isVerified: true,
      rating: 4.6,
      experience: "7 ans"
    },
    rating: 4.6,
    reviewsCount: 78,
    status: "published",
    isFeatured: false,
    available: true,
    availability: {
      instantBook: true,
      advanceNotice: 24
    }
  }
];

async function seedServices() {
  console.log('🛠️  Starting services seed...');

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing services
    console.log('🗑️  Clearing existing services...');
    await Service.deleteMany({});

    // Insert services
    console.log('🛠️  Creating services...');
    const createdServices = await Service.insertMany(servicesData);
    
    console.log(`✅ Created ${createdServices.length} services`);
    console.log('\n📊 Services seeded successfully!');
    
    createdServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} - ${service.price.basePrice} TND`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedServices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
