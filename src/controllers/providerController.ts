import { Request, Response } from 'express';
import { User, Listing, Experience, Service, Booking, Review, Message } from '../models';
import { ApiResponse } from '../types';

function buildBookingScopeOr(listings: { _id: unknown }[], experiences: { _id: unknown }[], services: { _id: unknown }[]) {
  const or: Record<string, unknown>[] = [];
  if (listings.length) or.push({ listingId: { $in: listings.map((l) => l._id) } });
  if (experiences.length) or.push({ experienceId: { $in: experiences.map((e) => e._id) } });
  if (services.length) or.push({ serviceId: { $in: services.map((s) => s._id) } });
  return or;
}

function buildReviewScopeQuery(listings: { _id: unknown }[], experiences: { _id: unknown }[], services: { _id: unknown }[]) {
  const or: Record<string, unknown>[] = [];
  if (listings.length) or.push({ listingId: { $in: listings.map((l) => l._id) } });
  if (experiences.length) or.push({ experienceId: { $in: experiences.map((e) => e._id) } });
  if (services.length) or.push({ serviceId: { $in: services.map((s) => s._id) } });
  return or.length ? { $or: or } : { _id: { $exists: false } };
}

function nightsOverlappingMonth(checkIn: Date, checkOut: Date | undefined, monthStart: Date, monthEnd: Date): number {
  const out = checkOut && checkOut > checkIn ? checkOut : new Date(checkIn.getTime() + 86400000);
  const start = new Date(Math.max(checkIn.getTime(), monthStart.getTime()));
  const end = new Date(Math.min(out.getTime(), monthEnd.getTime()));
  if (end <= start) return 0;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
}

