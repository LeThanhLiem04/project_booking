import { Review } from '../models/review.js';
import mongoose from 'mongoose';

export const reviewRepository = {
  create: async (data) => await Review.create(data),
  find: async (query) => await Review.find(query),
  findByHotelId: async (hotelId) => await Review.find({ hotelId: new mongoose.Types.ObjectId(hotelId) }).populate('userId'),
  findAll: async () => await Review.find().populate('userId', 'name avatarUrl').populate('hotelId'),
  update: async (id, data) => await Review.findByIdAndUpdate(id, data, { new: true }),
  delete: async (id) => await Review.findByIdAndDelete(id),
};