import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  type: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'STUDIO' | 'ROOM' | 'CABIN' | 'LOFT' | 'CONDO' | 'TOWNHOUSE';
  category: string;
  price: number;
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
    enum: ['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO', 'ROOM', 'CABIN', 'LOFT', 'CONDO', 'TOWNHOUSE']
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
listingSchema.index({ maxGuests: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ isFeatured: 1 });
listingSchema.index({ hostId: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ latitude: 1, longitude: 1 });

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