export const getProviderDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const [listings, experiences, services] = await Promise.all([
      Listing.find({ hostId: userId }),
      Experience.find({ hostId: userId }),
      Service.find({ hostId: userId })
    ]);

    const scopeOr = buildBookingScopeOr(listings, experiences, services);
    const bookingQuery = scopeOr.length ? { $or: scopeOr } : { _id: { $exists: false } };

    const [bookings, reviews, unreadMessages] = await Promise.all([
      Booking.find(bookingQuery),
      Review.find(buildReviewScopeQuery(listings, experiences, services)),
      Message.countDocuments({ receiverId: userId, isRead: false })
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const daysInMonth = monthEnd.getDate();

    const monthlyBookings = bookings.filter((b) => new Date(b.createdAt) >= monthStart);
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const upcomingBookings = bookings.filter((b) =>
      (b.status === 'PENDING' || b.status === 'CONFIRMED') && new Date(b.checkIn) >= now
    ).length;

    const publishedListings = listings.filter((l) => l.status === 'PUBLISHED');
    const activeListings = publishedListings.length;

    let bookedNightsMonth = 0;
    for (const b of bookings) {
      if (b.type !== 'PROPERTY' || !b.listingId || b.status === 'CANCELLED') continue;
      bookedNightsMonth += nightsOverlappingMonth(new Date(b.checkIn), b.checkOut ? new Date(b.checkOut) : undefined, monthStart, monthEnd);
    }
    const capacityNights = activeListings * daysInMonth;
    const occupancyRate =
      capacityNights > 0 ? Math.min(100, Math.round((bookedNightsMonth / capacityNights) * 100)) : 0;

    const totalListings = listings.length;
    const totalExperiences = experiences.length;
    const totalServices = services.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const bookingStats = bookings.reduce((stats, booking) => {
      stats[booking.status] = (stats[booking.status] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    const listingIds = listings.map((l) => l._id);
    const [bookingStatsByListing, reviewStatsByListing] = await Promise.all([
      listingIds.length
        ? Booking.aggregate([
            { $match: { listingId: { $in: listingIds } } },
            { $group: { _id: '$listingId', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
          ])
        : [],
      listingIds.length
        ? Review.aggregate([
            { $match: { listingId: { $in: listingIds } } },
            { $group: { _id: '$listingId', avgRating: { $avg: '$rating' } } }
          ])
        : []
    ]);
    const bMap = Object.fromEntries(bookingStatsByListing.map((x: any) => [String(x._id), x]));
    const rMap = Object.fromEntries(reviewStatsByListing.map((x: any) => [String(x._id), x]));

    const sortedListings = [...listings].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const listingPreviews = sortedListings.slice(0, 10).map((l) => {
      const id = String(l._id);
      const bs = bMap[id] || { bookings: 0, revenue: 0 };
      const rs = rMap[id];
      const rating = rs?.avgRating ? Math.round(rs.avgRating * 10) / 10 : 0;
      const uiStatus =
        l.status === 'PUBLISHED' ? 'active' : l.status === 'DRAFT' || l.status === 'SUSPENDED' ? 'pending' : 'inactive';
      return {
        id,
        title: l.title,
        status: uiStatus,
        bookings: bs.bookings,
        revenue: bs.revenue || 0,
        rating,
        image: Array.isArray(l.images) && l.images[0] ? l.images[0] : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        analytics: {
          totalListings,
          totalExperiences,
          totalServices,
          activeListings,
          totalBookings,
          monthlyBookings: monthlyBookings.length,
          totalRevenue,
          monthlyRevenue,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
          upcomingBookings,
          unreadMessages,
          occupancyRate,
          bookingStats
        },
        recentBookings,
        listingPreviews,
        listings: sortedListings.slice(0, 5),
        experiences: experiences.slice(0, 5),
        services: services.slice(0, 5)
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
      .populate('userId', 'firstName lastName avatar phone email')
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
    let { status } = req.body;
    const userId = (req as any).user.id;

    if (typeof status === 'string') status = status.toUpperCase();
    const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED'];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Use one of: ${allowed.join(', ')}`
      } as ApiResponse);
      return;
    }

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

    const [listings, experiences, services] = await Promise.all([
      Listing.find({ hostId: userId }),
      Experience.find({ hostId: userId }),
      Service.find({ hostId: userId })
    ]);

    const scope = buildReviewScopeQuery(listings, experiences, services);
    const query: Record<string, unknown> = { ...scope };
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

    const allReviews = await Review.find(scope);
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

export const getProviderClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const listings = await Listing.find({ hostId: userId }).select('_id');
    const listingIds = listings.map((l) => l._id);

    if (!listingIds.length) {
      res.status(200).json({ success: true, data: [] } as ApiResponse);
      return;
    }

    const rows = await Booking.aggregate([
      { $match: { listingId: { $in: listingIds } } },
      {
        $lookup: {
          from: 'listings',
          localField: 'listingId',
          foreignField: '_id',
          as: 'listing'
        }
      },
      { $unwind: { path: '$listing', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$userId',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          lastBookingDate: { $max: '$createdAt' },
          properties: { $addToSet: '$listing.title' }
        }
      },
      { $sort: { lastBookingDate: -1 } }
    ]);

    const userIds = rows.map((r) => r._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName email phone avatar createdAt')
      .lean();

    const uMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const data = rows.map((r) => {
      const u = uMap[String(r._id)];
      const name = u ? [u.firstName, u.lastName].filter(Boolean).join(' ').trim() : 'Client';
      const last = r.lastBookingDate ? new Date(r.lastBookingDate) : null;
      return {
        id: String(r._id),
        name: name || 'Client',
        email: u?.email || '',
        phone: u?.phone || '',
        avatar: u?.avatar || null,
        totalBookings: r.totalBookings,
        totalSpent: r.totalSpent || 0,
        averageRating: 0,
        joinDate: u?.createdAt || last || new Date(),
        lastBookingDate: last || new Date(),
        status: last && last >= ninetyDaysAgo ? 'active' : 'inactive',
        properties: (r.properties || []).filter(Boolean)
      };
    });

    res.status(200).json({ success: true, data } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching clients'
    } as ApiResponse);
  }
};

export const providerController = {
  getProviderDashboard,
  getProviderEarnings,
  getProviderBookings,
  updateBookingStatus,
  getProviderServices,
  getProviderReviews,
  getProviderClients
};
