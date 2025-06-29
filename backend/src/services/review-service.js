import { reviewRepository } from '../repositories/review-repository.js';
import { bookingRepository } from '../repositories/booking-repository.js';
import { Review } from '../models/review.js'; // Import Review model to use populate

export const reviewService = {
  createReview: async ({ hotelId, rating, comment }, userId) => {
    console.log('[Review Service] Creating review with params:', { hotelId, rating, comment, userId });
    
    // Removed the booking check to allow any logged-in user to review
    // const bookings = await bookingRepository.find({ userId, 'roomId.hotelId': hotelId, status: 'confirmed' });
    // if (!bookings || bookings.length === 0) {
    //   throw new Error('You must book this hotel to review it');
    // }

    // Check if the user has already reviewed this hotel
    console.log('[Review Service] Checking for existing reviews...');
    const existingReviews = await reviewRepository.find({ userId, hotelId });
    console.log('[Review Service] Existing reviews found:', existingReviews);
    
    if (existingReviews && existingReviews.length > 0) {
      console.log('[Review Service] User has already reviewed this hotel');
      throw new Error('Bạn đã đánh giá khách sạn này rồi');
    }

    console.log('[Review Service] Creating new review...');
    const newReview = await reviewRepository.create({ userId, hotelId, rating, comment });
    console.log('[Review Service] Review created successfully:', newReview);
    return newReview;
  },

  respondToReview: async (reviewId, response, user) => {
    if (user.role !== 'admin') throw new Error('Unauthorized');
    return await reviewRepository.update(reviewId, { response, respondedBy: user.id });
  },

  getAllReviews: async (adminUser) => {
    // Redundant admin check removed - adminMiddleware on route handles this
    // if (adminUser.role !== 'admin') throw new Error('Unauthorized'); 
    console.log('Fetching all reviews with user and hotel info...'); // Added debug log
    try {
      // Fetch reviews with userId (name, avatarUrl) and hotelId populated
      const reviews = await reviewRepository.findAll();
      console.log('Successfully fetched and populated reviews:', reviews); // Added debug log
      return reviews;
    } catch (error) {
      console.error('Error fetching or populating reviews in service:', error); // Added debug log
      throw error; // Re-throw the error after logging
    }
  },

  deleteReview: async (reviewId, adminUser) => {
    if (adminUser.role !== 'admin') throw new Error('Unauthorized');
    return await reviewRepository.delete(reviewId);
  },

  getReviewsByHotel: async (hotelId) => {
    return await reviewRepository.findByHotelId(hotelId);
  }
};