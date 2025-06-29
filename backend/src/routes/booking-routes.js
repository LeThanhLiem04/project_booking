import express from 'express';
import { createBooking, getBookings, getBooking, confirmBooking, deleteBooking, getCancelledBookingsStats } from '../controllers/booking-controller.js';
import { authenticate, adminMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getBookings);

// Admin routes
router.get('/cancelled-stats', authenticate, adminMiddleware(), getCancelledBookingsStats);

router.get('/:id', authenticate, getBooking);
router.put('/:id/confirm', authenticate, adminMiddleware(), confirmBooking);
router.delete('/:id', authenticate, deleteBooking);

export default router;