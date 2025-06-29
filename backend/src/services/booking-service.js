import { bookingRepository } from '../repositories/booking-repository.js';
import { roomRepository } from '../repositories/room-repository.js';
import { userRepository } from '../repositories/user-repository.js';
import { sendEmail } from '../config/nodemailer.js';
import { paymentRepository } from '../repositories/payment-repository.js';

export const bookingService = {
  createBooking: async ({ roomId, checkInDate, checkOutDate }, userId) => {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    const overlappingBookings = await bookingRepository.findOverlapping(roomId, checkInDate, checkOutDate);
    if (overlappingBookings.length > 0) throw new Error('Room not available');

    const days = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
    const totalPrice = days * room.price;

    const booking = await bookingRepository.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    try {
      const user = await userRepository.findById(userId);
      if (user && user.email) {
        await sendEmail(user.email, 'Booking Created', `Your booking (ID: ${booking._id}) is pending confirmation.`);
      }
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Continue even if email fails
    }

    return booking;
  },

  getUserBookings: async (userId) => await bookingRepository.findByUserId(userId),
  
  getAllBookings: async () => await bookingRepository.findAll(), // Added for admin

  getBookingById: async (id, userId) => {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId.toString() !== userId) throw new Error('Unauthorized');
    return booking;
  },

  getBookingByIdAdmin: async (id) => {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },

  updateBooking: async (id, data) => {
    const booking = await bookingRepository.update(id, data);
    // Nếu hủy booking, cập nhật payment liên quan sang cancelled nếu chưa completed
    if (data.status === 'cancelled') {
      const payment = await paymentRepository.findByBookingId(id);
      if (payment && payment.status !== 'completed' && payment.status !== 'cancelled') {
        await paymentRepository.update(payment._id, { status: 'cancelled' });
      }
    }
    try {
      const user = await userRepository.findById(booking.userId);
      if (user && user.email) {
        await sendEmail(user.email, 'Booking Updated', `Your booking (ID: ${id}) has been updated to ${data.status}.`);
      }
    } catch (emailError) {
      console.error('Failed to send booking update email:', emailError);
      // Continue even if email fails
    }
    return booking;
  },

  // Add confirmBooking method
  confirmBooking: async (id) => {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'pending') throw new Error('Booking cannot be confirmed as it is not in pending status');

    // Cập nhật trạng thái booking
    const updatedBooking = await bookingRepository.update(id, { 
      status: 'confirmed', 
      updatedAt: Date.now() 
    });

    // Gửi email thông báo đến admin
    try {
      const emailContent = `
        <h2>New Booking Confirmation</h2>
        <p>A new booking has been confirmed:</p>
        <h3>Booking Details:</h3>
        <ul>
          <li>Booking ID: ${booking._id}</li>
          <li>Room: ${booking.roomId?.name}</li>
          <li>Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
          <li>Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
          <li>Total Price: $${booking.totalPrice}</li>
        </ul>
      `;

      await sendEmail(
        process.env.EMAIL_USER, // Gửi đến email admin đã cấu hình trong .env
        'New Booking Confirmation',
        emailContent
      );
      console.log('Email sent to admin:', process.env.EMAIL_USER);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Continue even if email fails
    }

    return updatedBooking;
  },

  deleteBooking: async (id) => {
    console.log('Deleting booking with id:', id);
    const result = await bookingRepository.delete(id);
    console.log('Delete result:', result);
    return result;
  },

  getCancelledBookingsStatistics: async (year, periodType = 'month') => {
    console.log(`[Booking Service] Fetching cancelled bookings statistics for year: ${year}, periodType: ${periodType}`);
    const stats = await bookingRepository.getCancelledBookingsStats(year, periodType);
    console.log('[Booking Service] Cancelled bookings statistics fetched:', stats);
    return stats;
  },
};