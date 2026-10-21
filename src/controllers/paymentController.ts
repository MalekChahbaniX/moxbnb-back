import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { notificationController } from './notificationController';
import { paymentService, PaymentProvider } from '../services/paymentService';

export const paymentController = {
  // Get available payment providers
  getAvailableProviders: async (req: Request, res: Response) => {
    try {
      const providers = paymentService.getAvailableProviders();
      res.json({
        success: true,
        data: providers,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment providers',
      });
    }
  },

  // Create payment intent
  createPaymentIntent: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { bookingId, amount, currency = 'tnd', provider = 'STRIPE', returnUrl, cancelUrl } = req.body;

      // Validate required fields
      if (!bookingId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Booking ID and amount are required',
        });
      }

      // Validate provider
      const validProviders: PaymentProvider[] = ['STRIPE', 'KONNECT', 'FLOUCI', 'CLICKTOPAY'];
      if (!validProviders.includes(provider)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment provider',
        });
      }

      // Verify booking exists and belongs to user
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
      }

      if (booking.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to pay for this booking',
        });
      }

      // Verify amount matches booking total
      if (amount !== booking.totalPrice) {
        return res.status(400).json({
          success: false,
          error: 'Payment amount does not match booking total',
        });
      }

      // Create payment intent using the selected provider
      const paymentIntent = await paymentService.createPaymentIntent({
        amount,
        currency,
        bookingId: bookingId.toString(),
        userId,
        provider,
        returnUrl,
        cancelUrl,
      });

      // Store payment provider in booking
      booking.paymentProvider = provider;
      booking.paymentIntentId = paymentIntent.id;
      await booking.save();

      res.status(201).json({
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          clientSecret: paymentIntent.clientSecret,
          paymentUrl: paymentIntent.paymentUrl,
          provider,
        },
      });
    } catch (error: any) {
      console.error('Payment intent error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment intent',
      });
    }
  },

  // Confirm payment
  confirmPayment: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { paymentIntentId, provider } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
        });
      }

      // Find booking by payment intent ID
      const booking = await Booking.findOne({ paymentIntentId });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Associated booking not found',
        });
      }

      // Verify booking belongs to user
      if (booking.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to confirm this payment',
        });
      }

      if (booking.paymentProvider && provider && booking.paymentProvider !== provider) {
        return res.status(400).json({
          success: false,
          error: 'Payment provider does not match the booking',
        });
      }

      // Use the provider recorded with the booking when the client omits it.
      const paymentProvider = provider || booking.paymentProvider || 'STRIPE';
      const paymentIntent = await paymentService.confirmPayment({
        paymentIntentId,
        provider: paymentProvider,
      });

      // Update booking payment status based on payment intent status
      if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'COMPLETED' || paymentIntent.status === 'PAID') {
        booking.paymentStatus = 'COMPLETED';
        booking.status = 'CONFIRMED';
        await booking.save();

        // Create notification
        await notificationController.createNotification(
          userId,
          'Payment Successful',
          `Payment of ${paymentIntent.amount} ${paymentIntent.currency.toUpperCase()} for booking ${booking._id} was successful.`,
          'PAYMENT_SUCCESS',
          { bookingId: booking._id, paymentIntentId }
        );

        res.json({
          success: true,
          data: {
            paymentStatus: paymentIntent.status,
            bookingStatus: booking.status,
            bookingPaymentStatus: booking.paymentStatus,
          },
          message: 'Payment confirmed successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          error: `Payment not successful. Status: ${paymentIntent.status}`,
        });
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to confirm payment',
      });
    }
  },

  // Get payment history for user
  getPaymentHistory: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Get user's bookings with payment information
      const bookings = await Booking.find({ userId })
        .populate('listingId', 'title images')
        .populate('experienceId', 'title images')
        .populate('serviceId', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Booking.countDocuments({ userId });

      // Transform bookings into payment history format
      const paymentHistory = bookings.map(booking => ({
        id: booking._id,
        type: booking.type,
        title: (booking.listingId as any)?.title || (booking.experienceId as any)?.title || (booking.serviceId as any)?.title || 'Booking',
        image: (booking.listingId as any)?.images?.[0] || (booking.experienceId as any)?.images?.[0] || (booking.serviceId as any)?.images?.[0],
        amount: booking.totalPrice,
        currency: booking.currency,
        status: booking.paymentStatus,
        paymentDate: booking.updatedAt,
        bookingDate: booking.createdAt,
        bookingStatus: booking.status,
        paymentProvider: booking.paymentProvider,
      }));

      res.json({
        success: true,
        data: paymentHistory,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment history',
      });
    }
  },

  // Get payment details
  getPaymentDetails: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { bookingId } = req.params;

      const booking = await Booking.findById(bookingId)
        .populate('listingId', 'title images')
        .populate('experienceId', 'title images')
        .populate('serviceId', 'title images')
        .populate('userId', 'firstName lastName email');

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
      }

      if (booking.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to view this payment',
        });
      }

      res.json({
        success: true,
        data: {
          bookingId: booking._id,
          type: booking.type,
          title: (booking.listingId as any)?.title || (booking.experienceId as any)?.title || (booking.serviceId as any)?.title || 'Booking',
          image: (booking.listingId as any)?.images?.[0] || (booking.experienceId as any)?.images?.[0] || (booking.serviceId as any)?.images?.[0],
          amount: booking.totalPrice,
          currency: booking.currency,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.status,
          paymentProvider: booking.paymentProvider,
          paymentIntentId: booking.paymentIntentId,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment details',
      });
    }
  },

  // Process refund (admin only)
  processRefund: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { bookingId, reason, provider } = req.body;

      // Check if user is admin
      const user = await User.findById(userId);
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
        });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
      }

      if (booking.paymentStatus !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: 'No completed payment to refund',
        });
      }

      // Process refund through the payment service
      const paymentProvider = provider || booking.paymentProvider || 'STRIPE';
      const refundResult = await paymentService.processRefund(
        booking.paymentIntentId || bookingId.toString(),
        paymentProvider,
        booking.totalPrice
      );

      // Update booking status
      booking.paymentStatus = 'REFUNDED';
      booking.status = 'CANCELLED';
      await booking.save();

      // Create notification for user
      await notificationController.createNotification(
        booking.userId.toString(),
        'Refund Processed',
        `Your refund for booking ${bookingId} has been processed.`,
        'PAYMENT_FAILED',
        { bookingId, reason }
      );

      res.json({
        success: true,
        data: {
          bookingId: booking._id,
          refundStatus: 'processed',
          refundAmount: booking.totalPrice,
          refundResult,
        },
        message: 'Refund processed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process refund',
      });
    }
  },

  // Webhook handler for payment providers
  handleWebhook: async (req: Request, res: Response) => {
    try {
      const { provider } = req.params;
      const sig = req.headers['stripe-signature'] as string;

      // Handle Stripe webhooks
      if (provider === 'stripe' && sig) {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2023-10-16',
        });
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
          return res.status(400).json({
            success: false,
            error: 'Webhook secret missing',
          });
        }

        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as any;
            console.log('Stripe payment succeeded:', paymentIntent.id);
            // Update booking status
            const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
            if (booking) {
              booking.paymentStatus = 'COMPLETED';
              booking.status = 'CONFIRMED';
              await booking.save();
            }
            break;

          case 'payment_intent.payment_failed':
            const failedPayment = event.data.object as any;
            console.log('Stripe payment failed:', failedPayment.id);
            break;

          default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
        }
      }

      // Handle other provider webhooks (Konnect, Flouci, Clicktopay)
      // This would be implemented based on each provider's webhook specification
      console.log(`Webhook received from ${provider}`);

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
