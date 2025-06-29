import { Payment } from '../models/payment.js';

export const paymentRepository = {
  create: async (data) => await Payment.create(data),
  update: async (id, data) => {
    console.log('Updating payment with _id:', id, 'with data:', data);
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    if (!updatedPayment) {
      console.warn('No payment found for _id:', id);
    }
    return updatedPayment;
  },

  findByUserId: async (userId) => {
    // Find payments where the associated booking's userId matches the given userId
    return await Payment.find()
      .populate({
        path: 'bookingId',
        match: { userId: userId }, // Match bookings for the specific user
        populate: {
          path: 'roomId',
          populate: {
            path: 'hotelId'
          }
        }
      })
      .sort({ createdAt: -1 })
      .exec()
      .then(payments => payments.filter(payment => payment.bookingId !== null)); // Filter out payments where bookingId didn't match userId
  },

  findByBookingId: async (bookingId) => {
    return await Payment.findOne({ bookingId: bookingId })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'roomId',
          populate: {
            path: 'hotelId'
          }
        }
      });
  },

  findAllAdmin: async () => {
    return await Payment.find()
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId' },
          { path: 'roomId', populate: { path: 'hotelId' } }
        ]
      })
      .sort({ createdAt: -1 });
  }
};