import express from 'express';
import { roomController } from '../controllers/room-controller.js';
import { authenticate } from '../middlewares/auth-middleware.js';

const router = express.Router();

router.get('/', authenticate, roomController.getAllRooms);
router.post('/', authenticate, roomController.addRoom);
router.get('/available', roomController.getAvailableRooms);

export default router;