import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'GUEST' | 'CLIENT' | 'HOST' | 'PROVIDER' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  language: string;
  currency: string;
  timezone: string;
  dateOfBirth?: Date;
  nationality?: string;
  bio?: string;
  emergencyContact?: string;
  settings?: {
    language?: string;
    currency?: string;
    theme?: 'light' | 'dark' | 'auto';
    autoPlayVideos?: boolean;
    profileVisibility?: 'public' | 'private';
    showOnlineStatus?: boolean;
    allowDirectMessages?: boolean;
    dataSharing?: boolean;
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    bookingUpdates?: boolean;
    newMessages?: boolean;
    promotions?: boolean;
    twoFactorAuth?: boolean;
    loginAlerts?: boolean;
    sessionTimeout?: boolean;
  };
  favorites?: Array<{
    _id?: string;
    type: string;
    itemId: string;
    addedAt: Date;
  }>;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['GUEST', 'CLIENT', 'HOST', 'PROVIDER', 'ADMIN'],
    default: 'CLIENT'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'fr',
    enum: ['fr', 'ar', 'en']
  },
  currency: {
    type: String,
    default: 'TND',
    enum: ['TND', 'EUR', 'USD']
  },
  timezone: {
    type: String,
    default: 'Africa/Tunis'
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  nationality: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: null
  },
  emergencyContact: {
    type: String,
    default: null
  },
  settings: {
    language: { type: String, default: 'fr' },
    currency: { type: String, default: 'TND' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    autoPlayVideos: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    showOnlineStatus: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    bookingUpdates: { type: Boolean, default: true },
    newMessages: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true },
    sessionTimeout: { type: Boolean, default: true }
  },
  favorites: [{
    type: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    addedAt: { type: Date, default: Date.now() }
  }],
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove password from JSON output
      const { password, ...result } = ret;
      return result;
    }
  }
});

// Indexes
// email index is already created by unique: true in schema definition
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
