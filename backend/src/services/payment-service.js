import Stripe from 'stripe';
import { paymentRepository } from '../repositories/payment-repository.js';
import { bookingRepository } from '../repositories/booking-repository.js';
import { sendEmail } from '../config/nodemailer.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log('Stripe Secret Key loaded (last 5 chars): ', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.slice(-5) : 'Not loaded');

export const paymentService = {
  createPaymentIntent: async ({ bookingId, amount }) => {
    try {
      // Kiểm tra nếu đã có payment completed cho bookingId thì không tạo mới
      const existingPayment = await paymentRepository.findByBookingId(bookingId);
      if (existingPayment && existingPayment.status === 'completed') {
        throw new Error('Payment already completed for this booking');
      }
      // Nếu payment chưa completed, vẫn tạo mới payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // For VND, amount is already in the smallest unit (dong)
        currency: 'vnd',
        metadata: { bookingId },
      });

      // Nếu đã có payment (pending), cập nhật lại transactionId
      let payment;
      if (existingPayment) {
        payment = await paymentRepository.update(existingPayment._id, {
          amount,
          paymentMethod: 'stripe',
          transactionId: paymentIntent.id,
        });
      } else {
        payment = await paymentRepository.create({
          bookingId,
          amount,
          paymentMethod: 'stripe',
          transactionId: paymentIntent.id,
        });
      }

      return { payment, clientSecret: paymentIntent.client_secret };
    } catch (stripeError) {
      console.error('Error creating Stripe Payment Intent:', stripeError);
      // Re-throw the error so the controller can catch it and send a 400 response
      throw new Error(`Stripe API Error: ${stripeError.message}`);
    }
  },

  confirmPayment: async (paymentId, bookingId) => {
    console.log('Attempting to confirm payment for paymentId:', paymentId, 'and bookingId:', bookingId);
    let payment, booking;

    try {
      payment = await paymentRepository.update(paymentId, { status: 'completed' });
      if (!payment) throw new Error('Payment record not found for update');
      console.log('Payment record updated to completed:', payment);
    } catch (err) {
      console.error('Error updating payment record:', err);
      throw new Error(`Failed to update payment status: ${err.message}`);
    }

    try {
      booking = await bookingRepository.update(bookingId, { status: 'confirmed' });
      if (!booking) throw new Error('Booking record not found for update');
      console.log('Booking record updated to confirmed:', booking);
    } catch (err) {
      console.error('Error updating booking record:', err);
      throw new Error(`Failed to update booking status: ${err.message}`);
    }

    try {
      console.log('Checking bookingRepository object:', bookingRepository);
      const bookingQuery = bookingRepository.findById(bookingId);
      console.log('Result of bookingRepository.findById:', bookingQuery);
      const foundBooking = await bookingQuery.populate('userId');
      if (!foundBooking) throw new Error('Booking not found after confirmation');
      console.log('Booking found for email sending:', foundBooking);

      await sendEmail(
        foundBooking.userId.email,
        'Booking Confirmed',
        `Your booking (ID: ${bookingId}) has been confirmed!`
      );
      console.log('Confirmation email sent to:', foundBooking.userId.email);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Decide whether to re-throw this error or just log it and continue
      // For now, let's re-throw to ensure all steps are successful.
      throw new Error(`Failed to send confirmation email: ${emailError.message}`);
    }

    return payment;
  },

  getPaymentsByUserId: async (userId) => {
    console.log(`[Payment Service] Fetching payments for userId: ${userId}`);
    const payments = await paymentRepository.findByUserId(userId);
    console.log(`[Payment Service] Fetched payments: ${payments.length} items`);
    return payments;
  },

  getPaymentByBookingId: async (bookingId) => {
    console.log(`[Payment Service] Fetching payment for bookingId: ${bookingId}`);
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) {
      console.log(`[Payment Service] No payment found for bookingId: ${bookingId}`);
    }
    return payment;
  },

  getAllPaymentsAdmin: async () => {
    return await paymentRepository.findAllAdmin();
  }
};