import { Hotel } from '../models/hotel.js';

export const hotelRepository = {
  findAll: async (query = {}) => {
    return await Hotel.find(query).lean();
  },
  findById: async (id) => {
    return await Hotel.findById(id).lean();
  },
  create: async (data) => {
    const hotel = new Hotel(data);
    return await hotel.save();
  },
  update: async (id, data) => {
    return await Hotel.findByIdAndUpdate(id, data, { new: true }).lean();
  },
  delete: async (id) => {
    return await Hotel.findByIdAndDelete(id);
  },
};