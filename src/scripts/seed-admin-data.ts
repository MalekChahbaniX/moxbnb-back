import { Listing } from '../models/Listing';
import { Service } from '../models/Service';
import { Experience } from '../models/Experience';
import { User } from '../models/User';
import mongoose from 'mongoose';

/**
 * Seed pending listings for testing admin approval workflow
 */
export async function seedPendingListings() {
  try {
    console.log('🌱 Seeding pending listings...');

    // Find a host user (or create one for testing)
    let host = await User.findOne({ role: 'host' });

    if (!host) {
      host = await User.create({
        name: 'Test Host',
        email: 'testhost@example.com',
        password: 'hashed_password_here',
        phone: '+216 71 234 567',
        role: 'host',
        status: 'active',
        isActive: true
      });
      console.log('✅ Created test host user');
    }

    const pendingListings = [
      {
        title: 'Luxe Studio Downtown - En attente',
        type: 'apartment',
        description: 'Studio moderne avec vue panoramique sur la ville, climatisation, WiFi haut débit',
        location: 'Downtown',
        city: 'Tunis',
        region: 'Tunis',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNight: 150,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'],
        amenities: ['WiFi', 'Climatisation', 'Cuisine équipée', 'TV'],
        host: host._id,
        status: 'pending',
        createdAt: new Date()
      },
      {
        title: 'Villa Prestige Hammamet - Validation en cours',
        type: 'villa',
        description: 'Magnifique villa avec piscine, jardin privatif, proche de la plage',
        location: 'Hammamet',
        city: 'Hammamet',
        region: 'Nabeul',
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        pricePerNight: 450,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500'],
        amenities: ['Piscine', 'Jardin', 'Climatisation', 'WiFi', 'Parking'],
        host: host._id,
        status: 'pending',
        createdAt: new Date()
      },
      {
        title: 'Maison Médina - Nouvelle soumission',
        type: 'house',
        description: 'Authentique maison médina rénovée avec tous les conforts modernes',
        location: 'Medina',
        city: 'Tunis',
        region: 'Tunis',
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        pricePerNight: 280,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500'],
        amenities: ['Riad', 'WiFi', 'Climatisation', 'Cuisine traditionnelle'],
        host: host._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    const created = await Listing.insertMany(pendingListings);
    console.log(`✅ Created ${created.length} pending listings`);
    return created;
  } catch (error) {
    console.error('❌ Error seeding listings:', error);
    throw error;
  }
}

/**
 * Seed pending services for testing admin approval workflow
 */
export async function seedPendingServices() {
  try {
    console.log('🌱 Seeding pending services...');

    // Find a provider user (or create one for testing)
    let provider = await User.findOne({ role: 'provider' });

    if (!provider) {
      provider = await User.create({
        name: 'Test Provider',
        email: 'testprovider@example.com',
        password: 'hashed_password_here',
        phone: '+216 72 345 678',
        role: 'provider',
        status: 'active',
        isActive: true
      });
      console.log('✅ Created test provider user');
    }

    const pendingServices = [
      {
        title: 'Chef Privé - Cuisine Méditerranéenne',
        description: 'Chef expérimenté proposant repas personnalisés avec produits locaux',
        serviceType: 'privateChef',
        location: 'Tunis',
        city: 'Tunis',
        region: 'Tunis',
        price: 250,
        duration: '3 heures',
        image: 'https://images.unsplash.com/photo-1556910103-2eccc2a76ef6?w=500',
        provider: provider._id,
        status: 'pending',
        createdAt: new Date()
      },
      {
        title: 'Massage Relaxant - Spa Domicile',
        description: 'Massage suédois, thaïlandais et aromathérapie chez vous',
        serviceType: 'massage',
        location: 'Hammamet',
        city: 'Hammamet',
        region: 'Nabeul',
        price: 180,
        duration: '90 minutes',
        image: 'https://images.unsplash.com/photo-1560806887-1295e3dd53ba?w=500',
        provider: provider._id,
        status: 'pending',
        createdAt: new Date()
      },
      {
        title: 'Coaching Fitness Personnel',
        description: 'Séances personnalisées pour atteindre vos objectifs fitness',
        serviceType: 'sportsCoach',
        location: 'Tunis',
        city: 'Tunis',
        region: 'Tunis',
        price: 80,
        duration: '1 heure',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
        provider: provider._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        title: 'Photographe Événementiel',
        description: 'Couverture photo professionnelle de vos événements',
        serviceType: 'photography',
        location: 'Sousse',
        city: 'Sousse',
        region: 'Sousse',
        price: 350,
        duration: '4 heures',
        image: 'https://images.unsplash.com/photo-1502764613149-7f3d7ce793d5?w=500',
        provider: provider._id,
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    const created = await Service.insertMany(pendingServices);
    console.log(`✅ Created ${created.length} pending services`);
    return created;
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
}

/**
 * Seed pending experiences for testing admin approval workflow
 */
export async function seedPendingExperiences() {
  try {
    console.log('🌱 Seeding pending experiences...');

    // Find a provider user
    let provider = await User.findOne({ role: 'provider' });

    if (!provider) {
      provider = await User.create({
        name: 'Test Experience Provider',
        email: 'testexperience@example.com',
        password: 'hashed_password_here',
        phone: '+216 73 456 789',
        role: 'provider',
        status: 'active',
        isActive: true
      });
      console.log('✅ Created test experience provider user');
    }

    const pendingExperiences = [
      {
        title: 'Visite Guidée Médina Tunis',
        description: 'Découvrez les secrets de la médina authentique avec un guide expert',
        location: 'Tunis',
        city: 'Tunis',
        region: 'Tunis',
        price: 120,
        duration: '3 heures',
        maxParticipants: 6,
        images: ['https://images.unsplash.com/photo-1488747807830-63789f68bb65?w=500'],
        provider: provider._id,
        status: 'pending',
        createdAt: new Date()
      },
      {
        title: 'Cours de Cuisine Tunisienne',
        description: 'Apprenez à préparer les plats traditionnels tunisiens authentiques',
        location: 'Sousse',
        city: 'Sousse',
        region: 'Sousse',
        price: 200,
        duration: '4 heures',
        maxParticipants: 8,
        images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
        provider: provider._id,
        status: 'pending',
        createdAt: new Date()
      }
    ];

    // Create Experience documents if Experience model exists
    try {
      const created = await Experience.insertMany(pendingExperiences);
      console.log(`✅ Created ${created.length} pending experiences`);
      return created;
    } catch (err) {
      console.warn('⚠️ Experience model not yet available, skipping experiences seed');
      return [];
    }
  } catch (error) {
    console.error('❌ Error seeding experiences:', error);
    throw error;
  }
}

/**
 * Run all seed functions
 */
export async function seedAdminTestData() {
  try {
    console.log('\n🚀 Starting admin test data seeding...\n');
    
    await seedPendingListings();
    await seedPendingServices();
    await seedPendingExperiences();
    
    console.log('\n✅ Admin test data seeding completed!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}
