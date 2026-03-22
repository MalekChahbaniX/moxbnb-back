import { Request, Response } from 'express';
import { Listing, Experience, Service, Booking, Review } from '@/models';
import { ApiResponse, PaginationInfo, QueryParams } from '@/types';

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
      city
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

export const listingController = {
  getListings,
  getFeaturedListings,
  searchListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  uploadImages,
  deleteImage
};
