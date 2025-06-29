import { User } from '../models/user.js';

export const userRepository = {
  create: async (data) => await User.create(data),
  findByEmail: async (email) => await User.findOne({ email }),
  findById: async (id) => await User.findById(id),
  findAll: async () => await User.find(), // Added for admin
  update: async (id, data) => await User.findByIdAndUpdate(id, data, { new: true }), // Added for admin
  delete: async (id) => await User.findByIdAndDelete(id), // Added for admin
  findByRole: async (role) => await User.find({ role }),
  countDocuments: async () => await User.countDocuments(),
};