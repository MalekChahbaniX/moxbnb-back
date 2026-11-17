import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Experience, Listing, PromoCode, Service } from '../models';
import { calculatePromotionQuote, findRedeemablePromoCode } from '../utils/promotionPricing';

const offerModels = {
  PROPERTY: Listing,
  EXPERIENCE: Experience,
  SERVICE: Service,
} as const;

const ownerField = {
  PROPERTY: 'hostId',
  EXPERIENCE: 'providerId',
  SERVICE: 'providerId',
} as const;

const isOfferType = (value: string): value is keyof typeof offerModels =>
  Object.prototype.hasOwnProperty.call(offerModels, value);

function isValidPromotion(percent: unknown, start: unknown, end: unknown) {
  const percentage = Number(percent);
  const startsAt = new Date(String(start));
  const endsAt = new Date(String(end));
  return Number.isInteger(percentage) && percentage >= 1 && percentage <= 90 &&
    Number.isFinite(startsAt.getTime()) && Number.isFinite(endsAt.getTime()) && startsAt < endsAt;
}

function mapOffer(type: keyof typeof offerModels, item: any) {
  const value = typeof item.toObject === 'function' ? item.toObject() : item;
  return {
    id: String(value._id),
    type,
    title: value.title,
    image: value.images?.[0],
    price: value.price,
    currency: value.currency || 'TND',
    city: value.city || value.location || '',
    promotionPercent: value.promotionPercent || 0,
    promotionStartDate: value.promotionStartDate,
    promotionEndDate: value.promotionEndDate,
    promotionStatus: value.promotionStatus || 'ACTIVE',
    ownerName: value.hostId?.firstName
      ? `${value.hostId.firstName} ${value.hostId.lastName || ''}`.trim()
      : value.providerId?.firstName
        ? `${value.providerId.firstName} ${value.providerId.lastName || ''}`.trim()
        : undefined,
  };
}

