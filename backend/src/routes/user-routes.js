import express from 'express';
import { userController } from '../controllers/user-controller.js';
import { authenticate } from '../middlewares/auth-middleware.js';

const router = express.Router();

// Route để lấy danh sách người dùng cho chat, tùy thuộc vào role
router.get('/chat', authenticate, userController.getUsersForChat);

// Route cập nhật thông tin cá nhân
router.put('/profile', authenticate, userController.updateProfile);

export default router;