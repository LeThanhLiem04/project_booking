import { api } from './api';

const API_URL = '';

export const notificationService = {
  /**
   * Fetches all notifications for the current user.
   * @returns {Promise<Array>} A promise that resolves to an array of notification objects.
   */
  getNotifications: async () => {
    try {
      console.log('Attempting to fetch notifications...');
      console.log('Authorization header for notification request:', api.defaults.headers.common['Authorization']);
      const response = await api.get('/notifications');
      console.log('Successfully fetched notifications. Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Marks a specific notification as read.
   * @param {string} notificationId - The ID of the notification to mark as read.
   * @returns {Promise<object>} A promise that resolves to the updated notification object.
   */
  markAsRead: async (notificationId) => {
    try {
      console.log(`Attempting to mark notification ${notificationId} as read...`);
      const response = await api.put(`/notifications/${notificationId}/read`);
      console.log(`Notification ${notificationId} marked as read. Response data:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo là đã đọc:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Marks all notifications for the current user as read.
   * @returns {Promise<object>} A promise that resolves to a success message.
   */
  markAllAsRead: async () => {
    try {
      console.log('Attempting to mark all notifications as read...');
      const response = await api.put('/notifications/mark-all-read');
      console.log('All notifications marked as read. Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo là đã đọc:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Sends a new notification (admin only).
   * @param {object} notificationData - The data for the new notification (userId, message, type, link).
   * @returns {Promise<object>} A promise that resolves to the created notification object.
   */
  createNotification: async (notificationData) => {
    try {
      console.log('Attempting to create a new notification...', notificationData);
      const response = await api.post('/notifications', notificationData);
      console.log('Notification created. Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}; 