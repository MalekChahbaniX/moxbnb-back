import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models';

const usersData = [
  { firstName: 'Yassine', lastName: 'Ben Salem', email: 'yassine.bensalem@moxbnb.tn', role: 'CLIENT', phone: '+216 20 101 001', language: 'fr' },
  { firstName: 'Ines', lastName: 'Trabelsi', email: 'ines.trabelsi@moxbnb.tn', role: 'CLIENT', phone: '+216 21 202 002', language: 'ar' },
  { firstName: 'Mohamed', lastName: 'Karray', email: 'mohamed.karray@moxbnb.tn', role: 'CLIENT', phone: '+216 22 303 003', language: 'fr' },
  { firstName: 'Sarra', lastName: 'Masmoudi', email: 'sarra.masmoudi@moxbnb.tn', role: 'CLIENT', phone: '+216 23 404 004', language: 'en' },
  { firstName: 'Fatma', lastName: 'Ben Amor', email: 'fatma.benamor@moxbnb.tn', role: 'HOST', phone: '+216 24 505 005', language: 'fr', city: 'Tunis', address: 'Rue de la Kasbah, Tunis', propertyTypes: ['APARTMENT', 'STUDIO'] },
  { firstName: 'Ahmed', lastName: 'Jlassi', email: 'ahmed.jlassi@moxbnb.tn', role: 'HOST', phone: '+216 25 606 006', language: 'ar', city: 'Hammamet', address: 'Route de la Plage, Hammamet', propertyTypes: ['VILLA', 'HOUSE'] },
  { firstName: 'Nour', lastName: 'Chaabane', email: 'nour.chaabane@moxbnb.tn', role: 'HOST', phone: '+216 26 707 007', language: 'fr', city: 'Sousse', address: 'Boulevard de la Corniche, Sousse', propertyTypes: ['ROOM', 'PRIVATE_ROOM_STUDENTS'] },
  { firstName: 'Amine', lastName: 'Belhaj', email: 'amine.belhaj@moxbnb.tn', role: 'PROVIDER', phone: '+216 27 808 008', language: 'fr', companyName: 'Darna Services', specialization: 'Transport et conciergerie', serviceTypes: ['transport', 'conciergerie'] },
  { firstName: 'Rim', lastName: 'Gharbi', email: 'rim.gharbi@moxbnb.tn', role: 'PROVIDER', phone: '+216 28 909 009', language: 'ar', companyName: 'Rim Bien-etre', specialization: 'Bien-etre et beaute', serviceTypes: ['wellness', 'beauty'] },
  { firstName: 'Walid', lastName: 'Mansouri', email: 'walid.mansouri@moxbnb.tn', role: 'PROVIDER', phone: '+216 29 010 010', language: 'fr', companyName: 'Mansouri Experiences', specialization: 'Guides et activites', serviceTypes: ['guide', 'adventure'] }
] as const;

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    await User.deleteMany({ email: { $in: usersData.map((user) => user.email) } });

    const createdUsers = await User.create(usersData.map((user) => ({
      ...user,
      password: 'password123',
      isVerified: true,
      isActive: true,
      nationality: 'Tunisienne',
      timezone: 'Africa/Tunis',
      currency: 'TND',
      bio: `Membre tunisien de Moxbnb - ${user.role.toLowerCase()}.`,
      settings: {
        language: user.language,
        currency: 'TND',
        theme: 'light',
        profileVisibility: 'public',
        allowDirectMessages: true,
        pushNotifications: true,
        emailNotifications: true
      }
    })));

    console.log(`Created ${createdUsers.length} users.`);
    createdUsers.forEach((user) => console.log(`${user._id} | ${user.role} | ${user.email}`));
    console.log('Default password for all users: password123');
  } catch (error) {
    console.error('Users seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedUsers();
