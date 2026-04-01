import { Request, Response } from 'express';
import { Service } from '../models';
import { ApiResponse } from '../types';

export const getServices = async (req: Request, res: Response): Promise<void> => {
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

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('providerId', 'firstName lastName avatar')
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
      error: error.message || 'Server error fetching services'
    } as ApiResponse);
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id)
      .populate('providerId', 'firstName lastName avatar phone email')
      .exec();

    if (!service || service.status !== 'PUBLISHED') {
      res.status(404).json({
        success: false,
        error: 'Service not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: service
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching service'
    } as ApiResponse);
  }
};

export const serviceController = {
  getServices,
  getServiceById
};
