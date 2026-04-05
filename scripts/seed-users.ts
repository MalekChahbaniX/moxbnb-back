import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models';

// Données extraites du fichier users.json
const usersData = [
  {
    name: "Karim Ben Ali",
    email: "karim.benali@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    role: "HOST",
    phone: "+216 22 123 456",
    isVerified: true,
    preferences: {
      language: "fr",
      notifications: true,
      emailMarketing: false
    },
    stats: {
      totalListings: 3,
      totalBookings: 156,
      averageRating: 4.8,
      totalEarnings: 45600
    }
  },
  {
    name: "Sonia Masmoudi",
    email: "sonia.masmoudi@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    role: "HOST",
    phone: "+216 98 765 432",
    isVerified: true,
    preferences: {
      language: "fr",
      notifications: true,
      emailMarketing: true
    },
    stats: {
      totalListings: 2,
      totalBookings: 89,
      averageRating: 4.9,
      totalEarnings: 32400
    }
  },
  {
    name: "Youssef Trabelsi",
    email: "youssef.trabelsi@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "CLIENT",
    phone: "+216 55 111 222",
    isVerified: false,
    preferences: {
      language: "fr",
      notifications: true,
      emailMarketing: false
    },
    stats: {
      totalBookings: 12,
      totalSpent: 2850,
      averageRating: 4.5,
      favoriteCities: ["Tunis", "Hammamet", "Djerba"]
    }
  },
  {
    name: "Leïla Ben Salem",
    email: "leila.bensalem@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    role: "PROVIDER",
    phone: "+216 77 333 444",
    isVerified: true,
    preferences: {
      language: "fr",
      notifications: true,
      emailMarketing: true
    },
    stats: {
      totalServices: 2,
      totalBookings: 67,
      averageRating: 4.7,
      totalEarnings: 12800
    }
  },
  {
    name: "Mohamed Karray",
    email: "mohamed.karray@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    role: "CLIENT",
    phone: "+216 44 555 666",
    isVerified: true,
    preferences: {
      language: "ar",
      notifications: false,
      emailMarketing: false
    },
    stats: {
      totalBookings: 8,
      totalSpent: 1920,
      averageRating: 4.6,
      favoriteCities: ["Sfax", "Sousse", "Monastir"]
    }
  },
  {
    name: "Amine Belhadj",
    email: "amine.belhadj@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "PROVIDER",
    phone: "+216 99 777 888",
    isVerified: true,
    preferences: {
      language: "fr",
      notifications: true,
      emailMarketing: true
    },
    stats: {
      totalServices: 3,
      totalBookings: 156,
      averageRating: 4.9,
      totalEarnings: 18700
    }
  },
  {
    name: "Fatma Ben Ammar",
    email: "fatma.benammar@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    role: "PROVIDER",
    phone: "+216 66 999 000",
    isVerified: false,
    preferences: {
      language: "fr",
      notifications: true,
      emailMarketing: false
    },
    stats: {
      totalServices: 1,
      totalBookings: 34,
      averageRating: 4.8,
      totalEarnings: 4080
    }
  },
  {
    name: "John Smith",
    email: "john.smith@email.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    role: "CLIENT",
    phone: "+216 33 444 555",
    isVerified: true,
    preferences: {
      language: "en",
      notifications: true,
      emailMarketing: true
    },
    stats: {
      totalBookings: 23,
      totalSpent: 6750,
      averageRating: 4.7,
      favoriteCities: ["Tunis", "Sidi Bou Said", "Carthage"]
    }
  }
];

async function seedUsers() {
  console.log('👥 Starting users seed...');

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});

    // Hash passwords and create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Split name into firstName and lastName
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      const user = await User.create({
        firstName,
        lastName,
        email: userData.email,
        password: hashedPassword,
        avatar: userData.avatar,
        role: userData.role,
        phone: userData.phone,
        isVerified: userData.isVerified,
        preferences: userData.preferences,
        stats: userData.stats,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      createdUsers.push(user);
    }
    
    console.log(`✅ Created ${createdUsers.length} users`);
    console.log('\n📊 Users seeded successfully!');
    
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.role} - ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
