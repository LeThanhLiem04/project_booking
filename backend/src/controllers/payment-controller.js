import { paymentService } from '../services/payment-service.js';
import { notificationService } from '../services/notification-service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { bookingService } from '../services/booking-service.js';

export const createPayment = async (req, res) => {
  try {
    const { payment, clientSecret } = await paymentService.createPaymentIntent(req.body);
    res.status(201).json({ payment, clientSecret });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const payment = await paymentService.confirmPayment(req.body.paymentId, req.body.bookingId);
    // Sau khi thanh toán thành công, tạo thông báo xác nhận đơn đặt phòng
    const booking = await bookingService.getBookingById(req.body.bookingId, req.user.id);
    if (booking && booking.userId) {
      await notificationService.createBookingNotification(booking.userId, booking._id, 'confirmed');
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(400).json({ message: error.message, stack: error.stack });
  }
};

/**
 * @description Get payments for the current user
 * @route GET /api/payments/my-payments
 * @access Private
 */
export const getMyPayments = catchAsync(async (req, res) => {
  console.log('[Payment Controller] Fetching payments for user ID:', req.user.id);
  const payments = await paymentService.getPaymentsByUserId(req.user.id);
  res.status(200).json(payments);
});

/**
 * @description Get payment details by booking ID
 * @route GET /api/payments/booking/:bookingId
 * @access Private
 */
export const getPaymentByBookingId = catchAsync(async (req, res) => {
  console.log('[Payment Controller] Fetching payment for booking ID:', req.params.bookingId);
  const payment = await paymentService.getPaymentByBookingId(req.params.bookingId);
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found for this booking' });
  }
  res.status(200).json(payment);
});

/**
 * @description Get all payments (admin only)
 * @route GET /api/admin/payments
 * @access Private/Admin
 */
export const getAllPaymentsAdmin = async (req, res) => {
  try {
    // Có thể kiểm tra quyền admin ở middleware route
    const payments = await paymentService.getAllPaymentsAdmin();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};