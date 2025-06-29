import { roomRepository } from '../repositories/room-repository.js';
import { roomService } from '../services/room-service.js'; // Add this import
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, { folder: 'hotel_booking/rooms' });
  fs.unlinkSync(filePath);
  return result.secure_url;
};

export const roomController = {
  getAllRooms: async (req, res) => {
    try {
      console.log('Fetching all rooms');
      const rooms = await roomRepository.findAll();
      console.log('Rooms fetched:', rooms);
      res.json(rooms);
    } catch (error) {
      console.error('Error in getAllRooms:', error);
      res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
    }
  },

  addRoom: async (req, res) => {
    const { name, type, price, capacity, status, hotelId } = req.body;
    let image = null;
    console.log('Room data nhận được:', req.body);
    console.log('File nhận được:', req.file);
    try {
      if (req.file) {
        image = await uploadToCloudinary(req.file.path);
      }
      const room = await roomRepository.create({ name, type, price, capacity, status, hotelId, image });
      res.status(201).json(room);
    } catch (error) {
      console.error('Error in addRoom:', error);
      res.status(500).json({ message: 'Failed to add room', error: error.message });
    }
  },

  updateRoom: async (req, res) => {
    const { id } = req.params;
    const { name, type, price, capacity, status, hotelId } = req.body;
    let image;
    console.log('Room data nhận được (update):', req.body);
    console.log('File nhận được (update):', req.file);
    try {
      if (req.file) {
        image = await uploadToCloudinary(req.file.path);
      }
      const updateData = { name, type, price, capacity, status, hotelId };
      if (image) updateData.image = image;
      const room = await roomRepository.update(id, updateData);
      if (!room) return res.status(404).json({ message: 'Room not found' });
      res.json(room);
    } catch (error) {
      console.error('Error in updateRoom:', error);
      res.status(500).json({ message: 'Failed to update room', error: error.message });
    }
  },

  deleteRoom: async (req, res) => {
    const { id } = req.params;
    try {
      const room = await roomRepository.delete(id);
      if (!room) return res.status(404).json({ message: 'Room not found' });
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Error in deleteRoom:', error);
      res.status(500).json({ message: 'Failed to delete room', error: error.message });
    }
  },

  getRoomsByHotel: async (req, res) => { // Add this method
    try {
      const { hotelId } = req.params;
      console.log(`Fetching rooms for hotelId: ${hotelId}`);
      const rooms = await roomService.getRoomsByHotel(hotelId);
      console.log('Rooms fetched for hotel:', rooms);
      res.json(rooms);
    } catch (error) {
      console.error('Error in getRoomsByHotel:', error);
      res.status(500).json({ message: 'Failed to fetch rooms for hotel', error: error.message });
    }
  },

  getAvailableRooms: async (req, res) => {
    try {
      const { checkInDate, checkOutDate, hotelId } = req.query;
      if (!checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Missing checkInDate or checkOutDate' });
      }
      const rooms = await roomService.getAvailableRooms(checkInDate, checkOutDate, hotelId);
      res.json(rooms);
    } catch (error) {
      console.error('Error in getAvailableRooms:', error);
      res.status(500).json({ message: 'Failed to fetch available rooms', error: error.message });
    }
  },
};