import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportReply {
  author: 'user' | 'support';
  text: string;
  date: Date;
}

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  category: 'booking' | 'payment' | 'listing' | 'account' | 'other';
  bookingRef?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  replies: ISupportReply[];
  responses: number;
  createdAt: Date;
  updatedAt: Date;
}

const supportReplySchema = new Schema<ISupportReply>({
  author: { type: String, enum: ['user', 'support'], required: true },
  text: { type: String, required: true, trim: true, maxlength: 5000 },
  date: { type: Date, default: Date.now },
}, { _id: false });

const supportTicketSchema = new Schema<ISupportTicket>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, enum: ['booking', 'payment', 'listing', 'account', 'other'], default: 'other' },
  bookingRef: { type: String, trim: true, maxlength: 100 },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  replies: { type: [supportReplySchema], default: [] },
  responses: { type: Number, default: 0 },
}, { timestamps: true });

supportTicketSchema.index({ userId: 1, createdAt: -1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);