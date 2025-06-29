import { userService } from '../services/user-service.js';
import mongoose from 'mongoose';

export const userController = {
  /**
   * @description Get users for chat based on current user's role
   * @route GET /api/users/chat
   */
  getUsersForChat: async (req, res) => {
    try {
      console.log('req.user in getUsersForChat:', req.user);
      const currentUser = req.user;
      const users = await userService.getUsersForChat(currentUser);
      console.log('users for chat:', users);
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in getUsersForChat:', error);
      res.status(500).json({ message: error.message });
    }
  },

  /**
   * @description Update user profile (avatar, phone, address)
   * @route PUT /api/users/profile
   */
  updateProfile: async (req, res) => {
    try {
      console.log('req.user:', req.user);
      const userIdString = req.user.id || req.user._id;
      console.log('userId string:', userIdString);
      const userId = new mongoose.Types.ObjectId(userIdString);
      const { phone, address, avatarUrl } = req.body;
      const update = {};
      if (phone !== undefined) update.phone = phone;
      if (address !== undefined) update.address = address;
      if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
      console.log('Update payload:', update);
      const user = await userService.updateUserProfile(userId, update);
      if (!user) {
        console.log('Không tìm thấy user với _id:', userIdString);
        return res.status(404).json({ message: 'Không tìm thấy người dùng hoặc không thể cập nhật.' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};