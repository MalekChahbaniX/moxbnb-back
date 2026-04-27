import { Request, Response } from 'express';
import { Experience } from '../models';
import { ApiResponse } from '../types';

export const getExperiences = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, city, minPrice, maxPrice, featured } = req.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query: any = { status: 'PUBLISHED' };
    if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const experiences = await Experience.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('providerId', 'firstName lastName avatar')
      .exec();

    const total = await Experience.countDocuments(query);

    res.status(200).json({
      success: true,
      data: experiences,
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
      error: error.message || 'Server error fetching experiences'
    } as ApiResponse);
  }
};

export const getExperienceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id)
      .populate('providerId', 'firstName lastName avatar phone email')
      .exec();

    if (!experience || experience.status !== 'PUBLISHED') {
      res.status(404).json({
        success: false,
        error: 'Experience not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: experience
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching experience'
    } as ApiResponse);
  }
};

export const getMyExperiences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status, search } = req.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query: any = { providerId: userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const experiences = await Experience.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .exec();

    const total = await Experience.countDocuments(query);

    res.status(200).json({
      success: true,
      data: experiences,
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
      error: error.message || 'Server error fetching experiences'
    } as ApiResponse);
  }
};

export const createExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const experienceData = { ...req.body, providerId: userId };

    const experience = new Experience(experienceData);
    await experience.save();

    res.status(201).json({
      success: true,
      data: experience
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating experience'
    } as ApiResponse);
  }
};

export const updateExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const experience = await Experience.findOneAndUpdate(
      { _id: id, providerId: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!experience) {
      res.status(404).json({
        success: false,
        error: 'Experience not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: experience
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating experience'
    } as ApiResponse);
  }
};

export const deleteExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const experience = await Experience.findOneAndDelete({ _id: id, providerId: userId });

    if (!experience) {
      res.status(404).json({
        success: false,
        error: 'Experience not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error deleting experience'
    } as ApiResponse);
  }
};

export const experienceController = {
  getExperiences,
  getExperienceById,
  getMyExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};
