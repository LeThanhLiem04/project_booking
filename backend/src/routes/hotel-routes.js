import express from 'express';
import { hotelController } from '../controllers/hotel-controller.js';
import { roomController } from '../controllers/room-controller.js'; // Add this import
import { reviewController } from '../controllers/review-controller.js'; // Add this import

const router = express.Router();

router.get('/', hotelController.getAllHotels);
router.get('/search', hotelController.searchHotels); // New search route
router.get('/:hotelId/rooms', roomController.getRoomsByHotel); // Add this route
router.get('/reviews/:hotelId', reviewController.getReviewsByHotel); // Đổi vị trí và path
router.get('/:id', hotelController.getHotelById);

export default router;