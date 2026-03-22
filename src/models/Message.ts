import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  fileUrl?: string;
  isRead: boolean;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'LOCATION'],
    default: 'TEXT'
  },
  fileUrl: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ bookingId: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
