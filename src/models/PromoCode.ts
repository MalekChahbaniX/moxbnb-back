import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description?: string;
  percent: number;
  startsAt: Date;
  endsAt: Date;
  maxRedemptions?: number;
  redemptionCount: number;
  redeemedBy: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'SUSPENDED';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>({
  code: { type: String, required: true, trim: true, uppercase: true, unique: true, minlength: 3, maxlength: 32 },
  description: { type: String, trim: true, maxlength: 300 },
  percent: { type: Number, required: true, min: 1, max: 90 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  maxRedemptions: { type: Number, min: 1 },
  redemptionCount: { type: Number, min: 0, default: 0 },
  redeemedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

promoCodeSchema.index({ status: 1, startsAt: 1, endsAt: 1 });

export const PromoCode = mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);
