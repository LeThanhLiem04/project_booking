import express from 'express';
import { authenticate as protect, adminMiddleware as authorize } from '../middlewares/auth-middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
} from '../controllers/notification-controller.js';

const router = express.Router();

// Get all notifications for the current user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Create a new notification (admin only)
router.post('/', protect, authorize(), createNotification); // Only admin can create notifications via this route

export default router; 