import { Notification } from '../models/notification.js';

export const notificationRepository = {
  create: async (data) => {
    const notification = new Notification(data);
    return await notification.save();
  },

  findByUserId: async (userId) => {
    return await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
  },

  update: async (id, data) => {
    return await Notification.findByIdAndUpdate(id, data, { new: true });
  },

  markAllAsRead: async (userId) => {
    return await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
  }
}; 