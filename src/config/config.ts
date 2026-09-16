import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  redis: {
    url: string;
    password?: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  konnect: {
    apiKey: string;
    baseUrl: string;
  };
  flouci: {
    apiKey: string;
    baseUrl: string;
  };
  clicktopay: {
    apiKey: string;
    merchantId: string;
    baseUrl: string;
  };
  frontend: {
    url: string;
  };
  upload: {
    maxFileSize: number;
    path: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    allowedOrigins: string[];
  };
  logging: {
    level: string;
    file: string;
  };
  apiKeys: {
    googleMaps: string;
    googleClientId: string;
    twilio: {
      accountSid: string;
      authToken: string;
    };
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    url: process.env.MONGODB_URI || 'mongodb+srv://malekchahbanix_db_user:OY6V7iwS7C4cgoPW@moxbnb.ivvqsv7.mongodb.net/?appName=moxbnb',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc3NDE4ODkzNCwiaWF0IjoxNzc0MTg4OTM0fQ.ekuoMv6bRPtbuYQW4e7J0e08vMYI_YH77xn4UMSA6Lw',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc3NDE4ODkzNCwiaWF0IjoxNzc0MTg4OTM0fQ.I0HKdpSYpgtCs5aYKrsHki1jvaYrCav_WDsBV5lYSCU',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'noreply@moxbnb.tn',
    fromName: process.env.FROM_NAME || 'Moxbnb',
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  konnect: {
    apiKey: process.env.KONNECT_API_KEY || '',
    baseUrl: process.env.KONNECT_BASE_URL || 'https://api.konnect.tn',
  },
  
  flouci: {
    apiKey: process.env.FLOUCI_API_KEY || '',
    baseUrl: process.env.FLOUCI_BASE_URL || 'https://api.flouci.com',
  },
  
  clicktopay: {
    apiKey: process.env.CLICKTOPAY_API_KEY || '',
    merchantId: process.env.CLICKTOPAY_MERCHANT_ID || '',
    baseUrl: process.env.CLICKTOPAY_BASE_URL || 'https://api.clicktopay.tn',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    path: process.env.UPLOAD_PATH || './uploads',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3010',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3001',
      'http://localhost:19006',
      'https://moxbnb.com',
      'https://moxbnb.netlify.app',
    ],
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },
  
  apiKeys: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
    },
  },
};

// Validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

if (config.env === 'production') {
  requiredEnvVars.push(
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'STRIPE_SECRET_KEY'
  );
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export { config };
