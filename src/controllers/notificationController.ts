import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

export const notificationController = {
  // Get all notifications for the authenticated user
  getNotifications: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const filter: any = { userId };
      if (unreadOnly === 'true') {
        filter.isRead = false;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        unreadCount,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch notifications',
      });
    }
  },

  // Get a single notification by ID
  getNotificationById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const notification = await Notification.findOne({ _id: id, userId });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch notification',
      });
    }
  },

  // Mark notification as read
  markAsRead: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const notification = await Notification.findOne({ _id: id, userId });
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
      }

      notification.isRead = true;
      await notification.save();

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark notification as read',
      });
    }
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { notificationIds } = req.body;

      let filter: any = { userId };
      if (notificationIds && Array.isArray(notificationIds)) {
        filter = { 
          userId, 
          _id: { $in: notificationIds }
        };
      }

      const result = await Notification.updateMany(
        filter,
        { isRead: true }
      );

      res.json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
        },
        message: 'Notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark notifications as read',
      });
    }
  },

  // Delete a notification
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const notification = await Notification.findOne({ _id: id, userId });
      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
      }

      await Notification.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete notification',
      });
    }
  },

  // Delete multiple notifications
  deleteMultipleNotifications: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { notificationIds } = req.body;

      let filter: any = { userId };
      if (notificationIds && Array.isArray(notificationIds)) {
        filter = { 
          userId, 
          _id: { $in: notificationIds }
        };
      }

      const result = await Notification.deleteMany(filter);

      res.json({
        success: true,
        data: {
          deletedCount: result.deletedCount,
        },
        message: 'Notifications deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete notifications',
      });
    }
  },

  // Get unread notification count
  getUnreadCount: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      res.json({
        success: true,
        data: { unreadCount },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch unread count',
      });
    }
  },

  // Create a notification (internal use)
  createNotification: async (userId: string, title: string, message: string, type: any, data?: any) => {
    try {
      const notification = new Notification({
        userId,
        title,
        message,
        type,
        data,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  },

  // Mark all notifications as read for user
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      res.json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
        },
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark all notifications as read',
      });
    }
  },
};