export const promotionController = {
  getPublicOffers: async (_req: Request, res: Response) => {
    try {
      const now = new Date();
      const activeFilter = {
        status: 'PUBLISHED',
        promotionStatus: { $ne: 'SUSPENDED' },
        promotionPercent: { $gt: 0, $lte: 90 },
        promotionStartDate: { $lte: now },
        promotionEndDate: { $gt: now },
      };
      const [listings, experiences, services] = await Promise.all([
        Listing.find(activeFilter).sort({ promotionEndDate: 1 }).limit(24).populate('hostId', 'firstName lastName'),
        Experience.find(activeFilter).sort({ promotionEndDate: 1 }).limit(24).populate('providerId', 'firstName lastName'),
        Service.find(activeFilter).sort({ promotionEndDate: 1 }).limit(24).populate('providerId', 'firstName lastName'),
      ]);
      const data = [
        ...listings.map((item) => mapOffer('PROPERTY', item)),
        ...experiences.map((item) => mapOffer('EXPERIENCE', item)),
        ...services.map((item) => mapOffer('SERVICE', item)),
      ].sort((a, b) => new Date(a.promotionEndDate).getTime() - new Date(b.promotionEndDate).getTime());
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching public promotions:', error);
      res.status(500).json({ success: false, error: 'Unable to load promotions' });
    }
  },

  getManagedOffers: async (req: Request, res: Response) => {
    try {
      const role = (req as any).user.role as string;
      const ownerId = role === 'ADMIN' ? undefined : (req as any).user._id;
      const load = async (type: keyof typeof offerModels) => {
        const owner = ownerField[type];
        const query = ownerId ? { [owner]: ownerId } : {};
        const select = 'title images price currency city location promotionPercent promotionStartDate promotionEndDate promotionStatus hostId providerId';
        const items = type === 'PROPERTY'
          ? await Listing.find(query).select(select).populate(owner, 'firstName lastName').sort({ updatedAt: -1 }).limit(200)
          : type === 'EXPERIENCE'
            ? await Experience.find(query).select(select).populate(owner, 'firstName lastName').sort({ updatedAt: -1 }).limit(200)
            : await Service.find(query).select(select).populate(owner, 'firstName lastName').sort({ updatedAt: -1 }).limit(200);
        return items.map((item) => mapOffer(type, item));
      };
      const data = (await Promise.all((Object.keys(offerModels) as Array<keyof typeof offerModels>).map(load))).flat();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching managed promotions:', error);
      res.status(500).json({ success: false, error: 'Unable to load promotions' });
    }
  },

  updateOffer: async (req: Request, res: Response) => {
    try {
      const type = String(req.params.type).toUpperCase();
      if (!isOfferType(type)) {
        res.status(400).json({ success: false, error: 'Unknown offer type' });
        return;
      }

      const { promotionPercent, promotionStartDate, promotionEndDate, promotionStatus } = req.body;
      const clearPromotion = promotionPercent === null || promotionPercent === 0;
      const statusOnlyUpdate = promotionPercent === undefined && promotionStatus !== undefined;
      if (!clearPromotion && !statusOnlyUpdate && !isValidPromotion(promotionPercent, promotionStartDate, promotionEndDate)) {
        res.status(400).json({ success: false, error: 'Provide a discount from 1 to 90 and a valid start and end date' });
        return;
      }
      if (promotionStatus !== undefined && !['ACTIVE', 'SUSPENDED'].includes(promotionStatus)) {
        res.status(400).json({ success: false, error: 'Invalid promotion status' });
        return;
      }

      const role = (req as any).user.role as string;
      if ((type === 'PROPERTY' && role === 'PROVIDER') || (type !== 'PROPERTY' && role === 'HOST')) {
        res.status(403).json({ success: false, error: 'You cannot manage promotions for this offer type' });
        return;
      }

      const ownership = role === 'ADMIN' ? {} : { [ownerField[type]]: (req as any).user._id };
      const update = statusOnlyUpdate
        ? { $set: { promotionStatus } }
        : clearPromotion
        ? {
          $unset: { promotionPercent: 1, promotionStartDate: 1, promotionEndDate: 1 },
          $set: { promotionStatus: promotionStatus || 'ACTIVE' },
        }
        : {
          $set: {
            promotionPercent: Number(promotionPercent),
            promotionStartDate: new Date(promotionStartDate),
            promotionEndDate: new Date(promotionEndDate),
            ...(promotionStatus ? { promotionStatus } : {}),
          },
        };
      const filter = { _id: req.params.id, ...ownership };
      const item = type === 'PROPERTY'
        ? await Listing.findOneAndUpdate(filter, update, { new: true, runValidators: true })
        : type === 'EXPERIENCE'
          ? await Experience.findOneAndUpdate(filter, update, { new: true, runValidators: true })
          : await Service.findOneAndUpdate(filter, update, { new: true, runValidators: true });
      if (!item) {
        res.status(404).json({ success: false, error: 'Offer not found or access denied' });
        return;
      }
      res.json({ success: true, data: mapOffer(type, item) });
    } catch (error) {
      console.error('Error updating offer promotion:', error);
      res.status(500).json({ success: false, error: 'Unable to update promotion' });
    }
  },

  listCodes: async (_req: Request, res: Response) => {
    try {
      const codes = await PromoCode.find().sort({ createdAt: -1 }).limit(300).lean();
      res.json({ success: true, data: codes });
    } catch (error) {
      console.error('Error listing promo codes:', error);
      res.status(500).json({ success: false, error: 'Unable to load promo codes' });
    }
  },

  createCode: async (req: Request, res: Response) => {
    try {
      const code = String(req.body.code || '').trim().toUpperCase();
      const { description, percent, startsAt, endsAt, maxRedemptions } = req.body;
      if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !isValidPromotion(percent, startsAt, endsAt) ||
        (maxRedemptions != null && (!Number.isInteger(Number(maxRedemptions)) || Number(maxRedemptions) < 1))) {
        res.status(400).json({ success: false, error: 'Invalid promo code, percentage, dates, or redemption limit' });
        return;
      }

      const created = await PromoCode.create({
        code,
        description,
        percent: Number(percent),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        maxRedemptions: maxRedemptions == null ? undefined : Number(maxRedemptions),
        createdBy: (req as any).user._id,
      });
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      if (error?.code === 11000) {
        res.status(409).json({ success: false, error: 'This promo code already exists' });
        return;
      }
      console.error('Error creating promo code:', error);
      res.status(500).json({ success: false, error: 'Unable to create promo code' });
    }
  },

  updateCode: async (req: Request, res: Response) => {
    try {
      const current = await PromoCode.findById(req.params.id);
      if (!current) {
        res.status(404).json({ success: false, error: 'Promo code not found' });
        return;
      }

      const set: Record<string, unknown> = {};
      const unset: Record<string, number> = {};
      if (req.body.description !== undefined) set.description = req.body.description;
      if (req.body.percent !== undefined) set.percent = Number(req.body.percent);
      if (req.body.startsAt !== undefined) set.startsAt = new Date(req.body.startsAt);
      if (req.body.endsAt !== undefined) set.endsAt = new Date(req.body.endsAt);
      if (req.body.maxRedemptions !== undefined) {
        if (req.body.maxRedemptions === null || req.body.maxRedemptions === '') {
          unset.maxRedemptions = 1;
        } else {
          set.maxRedemptions = Number(req.body.maxRedemptions);
        }
      }
      if (req.body.status !== undefined) {
        if (!['ACTIVE', 'SUSPENDED'].includes(req.body.status)) {
          res.status(400).json({ success: false, error: 'Invalid promo code status' });
          return;
        }
        set.status = req.body.status;
      }
      const percent = Number(set.percent ?? current.percent);
      const startsAt = new Date(String(set.startsAt ?? current.startsAt));
      const endsAt = new Date(String(set.endsAt ?? current.endsAt));
      const maxRedemptions = unset.maxRedemptions ? undefined : Number(set.maxRedemptions ?? current.maxRedemptions);
      if (!Number.isInteger(percent) || percent < 1 || percent > 90 ||
        !Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || startsAt >= endsAt) {
        res.status(400).json({ success: false, error: 'Promo code requires a discount from 1 to 90 and a valid date range' });
        return;
      }
      if (maxRedemptions != null && (!Number.isInteger(maxRedemptions) || maxRedemptions < current.redemptionCount)) {
        res.status(400).json({ success: false, error: 'The redemption limit cannot be lower than the number of times already used' });
        return;
      }
      if (set.maxRedemptions !== undefined && (!Number.isInteger(set.maxRedemptions) || Number(set.maxRedemptions) < 1)) {
        res.status(400).json({ success: false, error: 'Redemption limit must be a positive whole number' });
        return;
      }
      const update: Record<string, unknown> = {};
      if (Object.keys(set).length) update.$set = set;
      if (Object.keys(unset).length) update.$unset = unset;
      const code = await PromoCode.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
      res.json({ success: true, data: code });
    } catch (error) {
      console.error('Error updating promo code:', error);
      res.status(500).json({ success: false, error: 'Unable to update promo code' });
    }
  },

  deleteCode: async (req: Request, res: Response) => {
    try {
      const code = await PromoCode.findByIdAndDelete(req.params.id);
      if (!code) {
        res.status(404).json({ success: false, error: 'Promo code not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting promo code:', error);
      res.status(500).json({ success: false, error: 'Unable to delete promo code' });
    }
  },

  validateCode: async (req: Request, res: Response) => {
    try {
      const userId = String((req as any).user._id);
      const type = String(req.body.type || '').toUpperCase();
      if (!isOfferType(type) || typeof req.body.code !== 'string') {
        res.status(400).json({ success: false, error: 'Offer type and promo code are required' });
        return;
      }
      const quote = await calculatePromotionQuote({
        type,
        itemId: req.body.itemId,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
      });
      const code = await findRedeemablePromoCode(req.body.code, userId);
      const discountAmount = Math.round(quote.originalPrice * (code.percent / 100) * 100) / 100;
      res.json({
        success: true,
        data: {
          code: code.code,
          percent: code.percent,
          basePrice: quote.originalPrice,
          discountAmount,
          totalPrice: Math.max(0, quote.originalPrice - discountAmount),
          currency: quote.currency,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Promo code cannot be applied' });
    }
  },
};

export function isValidPromoCodeId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}
