import { notificationRepository } from '../repositories/notification-repository.js';

export const notificationService = {
  /**
   * Creates a new notification.
   * @param {string} userId - The ID of the user to notify.
   * @param {string} message - The notification message.
   * @param {string} type - The type of notification (e.g., 'booking', 'payment', 'system').
   * @param {string} [link] - Optional link associated with the notification.
   * @param {object} [metadata] - Optional metadata associated with the notification (e.g., { paymentId: 'abc' }).
   * @returns {Promise<object>} The created notification object.
   */
  createNotification: async (userId, message, type, link = null, metadata = {}) => {
    try {
      const notification = await Notification.create({
        user: userId,
        message,
        type,
        read: false,
        link,
        metadata
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Creates a booking-related notification.
   * @param {string} userId - The ID of the user.
   * @param {string} bookingId - The ID of the booking.
   * @param {string} status - The status of the booking (e.g., 'pending', 'confirmed', 'cancelled').
   * @returns {Promise<object>} The created notification object.
   */
  createBookingNotification: async (userId, bookingId, status) => {
    console.log(`[Notification Service] Creating booking notification for userId: ${userId}, bookingId: ${bookingId}, status: ${status}`);
    let message, type;
    const metadata = { bookingId };
    switch (status) {
      case 'pending':
        message = 'Đơn đặt phòng của bạn đang chờ xác nhận';
        type = 'booking_pending';
        break;
      case 'confirmed':
        message = 'Đơn đặt phòng của bạn đã được xác nhận';
        type = 'booking_confirmed';
        break;
      case 'cancelled':
        message = 'Đơn đặt phòng của bạn đã bị hủy';
        type = 'booking_cancelled';
        break;
      default:
        message = 'Cập nhật trạng thái đơn đặt phòng';
        type = 'booking_update';
    }

    try {
      const notification = await notificationRepository.create({
        user: userId,
        message,
        type,
        link: `/my-bookings`,
        read: false,
        metadata
      });
      console.log('[Notification Service] Booking notification created successfully:', notification);
      return notification;
    } catch (error) {
      console.error('[Notification Service] Error creating booking notification:', error);
      throw error;
    }
  },

  /**
   * Creates a payment-related notification.
   * @param {string} userId - The ID of the user.
   * @param {string} bookingId - The ID of the associated booking.
   * @param {string} status - The status of the payment (e.g., 'pending', 'completed', 'failed').
   * @param {string} [paymentId] - The ID of the payment.
   * @returns {Promise<object>} The created notification object.
   */
  createPaymentNotification: async (userId, bookingId, status, paymentId = null) => {
    console.log(`[Notification Service] Creating payment notification for userId: ${userId}, bookingId: ${bookingId}, status: ${status}`);
    let message, type;
    const metadata = { bookingId, paymentId };
    switch (status) {
      case 'pending':
        message = 'Đang chờ thanh toán đơn đặt phòng';
        type = 'payment_pending';
        break;
      case 'completed':
        message = 'Thanh toán đơn đặt phòng thành công';
        type = 'payment';
        break;
      case 'failed':
        message = 'Thanh toán đơn đặt phòng thất bại';
        type = 'payment_failed';
        break;
      default:
        message = 'Cập nhật trạng thái thanh toán';
        type = 'payment_update';
    }

    try {
      const notification = await notificationRepository.create({
        user: userId,
        message,
        type,
        link: `/my-payments`,
        read: false,
        metadata
      });
      console.log('[Notification Service] Payment notification created successfully:', notification);
      return notification;
    } catch (error) {
      console.error('[Notification Service] Error creating payment notification:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả thông báo của người dùng
   */
  getNotifications: async (userId) => {
    console.log(`[Notification Service] Fetching notifications for userId: ${userId}`);
    return await notificationRepository.findByUserId(userId);
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead: async (notificationId) => {
    console.log(`[Notification Service] Marking notification as read: ${notificationId}`);
    return await notificationRepository.update(notificationId, { read: true });
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async (userId) => {
    console.log(`[Notification Service] Marking all notifications as read for userId: ${userId}`);
    return await notificationRepository.markAllAsRead(userId);
  }
}; 