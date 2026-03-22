import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  type: 'PROPERTY' | 'EXPERIENCE' | 'SERVICE';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  checkIn: Date;
  checkOut?: Date;
  guests: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentId?: string;
  userId: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  experienceId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  type: {
    type: String,
    required: true,
    enum: ['PROPERTY', 'EXPERIENCE', 'SERVICE']
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED'],
    default: 'PENDING'
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    validate: {
      validator: function(this: IBooking, value: Date) {
        return this.type === 'SERVICE' || !value || value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'TND',
    enum: ['TND', 'EUR', 'USD']
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'PENDING'
  },
  paymentId: {
    type: String,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  },
  experienceId: {
    type: Schema.Types.ObjectId,
    ref: 'Experience'
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ listingId: 1 });
bookingSchema.index({ experienceId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
