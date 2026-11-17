import 'dotenv/config';
import mongoose from 'mongoose';
import { Experience, Listing, Service, User } from '../src/models';

const HOST_EMAIL = 'malek-host@moxbnb.com';
const PROVIDER_EMAIL = 'malek-provider@moxbnb.com';

async function seedPromotions() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(mongoUri);

  try {
    const [host, provider] = await Promise.all([
      User.findOne({ email: HOST_EMAIL, role: 'HOST', isActive: true }).select('_id'),
      User.findOne({ email: PROVIDER_EMAIL, role: 'PROVIDER', isActive: true }).select('_id'),
    ]);

    if (!host) {
      throw new Error(`Active HOST account not found: ${HOST_EMAIL}`);
    }
    if (!provider) {
      throw new Error(`Active PROVIDER account not found: ${PROVIDER_EMAIL}`);
    }

    const promotionStartDate = new Date(Date.now() - 5 * 60 * 1000);
    const promotionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Keep demo offers separate from real inventory so rerunning this seed is safe.
    const [listing, experience, service] = await Promise.all([
      Listing.findOneAndUpdate(
        { hostId: host._id, title: '[DEMO PROMO] Appartement avec vue sur Sidi Bou Said' },
        {
          $set: {
            description: 'Annonce de démonstration pour tester les promotions dans Moxbnb.',
            type: 'APARTMENT',
            category: 'location saisonniere',
            price: 240,
            currency: 'TND',
            address: 'Rue Hedi Zarrouk',
            city: 'Sidi Bou Said',
            country: 'Tunisia',
            images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'],
            amenities: ['Wi-Fi', 'Climatisation'],
            bedrooms: 2,
            bathrooms: 1,
            maxGuests: 4,
            rules: [],
            pricingType: 'NIGHTLY',
            status: 'PUBLISHED',
            isFeatured: false,
            promotionPercent: 15,
            promotionStartDate,
            promotionEndDate,
            promotionStatus: 'ACTIVE',
          },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ).select('_id title'),
      Experience.findOneAndUpdate(
        { providerId: provider._id, title: '[DEMO PROMO] Decouverte de la medina de Tunis' },
        {
          $set: {
            description: 'Experience de démonstration pour tester les promotions dans Moxbnb.',
            category: 'culture',
            price: 120,
            currency: 'TND',
            duration: 180,
            maxGuests: 8,
            location: 'Medina de Tunis',
            address: 'Place de la Kasbah',
            city: 'Tunis',
            country: 'Tunisia',
            images: ['https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200&q=80'],
            includes: [],
            requirements: [],
            difficulty: 'BEGINNER',
            status: 'PUBLISHED',
            isFeatured: false,
            promotionPercent: 20,
            promotionStartDate,
            promotionEndDate,
            promotionStatus: 'ACTIVE',
          },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ).select('_id title'),
      Service.findOneAndUpdate(
        { providerId: provider._id, title: '[DEMO PROMO] Transfert aeroport Tunis-Carthage' },
        {
          $set: {
            description: 'Service de démonstration pour tester les promotions dans Moxbnb.',
            category: 'transport',
            price: 70,
            currency: 'TND',
            duration: 60,
            location: 'Tunis',
            address: 'Aeroport Tunis-Carthage',
            city: 'Tunis',
            country: 'Tunisia',
            images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'],
            status: 'PUBLISHED',
            isFeatured: false,
            promotionPercent: 10,
            promotionStartDate,
            promotionEndDate,
            promotionStatus: 'ACTIVE',
          },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      ).select('_id title'),
    ]);

    if (!listing || !experience || !service) {
      throw new Error('Failed to create or update one or more demo offers.');
    }

    const promotions = [
      { type: 'Hébergement', item: listing, percent: 15 },
      { type: 'Expérience', item: experience, percent: 20 },
      { type: 'Service', item: service, percent: 10 },
    ];
    for (const promotion of promotions) {
      console.log(
        `${promotion.type}: ${promotion.item.title} - ${promotion.percent}% (${promotionEndDate.toLocaleDateString()})`,
      );
    }

    console.log('Demo offers are published and their promotions are active.');
  } finally {
    await mongoose.disconnect();
  }
}

seedPromotions().catch((error: unknown) => {
  console.error('Promotions seed failed:', error);
  process.exitCode = 1;
});
