import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/config';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import listingRoutes from './routes/listings';
import experienceRoutes from './routes/experiences';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/upload';
import favoritesRoutes from './routes/favorites';
import supportRoutes from './routes/support';
import providerRoutes from './routes/provider';

const app = express();

// Trust proxy for Vercel deployment
app.set('trust proxy', true);

// Initialize application
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Security middleware
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    app.use(cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Serve uploaded files statically
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // Compression middleware
    app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api/', limiter);

    // Logging middleware
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
      });
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/listings', listingRoutes);
    app.use('/api/experiences', experienceRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/favorites', favoritesRoutes);
    app.use('/api/support', supportRoutes);
    app.use('/api/provider', providerRoutes);

    // API documentation endpoint
    app.get('/api', (req, res) => {
      res.json({
        name: 'Moxbnb API',
        version: '1.0.0',
        description: 'Backend API for Moxbnb platform',
        database: 'MongoDB',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          listings: '/api/listings',
          experiences: '/api/experiences',
          services: '/api/services',
          bookings: '/api/bookings',
          reviews: '/api/reviews',
          messages: '/api/messages',
          notifications: '/api/notifications',
          payments: '/api/payments',
          upload: '/api/upload',
          favorites: '/api/favorites',
          support: '/api/support',
          provider: '/api/provider',
        },
        documentation: '/api/docs',
      });
    });

    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);

    const PORT = config.port;

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 Environment: ${config.env}`);
      logger.info(`🗄️ Database: MongoDB`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
