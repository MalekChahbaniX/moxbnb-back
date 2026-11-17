import { Request, Response } from 'express';
import { Booking } from '../models';
import { ApiResponse } from '../types';
import { calculatePromotionQuote, findRedeemablePromoCode, redeemPromoCode, undoPromoCodeRedemption } from '../utils/promotionPricing';

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('listingId', 'title images price currency')
      .populate('experienceId', 'title images price currency duration')
      .populate('serviceId', 'title images price currency duration')
      .exec();

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching bookings'
    } as ApiResponse);
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  let claimedPromoCodeId: any;
  let claimedUserId: string | undefined;
  try {
    const userId = (req as any).user.id;
    const type = req.body.type;
    const itemKey = type === 'PROPERTY' ? 'listingId' : type === 'EXPERIENCE' ? 'experienceId' : type === 'SERVICE' ? 'serviceId' : null;
    const suppliedItems = ['listingId', 'experienceId', 'serviceId'].filter((key) => req.body[key]);
    if (!itemKey || suppliedItems.length !== 1 || suppliedItems[0] !== itemKey) {
      res.status(400).json({ success: false, error: 'Provide exactly one offer ID matching the booking type' } as ApiResponse);
      return;
    }

    const quote = await calculatePromotionQuote({
      type,
      itemId: req.body[itemKey],
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
    });

    let discountAmount = quote.offerDiscount;
    let totalPrice = quote.offerPrice;
    let promotionSource: 'NONE' | 'OFFER' | 'COUPON' = quote.offerActive ? 'OFFER' : 'NONE';
    let normalizedPromoCode: string | undefined;
    let promoCodeId: any;

    if (req.body.promoCode) {
      const promoCode = await findRedeemablePromoCode(String(req.body.promoCode), userId);
      normalizedPromoCode = promoCode.code;
      promoCodeId = promoCode._id;
      discountAmount = Math.round(quote.originalPrice * (promoCode.percent / 100) * 100) / 100;
      totalPrice = Math.max(0, quote.originalPrice - discountAmount);
      promotionSource = 'COUPON';
    }

    if (normalizedPromoCode) {
      const claimedCode = await redeemPromoCode(promoCodeId, userId);
      if (!claimedCode) {
        res.status(409).json({ success: false, error: 'This promo code has just reached its usage limit or was already used' } as ApiResponse);
        return;
      }
      claimedPromoCodeId = promoCodeId;
      claimedUserId = userId;
    }

    const bookingData = {
      ...req.body,
      totalPrice,
      basePrice: quote.originalPrice,
      discountAmount,
      promotionSource,
      promoCode: normalizedPromoCode,
      currency: quote.currency,
      userId,
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate related data
    await booking.populate('listingId');
    await booking.populate('experienceId');
    await booking.populate('serviceId');

    res.status(201).json({
      success: true,
      data: booking
    } as ApiResponse);
  } catch (error: any) {
    if (claimedPromoCodeId && claimedUserId) {
      await undoPromoCodeRedemption(claimedPromoCodeId, claimedUserId);
    }
    if (typeof error?.message === 'string' && (error.message === 'Invalid offer ID' || error.message === 'This offer is unavailable for booking' ||
      error?.message === 'Check-out date must be after check-in date' ||
      error.message.toLowerCase().includes('promo code'))) {
      res.status(400).json({ success: false, error: error.message } as ApiResponse);
      return;
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating booking'
    } as ApiResponse);
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOne({ _id: id, userId })
      .populate('listingId')
      .populate('experienceId')
      .populate('serviceId')
      .populate('userId', 'firstName lastName email phone')
      .exec();

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: booking
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching booking'
    } as ApiResponse);
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('listingId')
      .populate('experienceId')
      .populate('serviceId')
      .exec();

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: booking
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating booking'
    } as ApiResponse);
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      { status: 'CANCELLED' },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error cancelling booking'
    } as ApiResponse);
  }
};

export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      { status: 'CONFIRMED' },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking confirmed successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error confirming booking'
    } as ApiResponse);
  }
};

export const bookingController = {
  getBookings,
  createBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking
};
