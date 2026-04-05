import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';
import { User, Listing, Experience, Service } from '../models';

// Get user favorites
export const getFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, page = 1, limit = 20 } = req.query as Record<string, string>;
    
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        populate: [
          { path: 'listingId', model: 'Listing' },
          { path: 'experienceId', model: 'Experience' },
          { path: 'serviceId', model: 'Service' }
        ]
      })
      .exec();

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    let favorites = user.favorites || [];
    
    // Filter by type if specified
    if (type && type !== 'all') {
      favorites = favorites.filter((fav: any) => fav.type === type.replace('s', ''));
    }

    // Pagination
    const total = favorites.length;
    const paginatedFavorites = favorites.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: paginatedFavorites,
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
      error: error.message || 'Server error fetching favorites'
    } as ApiResponse);
  }
};

// Add to favorites
export const addToFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, itemId } = req.body;

    if (!type || !itemId) {
      res.status(400).json({
        success: false,
        error: 'Type and itemId are required'
      } as ApiResponse);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // Check if already in favorites
    const existingFavorite = user.favorites.find((fav: any) => 
      fav.type === type && fav.itemId.toString() === itemId
    );

    if (existingFavorite) {
      res.status(400).json({
        success: false,
        error: 'Already in favorites'
      } as ApiResponse);
      return;
    }

    // Verify the item exists
    let item;
    switch (type) {
      case 'listing':
        item = await Listing.findById(itemId);
        break;
      case 'experience':
        item = await Experience.findById(itemId);
        break;
      case 'service':
        item = await Service.findById(itemId);
        break;
      default:
        res.status(400).json({
          success: false,
          error: 'Invalid type'
        } as ApiResponse);
        return;
    }

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Item not found'
      } as ApiResponse);
      return;
    }

    // Add to favorites
    const favorite = {
      type,
      itemId,
      addedAt: new Date()
    };

    user.favorites.push(favorite);
    await user.save();

    res.status(201).json({
      success: true,
      data: { favorite }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error adding to favorites'
    } as ApiResponse);
  }
};

// Remove from favorites
export const removeFromFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { favoriteId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    // Remove from favorites
    user.favorites = user.favorites.filter((fav: any) => fav._id.toString() !== favoriteId);
    await user.save();

    res.status(200).json({
      success: true,
      data: { message: 'Removed from favorites' }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error removing from favorites'
    } as ApiResponse);
  }
};

// Check if item is in favorites
export const checkFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, itemId } = req.query as Record<string, string>;

    if (!type || !itemId) {
      res.status(400).json({
        success: false,
        error: 'Type and itemId are required'
      } as ApiResponse);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    const favorite = user.favorites.find((fav: any) => 
      fav.type === type && fav.itemId.toString() === itemId
    );

    res.status(200).json({
      success: true,
      data: { isFavorite: !!favorite, favoriteId: favorite?._id }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error checking favorite'
    } as ApiResponse);
  }
};

export const favoritesController = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite
};
