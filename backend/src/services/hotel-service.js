import { hotelRepository } from '../repositories/hotel-repository.js';
import { Review } from '../models/review.js'; // Import Review model

export const hotelService = {
  createHotel: async (data, user) => {
    if (user.role !== 'admin') throw new Error('Unauthorized');
    return await hotelRepository.create(data);
  },
  searchHotels: async ({ name, location, minPrice, maxPrice, amenities }) => {
    const matchQuery = {};
    if (name) matchQuery.name = { $regex: name, $options: 'i' };
    if (location) {
      matchQuery.$or = [
        { address: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } }
      ];
    }

    try {
      // Lấy danh sách khách sạn
      const hotels = await hotelRepository.findAll(matchQuery);
      
      // Lấy số lượng đánh giá cho mỗi khách sạn
      const hotelsWithReviews = await Promise.all(hotels.map(async (hotel) => {
        const reviews = await Review.find({ hotelId: hotel._id });
        return {
          _id: hotel._id,
          name: hotel.name,
          location: hotel.location,
          address: hotel.address,
          city: hotel.city,
          description: hotel.description,
          image: hotel.image,
          rating: hotel.rating,
          totalReviews: reviews.length
        };
      }));

      return hotelsWithReviews;
    } catch (error) {
      console.error('Error in searchHotels:', error);
      throw error;
    }
  },
};