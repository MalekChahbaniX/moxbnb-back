import cron from 'node-cron';
import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';

/**
 * Keep-alive service to prevent Render from spinning down the server
 * Makes a request to the health endpoint every 10 minutes
 */
class KeepAliveService {
  private task: any | null = null;
  private healthUrl: string;

  constructor() {
    // Use the configured base URL or default to localhost
    const baseUrl = config.env === 'production' 
      ? process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
      : 'http://localhost:3000';
    this.healthUrl = `${baseUrl}/health`;
  }

  /**
   * Start the keep-alive cron job
   * Runs every 10 minutes using cron pattern
   */
  start(): void {
    if (this.task) {
      logger.warn('Keep-alive service is already running');
      return;
    }

    // Schedule task to run every 10 minutes
    this.task = cron.schedule('*/10 * * * *', async () => {
      try {
        await this.pingHealthEndpoint();
      } catch (error) {
        logger.error('Keep-alive ping failed:', error);
      }
    });

    logger.info('✅ Keep-alive service started - pinging every 10 minutes');
  }

  /**
   * Stop the keep-alive cron job
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('🛑 Keep-alive service stopped');
    }
  }

  /**
   * Ping the health endpoint to keep the server awake
   */
  private async pingHealthEndpoint(): Promise<void> {
    try {
      const response = await axios.get(this.healthUrl, {
        timeout: 5000, // 5 second timeout
      });

      logger.info(`💓 Keep-alive ping successful: ${response.status} - ${new Date().toISOString()}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Keep-alive ping failed: ${error.message}`);
      } else {
        logger.error('Keep-alive ping failed with unknown error:', error);
      }
    }
  }
}

// Export singleton instance
export const keepAliveService = new KeepAliveService();
