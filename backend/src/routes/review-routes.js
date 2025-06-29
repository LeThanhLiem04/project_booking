import express from 'express';
import { reviewController } from '../controllers/review-controller.js';
import { authenticate, adminMiddleware } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.post('/', authenticate, reviewController.createReview);
router.put('/:id/respond', authenticate, reviewController.respondToReview);
router.get('/', authenticate, adminMiddleware, reviewController.getAllReviews);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;