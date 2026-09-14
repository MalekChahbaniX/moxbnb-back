import 'dotenv/config';
import mongoose from 'mongoose';
import { Booking, Experience, Listing, Review, Service, User } from '../src/models';

const comments = {
  PROPERTY: [
    'Logement propre, confortable et conforme aux photos. Nous avons passe un excellent sejour.',
    'Tres bon accueil et emplacement pratique. Je recommande vivement cette adresse.'
  ],
  SERVICE: [
    'Service ponctuel, professionnel et tres agreable. Une experience sans souci.',
    'La prestation etait de qualite et le prestataire etait tres disponible.'
  ],
  EXPERIENCE: [
    'Une tres belle decouverte de la Tunisie avec un guide passionne et attentionne.',
    'Experience bien organisee, riche en decouvertes et fidele a la description.'
  ]
} as const;

const ratings = [5, 4] as const;

type Target = {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: 'PROPERTY' | 'SERVICE' | 'EXPERIENCE';
  price: number;
  listingId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  experienceId?: mongoose.Types.ObjectId;
};

async function seedReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    const [clients, listings, services, experiences] = await Promise.all([
      User.find({ role: 'CLIENT', isActive: true }).sort({ createdAt: 1 }).limit(2),
      Listing.find({ status: 'PUBLISHED' }).select('_id title price').sort({ createdAt: 1 }),
      Service.find({ status: 'PUBLISHED' }).select('_id title price').sort({ createdAt: 1 }),
      Experience.find({ status: 'PUBLISHED' }).select('_id title price').sort({ createdAt: 1 })
    ]);

    if (clients.length < 2) {
      throw new Error('At least two active CLIENT users are required. Run seed-users.ts first.');
    }

    const targets: Target[] = [
      ...listings.map((item) => ({ _id: item._id, title: item.title, type: 'PROPERTY' as const, price: item.price, listingId: item._id })),
      ...services.map((item) => ({ _id: item._id, title: item.title, type: 'SERVICE' as const, price: item.price, serviceId: item._id })),
      ...experiences.map((item) => ({ _id: item._id, title: item.title, type: 'EXPERIENCE' as const, price: item.price, experienceId: item._id }))
    ];

    let createdBookings = 0;
    let createdReviews = 0;

    for (const target of targets) {
      for (const [index, client] of clients.entries()) {
        const marker = `Moxbnb review seed | ${target.type} | ${target._id} | ${client._id}`;
        let booking = await Booking.findOne({ specialRequests: marker });

        if (!booking) {
          const bookingData = {
            type: target.type,
            status: 'COMPLETED' as const,
            checkIn: new Date(Date.now() - (index + 8) * 24 * 60 * 60 * 1000),
            checkOut: target.type === 'SERVICE'
              ? undefined
              : new Date(Date.now() - (index + 6) * 24 * 60 * 60 * 1000),
            guests: target.type === 'SERVICE' ? 1 : 2,
            totalPrice: target.price,
            currency: 'TND' as const,
            specialRequests: marker,
            paymentStatus: 'COMPLETED' as const,
            userId: client._id,
            ...(target.listingId ? { listingId: target.listingId } : {}),
            ...(target.serviceId ? { serviceId: target.serviceId } : {}),
            ...(target.experienceId ? { experienceId: target.experienceId } : {})
          };
          booking = await Booking.create(bookingData);
          createdBookings += 1;
        }

        const reviewExists = await Review.exists({ userId: client._id, bookingId: booking._id });
        if (!reviewExists) {
          await Review.create({
            rating: ratings[index],
            comment: comments[target.type][index],
            images: [],
            userId: client._id,
            bookingId: booking._id,
            ...(target.listingId ? { listingId: target.listingId } : {}),
            ...(target.serviceId ? { serviceId: target.serviceId } : {}),
            ...(target.experienceId ? { experienceId: target.experienceId } : {})
          });
          createdReviews += 1;
        }
      }
    }

    console.log(`Processed ${targets.length} contents.`);
    console.log(`Created ${createdBookings} demo bookings and ${createdReviews} reviews.`);
    console.log(`Each content has ${clients.length} reviews using real CLIENT user IDs.`);
  } catch (error) {
    console.error('Reviews seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedReviews();
