import { bookingService } from '../services/booking-service.js';
import { notificationService } from '../services/notification-service.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * @description Create a booking
 * @route POST /api/bookings
 */
export const createBooking = async (req, res) => {
  try {
    console.log('[Booking Controller] Received booking request body:', req.body); // Log request body
    console.log('[Booking Controller] User ID from request:', req.user?.id); // Log user ID
    const booking = await bookingService.createBooking(req.body, req.user.id);
    // Create notification for new booking
    await notificationService.createBookingNotification(req.user.id, booking._id, 'pending');
    res.status(201).json(booking);
  } catch (error) {
    console.error('[Booking Controller] Error creating booking:', error); // Log detailed error
    res.status(400).json({ message: error.message, details: error.details || error.stack }); // Include more error details
  }
};

/**
 * @description Get user bookings
 * @route GET /api/bookings
 */
export const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Get a single booking by ID
 * @route GET /api/bookings/:id
 */
export const getBooking = async (req, res) => {
  try {
    console.log(`Fetching booking with ID: ${req.params.id} for user: ${req.user.id}`);
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    console.log('Booking fetched:', booking);
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Confirm a booking (Admin only)
 * @route PUT /api/admin/bookings/:id/confirm
 */
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.confirmBooking(id);
    // Create notification for booking confirmation
    await notificationService.createBookingNotification(booking.userId, booking._id, 'confirmed', booking._id);
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @description Delete a booking
 * @route DELETE /api/bookings/:id
 */
export const deleteBooking = async (req, res) => {
  try {
    let booking;
    if (req.user.role === 'admin') {
      booking = await bookingService.getBookingByIdAdmin(req.params.id);
    } else {
      booking = await bookingService.getBookingById(req.params.id, req.user.id);
    }
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await bookingService.updateBooking(req.params.id, { status: 'cancelled' });
    // Create notification for booking cancellation
    const updatedBooking = await bookingService.getBookingByIdAdmin(req.params.id); // Or getBookingById for user
    if (updatedBooking) {
      await notificationService.createBookingNotification(updatedBooking.userId, updatedBooking._id, 'cancelled', updatedBooking._id);
    }
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error in deleteBooking controller:', error);
    if (error.message === 'Booking not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(403).json({ message: error.message });
  }
};

/**
 * @description Get cancelled bookings statistics
 * @route GET /api/bookings/cancelled-stats
 * @access Private (Admin only)
 */
export const getCancelledBookingsStats = catchAsync(async (req, res) => {
  const { year, periodType } = req.query;
  if (!year) {
    return res.status(400).json({ message: 'Year is required' });
  }
  const stats = await bookingService.getCancelledBookingsStatistics(parseInt(year), periodType);
  res.status(200).json(stats);
});