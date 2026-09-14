import 'dotenv/config';
import mongoose from 'mongoose';
import { Experience, Listing, Service, User } from '../src/models';

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const listingData = [
  ['Appartement bleu de Sidi Bou Said', 'APARTMENT', 'location saisonniere', 220, 'Sidi Bou Said', 'Rue Hedi Zarrouk', 2, 1, 4, 'fatma.benamor@moxbnb.tn'],
  ['Villa familiale avec piscine a Hammamet', 'VILLA', 'villa', 650, 'Hammamet', 'Route de la Plage', 4, 3, 8, 'ahmed.jlassi@moxbnb.tn'],
  ['Maison traditionnelle a Djerba', 'HOUSE', 'maison traditionnelle', 280, 'Djerba', 'Houmt Souk, Djerba', 3, 2, 6, 'ahmed.jlassi@moxbnb.tn'],
  ['Studio vue mer a Monastir', 'STUDIO', 'studio', 150, 'Monastir', 'Avenue Habib Bourguiba', 1, 1, 2, 'fatma.benamor@moxbnb.tn'],
  ['Hotel Dar Medina Tunis', 'ROOM', 'hotel', 190, 'Tunis', 'Rue du Pacha, Medina', 1, 1, 2, 'fatma.benamor@moxbnb.tn'],
  ['Loft moderne aux Berges du Lac', 'LOFT', 'loft', 320, 'Tunis', 'Rue du Lac Windermere', 2, 2, 4, 'fatma.benamor@moxbnb.tn'],
  ['Chambre etudiante El Manar', 'PRIVATE_ROOM_STUDENTS', 'logement etudiant', 550, 'Tunis', 'Avenue de la Liberte, El Manar', 1, 1, 1, 'nour.chaabane@moxbnb.tn'],
  ['Colocation etudiante Sahloul', 'SHARED_ROOM_STUDENTS', 'logement etudiant', 380, 'Sousse', 'Rue de Sahloul', 1, 1, 1, 'nour.chaabane@moxbnb.tn'],
  ['Maison etudiante complete Ariana', 'ENTIRE_MAISON_STUDENTS', 'logement etudiant', 1800, 'Ariana', 'Rue du Lac Ichkeul', 4, 2, 6, 'nour.chaabane@moxbnb.tn'],
  ['Cabane nature au Cap Bon', 'CABIN', 'sejour insolite', 260, 'Nabeul', 'Route de Korba', 1, 1, 3, 'ahmed.jlassi@moxbnb.tn'],
  ['Appartement familial a Sfax', 'CONDO', 'appartement', 180, 'Sfax', 'Avenue Majida Boulila', 3, 2, 5, 'fatma.benamor@moxbnb.tn'],
  ['Maison de plage a Mahdia', 'TOWNHOUSE', 'maison de plage', 400, 'Mahdia', 'Corniche de Mahdia', 3, 2, 6, 'ahmed.jlassi@moxbnb.tn']
] as const;

const serviceData = [
  ['Transfert aeroport Tunis-Carthage', 'transport', 70, 90, 'Tunis', 'amine.belhaj@moxbnb.tn'],
  ['Chauffeur prive pour excursions', 'transport', 180, 360, 'Tunis et Cap Bon', 'amine.belhaj@moxbnb.tn'],
  ['Menage de logement', 'conciergerie', 80, 120, 'Tunis', 'amine.belhaj@moxbnb.tn'],
  ['Check-in et remise des cles', 'conciergerie', 45, 60, 'Hammamet', 'amine.belhaj@moxbnb.tn'],
  ['Massage relaxant a domicile', 'wellness', 120, 90, 'Sousse', 'rim.gharbi@moxbnb.tn'],
  ['Coiffure et mise en beaute', 'beauty', 90, 90, 'Tunis', 'rim.gharbi@moxbnb.tn'],
  ['Photographe de voyage', 'photography', 250, 120, 'Sidi Bou Said', 'rim.gharbi@moxbnb.tn'],
  ['Baby-sitting en soiree', 'family', 60, 180, 'Hammamet', 'rim.gharbi@moxbnb.tn'],
  ['Guide local francophone', 'guide', 150, 180, 'Tunis', 'walid.mansouri@moxbnb.tn'],
  ['Organisation de surprise romantique', 'events', 300, 180, 'Djerba', 'walid.mansouri@moxbnb.tn']
] as const;

