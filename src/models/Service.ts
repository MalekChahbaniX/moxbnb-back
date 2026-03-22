import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  duration: number; // in minutes
  location?: string;
  address?: string;
  city?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'UNAVAILABLE' | 'ARCHIVED';
  isFeatured: boolean;
  providerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
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
  currency: {
    type: String,
    default: 'TND',
    enum: ['TND', 'EUR', 'USD']
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 480 // 8 hours max
  },
  location: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
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
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'ARCHIVED'],
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
serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ city: 1, country: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ isFeatured: 1 });
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ latitude: 1, longitude: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);
