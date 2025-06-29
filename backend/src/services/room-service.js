import { roomRepository } from '../repositories/room-repository.js';

export const roomService = {
  createRoom: async (data, user) => {
    if (user.role !== 'admin') throw new Error('Unauthorized');
    return await roomRepository.create(data);
  },
  getRooms: async () => await roomRepository.findAll(),
  updateRoom: async (id, data, user) => {
    if (user.role !== 'admin') throw new Error('Unauthorized');
    return await roomRepository.update(id, data);
  },
  deleteRoom: async (id, user) => {
    if (user.role !== 'admin') throw new Error('Unauthorized');
    return await roomRepository.delete(id);
  },
  getRoomsByHotel: async (hotelId) => await roomRepository.findByHotelId(hotelId), // Add this method
  getAvailableRooms: async (checkInDate, checkOutDate, hotelId = null) => {
    return await roomRepository.findAvailable(checkInDate, checkOutDate, hotelId);
  },
};