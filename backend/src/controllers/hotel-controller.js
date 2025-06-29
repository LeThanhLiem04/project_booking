import { hotelRepository } from '../repositories/hotel-repository.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { hotelService } from '../services/hotel-service.js';

const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, { folder: 'hotel_booking/hotels' });
  fs.unlinkSync(filePath);
  return result.secure_url;
};

export const hotelController = {
  getAllHotels: async (req, res) => {
    try {
      const hotels = await hotelRepository.findAll();
      console.log('Fetched hotels:', hotels);
      res.json(hotels);
    } catch (error) {
      console.error('Error in getAllHotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels', error: error.message });
    }
  },

  addHotel: async (req, res) => {
    const { name, location, address, city, description, rating } = req.body;
    let image = null;
    try {
      if (req.file) {
        try {
          image = await uploadToCloudinary(req.file.path);
        } catch (cloudErr) {
          console.error('Cloudinary upload error:', cloudErr);
          throw new Error('Cloudinary upload failed: ' + cloudErr.message);
        }
      }
      const hotel = await hotelRepository.create({ name, location, address, city, description, rating, image });
      res.status(201).json(hotel);
    } catch (error) {
      console.error('Error in addHotel:', error);
      res.status(500).json({ message: 'Failed to add hotel', error: error.message, stack: error.stack });
    }
  },

  updateHotel: async (req, res) => {
    const { id } = req.params;
    const { name, location, address, city, description, rating } = req.body;
    let image;
    try {
      if (req.file) {
        try {
          image = await uploadToCloudinary(req.file.path);
        } catch (cloudErr) {
          console.error('Cloudinary upload error:', cloudErr);
          throw new Error('Cloudinary upload failed: ' + cloudErr.message);
        }
      }
      const updateData = { name, location, address, city, description, rating };
      if (image) updateData.image = image;
      const hotel = await hotelRepository.update(id, updateData);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      res.json(hotel);
    } catch (error) {
      console.error('Error in updateHotel:', error);
      res.status(500).json({ message: 'Failed to update hotel', error: error.message, stack: error.stack });
    }
  },

  deleteHotel: async (req, res) => {
    const { id } = req.params;
    try {
      const hotel = await hotelRepository.delete(id);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error('Error in deleteHotel:', error);
      res.status(500).json({ message: 'Failed to delete hotel', error: error.message });
    }
  },

  searchHotels: async (req, res) => {
    try {
      const hotels = await hotelService.searchHotels(req.query);
      res.json(hotels);
    } catch (error) {
      console.error('Error in searchHotels:', error);
      res.status(500).json({ message: 'Failed to search hotels', error: error.message });
    }
  },

  getHotelById: async (req, res) => {
    const { id } = req.params;
    try {
      const hotel = await hotelRepository.findById(id);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch hotel', error: error.message });
    }
  },
};