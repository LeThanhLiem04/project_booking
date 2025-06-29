import { notificationRepository } from '../repositories/notification-repository.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * @description Get all notifications for the current user
 * @route GET /api/notifications
 * @access Private
 */
export const getNotifications = catchAsync(async (req, res) => {
  console.log('[Notification Controller] User object from request:', req.user);
  console.log('[Notification Controller] User ID from request:', req.user?.id);
  const notifications = await notificationRepository.findByUserId(req.user.id);
  console.log('[Notification Controller] Notifications fetched:', notifications);
  res.status(200).json(notifications);
});

/**
 * @description Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationRepository.update(req.params.id, { read: true });
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  res.status(200).json(notification);
});

/**
 * @description Mark all notifications as read for the current user
 * @route PUT /api/notifications/read-all
 * @access Private
 */
export const markAllAsRead = catchAsync(async (req, res) => {
  await notificationRepository.markAllAsRead(req.user._id);
  res.status(200).json({ message: 'All notifications marked as read' });
});

/**
 * @description Create a new notification (typically called internally or by admin)
 * @route POST /api/notifications
 * @access Private (Admin only if directly exposed)
 */
export const createNotification = catchAsync(async (req, res) => {
  // This function is primarily for internal use by other controllers
  // or can be exposed for admin to send general notifications.
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to create notifications' });
  }

  const { userId, message, type, link } = req.body;
  const notification = await notificationRepository.create({
    user: userId,
    message,
    type,
    read: false,
    link
  });

  res.status(201).json(notification);
}); 