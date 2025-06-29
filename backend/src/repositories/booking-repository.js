import { Booking } from '../models/booking.js';

export const bookingRepository = {
  create: async (data) => await Booking.create(data),
  findByUserId: async (userId) => await Booking.find({ userId }).populate('roomId'),
  findOverlapping: async (roomId, checkInDate, checkOutDate) => await Booking.find({
    roomId,
    $or: [
      { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } },
    ],
    status: { $ne: 'cancelled' },
  }),
  findAll: async () => await Booking.find()
    .populate('userId')
    .populate({
      path: 'roomId',
      populate: { path: 'hotelId' }
    }),
  update: async (id, data) => await Booking.findByIdAndUpdate(id, data, { new: true }),
  findById: (id) => Booking.findById(id).populate({ path: 'roomId', populate: { path: 'hotelId' } }),
  countDocuments: async (query) => await Booking.countDocuments(query), // Added for stats
  aggregate: async (pipeline) => await Booking.aggregate(pipeline), // Added for stats
  delete: async (id) => {
    console.log('Repository deleting booking:', id);
    return await Booking.findByIdAndDelete(id);
  },

  getCancelledBookingsStats: async (year, periodType = 'month') => {
    console.log(`[Booking Repository] getCancelledBookingsStats called with year: ${year}, periodType: ${periodType}`);
    const matchStage = {
      status: 'cancelled',
      checkOutDate: { $ne: null } // Ensure checkOutDate exists
    };

    if (year) {
      matchStage.checkOutDate.$gte = new Date(`${year}-01-01T00:00:00Z`);
      matchStage.checkOutDate.$lt = new Date(`${parseInt(year) + 1}-01-01T00:00:00Z`);
    }
    console.log('[Booking Repository] Match Stage:', JSON.stringify(matchStage, null, 2));

    let groupField;
    let sortField = { '_id.year': 1 };

    if (periodType === 'quarter') {
      groupField = {
        year: { $year: '$checkOutDate' },
        quarter: { $ceil: { $divide: [{ $month: '$checkOutDate' }, 3] } },
      };
      sortField['_id.quarter'] = 1;
    } else { // default to month
      groupField = {
        year: { $year: '$checkOutDate' },
        month: { $month: '$checkOutDate' },
      };
      sortField['_id.month'] = 1;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: groupField,
          count: { $sum: 1 },
        },
      },
      { $sort: sortField },
    ];
    console.log('[Booking Repository] Aggregation Pipeline:', JSON.stringify(pipeline, null, 2));

    const results = await Booking.aggregate(pipeline);
    console.log('[Booking Repository] Aggregation Results:', JSON.stringify(results, null, 2));
    return results;
  },
};