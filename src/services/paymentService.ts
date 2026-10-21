import Stripe from 'stripe';
import axios from 'axios';

// Payment Provider Types
export type PaymentProvider = 'STRIPE' | 'KONNECT' | 'FLOUCI' | 'CLICKTOPAY';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  paymentUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  bookingId: string;
  userId: string;
  provider: PaymentProvider;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  provider: PaymentProvider;
}

// Stripe Service
class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(request: PaymentRequest): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      metadata: {
        bookingId: request.bookingId,
        userId: request.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      metadata: paymentIntent.metadata,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
    };
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<any> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  }
}

// Konnect Service (Tunisia)
class KonnectService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.KONNECT_API_KEY || '';
    this.baseUrl = process.env.KONNECT_BASE_URL || 'https://api.konnect.tn';
  }

  async createPaymentIntent(request: PaymentRequest): Promise<PaymentIntent> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/payments`,
      {
        amount: request.amount,
        currency: request.currency,
        description: `Booking ${request.bookingId}`,
        metadata: {
          bookingId: request.bookingId,
          userId: request.userId,
        },
        returnUrl: request.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: request.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.payment_id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      paymentUrl: response.data.payment_url,
      metadata: response.data.metadata,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await axios.get(
      `${this.baseUrl}/api/v1/payments/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return {
      id: response.data.payment_id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      metadata: response.data.metadata,
    };
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/payments/${paymentIntentId}/refund`,
      amount ? { amount } : {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );
    return response.data;
  }
}

// Flouci Service (Tunisia)
class FlouciService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.FLOUCI_API_KEY || '';
    this.baseUrl = process.env.FLOUCI_BASE_URL || 'https://api.flouci.com';
  }

  async createPaymentIntent(request: PaymentRequest): Promise<PaymentIntent> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/payments`,
      {
        amount: request.amount,
        currency: request.currency,
        description: `Booking ${request.bookingId}`,
        metadata: {
          bookingId: request.bookingId,
          userId: request.userId,
        },
        accept_url: request.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: request.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.payment_id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      paymentUrl: response.data.payment_url,
      metadata: response.data.metadata,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await axios.get(
      `${this.baseUrl}/api/v1/payments/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return {
      id: response.data.payment_id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      metadata: response.data.metadata,
    };
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/payments/${paymentIntentId}/refund`,
      amount ? { amount } : {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );
    return response.data;
  }
}

// Clicktopay Service (Tunisia)
class ClicktopayService {
  private apiKey: string;
  private merchantId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CLICKTOPAY_API_KEY || '';
    this.merchantId = process.env.CLICKTOPAY_MERCHANT_ID || '';
    this.baseUrl = process.env.CLICKTOPAY_BASE_URL || 'https://api.clicktopay.tn';
  }

  async createPaymentIntent(request: PaymentRequest): Promise<PaymentIntent> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/payments`,
      {
        merchant_id: this.merchantId,
        amount: request.amount,
        currency: request.currency,
        description: `Booking ${request.bookingId}`,
        metadata: {
          bookingId: request.bookingId,
          userId: request.userId,
        },
        return_url: request.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: request.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.payment_id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      paymentUrl: response.data.payment_url,
      metadata: response.data.metadata,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await axios.get(
      `${this.baseUrl}/api/v1/payments/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return {
      id: response.data.payment_id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      metadata: response.data.metadata,
    };
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/api/v1/payments/${paymentIntentId}/refund`,
      amount ? { amount } : {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );
    return response.data;
  }
}

// Main Payment Service Factory
class PaymentServiceFactory {
  private stripeService: StripeService;
  private konnectService: KonnectService;
  private flouciService: FlouciService;
  private clicktopayService: ClicktopayService;

  constructor() {
    this.stripeService = new StripeService();
    this.konnectService = new KonnectService();
    this.flouciService = new FlouciService();
    this.clicktopayService = new ClicktopayService();
  }

  getService(provider: PaymentProvider) {
    switch (provider) {
      case 'STRIPE':
        return this.stripeService;
      case 'KONNECT':
        return this.konnectService;
      case 'FLOUCI':
        return this.flouciService;
      case 'CLICKTOPAY':
        return this.clicktopayService;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  async createPaymentIntent(request: PaymentRequest): Promise<PaymentIntent> {
    const service = this.getService(request.provider);
    return await service.createPaymentIntent(request);
  }

  async confirmPayment(confirmation: PaymentConfirmation): Promise<PaymentIntent> {
    const service = this.getService(confirmation.provider);
    return await service.confirmPayment(confirmation.paymentIntentId);
  }

  async processRefund(
    paymentIntentId: string,
    provider: PaymentProvider,
    amount?: number
  ): Promise<any> {
    const service = this.getService(provider);
    return await service.processRefund(paymentIntentId, amount);
  }

  getAvailableProviders(): PaymentProvider[] {
    const providers: PaymentProvider[] = ['STRIPE'];
    
    if (process.env.KONNECT_API_KEY) providers.push('KONNECT');
    if (process.env.FLOUCI_API_KEY) providers.push('FLOUCI');
    if (
      process.env.CLICKTOPAY_API_KEY?.trim() &&
      process.env.CLICKTOPAY_MERCHANT_ID?.trim()
    ) {
      providers.push('CLICKTOPAY');
    }
    
    return providers;
  }
}

// Export singleton instance
export const paymentService = new PaymentServiceFactory();