const experienceData = [
  ['Visite gourmande de la Medina', 'food', 95, 180, 8, 'Medina de Tunis', 'walid.mansouri@moxbnb.tn'],
  ['Atelier de poterie a Sejnane', 'art', 140, 300, 6, 'Sejnane', 'walid.mansouri@moxbnb.tn'],
  ['Coucher de soleil a Sidi Bou Said', 'culture', 80, 150, 10, 'Sidi Bou Said', 'walid.mansouri@moxbnb.tn'],
  ['Cours de cuisine tunisienne', 'cooking', 130, 240, 8, 'Hammamet', 'rim.gharbi@moxbnb.tn'],
  ['Balade en quad dans le desert', 'adventure', 220, 240, 6, 'Douz', 'walid.mansouri@moxbnb.tn'],
  ['Plongee sous-marine a Tabarka', 'sport', 190, 240, 6, 'Tabarka', 'walid.mansouri@moxbnb.tn'],
  ['Balade en bateau a Djerba', 'sea', 160, 180, 10, 'Djerba', 'amine.belhaj@moxbnb.tn'],
  ['Randonnee dans les montagnes de Zaghouan', 'hiking', 110, 300, 12, 'Zaghouan', 'walid.mansouri@moxbnb.tn'],
  ['Initiation a la calligraphie arabe', 'art', 75, 120, 8, 'Kairouan', 'rim.gharbi@moxbnb.tn'],
  ['Soiree musicale tunisienne', 'music', 100, 180, 20, 'Sousse', 'rim.gharbi@moxbnb.tn']
] as const;

const additionalListingData = [
  ['Dar Andalou a Bizerte', 'HOUSE', 'maison traditionnelle', 240, 'Bizerte', 'Rue de la Corniche', 3, 2, 6, 'ahmed.jlassi@moxbnb.tn', 'photo-1510798831971-661eb04b3739'],
  ['Gite rural a Beja', 'CABIN', 'sejour nature', 180, 'Beja', 'Route des Grandes Plaines', 2, 1, 4, 'ahmed.jlassi@moxbnb.tn', 'photo-1449158743715-0a90ebb6d2d8'],
  ['Maison d hotes a Jendouba', 'HOUSE', 'maison d hotes', 210, 'Jendouba', 'Avenue de Tabarka', 3, 2, 6, 'ahmed.jlassi@moxbnb.tn', 'photo-1564013799919-ab600027ffc6'],
  ['Appartement central a Gafsa', 'APARTMENT', 'appartement', 140, 'Gafsa', 'Avenue Farhat Hached', 2, 1, 4, 'fatma.benamor@moxbnb.tn', 'photo-1493809842364-78817add7ffb'],
  ['Oasis residence a Gabes', 'STUDIO', 'sejour desert', 160, 'Gabes', 'Rue de l Oasis', 1, 1, 2, 'fatma.benamor@moxbnb.tn', 'photo-1505693416388-ac5ce068fe85'],
  ['Maison de famille a Medenine', 'HOUSE', 'maison familiale', 230, 'Medenine', 'Rue de Djerba', 3, 2, 6, 'ahmed.jlassi@moxbnb.tn', 'photo-1600607687920-4e2a09cf159d'],
  ['Eco lodge a Tozeur', 'CABIN', 'sejour insolite', 290, 'Tozeur', 'Palmeraie de Tozeur', 1, 1, 2, 'ahmed.jlassi@moxbnb.tn', 'photo-1542718610-a1d656d1884c'],
  ['Studio desert a Kebili', 'STUDIO', 'sejour desert', 135, 'Kebili', 'Route de Douz', 1, 1, 2, 'fatma.benamor@moxbnb.tn', 'photo-1500530855697-b586d89ba3ee'],
  ['Maison de montagne a Siliana', 'HOUSE', 'sejour nature', 175, 'Siliana', 'Route de Kesra', 2, 1, 4, 'ahmed.jlassi@moxbnb.tn', 'photo-1470770841072-f978cf4d019e'],
  ['Riad moderne au Kef', 'LOFT', 'loft', 205, 'Le Kef', 'Rue de la Kasbah', 2, 1, 4, 'fatma.benamor@moxbnb.tn', 'photo-1600607687939-ce8a6c25118c'],
  ['Appartement familial a Kasserine', 'CONDO', 'appartement', 125, 'Kasserine', 'Avenue de l Algerie', 3, 1, 5, 'fatma.benamor@moxbnb.tn', 'photo-1600566753086-00f18fb6b3ea'],
  ['Villa calme a Ben Arous', 'VILLA', 'villa', 360, 'Ben Arous', 'Route de Hammam Lif', 3, 2, 6, 'ahmed.jlassi@moxbnb.tn', 'photo-1600585154340-be6161a56a0c']
] as const;

