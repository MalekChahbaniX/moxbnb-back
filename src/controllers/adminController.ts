import { Request, Response } from 'express';
import { Listing } from '../models/Listing';
import { Service } from '../models/Service';
import { Experience } from '../models/Experience';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';

// ==================== LISTINGS ====================

export const getAllListings = async (req: Request, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'host.name': { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await Listing.find(filter)
      .populate('host', 'name email phone')
      .sort(sort as any)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Listing.countDocuments(filter);

    res.json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingListings = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const listings = await Listing.find({ status: 'pending' })
      .populate('host', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Listing.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getListingDetails = async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveListing = async (req: Request, res: Response) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', updatedAt: new Date() },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing, message: 'Listing approved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectListing = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason, updatedAt: new Date() },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing, message: 'Listing rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SERVICES ====================

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'provider.name': { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(filter)
      .populate('provider', 'name email phone')
      .sort(sort as any)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingServices = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const services = await Service.find({ status: 'pending' })
      .populate('provider', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Service.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getServiceDetails = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', updatedAt: new Date() },
      { new: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service, message: 'Service approved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectService = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason, updatedAt: new Date() },
      { new: true }
    );
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service, message: 'Service rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPERIENCES ====================

export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'provider.name': { $regex: search, $options: 'i' } }
      ];
    }

    const experiences = await Experience.find(filter)
      .populate('provider', 'name email phone')
      .sort(sort as any)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Experience.countDocuments(filter);

    res.json({
      success: true,
      data: experiences,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingExperiences = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const experiences = await Experience.find({ status: 'pending' })
      .populate('provider', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Experience.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: experiences,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExperienceDetails = async (req: Request, res: Response) => {
  try {
    const experience = await Experience.findById(req.params.id).populate('provider');
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, data: experience });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveExperience = async (req: Request, res: Response) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', updatedAt: new Date() },
      { new: true }
    );
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, data: experience, message: 'Experience approved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectExperience = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason, updatedAt: new Date() },
      { new: true }
    );
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, data: experience, message: 'Experience rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== USERS ====================

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort as any)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const listingsCount = await Listing.countDocuments({ host: user._id });
    const bookingsCount = await Booking.countDocuments({ user: user._id });
    
    res.json({ 
      success: true, 
      data: {
        ...user,
        listingsCount,
        bookingsCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'banned', banReason: reason, bannedAt: new Date() },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User banned' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active', banReason: undefined, bannedAt: undefined },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User unbanned' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'host', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User role updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REVIEWS ====================

export const getFlaggedReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ flagged: true })
      .populate('reviewer', 'name email')
      .populate('listing', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments({ flagged: true });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { flagged: false, moderationStatus: 'approved' },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review, message: 'Review approved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { flagged: false, moderationStatus: 'rejected' },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review, message: 'Review rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STATISTICS ====================

export const getPlatformOverview = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'approved' });
    const pendingListings = await Listing.countDocuments({ status: 'pending' });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        activeListings,
        pendingListings,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueStats = async (req: Request, res: Response) => {
  try {
    const monthlyRevenue = await Booking.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$price' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: 12 }
    ]);

    res.json({ success: true, data: monthlyRevenue });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const overview = await getPlatformOverview.bind(null, req, {} as any)();
    const pendingListings = await Listing.countDocuments({ status: 'pending' });
    const pendingServices = await Service.countDocuments({ status: 'pending' });
    const pendingExperiences = await Experience.countDocuments({ status: 'pending' });
    const flaggedReviews = await Review.countDocuments({ flagged: true });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: await User.countDocuments(),
          activeListings: await Listing.countDocuments({ status: 'approved' }),
          totalBookings: await Booking.countDocuments(),
          platformRevenue: (await Booking.aggregate([
            { $group: { _id: null, total: { $sum: '$price' } } }
          ]))[0]?.total || 0
        },
        pending: {
          listings: pendingListings,
          services: pendingServices,
          experiences: pendingExperiences,
          reviews: flaggedReviews
        },
        recentActivity: []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
