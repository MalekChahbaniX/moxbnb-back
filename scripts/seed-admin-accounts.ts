import mongoose from 'mongoose';
import { User } from '../src/models';

// Admin accounts to seed
const adminAccounts = [
  {
    name: "Malek Admin",
    email: "malek-admin@moxbnb.com",
    password: "password123",
    role: "ADMIN",
    phone: "+216 22 111 111",
    isVerified: true,
    isActive: true
  },
  {
    name: "Malek Provider",
    email: "malek-provider@moxbnb.com", 
    password: "password123",
    role: "PROVIDER",
    phone: "+216 22 222 222",
    isVerified: true,
    isActive: true
  },
  {
    name: "Malek Host",
    email: "malek-host@moxbnb.com",
    password: "password123", 
    role: "HOST",
    phone: "+216 22 333 333",
    isVerified: true,
    isActive: true
  }
];

async function seedAdminAccounts() {
  console.log('🔑 Starting admin accounts seed...');

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin accounts already exist
    console.log('🔍 Checking existing admin accounts...');
    const existingEmails = adminAccounts.map(account => account.email);
    const existingUsers = await User.find({ email: { $in: existingEmails } });
    
    if (existingUsers.length > 0) {
      console.log(`⚠️  Found ${existingUsers.length} existing admin accounts:`);
      existingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      
      // Ask if user wants to continue and overwrite
      console.log('\n❌ Admin accounts already exist. Use force-delete flag to overwrite.');
      process.exit(1);
    }

    // Create admin accounts (passwords will be hashed automatically by User model pre-save middleware)
    console.log('👤 Creating admin accounts...');
    const createdAccounts = [];
    
    for (const accountData of adminAccounts) {
      // Split name into firstName and lastName
      const nameParts = accountData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      const user = await User.create({
        firstName,
        lastName,
        email: accountData.email,
        password: accountData.password, // Plain password - will be hashed by User model
        role: accountData.role,
        phone: accountData.phone,
        isVerified: accountData.isVerified,
        isActive: accountData.isActive,
        settings: {
          language: 'fr',
          currency: 'TND',
          theme: 'light',
          pushNotifications: true,
          emailNotifications: true,
          loginAlerts: true
        }
      });
      
      createdAccounts.push(user);
    }
    
    console.log(`✅ Created ${createdAccounts.length} admin accounts`);
    console.log('\n🔑 Admin accounts seeded successfully!');
    
    createdAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.firstName} ${account.lastName} - ${account.role} - ${account.email}`);
    });

    console.log('\n📝 Login credentials:');
    console.log('Email: malek-admin@moxbnb.com | Password: password123');
    console.log('Email: malek-provider@moxbnb.com | Password: password123');
    console.log('Email: malek-host@moxbnb.com | Password: password123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const forceDelete = args.includes('--force-delete') || args.includes('-f');

if (forceDelete) {
  console.log('🗑️  Force delete mode enabled - deleting existing admin accounts...');
  
  async function forceSeed() {
    try {
      const mongoUri = 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/';
      await mongoose.connect(mongoUri);
      
      // Delete existing admin accounts
      const existingEmails = adminAccounts.map(account => account.email);
      const deleteResult = await User.deleteMany({ email: { $in: existingEmails } });
      console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing admin accounts`);
      
      await mongoose.disconnect();
      
      // Run the normal seed
      await seedAdminAccounts();
    } catch (error) {
      console.error('❌ Force delete failed:', error);
      process.exit(1);
    }
  }
  
  forceSeed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  seedAdminAccounts()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