const additionalServiceData = [
  ['Excursion en bateau a Bizerte', 'transport', 180, 240, 'Bizerte', 'amine.belhaj@moxbnb.tn', 'photo-1500375592092-40eb2168fd21'],
  ['Visite agricole a Beja', 'guide', 90, 180, 'Beja', 'walid.mansouri@moxbnb.tn', 'photo-1500076656116-558758c991c1'],
  ['Transfert vers Tabarka', 'transport', 220, 240, 'Jendouba', 'amine.belhaj@moxbnb.tn', 'photo-1494783367193-149034c05e8f'],
  ['Nettoyage apres sejour a Gafsa', 'conciergerie', 75, 120, 'Gafsa', 'amine.belhaj@moxbnb.tn', 'photo-1581578731548-c64695cc6952'],
  ['Massage aux huiles a Gabes', 'wellness', 110, 90, 'Gabes', 'rim.gharbi@moxbnb.tn', 'photo-1544161515-4ab6ce6db874'],
  ['Organisation de visite a Medenine', 'guide', 100, 180, 'Medenine', 'walid.mansouri@moxbnb.tn', 'photo-1539650116574-75c0c6d73f6e'],
  ['Petit dejeuner oasis a Tozeur', 'cuisine', 85, 120, 'Tozeur', 'rim.gharbi@moxbnb.tn', 'photo-1498837167922-ddd27525d352'],
  ['Location de velo a Kebili', 'sport', 45, 240, 'Kebili', 'amine.belhaj@moxbnb.tn', 'photo-1485965120184-e220f721d03e'],
  ['Photographe nature a Siliana', 'photography', 180, 120, 'Siliana', 'rim.gharbi@moxbnb.tn', 'photo-1452587925148-ce544e77e70d'],
  ['Guide historique du Kef', 'guide', 95, 180, 'Le Kef', 'walid.mansouri@moxbnb.tn', 'photo-1564501049412-61c2a3083791'],
  ['Chef a domicile a Kasserine', 'cuisine', 260, 240, 'Kasserine', 'rim.gharbi@moxbnb.tn', 'photo-1556910103-1c02745aae4d'],
  ['Decoration evenement a Ben Arous', 'events', 280, 240, 'Ben Arous', 'walid.mansouri@moxbnb.tn', 'photo-1519167758481-83f550bb49b3']
] as const;

const additionalExperienceData = [
  ['Peche traditionnelle a Bizerte', 'sea', 120, 180, 8, 'Bizerte', 'walid.mansouri@moxbnb.tn', 'photo-1534766555764-cec7a662b1b2'],
  ['Degustation de produits du terroir a Beja', 'food', 80, 150, 10, 'Beja', 'rim.gharbi@moxbnb.tn', 'photo-1504674900247-0877df9cc836'],
  ['Randonnee forestiere a Jendouba', 'hiking', 110, 300, 12, 'Jendouba', 'walid.mansouri@moxbnb.tn', 'photo-1448375240586-882707db888b'],
  ['Balade dans les oasis de Gafsa', 'culture', 90, 180, 10, 'Gafsa', 'walid.mansouri@moxbnb.tn', 'photo-1500534623283-312aade485b7'],
  ['Atelier de tissage a Gabes', 'art', 100, 180, 8, 'Gabes', 'rim.gharbi@moxbnb.tn', 'photo-1452860606245-08befc0ff44b'],
  ['Circuit des ksour a Medenine', 'culture', 130, 240, 12, 'Medenine', 'walid.mansouri@moxbnb.tn', 'photo-1539650116574-75c0c6d73f6e'],
  ['Nuit sous les palmiers a Tozeur', 'adventure', 240, 360, 8, 'Tozeur', 'walid.mansouri@moxbnb.tn', 'photo-1470252649378-9c29740c9fa8'],
  ['Coucher de soleil a Kebili', 'adventure', 95, 150, 10, 'Kebili', 'walid.mansouri@moxbnb.tn', 'photo-1500534623283-312aade485b7'],
  ['Randonnée de Kesra a Siliana', 'hiking', 115, 300, 10, 'Siliana', 'walid.mansouri@moxbnb.tn', 'photo-1464822759023-fed622ff2c3b'],
  ['Patrimoine ottoman du Kef', 'culture', 85, 150, 15, 'Le Kef', 'walid.mansouri@moxbnb.tn', 'photo-1533929736458-ca588d08c8be'],
  ['Atelier de cuisine du terroir a Kasserine', 'cooking', 105, 240, 8, 'Kasserine', 'rim.gharbi@moxbnb.tn', 'photo-1556910103-1c02745aae4d'],
  ['Hammam traditionnel a Ben Arous', 'wellness', 90, 120, 8, 'Ben Arous', 'rim.gharbi@moxbnb.tn', 'photo-1540555700478-4be289fbecef']
] as const;

