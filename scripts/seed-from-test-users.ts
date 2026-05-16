import mongoose from 'mongoose';
import { User, Listing, Service, Experience, Booking, Review } from '../src/models';

const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';

const existingUserIds = {
  admin: new mongoose.Types.ObjectId('69ebcaaf39032348753eef83'),
  host: new mongoose.Types.ObjectId('69ebcab039032348753eef98'),
  provider: new mongoose.Types.ObjectId('69ebcab139032348753eefae'),
  client: new mongoose.Types.ObjectId('69ebcab139032348753eefbc')
};

async function seedAll() {
  console.log('🔁 Starting combined seed using existing users and IDs');

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Validate existing users
    console.log('🔎 Verifying existing users...');
    const [admin, host, provider, client] = await Promise.all([
      User.findById(existingUserIds.admin),
      User.findById(existingUserIds.host),
      User.findById(existingUserIds.provider),
      User.findById(existingUserIds.client)
    ]);

    if (!admin || !host || !provider || !client) {
      throw new Error('One or more expected users do not exist. Vérifiez les IDs et la base de données.');
    }

    // Clear existing data except users
    console.log('🗑️  Clearing Listings, Services, Experiences, Bookings, Reviews...');
    await Promise.all([
      Review.deleteMany({}),
      Booking.deleteMany({}),
      Listing.deleteMany({}),
      Experience.deleteMany({}),
      Service.deleteMany({})
    ]);

    // Listings (assigned to host)
    console.log('🏠 Creating listings for host...');
    const listingsData = [
      {
        title: "Appartement de charme à La Marsa",
        description: "Appartement lumineux proche de la mer, parfait pour couple ou petite famille.",
        type: 'APARTMENT',
        category: 'entire_place',
        price: 110,
        currency: 'TND',
        address: 'Avenue Habib Bourguiba, La Marsa',
        city: 'La Marsa',
        country: 'Tunisia',
        latitude: 36.8678,
        longitude: 10.3333,
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1f8cb6bc?w=800',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800'
        ],
        amenities: ['WiFi', 'Climatisation', 'Cuisine'],
        maxGuests: 3,
        rules: ['Non fumeur', 'Pas de fêtes'],
        status: 'PUBLISHED',
        isFeatured: true,
        hostId: host._id
      },
      {
        title: "Studio moderne à Sousse centre",
        description: "Studio pratique au coeur de Sousse, proche des commerces et de la plage.",
        type: 'STUDIO',
        category: 'entire_place',
        price: 60,
        currency: 'TND',
        address: 'Rue de la Plage, Sousse',
        city: 'Sousse',
        country: 'Tunisia',
        latitude: 35.8256,
        longitude: 10.6360,
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800'
        ],
        amenities: ['WiFi', 'Climatisation'],
        maxGuests: 2,
        rules: ['Non fumeur'],
        status: 'PUBLISHED',
        isFeatured: false,
        hostId: host._id
      }
    ];

    const createdListings = await Listing.insertMany(listingsData);

    // Services (assigned to provider)
    console.log('🛠️  Creating services for provider...');
    const servicesData = [
      {
        title: 'Massage bien-être à domicile - Tunis',
        description: 'Séance relaxante de 90 minutes par un professionnel certifié.',
        category: 'wellness',
        price: 120,
        currency: 'TND',
        duration: 90,
        address: 'À domicile (Tunis)',
        city: 'Tunis',
        country: 'Tunisia',
        images: [
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800',
          'https://images.unsplash.com/photo-1517430816045-df4b7de11d1e?w=800'
        ],
        status: 'PUBLISHED',
        isFeatured: false,
        providerId: provider._id
      }
    ];

    const createdServices = await Service.insertMany(servicesData);

    // Experiences (assigned to provider)
    console.log('🎯 Creating experiences for provider...');
    const experiencesData = [
      {
        title: 'Atelier cuisine tunisienne - Sidi Bou Said',
        description: 'Apprenez à préparer briks et couscous avec un chef local.',
        category: 'cooking',
        price: 90,
        currency: 'TND',
        duration: 180,
        maxGuests: 8,
        location: 'Maison d\'hôtes, Sidi Bou Said',
        address: 'Sidi Bou Said',
        city: 'Sidi Bou Said',
        country: 'Tunisia',
        latitude: 36.8667,
        longitude: 10.3417,
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
          'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800',
          'https://images.unsplash.com/photo-1506368083636-6defb67639c7?w=800'
        ],
        includes: ['Ingrédients', 'Recette', 'Déjeuner'],
        requirements: ['Envie d\'apprendre'],
        difficulty: 'BEGINNER',
        status: 'PUBLISHED',
        isFeatured: true,
        providerId: provider._id
      }
    ];

    const createdExperiences = await Experience.insertMany(experiencesData);

    // Bookings (client books one listing, one experience, one service)
    console.log('📅 Creating bookings for client...');
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const twoDays = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    const bookingListing = await Booking.create({
      type: 'PROPERTY',
      status: 'COMPLETED',
      checkIn: tomorrow,
      checkOut: twoDays,
      guests: 2,
      totalPrice: createdListings[0].price * 1,
      currency: 'TND',
      paymentStatus: 'COMPLETED',
      userId: client._id,
      listingId: createdListings[0]._id
    });

    const bookingExperience = await Booking.create({
      type: 'EXPERIENCE',
      status: 'COMPLETED',
      checkIn: tomorrow,
      guests: 4,
      totalPrice: createdExperiences[0].price * 4,
      currency: 'TND',
      paymentStatus: 'COMPLETED',
      userId: client._id,
      experienceId: createdExperiences[0]._id
    });

    const bookingService = await Booking.create({
      type: 'SERVICE',
      status: 'COMPLETED',
      checkIn: tomorrow,
      guests: 1,
      totalPrice: createdServices[0].price,
      currency: 'TND',
      paymentStatus: 'COMPLETED',
      userId: client._id,
      serviceId: createdServices[0]._id
    });

    // Reviews (from client for each booking)
    console.log('⭐ Creating reviews for completed bookings...');
    const reviews = [
      {
        rating: 5,
        comment: 'Séjour excellent, hôte très accueillant.',
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
        userId: client._id,
        listingId: createdListings[0]._id,
        bookingId: bookingListing._id
      },
      {
        rating: 5,
        comment: 'Atelier très instructif et délicieux!',
        images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
        userId: client._id,
        experienceId: createdExperiences[0]._id,
        bookingId: bookingExperience._id
      },
      {
        rating: 4,
        comment: 'Massage relaxant, ponctuel et professionnel.',
        images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800'],
        userId: client._id,
        serviceId: createdServices[0]._id,
        bookingId: bookingService._id
      }
    ];

    const createdReviews = await Review.insertMany(reviews);

    console.log(`✅ Seed finished: 4 existing users, ${createdListings.length} listings, ${createdServices.length} services, ${createdExperiences.length} experiences, 3 bookings, ${createdReviews.length} reviews created.`);

  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedAll().catch(e => {
  console.error(e);
  process.exit(1);
});
