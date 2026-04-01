import { Request, Response } from 'express';
import { Message } from '../models';
import { ApiResponse } from '../types';

const fullName = (user: any): string => {
  if (!user) return 'Utilisateur';
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Utilisateur';
};

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String((req as any).user.id);

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'firstName lastName avatar role')
      .populate('receiverId', 'firstName lastName avatar role')
      .populate({
        path: 'bookingId',
        select: 'listingId experienceId serviceId',
        populate: [
          { path: 'listingId', select: 'title images' },
          { path: 'experienceId', select: 'title images' },
          { path: 'serviceId', select: 'title images' },
        ],
      })
      .limit(300)
      .exec();

    const byUser = new Map<string, any>();

    for (const msg of messages) {
      const sender = msg.senderId as any;
      const receiver = msg.receiverId as any;
      const other = String(sender?._id) === userId ? receiver : sender;
      const otherId = String(other?._id || '');
      if (!otherId) continue;

      if (!byUser.has(otherId)) {
        const booking: any = (msg as any).bookingId;
        const listingRef = booking?.listingId || booking?.experienceId || booking?.serviceId;
        byUser.set(otherId, {
          id: otherId,
          userId: otherId,
          userName: fullName(other),
          userAvatar: other?.avatar || null,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          isOnline: false,
          listingTitle: listingRef?.title,
          listingImage: Array.isArray(listingRef?.images) ? listingRef.images[0] : undefined,
          isHost: ['HOST', 'PROVIDER'].includes(String(other?.role || '')),
        });
      }

      if (String(receiver?._id) === userId && !msg.isRead) {
        const current = byUser.get(otherId);
        current.unreadCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(byUser.values()),
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching conversations',
    } as ApiResponse);
  }
};

export const getThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String((req as any).user.id);
    const { userId: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', '_id')
      .exec();

    const payload = messages.map((m) => {
      const sender = m.senderId as any;
      const senderIdStr = sender?._id ? String(sender._id) : String(m.senderId);
      return {
        id: String(m._id),
        content: m.content,
        type: m.type,
        createdAt: m.createdAt,
        isMine: senderIdStr === userId,
      };
    });

    res.status(200).json({
      success: true,
      data: { messages: payload },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching thread',
    } as ApiResponse);
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = (req as any).user.id;
    const { receiverId, content, type = 'TEXT', bookingId } = req.body;

    const message = await Message.create({
      senderId,
      receiverId,
      content,
      type,
      bookingId,
    });

    res.status(201).json({
      success: true,
      data: message,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error sending message',
    } as ApiResponse);
  }
};

export const markConversationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { userId: otherUserId } = req.params;

    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error marking conversation as read',
    } as ApiResponse);
  }
};

export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { userId: otherUserId } = req.params;

    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Conversation deleted',
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error deleting conversation',
    } as ApiResponse);
  }
};

export const messageController = {
  getConversations,
  getThread,
  sendMessage,
  markConversationAsRead,
  deleteConversation,
};
