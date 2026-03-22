import { Request, Response } from 'express';
import { Booking } from '../models';
import { ApiResponse } from '../types';

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('listingId', 'title images price currency')
      .populate('experienceId', 'title images price currency duration')
      .populate('serviceId', 'title images price currency duration')
      .exec();

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching bookings'
    } as ApiResponse);
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const bookingData = { ...req.body, userId };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate related data
    await booking.populate('listingId');
    await booking.populate('experienceId');
    await booking.populate('serviceId');

    res.status(201).json({
      success: true,
      data: booking
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating booking'
    } as ApiResponse);
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOne({ _id: id, userId })
      .populate('listingId')
      .populate('experienceId')
      .populate('serviceId')
      .populate('userId', 'firstName lastName email phone')
      .exec();

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
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
      error: error.message || 'Server error fetching booking'
    } as ApiResponse);
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('listingId')
      .populate('experienceId')
      .populate('serviceId')
      .exec();

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
      error: error.message || 'Server error updating booking'
    } as ApiResponse);
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, userId },
      { status: 'CANCELLED' },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found or access denied'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error cancelling booking'
    } as ApiResponse);
  }
};

export const bookingController = {
  getBookings,
  createBooking,
  getBookingById,
  updateBooking,
  cancelBooking
};
