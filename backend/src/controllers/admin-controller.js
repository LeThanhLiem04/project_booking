import { userService } from '../services/user-service.js';
import { hotelService } from '../services/hotel-service.js';
import { roomService } from '../services/room-service.js';
import { bookingService } from '../services/booking-service.js';

/**
 * @description Get all users
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.user);
    res.status(200).json(users);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

/**
 * @description Update a user
 * @route PUT /api/admin/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.status(200).json(user);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

/**
 * @description Delete a user
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

/**
 * @description Get all bookings
 * @route GET /api/admin/bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') throw new Error('Unauthorized');
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

/**
 * @description Confirm a booking
 * @route PUT /api/admin/bookings/:id/confirm
 */
export const confirmBooking = async (req, res) => {
  try {
    if (req.user.role !== 'admin') throw new Error('Unauthorized');
    const booking = await bookingService.updateBooking(req.params.id, { status: 'confirmed' });
    res.status(200).json(booking);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};