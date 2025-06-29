import express from 'express';
import { createPayment, confirmPayment, getMyPayments, getPaymentByBookingId, getAllPaymentsAdmin } from '../controllers/payment-controller.js';
import { authenticate, adminMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', authenticate, createPayment);
router.post('/confirm', authenticate, confirmPayment);
router.get('/my-payments', authenticate, getMyPayments);
router.get('/booking/:bookingId', authenticate, getPaymentByBookingId);
router.get('/admin/payments', authenticate, adminMiddleware, getAllPaymentsAdmin);

export default router;