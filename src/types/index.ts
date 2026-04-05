// Common types used across the application
import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  query: any;
  body: any;
  params: any;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}

export interface FilterOptions {
  priceMin?: number;
  priceMax?: number;
  category?: string;
  type?: string;
  rating?: number;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchFilters extends FilterOptions {
  q?: string;
  location?: string;
  radius?: number;
}

export interface BookingData {
  type: 'property' | 'experience' | 'service';
  itemId: string;
  checkIn: Date;
  checkOut?: Date;
  guests: number;
  totalPrice: number;
  specialRequests?: string;
}

export interface PaymentData {
  method: 'card' | 'paypal' | 'stripe';
  amount: number;
  currency: string;
  bookingId: string;
  metadata?: Record<string, any>;
}

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
}

export interface EmailData {
  to: string | string[];
  subject: string;
  template?: string;
  data?: Record<string, any>;
  attachments?: any[];
}

export interface ReviewData {
  rating: number;
  comment?: string;
  images?: string[];
  bookingId: string;
}

export interface MessageData {
  content: string;
  type: 'text' | 'image' | 'file';
  receiverId: string;
  bookingId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  language: string;
  currency: string;
  timezone: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  type: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewsCount: number;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  isFeatured: boolean;
}

export interface ExperienceSummary {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  location: string;
  city: string;
  country: string;
  rating: number;
  reviewsCount: number;
  duration: number;
  maxGuests: number;
  difficulty: string;
  isFeatured: boolean;
}

export interface ServiceSummary {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  location?: string;
  city?: string;
  country: string;
  rating: number;
  reviewsCount: number;
  duration: number;
  isFeatured: boolean;
}

export interface BookingSummary {
  id: string;
  type: string;
  status: string;
  checkIn: Date;
  checkOut?: Date;
  guests: number;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  item: ListingSummary | ExperienceSummary | ServiceSummary;
  createdAt: Date;
}