async function seedMarketplace() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const emails = [...new Set([...listingData.map((item) => item[9]), ...serviceData.map((item) => item[5]), ...experienceData.map((item) => item[6])])];
    const users = await User.find({ email: { $in: emails } });
    const usersByEmail = new Map(users.map((user) => [user.email, user]));
    const missingEmails = emails.filter((email) => !usersByEmail.has(email));
    if (missingEmails.length > 0) throw new Error(`Run seed-users.ts first. Missing users: ${missingEmails.join(', ')}`);

    const listings = additionalListingData.map((item, index) => {
      const host = usersByEmail.get(item[9])!;
      return {
        title: item[0], description: `Sejour confortable et soigne dans un logement tunisien situe a ${item[4]}.`, type: item[1], category: item[2], price: item[3], pricingType: 'NIGHTLY', currency: 'TND', address: item[5], city: item[4], country: 'Tunisia', latitude: 33 + index * 0.3, longitude: 8 + index * 0.2, images: [image(item[10])], amenities: ['WiFi', 'Climatisation', 'Cuisine equipee'], bedrooms: item[6], bathrooms: item[7], maxGuests: item[8], size: 45 + index * 8, rules: ['Non fumeur', 'Respect du voisinage'], targetAudience: 'GENERAL', status: 'PUBLISHED', isFeatured: index < 4, hostId: host._id
      };
    });

    const services = additionalServiceData.map((item, index) => ({ title: item[0], description: `Service professionnel et fiable propose par un prestataire tunisien a ${item[4]}.`, category: item[1], price: item[2], currency: 'TND', duration: item[3], location: item[4], address: `Centre-ville de ${item[4]}`, city: item[4], country: 'Tunisia', latitude: 33 + index * 0.35, longitude: 8 + index * 0.25, images: [image(item[6])], status: 'PUBLISHED', isFeatured: index < 3, providerId: usersByEmail.get(item[5])!._id }));
    const experiences = additionalExperienceData.map((item, index) => ({ title: item[0], description: 'Une experience authentique pour decouvrir une nouvelle region tunisienne, accompagnee par un guide local.', category: item[1], price: item[2], currency: 'TND', duration: item[3], maxGuests: item[4], location: item[5], address: `Point de rencontre, ${item[5]}`, city: item[5], country: 'Tunisia', latitude: 33 + index * 0.35, longitude: 8 + index * 0.25, images: [image(item[7])], includes: ['Guide local', 'Boisson', 'Assurance'], requirements: ['Chaussures confortables'], difficulty: index % 3 === 0 ? 'BEGINNER' : 'INTERMEDIATE', status: 'PUBLISHED', isFeatured: index < 3, providerId: usersByEmail.get(item[6])!._id }));

    const [createdListings, createdServices, createdExperiences] = await Promise.all([Listing.insertMany(listings), Service.insertMany(services), Experience.insertMany(experiences)]);
    console.log(`Created ${createdListings.length} listings, ${createdServices.length} services and ${createdExperiences.length} experiences.`);
  } catch (error) {
    console.error('Marketplace seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedMarketplace();
