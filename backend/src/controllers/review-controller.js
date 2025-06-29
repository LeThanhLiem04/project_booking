import { reviewService } from '../services/review-service.js';

export const reviewController = {
  /**
   * @description Create a review
   * @route POST /api/reviews
   */
  createReview: async (req, res) => {
    try {
      console.log('[Review Controller] Creating review with data:', req.body);
      console.log('[Review Controller] User from request:', req.user);
      
      const review = await reviewService.createReview(req.body, req.user.id);
      console.log('[Review Controller] Review created successfully:', review);
      res.status(201).json(review);
    } catch (error) {
      console.error('[Review Controller] Error creating review:', error);
      res.status(403).json({ message: error.message });
    }
  },

  /**
   * @description Respond to a review
   * @route PUT /api/reviews/:id/respond
   */
  respondToReview: async (req, res) => {
    try {
      const review = await reviewService.respondToReview(req.params.id, req.body.response, req.user);
      res.status(200).json(review);
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  /**
   * @description Get all reviews (admin only)
   * @route GET /api/reviews
   */
  getAllReviews: async (req, res) => {
    try {
      console.log('---[GET /api/reviews]---');
      console.log('Thời gian:', new Date().toISOString());
      console.log('User:', JSON.stringify(req.user));
      const reviews = await reviewService.getAllReviews(req.user);
      console.log('Số lượng review trả về:', reviews.length);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Lỗi khi lấy tất cả đánh giá:', error);
      if (error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      res.status(403).json({ message: error.message });
    }
  },

  /**
   * @description Delete a review (admin only)
   * @route DELETE /api/reviews/:id
   */
  deleteReview: async (req, res) => {
    try {
      await reviewService.deleteReview(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  },

  /**
   * @description Get reviews by hotel ID
   * @route GET /api/hotels/:hotelId/reviews
   */
  getReviewsByHotel: async (req, res) => {
    try {
      const { hotelId } = req.params;
      console.log('[API] Nhận request GET reviews cho hotelId:', hotelId);
      const reviews = await reviewService.getReviewsByHotel(hotelId);
      console.log('[API] Số lượng review tìm được:', reviews.length);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('[API] Lỗi khi lấy review:', error);
      res.status(500).json({ message: error.message });
    }
  }
};