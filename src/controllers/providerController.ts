import { Request, Response } from 'express';
import { User, Listing, Experience, Service, Booking, Review } from '../models';
import { ApiResponse } from '../types';

export const getProviderDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    
    // Get provider's listings, experiences, and services
    const [listings, experiences, services] = await Promise.all([
      Listing.find({ hostId: userId }),
      Experience.find({ hostId: userId }),
      Service.find({ hostId: userId })
    ]);

    // Get bookings for provider's listings, experiences, and services
    const bookingQuery = {
      $or: [
        { listingId: { $in: listings.map(l => l._id) } },
        { experienceId: { $in: experiences.map(e => e._id) } },
        { serviceId: { $in: services.map(s => s._id) } }
      ]
    };

    const [bookings, reviews] = await Promise.all([
      Booking.find(bookingQuery),
      Review.find({ hostId: userId })
    ]);

    // Calculate analytics
    const totalListings = listings.length;
    const totalExperiences = experiences.length;
    const totalServices = services.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Booking status breakdown
    const bookingStats = bookings.reduce((stats, booking) => {
      stats[booking.status] = (stats[booking.status] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      data: {
        analytics: {
          totalListings,
          totalExperiences,
          totalServices,
          totalBookings,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10,
          bookingStats
        },
        recentBookings,
        listings: listings.slice(0, 5), // Recent listings
        experiences: experiences.slice(0, 5), // Recent experiences
        services: services.slice(0, 5) // Recent services
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching provider dashboard'
    } as ApiResponse);
  }
};

export const getProviderEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { period = 'month' } = req.query;

    // Get provider's listings, experiences, and services
    const [listings, experiences, services] = await Promise.all([
      Listing.find({ hostId: userId }),
      Experience.find({ hostId: userId }),
      Service.find({ hostId: userId })
    ]);

    // Build booking query
    const matchStage: any = {
      $or: [
        { listingId: { $in: listings.map(l => l._id) } },
        { experienceId: { $in: experiences.map(e => e._id) } },
        { serviceId: { $in: services.map(s => s._id) } }
      ]
    };
    
    // Filter by period
    const now = new Date();
    if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      matchStage.createdAt = { $gte: monthStart };
    } else if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      matchStage.createdAt = { $gte: weekStart };
    } else if (period === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      matchStage.createdAt = { $gte: yearStart };
    }

    const bookings = await Booking.find(matchStage)
      .sort({ createdAt: -1 });

    // Calculate earnings
    const totalEarnings = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const completedEarnings = completedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Group earnings by date for chart
    const earningsByDate = bookings.reduce((acc, booking) => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += booking.totalPrice || 0;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        completedEarnings,
        pendingEarnings: totalEarnings - completedEarnings,
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        earningsByDate: Object.entries(earningsByDate).map(([date, amount]) => ({
          date,
          amount
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching provider earnings'
    } as ApiResponse);
  }
};

export const getProviderBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Get provider's listings, experiences, and services
    const [listings, experiences, services] = await Promise.all([
      Listing.find({ hostId: userId }),
      Experience.find({ hostId: userId }),
      Service.find({ hostId: userId })
    ]);

    // Build booking query
    const query: any = {
      $or: [
        { listingId: { $in: listings.map(l => l._id) } },
        { experienceId: { $in: experiences.map(e => e._id) } },
        { serviceId: { $in: services.map(s => s._id) } }
      ]
    };
    
    if (status) {
      query.status = status;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'firstName lastName avatar phone')
      .populate('listingId', 'title images')
      .populate('experienceId', 'title images')
      .populate('serviceId', 'title images')
      .exec();

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching provider bookings'
    } as ApiResponse);
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    // Get provider's listings, experiences, and services
    const [listings, experiences, services] = await Promise.all([
      Listing.find({ hostId: userId }),
      Experience.find({ hostId: userId }),
      Service.find({ hostId: userId })
    ]);

    // Build query to find booking that belongs to provider
    const bookingQuery = {
      _id: id,
      $or: [
        { listingId: { $in: listings.map(l => l._id) } },
        { experienceId: { $in: experiences.map(e => e._id) } },
        { serviceId: { $in: services.map(s => s._id) } }
      ]
    };

    const booking = await Booking.findOneAndUpdate(
      bookingQuery,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName avatar phone email')
     .populate('listingId', 'title')
     .populate('experienceId', 'title')
     .populate('serviceId', 'title');

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: booking
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating booking status'
    } as ApiResponse);
  }
};

export const getProviderServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { hostId: userId };
    if (status) {
      query.status = status;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('hostId', 'firstName lastName avatar')
      .exec();

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching provider services'
    } as ApiResponse);
  }
};

export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, rating } = req.query;

    const query: any = { hostId: userId };
    if (rating) {
      query.rating = Number(rating);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'firstName lastName avatar')
      .populate('listingId', 'title')
      .populate('experienceId', 'title')
      .populate('serviceId', 'title')
      .exec();

    const total = await Review.countDocuments(query);

    // Calculate rating breakdown
    const allReviews = await Review.find({ hostId: userId });
    const ratingBreakdown = allReviews.reduce((breakdown, review) => {
      breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
      return breakdown;
    }, {} as Record<number, number>);

    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allReviews.length,
        ratingBreakdown
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching provider reviews'
    } as ApiResponse);
  }
};

export const providerController = {
  getProviderDashboard,
  getProviderEarnings,
  getProviderBookings,
  updateBookingStatus,
  getProviderServices,
  getProviderReviews
};
