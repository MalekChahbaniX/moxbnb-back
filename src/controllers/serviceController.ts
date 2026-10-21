import { Request, Response } from 'express';
import { Service } from '../models';
import { ApiResponse } from '../types';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, city, minPrice, maxPrice, featured } = req.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query: any = { status: { $in: ['PUBLISHED', 'UNAVAILABLE'] } };
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

    if (!service || !['PUBLISHED', 'UNAVAILABLE'].includes(service.status)) {
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

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
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

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
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

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      description,
      category,
      price,
      duration,
      maxGuests,
      location,
      city,
      country,
      coordinates,
      images,
      requirements,
      included,
      notIncluded,
      instantBook,
      status = 'DRAFT'
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !price || !duration) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category, price, duration'
      } as ApiResponse);
      return;
    }

    // Prepare service data
    const serviceData: any = {
      title,
      description,
      category,
      price: Number(price),
      duration: Number(duration),
      location,
      city,
      country,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      images: images || [],
      requirements,
      included,
      notIncluded,
      status: status === 'active' ? 'PUBLISHED' : 'DRAFT',
      providerId: userId
    };

    const service = new Service(serviceData);
    await service.save();

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating service'
    } as ApiResponse);
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const service = await Service.findOneAndUpdate(
      { _id: id, providerId: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found or access denied'
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
      error: error.message || 'Server error updating service'
    } as ApiResponse);
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const service = await Service.findOneAndDelete({ _id: id, providerId: userId });

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Service not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error deleting service'
    } as ApiResponse);
  }
};

export const serviceController = {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService
};
