import { Request, Response } from 'express';
import { Listing, Experience, Service, Booking, Review } from '../models';
import { ApiResponse, PaginationInfo, QueryParams } from '../types';

export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      category,
      type,
      minPrice,
      maxPrice,
      rating,
      city,
      pricingType,
      targetAudience
    } = req.query as QueryParams;

    // Build query
    const query: any = { status: 'PUBLISHED' };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (pricingType) {
      query.pricingType = pricingType;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Calculate pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const listings = await Listing.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('hostId', 'firstName lastName avatar')
      .exec();

    const total = await Listing.countDocuments(query);

    const pagination: PaginationInfo = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: skip + limitNum < total,
      hasPrev: pageNum > 1
    };

    res.status(200).json({
      success: true,
      data: listings,
      pagination
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching listings'
    } as ApiResponse);
  }
};

export const getFeaturedListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const listings = await Listing.find({ 
      status: 'PUBLISHED', 
      isFeatured: true 
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('hostId', 'firstName lastName avatar')
      .exec();

    res.status(200).json({
      success: true,
      data: listings
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching featured listings'
    } as ApiResponse);
  }
};

export const searchListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, latitude, longitude, radius = 50 } = req.query;

    const query: any = { status: 'PUBLISHED' };

    if (q) {
      query.$text = { $search: q };
    }

    // Geospatial search if coordinates are provided
    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude as string), parseFloat(latitude as string)]
          },
          $maxDistance: parseInt(radius as string) * 1000 // Convert km to meters
        }
      };
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('hostId', 'firstName lastName avatar')
      .exec();

    res.status(200).json({
      success: true,
      data: listings
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error searching listings'
    } as ApiResponse);
  }
};

export const getMyListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { status, search, page = 1, limit = 24 } = req.query;

    const query: Record<string, unknown> = { hostId: userId };

    if (status && status !== 'all') {
      if (status === 'active') query.status = 'PUBLISHED';
      else if (status === 'inactive') query.status = { $in: ['SUSPENDED', 'ARCHIVED', 'RENTED'] };
      else if (status === 'pending') query.status = 'DRAFT';
    }

    if (search && typeof search === 'string' && search.trim()) {
      const esc = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(esc, 'i');
      query.$or = [{ title: re }, { city: re }];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Listing.countDocuments(query)
    ]);

    const ids = listings.map((l) => l._id);
    const [bookingStats, reviewStats] = await Promise.all([
      ids.length
        ? Booking.aggregate([
            { $match: { listingId: { $in: ids } } },
            { $group: { _id: '$listingId', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
          ])
        : Promise.resolve([] as { _id: unknown; bookings: number; revenue: number }[]),
      ids.length
        ? Review.aggregate([
            { $match: { listingId: { $in: ids } } },
            { $group: { _id: '$listingId', avgRating: { $avg: '$rating' }, reviews: { $sum: 1 } } }
          ])
        : Promise.resolve([] as { _id: unknown; avgRating: number; reviews: number }[])
    ]);

    const bMap = Object.fromEntries(bookingStats.map((b) => [String(b._id), b]));
    const rMap = Object.fromEntries(reviewStats.map((r) => [String(r._id), r]));

    const data = listings.map((l) => {
      const id = String(l._id);
      const bs = bMap[id] || { bookings: 0, revenue: 0 };
      const rs = rMap[id] || { avgRating: 0, reviews: 0 };
      return {
        ...l,
        stats: {
          bookings: bs.bookings,
          revenue: bs.revenue || 0,
          rating: rs.avgRating ? Math.round(rs.avgRating * 10) / 10 : 0,
          reviews: rs.reviews || 0
        }
      };
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching your listings'
    } as ApiResponse);
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate('hostId', 'firstName lastName lastName avatar phone email')
      .exec();

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found'
      } as ApiResponse);
      return;
    }

    // Get reviews for this listing
    const reviews = await Review.find({ listingId: id })
      .populate('userId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      data: {
        listing,
        reviews
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching listing'
    } as ApiResponse);
  }
};

export const createListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const listingData = { ...req.body, hostId: userId };

    const listing = new Listing(listingData);
    await listing.save();

    await listing.populate('hostId', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: listing
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating listing'
    } as ApiResponse);
  }
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const listing = await Listing.findOneAndUpdate(
      { _id: id, hostId: userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('hostId', 'firstName lastName avatar');

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: listing
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating listing'
    } as ApiResponse);
  }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const listing = await Listing.findOneAndDelete({ _id: id, hostId: userId });

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error deleting listing'
    } as ApiResponse);
  }
};

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { images } = req.body;

    const listing = await Listing.findOneAndUpdate(
      { _id: id, hostId: userId },
      { $push: { images: { $each: images } } },
      { new: true }
    );

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: listing
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error uploading images'
    } as ApiResponse);
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, imageId } = req.params;
    const userId = (req as any).user.id;

    const listing = await Listing.findOneAndUpdate(
      { _id: id, hostId: userId },
      { $pull: { images: imageId } },
      { new: true }
    );

    if (!listing) {
      res.status(404).json({
        success: false,
        error: 'Listing not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: listing
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error deleting image'
    } as ApiResponse);
  }
};

export const getStudentListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      pricingType,
      bedrooms,
      maxPrice
    } = req.query;

    const query: any = {
      targetAudience: 'STUDENTS',
      status: 'PUBLISHED'
    };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (pricingType) {
      query.pricingType = { $in: [pricingType, 'BOTH'] };
    }

    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    if (maxPrice) {
      query.$or = [
        { price: { $lte: Number(maxPrice) } },
        { monthlyPrice: { $lte: Number(maxPrice) } }
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('hostId', 'firstName lastName avatar phone')
      .exec();

    const total = await Listing.countDocuments(query);

    res.status(200).json({
      success: true,
      data: listings,
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
      error: error.message || 'Server error fetching student listings'
    } as ApiResponse);
  }
};

export const listingController = {
  getListings,
  getFeaturedListings,
  searchListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  uploadImages,
  deleteImage,
  getStudentListings
};
