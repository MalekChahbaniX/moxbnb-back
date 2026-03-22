import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'NEW_MESSAGE' | 'REVIEW_RECEIVED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'SYSTEM_UPDATE';
  data?: Record<string, any>;
  isRead: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'NEW_MESSAGE', 'REVIEW_RECEIVED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SYSTEM_UPDATE']
  },
  data: {
    type: Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
