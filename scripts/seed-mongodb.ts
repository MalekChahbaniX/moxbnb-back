import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Listing, Experience, Service, Booking, Review, Message } from '../src/models';

async function main() {
  console.log('🌱 Starting MongoDB seed...');

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
    console.log(`🔗 Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Experience.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const fatma = await User.create({
      email: 'fatma@example.com',
      firstName: 'Fatma',
      lastName: 'Ben Ali',
      password: 'password123',
      phone: '+216 71 123 456',
      role: 'HOST'
    });

    const ahmed = await User.create({
      email: 'ahmed@example.com',
      firstName: 'Ahmed',
      lastName: 'Kaddour',
      password: 'password123',
      phone: '+216 72 234 567',
      role: 'HOST'
    });

    const leila = await User.create({
      email: 'leila@example.com',
      firstName: 'Leila',
      lastName: 'Messaoudi',
      password: 'password123',
      phone: '+216 73 345 678',
      role: 'HOST'
    });

    const omar = await User.create({
      email: 'omar@example.com',
      firstName: 'Omar',
      lastName: 'Ben Salah',
      password: 'password123',
      phone: '+216 74 456 789',
      role: 'HOST'
    });

    const chefMansouri = await User.create({
      email: 'chef@example.com',
      firstName: 'Chef Fatma',
      lastName: 'Mansouri',
      password: 'password123',
      phone: '+216 75 567 890',
      role: 'PROVIDER'
    });

    // Create a regular user for bookings
    const regularUser = await User.create({
      email: 'user@example.com',
      firstName: 'Mohamed',
      lastName: 'Trabelsi',
      password: 'password123',
      phone: '+216 76 678 901',
      role: 'GUEST'
    });

    console.log('✅ Created 6 users');

    // Create listings
    console.log('🏠 Creating listings...');
    const listing1 = await Listing.create({
      title: 'Appartement de Charme à Sidi Bou Said',
      description: 'Magnifique appartement avec vue mer, décoré dans le style traditionnel tunisien. À 5 minutes de la plage.',
      type: 'apartment',
      category: 'entire_place',
      location: {
        address: ' Rue Hedi Zarrouk, Sidi Bou Said',
        city: 'Tunis',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.8706,
          longitude: 10.3388
        }
      },
      price: {
        basePrice: 350,
        currency: 'TND',
        weekendPrice: 420,
        cleaningFee: 50
      },
      capacity: {
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1
      },
      amenities: [
        'WiFi',
        'Climatisation',
        'Vue mer',
        'Cuisine équipée',
        'Parking',
        'Télévision',
        'Lave-linge',
        'Fer à repasser'
      ],
      houseRules: 'Non fumeur, Pas de fêtes, Animaux non autorisés',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      hostId: fatma._id,
      status: 'published',
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 127,
      availability: {
        instantBook: true,
        minStay: 2,
        maxStay: 30
      }
    });

    const listing2 = await Listing.create({
      title: 'Villa avec Piscine à Hammamet',
      description: 'Superbe villa avec piscine privée, jardin et terrasse. Parfait pour les vacances en famille.',
      type: 'villa',
      category: 'entire_place',
      location: {
        address: 'Route de la Mer, Hammamet',
        city: 'Nabeul',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.4000,
          longitude: 10.6000
        }
      },
      price: {
        basePrice: 750,
        currency: 'TND',
        weekendPrice: 900,
        cleaningFee: 100
      },
      capacity: {
        maxGuests: 8,
        bedrooms: 4,
        beds: 4,
        bathrooms: 3
      },
      amenities: [
        'Piscine',
        'Jardin',
        'WiFi',
        'Climatisation',
        'Cuisine équipée',
        'Parking',
        'Barbecue',
        'Télévision',
        'Lave-linge'
      ],
      houseRules: 'Non fumeur à l\'intérieur',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
      ],
      hostId: ahmed._id,
      status: 'published',
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 89,
      availability: {
        instantBook: false,
        minStay: 3,
        maxStay: 60
      }
    });

    const listing3 = await Listing.create({
      title: 'Maison Traditionnelle Djerbienne',
      description: 'Authentique maison djerbienne avec architecture traditionnelle et patio central.',
      type: 'house',
      category: 'entire_place',
      location: {
        address: 'Medina, Djerba',
        city: 'Medenine',
        country: 'Tunisia',
        coordinates: {
          latitude: 33.8100,
          longitude: 10.8500
        }
      },
      price: {
        basePrice: 280,
        currency: 'TND',
        weekendPrice: 350,
        cleaningFee: 40
      },
      capacity: {
        maxGuests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2
      },
      amenities: [
        'Patio',
        'WiFi',
        'Climatisation',
        'Cuisine traditionnelle',
        'Parking',
        'Terrasse'
      ],
      houseRules: 'Respect des traditions locales',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
      ],
      hostId: fatma._id,
      status: 'published',
      isFeatured: false,
      rating: 4.95,
      reviewsCount: 203,
      availability: {
        instantBook: true,
        minStay: 2,
        maxStay: 30
      }
    });

    const listing4 = await Listing.create({
      title: 'Studio Vue Mer à Monastir',
      description: 'Coquet studio avec vue imprenable sur la mer et la plage Ribat.',
      type: 'apartment',
      category: 'private_room',
      location: {
        address: 'Avenue Habib Bourguiba, Monastir',
        city: 'Monastir',
        country: 'Tunisia',
        coordinates: {
          latitude: 35.7643,
          longitude: 10.8113
        }
      },
      price: {
        basePrice: 180,
        currency: 'TND',
        weekendPrice: 220,
        cleaningFee: 30
      },
      capacity: {
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1
      },
      amenities: [
        'Vue mer',
        'WiFi',
        'Climatisation',
        'Kitchenette',
        'Balcon'
      ],
      houseRules: 'Arrivée flexible possible',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
      ],
      hostId: leila._id,
      status: 'published',
      isFeatured: false,
      rating: 4.7,
      reviewsCount: 56,
      availability: {
        instantBook: true,
        minStay: 1,
        maxStay: 15
      }
    });

    const listing5 = await Listing.create({
      title: 'Cabane dans les Palmiers Tozeur',
      description: 'Expérience unique dans une cabane traditionnelle au milieu des palmeraies de Tozeur.',
      type: 'cabin',
      category: 'unique_stay',
      location: {
        address: 'Palmeraie, Tozeur',
        city: 'Tozeur',
        country: 'Tunisia',
        coordinates: {
          latitude: 33.9200,
          longitude: 8.1300
        }
      },
      price: {
        basePrice: 420,
        currency: 'TND',
        weekendPrice: 500,
        cleaningFee: 60
      },
      capacity: {
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1
      },
      amenities: [
        'Vue désert',
        'WiFi',
        'Terrasse',
        'Petit-déjeuner inclus',
        'Climatisation'
      ],
      houseRules: 'Pas d\'animaux',
      images: [
        'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'
      ],
      hostId: omar._id,
      status: 'published',
      isFeatured: true,
      rating: 4.92,
      reviewsCount: 78,
      availability: {
        instantBook: false,
        minStay: 2,
        maxStay: 7
      }
    });

    const listing6 = await Listing.create({
      title: 'Penthouse Moderne Tunis Centre',
      description: 'Luxe et confort au cœur de Tunis avec vue panoramique sur la ville.',
      type: 'apartment',
      category: 'entire_place',
      location: {
        address: 'Avenue Bourguiba, Tunis',
        city: 'Tunis',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.8065,
          longitude: 10.1815
        }
      },
      price: {
        basePrice: 450,
        currency: 'TND',
        weekendPrice: 550,
        cleaningFee: 70
      },
      capacity: {
        maxGuests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2
      },
      amenities: [
        'Vue ville',
        'WiFi',
        'Climatisation',
        'Cuisine équipée',
        'Parking',
        'Ascenseur',
        'Terrasse',
        'Machine à café'
      ],
      houseRules: 'Non fumeur',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      hostId: ahmed._id,
      status: 'published',
      isFeatured: false,
      rating: 4.85,
      reviewsCount: 145,
      availability: {
        instantBook: true,
        minStay: 3,
        maxStay: 30
      }
    });

    console.log('✅ Created 6 listings');

    // Create experiences
    console.log('🎯 Creating experiences...');
    const experience1 = await Experience.create({
      title: 'Dégustation de Cuisine Traditionnelle Tunisienne',
      description: 'Apprenez à préparer les plats tunisiens emblématiques avec une chef locale. Dégustation incluse.',
      category: 'culinary',
      location: {
        address: 'Médina de Tunis',
        city: 'Tunis',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.8189,
          longitude: 10.1659
        }
      },
      price: {
        basePrice: 150,
        currency: 'TND',
        perPerson: true
      },
      duration: '4 heures',
      capacity: {
        maxGuests: 8,
        minGuests: 2
      },
      requirements: 'Aucun niveau requis',
      inclusions: [
        'Ingrédients locaux',
        'Recettes à emporter',
        'Dégustation',
        'Boissons'
      ],
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
      ],
      hostId: fatma._id,
      status: 'published',
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 234,
      difficulty: 'easy',
      languages: ['fr', 'ar'],
      schedule: {
        startTime: '10:00',
        endTime: '14:00',
        days: ['samedi', 'dimanche']
      }
    });

    const experience2 = await Experience.create({
      title: 'Visite Guidée de la Médina de Tunis',
      description: 'Découvrez l\'histoire et la culture de la médina avec un guide expert.',
      category: 'guided_tour',
      location: {
        address: 'Porte de France, Tunis',
        city: 'Tunis',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.8189,
          longitude: 10.1659
        }
      },
      price: {
        basePrice: 80,
        currency: 'TND',
        perPerson: true
      },
      duration: '3 heures',
      capacity: {
        maxGuests: 10,
        minGuests: 1
      },
      requirements: 'Marche modérée',
      inclusions: [
        'Guide expert',
        'Entrées monuments',
        'Thé à la menthe'
      ],
      images: [
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
      ],
      hostId: ahmed._id,
      status: 'published',
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 512,
      difficulty: 'easy',
      languages: ['fr', 'ar', 'en'],
      schedule: {
        startTime: '09:00',
        endTime: '12:00',
        days: ['lundi', 'mercredi', 'vendredi']
      }
    });

    const experience3 = await Experience.create({
      title: 'Atelier de Poterie à Sejnane',
      description: 'Apprenez les techniques ancestrales de poterie de Sejnane, patrimoine UNESCO.',
      category: 'artistic',
      location: {
        address: 'Sejnane',
        city: 'Bizerte',
        country: 'Tunisia',
        coordinates: {
          latitude: 37.1000,
          longitude: 9.3500
        }
      },
      price: {
        basePrice: 200,
        currency: 'TND',
        perPerson: true
      },
      duration: '5 heures',
      capacity: {
        maxGuests: 6,
        minGuests: 2
      },
      requirements: 'Vêtements pouvant être tachés',
      inclusions: [
        'Argile locale',
        'Outils traditionnels',
        'Pièce à emporter',
        'Déjeuner'
      ],
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
      ],
      hostId: leila._id,
      status: 'published',
      isFeatured: true,
      rating: 4.95,
      reviewsCount: 89,
      difficulty: 'medium',
      languages: ['fr', 'ar'],
      schedule: {
        startTime: '09:00',
        endTime: '14:00',
        days: ['samedi', 'dimanche']
      }
    });

    const experience4 = await Experience.create({
      title: 'Balade en Chameau dans le Sahara',
      description: 'Aventure inoubliable dans le désert tunisien avec guide bédouin et coucher de soleil.',
      category: 'adventure',
      location: {
        address: 'Douz',
        city: 'Kebili',
        country: 'Tunisia',
        coordinates: {
          latitude: 33.4500,
          longitude: 9.0000
        }
      },
      price: {
        basePrice: 350,
        currency: 'TND',
        perPerson: true
      },
      duration: '1 journée',
      capacity: {
        maxGuests: 4,
        minGuests: 2
      },
      requirements: 'Condition physique moyenne',
      inclusions: [
        'Guide bédouin',
        'Chameaux',
        'Dîner traditionnel',
        'Thé du désert'
      ],
      images: [
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800'
      ],
      hostId: omar._id,
      status: 'published',
      isFeatured: true,
      rating: 4.97,
      reviewsCount: 345,
      difficulty: 'medium',
      languages: ['fr', 'ar', 'en'],
      schedule: {
        startTime: '15:00',
        endTime: '21:00',
        days: ['vendredi', 'samedi', 'dimanche']
      }
    });

    console.log('✅ Created 4 experiences');

    // Create services
    console.log('🛠️  Creating services...');
    const service1 = await Service.create({
      title: 'Cuisine Traditionnelle à Domicile',
      description: 'Chef professionnel qui cuisine pour vous à domicile avec des produits locaux frais.',
      category: 'private_chef',
      location: {
        address: 'Tunis',
        city: 'Tunis',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.8065,
          longitude: 10.1815
        }
      },
      price: {
        basePrice: 500,
        currency: 'TND',
        perSession: true
      },
      duration: '4 heures',
      capacity: {
        maxGuests: 8,
        minGuests: 2
      },
      requirements: 'Cuisine équipée',
      inclusions: [
        'Ingrédients frais',
        'Préparation complète',
        'Service',
        'Nettoyage'
      ],
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
      ],
      providerId: chefMansouri._id,
      status: 'published',
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 78,
      availability: {
        instantBook: true,
        advanceNotice: 48
      }
    });

    const service2 = await Service.create({
      title: 'Soin Massage Relaxant',
      description: 'Massage professionnel pour relaxation et bien-être.',
      category: 'wellness',
      location: {
        address: 'Hammamet',
        city: 'Nabeul',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.4000,
          longitude: 10.6000
        }
      },
      price: {
        basePrice: 200,
        currency: 'TND',
        perSession: true
      },
      duration: '1 heure',
      capacity: {
        maxGuests: 1,
        minGuests: 1
      },
      requirements: 'Aucune',
      inclusions: [
        'Huiles essentielles',
        'Musique relaxante',
        'Boisson chaude'
      ],
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
      ],
      providerId: chefMansouri._id,
      status: 'published',
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 156,
      availability: {
        instantBook: true,
        advanceNotice: 24
      }
    });

    const service3 = await Service.create({
      title: 'Coaching Sportif Personnalisé',
      description: 'Séances de sport personnalisées selon vos objectifs.',
      category: 'fitness',
      location: {
        address: 'Sousse',
        city: 'Sousse',
        country: 'Tunisia',
        coordinates: {
          latitude: 35.8256,
          longitude: 10.6369
        }
      },
      price: {
        basePrice: 150,
        currency: 'TND',
        perSession: true
      },
      duration: '1 heure',
      capacity: {
        maxGuests: 1,
        minGuests: 1
      },
      requirements: 'Tenue de sport',
      inclusions: [
        'Programme personnalisé',
        'Conseils nutritionnels',
        'Suivi progression'
      ],
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      providerId: ahmed._id,
      status: 'published',
      isFeatured: false,
      rating: 4.95,
      reviewsCount: 203,
      availability: {
        instantBook: true,
        advanceNotice: 12
      }
    });

    const service4 = await Service.create({
      title: 'Séance Photo Voyage',
      description: 'Photographe professionnel pour capturer vos meilleurs moments en Tunisie.',
      category: 'photography',
      location: {
        address: 'Tunis',
        city: 'Tunis',
        country: 'Tunisia',
        coordinates: {
          latitude: 36.8065,
          longitude: 10.1815
        }
      },
      price: {
        basePrice: 350,
        currency: 'TND',
        perSession: true
      },
      duration: '2 heures',
      capacity: {
        maxGuests: 6,
        minGuests: 1
      },
      requirements: 'Aucune',
      inclusions: [
        '50 photos retouchées',
        'Tous les fichiers originaux',
        'Conseils de pose'
      ],
      images: [
        'https://images.unsplash.com/photo-1542038782486-a3e11cffd5cc?w=800'
      ],
      providerId: leila._id,
      status: 'published',
      isFeatured: true,
      rating: 4.92,
      reviewsCount: 89,
      availability: {
        instantBook: false,
        advanceNotice: 72
      }
    });

    const service5 = await Service.create({
      title: 'Service de Traiteur pour Événements',
      description: 'Traiteur haut de gamme pour vos événements spéciaux.',
      category: 'catering',
      location: {
        address: 'Sfax',
        city: 'Sfax',
        country: 'Tunisia',
        coordinates: {
          latitude: 34.7406,
          longitude: 10.7603
        }
      },
      price: {
        basePrice: 1500,
        currency: 'TND',
        perEvent: true
      },
      duration: 'Sur demande',
      capacity: {
        maxGuests: 100,
        minGuests: 20
      },
      requirements: 'Espace événementiel',
      inclusions: [
        'Menu personnalisé',
        'Service complet',
        'Vaisselle',
        'Décoration'
      ],
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
      ],
      providerId: chefMansouri._id,
      status: 'published',
      isFeatured: false,
      rating: 4.85,
      reviewsCount: 67,
      availability: {
        instantBook: false,
        advanceNotice: 168
      }
    });

    const service6 = await Service.create({
      title: 'Coiffure et Maquillage Mariage',
      description: 'Service complet de beauté pour mariées et événements.',
      category: 'beauty',
      location: {
        address: 'Djerba',
        city: 'Medenine',
        country: 'Tunisia',
        coordinates: {
          latitude: 33.8100,
          longitude: 10.8500
        }
      },
      price: {
        basePrice: 600,
        currency: 'TND',
        perSession: true
      },
      duration: '3 heures',
      capacity: {
        maxGuests: 1,
        minGuests: 1
      },
      requirements: 'Aucune',
      inclusions: [
        'Essai préalable',
        'Produits de luxe',
        'Déplacement',
        'Photos avant/après'
      ],
      images: [
        'https://images.unsplash.com/photo-1562322145-92c21f5d6639?w=800'
      ],
      providerId: leila._id,
      status: 'published',
      isFeatured: true,
      rating: 4.88,
      reviewsCount: 134,
      availability: {
        instantBook: false,
        advanceNotice: 96
      }
    });

    console.log('✅ Created 6 services');

    // Create some sample bookings
    console.log('📅 Creating bookings...');
    const booking1 = await Booking.create({
      type: 'property',
      itemId: listing1._id,
      userId: regularUser._id,
      dates: {
        checkIn: new Date('2024-07-15'),
        checkOut: new Date('2024-07-20')
      },
      guests: {
        adults: 2,
        children: 0,
        infants: 0
      },
      pricing: {
        basePrice: 1750,
        cleaningFee: 50,
        serviceFee: 180,
        totalPrice: 1980,
        currency: 'TND'
      },
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'Arrivée tardive prévue',
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-06-02')
    });

    const booking2 = await Booking.create({
      type: 'experience',
      itemId: experience1._id,
      userId: regularUser._id,
      dates: {
        date: new Date('2024-07-25')
      },
      guests: {
        adults: 2,
        children: 0,
        infants: 0
      },
      pricing: {
        basePrice: 300,
        serviceFee: 30,
        totalPrice: 330,
        currency: 'TND'
      },
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-06-16')
    });

    const booking3 = await Booking.create({
      type: 'service',
      itemId: service1._id,
      userId: regularUser._id,
      dates: {
        date: new Date('2024-08-10')
      },
      guests: {
        adults: 4,
        children: 0,
        infants: 0
      },
      pricing: {
        basePrice: 500,
        serviceFee: 50,
        totalPrice: 550,
        currency: 'TND'
      },
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: 'Menu végétarien svp',
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-06-20')
    });

    console.log('✅ Created 3 bookings');

    // Create some reviews
    console.log('⭐ Creating reviews...');
    await Review.create({
      rating: 5,
      title: 'Exceptionnel!',
      comment: 'Un séjour magnifique dans un appartement impeccable avec une vue à couper le souffle. Fatma est une hôtesse formidable.',
      userId: regularUser._id,
      itemId: listing1._id,
      itemType: 'listing',
      bookingId: booking1._id,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
      helpful: 12,
      createdAt: new Date('2024-07-21')
    });

    await Review.create({
      rating: 4,
      title: 'Superbe expérience',
      comment: 'J\'ai appris à préparer des plats traditionnels tunisiens. La chef est très pédagogue et l\'expérience était délicieuse!',
      userId: regularUser._id,
      itemId: experience1._id,
      itemType: 'experience',
      bookingId: booking2._id,
      helpful: 8,
      createdAt: new Date('2024-07-26')
    });

    console.log('✅ Created 2 reviews');

    // Create some messages
    console.log('💬 Creating messages...');
    await Message.create({
      senderId: regularUser._id,
      receiverId: fatma._id,
      content: 'Bonjour, je suis intéressé par votre appartement. Est-il disponible pour la semaine du 15 au 22 juillet?',
      bookingId: booking1._id,
      isRead: true,
      createdAt: new Date('2024-05-28')
    });

    await Message.create({
      senderId: fatma._id,
      receiverId: regularUser._id,
      content: 'Bonjour! Oui, l\'appartement est disponible pour ces dates. N\'hésitez pas si vous avez d\'autres questions!',
      bookingId: booking1._id,
      isRead: true,
      createdAt: new Date('2024-05-28')
    });

    await Message.create({
      senderId: regularUser._id,
      receiverId: fatma._id,
      content: 'Parfait! Je vais faire la réservation. Merci pour votre réponse rapide.',
      bookingId: booking1._id,
      isRead: true,
      createdAt: new Date('2024-05-29')
    });

    console.log('✅ Created 3 messages');

    console.log('\n🎉 MongoDB seed completed successfully!');
    console.log('\n📊 Seed Summary:');
    console.log('- Users: 6');
    console.log('- Listings: 6');
    console.log('- Experiences: 4');
    console.log('- Services: 6');
    console.log('- Bookings: 3');
    console.log('- Reviews: 2');
    console.log('- Messages: 3');
    console.log('\n✅ All data has been inserted into MongoDB!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
