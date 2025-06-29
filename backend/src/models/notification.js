import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_pending',
      'booking_confirmed',
      'booking_cancelled',
      'booking_update',
      'payment_pending',
      'payment',
      'payment_failed',
      'payment_update'
    ],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String, // Optional link for the notification
    required: false
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema); 