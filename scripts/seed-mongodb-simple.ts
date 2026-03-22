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
      type: 'APARTMENT',
      category: 'entire_place',
      price: 350,
      currency: 'TND',
      address: 'Rue Hedi Zarrouk, Sidi Bou Said',
      city: 'Tunis',
      country: 'Tunisia',
      latitude: 36.8706,
      longitude: 10.3388,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: ['WiFi', 'Climatisation', 'Vue mer', 'Cuisine équipée', 'Parking'],
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      rules: ['Non fumeur', 'Pas de fêtes', 'Animaux non autorisés'],
      status: 'PUBLISHED',
      isFeatured: true,
      hostId: fatma._id
    });

    const listing2 = await Listing.create({
      title: 'Villa avec Piscine à Hammamet',
      description: 'Superbe villa avec piscine privée, jardin et terrasse. Parfait pour les vacances en famille.',
      type: 'VILLA',
      category: 'entire_place',
      price: 750,
      currency: 'TND',
      address: 'Route de la Mer, Hammamet',
      city: 'Nabeul',
      country: 'Tunisia',
      latitude: 36.4000,
      longitude: 10.6000,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      amenities: ['Piscine', 'Jardin', 'WiFi', 'Climatisation', 'Cuisine équipée', 'Parking'],
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 8,
      rules: ['Non fumeur à l\'intérieur'],
      status: 'PUBLISHED',
      isFeatured: true,
      hostId: ahmed._id
    });

    const listing3 = await Listing.create({
      title: 'Maison Traditionnelle Djerbienne',
      description: 'Authentique maison djerbienne avec architecture traditionnelle et patio central.',
      type: 'HOUSE',
      category: 'entire_place',
      price: 280,
      currency: 'TND',
      address: 'Medina, Djerba',
      city: 'Medenine',
      country: 'Tunisia',
      latitude: 33.8100,
      longitude: 10.8500,
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      amenities: ['Patio', 'WiFi', 'Climatisation', 'Cuisine traditionnelle', 'Parking'],
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      rules: ['Respect des traditions locales'],
      status: 'PUBLISHED',
      isFeatured: false,
      hostId: fatma._id
    });

    const listing4 = await Listing.create({
      title: 'Studio Vue Mer à Monastir',
      description: 'Coquet studio avec vue imprenable sur la mer et la plage Ribat.',
      type: 'STUDIO',
      category: 'private_room',
      price: 180,
      currency: 'TND',
      address: 'Avenue Habib Bourguiba, Monastir',
      city: 'Monastir',
      country: 'Tunisia',
      latitude: 35.7643,
      longitude: 10.8113,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      amenities: ['Vue mer', 'WiFi', 'Climatisation', 'Kitchenette'],
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      rules: ['Arrivée flexible possible'],
      status: 'PUBLISHED',
      isFeatured: false,
      hostId: leila._id
    });

    const listing5 = await Listing.create({
      title: 'Cabane dans les Palmiers Tozeur',
      description: 'Expérience unique dans une cabane traditionnelle au milieu des palmeraies de Tozeur.',
      type: 'CABIN',
      category: 'unique_stay',
      price: 420,
      currency: 'TND',
      address: 'Palmeraie, Tozeur',
      city: 'Tozeur',
      country: 'Tunisia',
      latitude: 33.9200,
      longitude: 8.1300,
      images: ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800'],
      amenities: ['Vue désert', 'WiFi', 'Terrasse', 'Petit-déjeuner inclus'],
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      rules: ['Pas d\'animaux'],
      status: 'PUBLISHED',
      isFeatured: true,
      hostId: omar._id
    });

    const listing6 = await Listing.create({
      title: 'Penthouse Moderne Tunis Centre',
      description: 'Luxe et confort au cœur de Tunis avec vue panoramique sur la ville.',
      type: 'APARTMENT',
      category: 'entire_place',
      price: 450,
      currency: 'TND',
      address: 'Avenue Bourguiba, Tunis',
      city: 'Tunis',
      country: 'Tunisia',
      latitude: 36.8065,
      longitude: 10.1815,
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
      amenities: ['Vue ville', 'WiFi', 'Climatisation', 'Cuisine équipée', 'Parking'],
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      rules: ['Non fumeur'],
      status: 'PUBLISHED',
      isFeatured: false,
      hostId: ahmed._id
    });

    console.log('✅ Created 6 listings');

    // Create experiences
    console.log('🎯 Creating experiences...');
    const experience1 = await Experience.create({
      title: 'Dégustation de Cuisine Traditionnelle Tunisienne',
      description: 'Apprenez à préparer les plats tunisiens emblématiques avec une chef locale. Dégustation incluse.',
      category: 'culinary',
      price: 150,
      currency: 'TND',
      duration: 240, // 4 heures en minutes
      maxGuests: 8,
      location: 'Médina de Tunis',
      address: 'Porte de France, Tunis',
      city: 'Tunis',
      country: 'Tunisia',
      latitude: 36.8189,
      longitude: 10.1659,
      images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
      includes: ['Ingrédients locaux', 'Recettes à emporter', 'Dégustation'],
      requirements: ['Aucun niveau requis'],
      difficulty: 'BEGINNER',
      status: 'PUBLISHED',
      isFeatured: true,
      providerId: fatma._id
    });

    const experience2 = await Experience.create({
      title: 'Visite Guidée de la Médina de Tunis',
      description: 'Découvrez l\'histoire et la culture de la médina avec un guide expert.',
      category: 'guided_tour',
      price: 80,
      currency: 'TND',
      duration: 180, // 3 heures en minutes
      maxGuests: 10,
      location: 'Médina de Tunis',
      address: 'Porte de France, Tunis',
      city: 'Tunis',
      country: 'Tunisia',
      latitude: 36.8189,
      longitude: 10.1659,
      images: ['https://images.unsplash.com/photo-1548013146-72479768bada?w=800'],
      includes: ['Guide expert', 'Entrées monuments'],
      requirements: ['Marche modérée'],
      difficulty: 'BEGINNER',
      status: 'PUBLISHED',
      isFeatured: false,
      providerId: ahmed._id
    });

    const experience3 = await Experience.create({
      title: 'Atelier de Poterie à Sejnane',
      description: 'Apprenez les techniques ancestrales de poterie de Sejnane, patrimoine UNESCO.',
      category: 'artistic',
      price: 200,
      currency: 'TND',
      duration: 300, // 5 heures en minutes
      maxGuests: 6,
      location: 'Sejnane',
      address: 'Centre artisanal, Sejnane',
      city: 'Bizerte',
      country: 'Tunisia',
      latitude: 37.1000,
      longitude: 9.3500,
      images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'],
      includes: ['Argile locale', 'Outils traditionnels', 'Pièce à emporter'],
      requirements: ['Vêtements pouvant être tachés'],
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isFeatured: true,
      providerId: leila._id
    });

    const experience4 = await Experience.create({
      title: 'Balade en Chameau dans le Sahara',
      description: 'Aventure inoubliable dans le désert tunisien avec guide bédouin et coucher de soleil.',
      category: 'adventure',
      price: 350,
      currency: 'TND',
      duration: 480, // 8 heures (1 journée)
      maxGuests: 4,
      location: 'Douz',
      address: 'Point de départ, Douz',
      city: 'Kebili',
      country: 'Tunisia',
      latitude: 33.4500,
      longitude: 9.0000,
      images: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800'],
      includes: ['Guide bédouin', 'Chameaux', 'Dîner traditionnel'],
      requirements: ['Condition physique moyenne'],
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isFeatured: true,
      providerId: omar._id
    });

    console.log('✅ Created 4 experiences');

    // Create services
    console.log('🛠️  Creating services...');
    const service1 = await Service.create({
      title: 'Cuisine Traditionnelle à Domicile',
      description: 'Chef professionnel qui cuisine pour vous à domicile avec des produits locaux frais.',
      category: 'private_chef',
      price: 500,
      currency: 'TND',
      duration: 240, // 4 heures en minutes
      location: 'Tunis',
      address: 'Avenue Bourguiba, Tunis',
      city: 'Tunis',
      country: 'Tunisia',
      latitude: 36.8065,
      longitude: 10.1815,
      images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
      status: 'PUBLISHED',
      isFeatured: true,
      providerId: chefMansouri._id
    });

    const service2 = await Service.create({
      title: 'Soin Massage Relaxant',
      description: 'Massage professionnel pour relaxation et bien-être.',
      category: 'wellness',
      price: 200,
      currency: 'TND',
      duration: 60, // 1 heure en minutes
      location: 'Hammamet',
      address: 'Route de la Mer, Hammamet',
      city: 'Nabeul',
      country: 'Tunisia',
      latitude: 36.4000,
      longitude: 10.6000,
      images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'],
      status: 'PUBLISHED',
      isFeatured: false,
      providerId: chefMansouri._id
    });

    const service3 = await Service.create({
      title: 'Coaching Sportif Personnalisé',
      description: 'Séances de sport personnalisées selon vos objectifs.',
      category: 'fitness',
      price: 150,
      currency: 'TND',
      duration: 60, // 1 heure en minutes
      location: 'Sousse',
      address: 'Stade Olympique, Sousse',
      city: 'Sousse',
      country: 'Tunisia',
      latitude: 35.8256,
      longitude: 10.6369,
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
      status: 'PUBLISHED',
      isFeatured: false,
      providerId: ahmed._id
    });

    const service4 = await Service.create({
      title: 'Séance Photo Voyage',
      description: 'Photographe professionnel pour capturer vos meilleurs moments en Tunisie.',
      category: 'photography',
      price: 350,
      currency: 'TND',
      duration: 120, // 2 heures en minutes
      location: 'Tunis',
      address: 'Avenue Bourguiba, Tunis',
      city: 'Tunis',
      country: 'Tunisia',
      latitude: 36.8065,
      longitude: 10.1815,
      images: ['https://images.unsplash.com/photo-1542038782486-a3e11cffd5cc?w=800'],
      status: 'PUBLISHED',
      isFeatured: true,
      providerId: leila._id
    });

    const service5 = await Service.create({
      title: 'Service de Traiteur pour Événements',
      description: 'Traiteur haut de gamme pour vos événements spéciaux.',
      category: 'catering',
      price: 1500,
      currency: 'TND',
      duration: 480, // 8 heures en minutes
      location: 'Sfax',
      address: 'Centre des congrès, Sfax',
      city: 'Sfax',
      country: 'Tunisia',
      latitude: 34.7406,
      longitude: 10.7603,
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
      status: 'UNAVAILABLE',
      isFeatured: false,
      providerId: chefMansouri._id
    });

    const service6 = await Service.create({
      title: 'Coiffure et Maquillage Mariage',
      description: 'Service complet de beauté pour mariées et événements.',
      category: 'beauty',
      price: 600,
      currency: 'TND',
      duration: 180, // 3 heures en minutes
      location: 'Djerba',
      address: 'Zone touristique, Djerba',
      city: 'Medenine',
      country: 'Tunisia',
      latitude: 33.8100,
      longitude: 10.8500,
      images: ['https://images.unsplash.com/photo-1562322145-92c21f5d6639?w=800'],
      status: 'PUBLISHED',
      isFeatured: true,
      providerId: leila._id
    });

    console.log('✅ Created 6 services');

    // Create some sample bookings
    console.log('📅 Creating bookings...');
    const booking1 = await Booking.create({
      type: 'PROPERTY',
      itemId: listing1._id,
      userId: regularUser._id,
      checkIn: new Date('2024-07-15'),
      checkOut: new Date('2024-07-20'),
      guests: 2,
      totalPrice: 1750,
      status: 'CONFIRMED',
      specialRequests: 'Arrivée tardive prévue'
    });

    const booking2 = await Booking.create({
      type: 'EXPERIENCE',
      itemId: experience1._id,
      userId: regularUser._id,
      checkIn: new Date('2024-07-25'),
      guests: 2,
      totalPrice: 300,
      status: 'CONFIRMED'
    });

    const booking3 = await Booking.create({
      type: 'SERVICE',
      itemId: service1._id,
      userId: regularUser._id,
      checkIn: new Date('2024-08-10'),
      guests: 4,
      totalPrice: 500,
      status: 'PENDING',
      specialRequests: 'Menu végétarien svp'
    });

    console.log('✅ Created 3 bookings');

    // Create some reviews
    console.log('⭐ Creating reviews...');
    await Review.create({
      rating: 5,
      comment: 'Un séjour magnifique dans un appartement impeccable avec une vue à couper le souffle. Fatma est une hôtesse formidable.',
      userId: regularUser._id,
      itemId: listing1._id,
      itemType: 'LISTING',
      bookingId: booking1._id
    });

    await Review.create({
      rating: 4,
      comment: 'J\'ai appris à préparer des plats traditionnels tunisiens. La chef est très pédagogue et l\'expérience était délicieuse!',
      userId: regularUser._id,
      itemId: experience1._id,
      itemType: 'EXPERIENCE',
      bookingId: booking2._id
    });

    console.log('✅ Created 2 reviews');

    // Create some messages
    console.log('💬 Creating messages...');
    await Message.create({
      senderId: regularUser._id,
      receiverId: fatma._id,
      content: 'Bonjour, je suis intéressé par votre appartement. Est-il disponible pour la semaine du 15 au 22 juillet?',
      bookingId: booking1._id,
      isRead: false
    });

    await Message.create({
      senderId: fatma._id,
      receiverId: regularUser._id,
      content: 'Bonjour! Oui, l\'appartement est disponible pour ces dates. N\'hésitez pas si vous avez d\'autres questions!',
      bookingId: booking1._id,
      isRead: true
    });

    await Message.create({
      senderId: regularUser._id,
      receiverId: fatma._id,
      content: 'Parfait! Je vais faire la réservation. Merci pour votre réponse rapide.',
      bookingId: booking1._id,
      isRead: true
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
