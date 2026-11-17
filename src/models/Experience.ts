import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  promotionPercent?: number;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  promotionStatus: 'ACTIVE' | 'SUSPENDED';
  currency: string;
  duration: number; // in minutes
  maxGuests: number;
  location: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  includes: string[];
  requirements: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'ARCHIVED';
  isFeatured: boolean;
  providerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>({
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
  promotionPercent: { type: Number, min: 1, max: 90 },
  promotionStartDate: { type: Date },
  promotionEndDate: { type: Date },
  promotionStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  currency: {
    type: String,
    default: 'TND',
    enum: ['TND', 'EUR', 'USD']
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  location: {
    type: String,
    required: true,
    trim: true
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
  includes: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    default: 'BEGINNER'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
experienceSchema.index({ title: 'text', description: 'text' });
experienceSchema.index({ city: 1, country: 1 });
experienceSchema.index({ category: 1 });
experienceSchema.index({ price: 1 });
experienceSchema.index({ status: 1, promotionStartDate: 1, promotionEndDate: 1 });
experienceSchema.index({ difficulty: 1 });
experienceSchema.index({ status: 1 });
experienceSchema.index({ isFeatured: 1 });
experienceSchema.index({ providerId: 1 });
experienceSchema.index({ createdAt: -1 });
experienceSchema.index({ latitude: 1, longitude: 1 });

export const Experience = mongoose.model<IExperience>('Experience', experienceSchema);
