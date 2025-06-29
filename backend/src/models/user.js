import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  address: { type: String },
  avatarUrl: { type: String },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);