import mongoose from 'mongoose';
import { User, Listing } from '../src/models';

const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';

const existingHostId = new mongoose.Types.ObjectId('69ebcab039032348753eef98');

async function seedStudentListings() {
  console.log('🎓 Starting student listings seed using existing host ID');

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const host = await User.findById(existingHostId);
    if (!host) {
      throw new Error('Host user non trouvé. Vérifiez que l\'ID existe dans la base de données.');
    }

    const studentListings = [
      {
        title: 'Chambre étudiante confortable à Tunis El Manar',
        description: 'Chambre meublée proche de l\'université, idéale pour les étudiants avec accès facile aux transports en commun.',
        type: 'PRIVATE_ROOM_STUDENTS',
        category: 'student_housing',
        price: 60,
        monthlyPrice: 1500,
        pricingType: 'BOTH',
        currency: 'TND',
        address: 'Avenue Taieb Mhiri, Tunis El Manar',
        city: 'Tunis',
        country: 'Tunisia',
        latitude: 36.8028,
        longitude: 10.1787,
        images: [
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
        ],
        amenities: ['WiFi', 'Bureau étudiant', 'Cuisine partagée', 'Buanderie', 'Parking vélo'],
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 1,
        rules: ['Non fumeur', 'Calme après 22h', 'Pas de fêtes'],
        targetAudience: 'STUDENTS',
        status: 'PUBLISHED',
        isFeatured: true,
        hostId: host._id
      },
      {
        title: 'Studio meublé pour étudiants à Sfax',
        description: 'Petite structure indépendante proche du centre universitaire, avec location mensuelle adaptée aux budgets étudiants.',
        type: 'STUDIO',
        category: 'student_housing',
        price: 55,
        monthlyPrice: 1300,
        pricingType: 'BOTH',
        currency: 'TND',
        address: 'Rue de la Liberté, Sfax',
        city: 'Sfax',
        country: 'Tunisia',
        latitude: 34.7406,
        longitude: 10.7603,
        images: [
          'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
        ],
        amenities: ['WiFi', 'Climatisation', 'Cuisine équipée', 'Internet haut débit'],
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 1,
        rules: ['Non fumeur', 'Respect du voisinage'],
        targetAudience: 'STUDENTS',
        status: 'PUBLISHED',
        isFeatured: false,
        hostId: host._id
      },
      {
        title: 'Colocation étudiante à Monastir',
        description: 'Grande colocation avec chambres séparées et salon partagé, proche des transports et des campus.',
        type: 'SHARED_ROOM_STUDENTS',
        category: 'student_housing',
        price: 45,
        monthlyPrice: 1100,
        pricingType: 'MONTHLY',
        currency: 'TND',
        address: 'Boulevard Habib Bourguiba, Monastir',
        city: 'Monastir',
        country: 'Tunisia',
        latitude: 35.7779,
        longitude: 10.8261,
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
        ],
        amenities: ['WiFi', 'Cuisine partagée', 'Salon commun', 'Machine à laver', 'Accès métro bus'],
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 3,
        rules: ['Non fumeur', 'Partage des espaces communs', 'Calme en soirée'],
        targetAudience: 'STUDENTS',
        status: 'PUBLISHED',
        isFeatured: false,
        hostId: host._id
      },
      {
        title: 'Maison étudiante économique à Nabeul',
        description: 'Maison entière avec plusieurs chambres pour étudiants, idéale pour colocation à long terme.',
        type: 'ENTIRE_MAISON_STUDENTS',
        category: 'student_housing',
        price: 200,
        monthlyPrice: 4200,
        pricingType: 'MONTHLY',
        currency: 'TND',
        address: 'Quartier universitaire, Nabeul',
        city: 'Nabeul',
        country: 'Tunisia',
        latitude: 36.4502,
        longitude: 10.7365,
        images: [
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1f8cb6bc?w=800'
        ],
        amenities: ['WiFi', 'Cuisine complète', 'Salon', 'Jardin', 'Buanderie'],
        bedrooms: 4,
        bathrooms: 2,
        maxGuests: 4,
        rules: ['Non fumeur', 'Respect des autres occupants'],
        targetAudience: 'STUDENTS',
        status: 'PUBLISHED',
        isFeatured: false,
        hostId: host._id
      }
    ];

    const createdStudentListings = await Listing.insertMany(studentListings);
    console.log(`✅ Created ${createdStudentListings.length} student listings without deleting existing data.`);
    createdStudentListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.city} - ${listing.price} TND`);
    });
  } catch (err) {
    console.error('❌ Student seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedStudentListings().catch((e) => {
  console.error(e);
  process.exit(1);
});