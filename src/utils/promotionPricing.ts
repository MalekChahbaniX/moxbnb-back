import mongoose from 'mongoose';
import { Experience, Listing, PromoCode, Service } from '../models';

export type PromotionalItemType = 'PROPERTY' | 'EXPERIENCE' | 'SERVICE';

type PriceRequest = {
  type: PromotionalItemType;
  itemId: string;
  checkIn?: string | Date;
  checkOut?: string | Date;
};

export async function calculatePromotionQuote(input: PriceRequest) {
  if (!mongoose.Types.ObjectId.isValid(input.itemId)) {
    throw new Error('Invalid offer ID');
  }

  const query = { _id: input.itemId, status: 'PUBLISHED' };
  const item = input.type === 'PROPERTY'
    ? await Listing.findOne(query)
    : input.type === 'EXPERIENCE'
      ? await Experience.findOne(query)
      : await Service.findOne(query);

  if (!item) {
    throw new Error('This offer is unavailable for booking');
  }

  let multiplier = 1;
  if (input.type === 'PROPERTY') {
    const checkIn = new Date(input.checkIn || '');
    const checkOut = new Date(input.checkOut || '');
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    if (!Number.isFinite(nights) || nights < 1) {
      throw new Error('Check-out date must be after check-in date');
    }
    multiplier = nights;
  }

  const originalPrice = Math.round(Number(item.price) * multiplier * 100) / 100;
  const now = new Date();
  const promotionActive =
    item.promotionStatus !== 'SUSPENDED' &&
    Number(item.promotionPercent) > 0 &&
    item.promotionStartDate != null &&
    item.promotionEndDate != null &&
    item.promotionStartDate <= now &&
    item.promotionEndDate > now;
  const offerDiscount = promotionActive
    ? Math.round(originalPrice * (Number(item.promotionPercent) / 100) * 100) / 100
    : 0;

  return {
    item,
    originalPrice,
    offerDiscount,
    offerPrice: Math.max(0, originalPrice - offerDiscount),
    currency: item.currency || 'TND',
    offerActive: promotionActive,
  };
}

export async function findRedeemablePromoCode(code: string, userId: string) {
  const normalizedCode = code.trim().toUpperCase();
  const now = new Date();
  const promoCode = await PromoCode.findOne({
    code: normalizedCode,
    status: 'ACTIVE',
    startsAt: { $lte: now },
    endsAt: { $gt: now },
    redeemedBy: { $ne: new mongoose.Types.ObjectId(userId) },
    $or: [
      { maxRedemptions: { $exists: false } },
      { maxRedemptions: null },
      { $expr: { $lt: ['$redemptionCount', '$maxRedemptions'] } },
    ],
  });

  if (!promoCode) {
    throw new Error('This promo code is invalid, expired, suspended, or already used');
  }

  return promoCode;
}

export async function redeemPromoCode(codeId: mongoose.Types.ObjectId, userId: string) {
  const now = new Date();
  return PromoCode.findOneAndUpdate(
    {
      _id: codeId,
      status: 'ACTIVE',
      startsAt: { $lte: now },
      endsAt: { $gt: now },
      redeemedBy: { $ne: new mongoose.Types.ObjectId(userId) },
      $or: [
        { maxRedemptions: { $exists: false } },
        { maxRedemptions: null },
        { $expr: { $lt: ['$redemptionCount', '$maxRedemptions'] } },
      ],
    },
    {
      $inc: { redemptionCount: 1 },
      $addToSet: { redeemedBy: new mongoose.Types.ObjectId(userId) },
    },
    { new: true },
  );
}

export async function undoPromoCodeRedemption(codeId: mongoose.Types.ObjectId, userId: string) {
  await PromoCode.updateOne(
    { _id: codeId, redeemedBy: new mongoose.Types.ObjectId(userId) },
    {
      $inc: { redemptionCount: -1 },
      $pull: { redeemedBy: new mongoose.Types.ObjectId(userId) },
    },
  );
}
