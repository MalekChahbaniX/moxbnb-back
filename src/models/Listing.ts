import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'STUDIO' | 'ROOM' | 'CABIN' | 'LOFT' | 'CONDO' | 'TOWNHOUSE' | 'SHARED_ROOM' | 'SHARED_ROOM_STUDENTS' | 'PRIVATE_ROOM_STUDENTS' | 'ENTIRE_MAISON_STUDENTS';
  category: string;
  price: number;
  promotionPercent?: number;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  promotionStatus: 'ACTIVE' | 'SUSPENDED';
  monthlyPrice?: number; // Prix mensuel si applicable
  pricingType: 'NIGHTLY' | 'MONTHLY' | 'BOTH'; // Type de prix
  currency: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  amenities: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests: number;
  size?: number;
  rules: string[];
  targetAudience?: 'GENERAL' | 'STUDENTS' | 'FAMILIES' | 'PROFESSIONALS'; // Audience cible
  status: 'DRAFT' | 'PUBLISHED' | 'RENTED' | 'SUSPENDED' | 'ARCHIVED';
  isFeatured: boolean;
  hostId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'CABIN', 'LOFT', 'CONDO', 'TOWNHOUSE', 'SHARED_ROOM', 'SHARED_ROOM_STUDENTS', 'PRIVATE_ROOM_STUDENTS', 'ENTIRE_MAISON_STUDENTS']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  promotionPercent: {
    type: Number,
    min: 1,
    max: 90
  },
  promotionStartDate: {
    type: Date
  },
  promotionEndDate: {
    type: Date
  },
  promotionStatus: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  monthlyPrice: {
    type: Number,
    min: 0
  },
  pricingType: {
    type: String,
    enum: ['NIGHTLY', 'MONTHLY', 'BOTH'],
    default: 'NIGHTLY'
  },
  currency: {
    type: String,
    default: 'TND',
    enum: ['TND', 'EUR', 'USD']
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: 'Tunisia',
    trim: true
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  },
  images: [{
    type: String,
    required: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  bedrooms: {
    type: Number,
    min: 0,
    max: 20
  },
  bathrooms: {
    type: Number,
    min: 0,
    max: 20
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  size: {
    type: Number,
    min: 0
  },
  rules: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    enum: ['GENERAL', 'STUDENTS', 'FAMILIES', 'PROFESSIONALS'],
    default: 'GENERAL'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'RENTED', 'SUSPENDED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ city: 1, country: 1 });
listingSchema.index({ type: 1, category: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ status: 1, promotionStartDate: 1, promotionEndDate: 1 });
listingSchema.index({ monthlyPrice: 1 });
listingSchema.index({ pricingType: 1 });
listingSchema.index({ targetAudience: 1 });
listingSchema.index({ maxGuests: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ isFeatured: 1 });
listingSchema.index({ hostId: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ latitude: 1, longitude: 1 });
listingSchema.index({ pricingType: 1, city: 1 }); // Pour filtrer par type de prix et ville
listingSchema.index({ targetAudience: 1, status: 1 }); // Pour filtrer par audience cible

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
