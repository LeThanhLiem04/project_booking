import { bookingRepository } from '../repositories/booking-repository.js';
import { userRepository } from '../repositories/user-repository.js';
// import { roomRepository } from '../repositories/room-repository.js'; // Assuming you have a room repository
import { Room } from '../models/Room.js'; // Assuming your Room model is here

export const statisticsService = {
  getStats: async (adminUser, { type, period, year } = {}) => { // Make type, period, year optional
    // Keep detailed logging for debugging the role check
    const expectedRole = 'admin';
    const receivedRole = adminUser?.role;

    let roleCheckFailed = false;
    // More robust role check - still keeping this as the issue is likely here
    if (!adminUser || typeof adminUser.role !== 'string' || adminUser.role.trim() !== expectedRole) {
         console.error('Admin role check failed with combined checks!', {
             adminUserExists: !!adminUser,
             isRoleString: typeof adminUser?.role === 'string',
             receivedRoleValue: `'${receivedRole}'`,
             expectedRoleValue: `'${expectedRole}'`,
             trimmedComparison: receivedRole?.trim() === expectedRole,
         });
        roleCheckFailed = true;
    }

    if (roleCheckFailed) {
        throw new Error('Unauthorized');
    }

    console.log('Admin role check passed.'); // Log if check passes

    // Filter by year if provided
    let bookingDateFilter = {};
    if (year) {
      const start = new Date(Number(year), 0, 1);
      const end = new Date(Number(year) + 1, 0, 1);
      bookingDateFilter.checkOutDate = { $gte: start, $lt: end };
    }
    // Logic to fetch total stats - Ensure this is always fetched
    const totalBookings = await bookingRepository.countDocuments({ status: 'confirmed', ...bookingDateFilter });
    const totalRevenueResult = await bookingRepository.aggregate([
      { $match: { status: 'confirmed', ...bookingDateFilter } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    const totalUsers = await userRepository.countDocuments();
    const totalCancelledBookings = await bookingRepository.countDocuments({ status: 'cancelled', ...bookingDateFilter });

    // Simple booking rate calculation (you might need to adjust this based on your data/definition)
    // Use Room model directly for counting
    const totalRooms = await Room.countDocuments(); 
    // Handle case where totalRooms might be 0 to avoid division by zero
    const bookingRate = totalRooms > 0 ? (totalBookings / totalRooms) * 100 : 0;

    const totalStats = {
        totalBookings,
        totalRevenue,
        totalUsers,
        totalCancelledBookings,
        bookingRate: parseFloat(bookingRate.toFixed(2)), // Return as number, not string
    };

    // Logic to fetch time series data based on type and period
    let timeSeriesData = [];

    // Only fetch time series data if type and period are provided and look reasonable
    if (type && period && (type === 'revenue' || type === 'bookings') && (period === 'month' || period === 'quarter')) {
        // Sử dụng year nếu có, nếu không thì lấy năm hiện tại
        const targetYear = year ? Number(year) : new Date().getFullYear();
        let startDate;
        if (period === 'month') {
          startDate = new Date(targetYear, 0, 1); // Đầu năm
        } else if (period === 'quarter') {
          startDate = new Date(targetYear, 0, 1); // Đầu năm
        }
        // Base match stage to filter by date and status
        const baseMatch = {
          status: 'confirmed',
          checkOutDate: { $gte: startDate, $lt: new Date(targetYear + 1, 0, 1) },
        };
        if (type === 'revenue') {
          timeSeriesData = await bookingRepository.aggregate([
            { $match: baseMatch },
            { $group: {
                _id: {
                  year: { $year: '$checkOutDate' },
                  month: { $month: '$checkOutDate' },
                  quarter: { $ceil: { $divide: [{ $month: '$checkOutDate' }, 3] } },
                },
                value: { $sum: '$totalPrice' },
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $project: {
                _id: 0,
                time: {
                    $concat: [
                        period === 'month' ? "Tháng " : "Quý ",
                        { $toString: period === 'month' ? '$_id.month' : '$_id.quarter' },
                        "/",
                        { $toString: '$_id.year' }
                    ]
                },
                value: '$value',
                year: '$_id.year',
                month: '$_id.month',
                quarter: '$_id.quarter'
              }
            },
          ]);
          // Fill in missing months/quarters with zero values
          const filledData = [];
          if (period === 'month') {
            for (let month = 1; month <= 12; month++) {
              const existingData = timeSeriesData.find(d => d.month === month && d.year === targetYear);
              filledData.push({
                time: `Tháng ${month}/${targetYear}`,
                value: existingData ? existingData.value : 0
              });
            }
          } else {
            for (let quarter = 1; quarter <= 4; quarter++) {
              const existingData = timeSeriesData.find(d => d.quarter === quarter && d.year === targetYear);
              filledData.push({
                time: `Quý ${quarter}/${targetYear}`,
                value: existingData ? existingData.value : 0
              });
            }
          }
          timeSeriesData = filledData;
        } else {
          timeSeriesData = await bookingRepository.aggregate([
            { $match: baseMatch },
            { $group: {
                _id: {
                  year: { $year: '$checkOutDate' },
                  month: { $month: '$checkOutDate' },
                  quarter: { $ceil: { $divide: [{ $month: '$checkOutDate' }, 3] } },
                },
                value: { $sum: 1 },
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $project: {
                _id: 0,
                time: {
                    $concat: [
                        period === 'month' ? "Tháng " : "Quý ",
                        { $toString: period === 'month' ? '$_id.month' : '$_id.quarter' },
                        "/",
                        { $toString: '$_id.year' }
                    ]
                },
                value: '$value',
                year: '$_id.year',
                month: '$_id.month',
                quarter: '$_id.quarter'
              }
            },
          ]);
          // Fill in missing months/quarters with zero values
          const filledData = [];
          if (period === 'month') {
            for (let month = 1; month <= 12; month++) {
              const existingData = timeSeriesData.find(d => d.month === month && d.year === targetYear);
              filledData.push({
                time: `Tháng ${month}/${targetYear}`,
                value: existingData ? existingData.value : 0
              });
            }
          } else {
            for (let quarter = 1; quarter <= 4; quarter++) {
              const existingData = timeSeriesData.find(d => d.quarter === quarter && d.year === targetYear);
              filledData.push({
                time: `Quý ${quarter}/${targetYear}`,
                value: existingData ? existingData.value : 0
              });
            }
          }
          timeSeriesData = filledData;
        }
    }

    const responseData = {
        totalStats,
        timeSeriesData,
    };

    console.log('Stats service returning data:', JSON.stringify(responseData, null, 2)); // Log final data being returned

    return responseData;
  },
};