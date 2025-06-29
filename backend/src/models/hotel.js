import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  image: { type: String }, // Ảnh đại diện
  images: [{ type: String }], // Nhiều ảnh
}, { timestamps: true });

export const Hotel = mongoose.model('Hotel', hotelSchema);