import { Room } from '../models/room.js';

export const roomRepository = {
  findAll: async () => {
    return await Room.find().populate('hotelId');
  },

  findById: async (id) => {
    return await Room.findById(id);
  },

  create: async (data) => {
    const room = new Room(data);
    return await room.save();
  },

  update: async (id, data) => {
    return await Room.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id) => {
    return await Room.findByIdAndDelete(id);
  },

  findByHotelId: async (hotelId) => {
    return await Room.find({ hotelId }).populate('hotelId');
  },

  findAvailable: async (checkInDate, checkOutDate, hotelId = null) => {
    // Find rooms that do not have any bookings overlapping with the given dates
    const Booking = (await import('../models/booking.js')).Booking;
    const bookedRoomIds = await Booking.find({
      $or: [
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } },
      ],
      status: { $ne: 'cancelled' },
    }).distinct('roomId');
    const query = hotelId ? { _id: { $nin: bookedRoomIds }, hotelId } : { _id: { $nin: bookedRoomIds } };
    return await Room.find(query).populate('hotelId');
  },
};