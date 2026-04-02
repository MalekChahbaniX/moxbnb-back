import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { notificationController } from './notificationController';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { bookingId, amount, currency = 'usd' } = req.body;

      // Validate required fields
      if (!bookingId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Booking ID and amount are required',
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

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          bookingId: bookingId.toString(),
          userId: userId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    } catch (error: any) {
      console.error('Stripe error:', error);
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
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: 'Payment intent ID is required',
        });
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Verify payment intent belongs to user
      if (paymentIntent.metadata.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized payment intent',
        });
      }

      // Update booking payment status
      const bookingId = paymentIntent.metadata.bookingId;
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Associated booking not found',
        });
      }

      if (paymentIntent.status === 'succeeded') {
        booking.paymentStatus = 'COMPLETED';
        booking.status = 'CONFIRMED';
        await booking.save();

        // Create notification
        await notificationController.createNotification(
          userId,
          'Payment Successful',
          `Payment of $${paymentIntent.amount / 100} for booking ${bookingId} was successful.`,
          'PAYMENT_SUCCESS',
          { bookingId, paymentIntentId }
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
      const { bookingId, reason } = req.body;

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

      // In a real implementation, you would process the refund through Stripe
      // For now, we'll just update the booking status
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

  // Webhook handler for Stripe events
  handleWebhook: async (req: Request, res: Response) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        return res.status(400).json({
          success: false,
          error: 'Webhook signature missing',
        });
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Handle successful payment
          console.log('Payment succeeded:', paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          // Handle failed payment
          console.log('Payment failed:', failedPayment.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

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
