const axios = require('axios');

async function testLogin() {
  const baseURL = 'http://localhost:3001'; // Adjust if your backend runs on different port
  
  const testAccounts = [
    { email: 'malek-admin@moxbnb.com', password: 'password123', role: 'ADMIN' },
    { email: 'malek-provider@moxbnb.com', password: 'password123', role: 'PROVIDER' },
    { email: 'malek-host@moxbnb.com', password: 'password123', role: 'HOST' }
  ];

  console.log('🧪 Testing login for all admin accounts...\n');

  for (const account of testAccounts) {
    try {
      console.log(`🔑 Testing ${account.role} account: ${account.email}`);
      
      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email: account.email,
        password: account.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ ${account.role} login successful!`);
      console.log(`   User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
      console.log(`   Role: ${response.data.data.user.role}`);
      console.log(`   Token: ${response.data.data.token.substring(0, 50)}...`);
      console.log('');

    } catch (error) {
      console.log(`❌ ${account.role} login failed!`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

testLogin().catch(console.error);
