import express from 'express';
import { 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  getAllBookings, 
  confirmBooking 
} from '../controllers/admin-controller.js';
import { getStats } from '../controllers/statistics-controller.js';
import { roomController } from '../controllers/room-controller.js';
import { hotelController } from '../controllers/hotel-controller.js'; // Import hotelController
import { authenticate } from '../middlewares/auth-middleware.js';
import multer from 'multer'; // Import multer
import path from 'path';
import { getAllPaymentsAdmin } from '../controllers/payment-controller.js';

const router = express.Router();

// Add a logging middleware for this router
router.use((req, res, next) => {
    console.log(`Request entering admin-routes: ${req.method} ${req.originalUrl}`);
    next();
});

// Multer setup for file uploads within this router
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads')); // Use process.cwd() for base path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Existing routes
router.get('/users', authenticate, getAllUsers);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, deleteUser);
router.get('/bookings', authenticate, getAllBookings);
router.put('/bookings/:id/confirm', authenticate, confirmBooking);

// Add logging middleware before getStats
router.get('/stats', authenticate, (req, res, next) => {
    console.log('Request reached /stats route handlers.');
    next();
}, getStats);

// Room management routes
router.get('/rooms', authenticate, roomController.getAllRooms);
router.post('/rooms', authenticate, upload.single('image'), roomController.addRoom);
router.put('/rooms/:id', authenticate, upload.single('image'), roomController.updateRoom);
router.delete('/rooms/:id', authenticate, roomController.deleteRoom);

// Hotel management routes
router.get('/hotels', authenticate, hotelController.getAllHotels);
router.post('/hotels', authenticate, upload.single('image'), hotelController.addHotel);
router.put('/hotels/:id', authenticate, upload.single('image'), hotelController.updateHotel);
router.delete('/hotels/:id', authenticate, hotelController.deleteHotel);

router.get('/payments', authenticate, getAllPaymentsAdmin);

export default router;