import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomsByHotel, getHotelById, createBooking } from '../services/api';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CircularProgress, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Pagination
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 6;

const HotelRooms = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [pageRoom, setPageRoom] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hotelRes, roomsRes] = await Promise.all([
          getHotelById(id),
          getRoomsByHotel(id)
        ]);
        setHotel(hotelRes.data);
        setRooms(roomsRes.data || []);
      } catch (err) {
        setError('Không thể tải khách sạn hoặc phòng.');
        toast.error('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    setPageRoom(1);
  }, [id]);

  const totalRoomPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = rooms.slice(
    (pageRoom - 1) * ITEMS_PER_PAGE,
    pageRoom * ITEMS_PER_PAGE
  );

  const handleBookNow = (room) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    setOpenBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Vui lòng chọn ngày nhận phòng và ngày trả phòng');
      return;
    }

    try {
      const bookingData = {
        roomId: selectedRoom._id,
        checkInDate,
        checkOutDate,
      };
      const { data: booking } = await createBooking(bookingData);
      setOpenBookingDialog(false);
      setCheckInDate('');
      setCheckOutDate('');
      navigate(`/booking/${booking._id}?success=1`);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(err.response?.data?.message || 'Không thể đặt phòng');
    }
  };

  const handleCloseDialog = () => {
    setOpenBookingDialog(false);
    setSelectedRoom(null);
    setCheckInDate('');
    setCheckOutDate('');
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3 }}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {hotel?.name || 'Khách sạn'} - Phòng
      </Typography>
      {rooms.length === 0 ? (
        <Typography>Không có phòng nào cho khách sạn này.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <Card>
                  {room.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={room.image?.startsWith('http') ? room.image : `http://localhost:3001${room.image}`}
                      alt={room.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{room.name}</Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                      Loại phòng: {room.type || 'Chưa cập nhật'}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                      Giá: {room.price.toLocaleString()} VNĐ / đêm
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                      Sức chứa: {room.capacity} người
                    </Typography>
                    <Typography 
                      sx={{ 
                        color: room.status === 'available' ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      Trạng thái: {
                        room.status === 'available' ? 'Còn phòng' :
                        room.status === 'unavailable' ? 'Đã hết phòng' :
                        room.status === 'maintenance' ? 'Đang bảo trì' :
                        'Chưa cập nhật'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleBookNow(room)}
                      disabled={room.status !== 'available'}
                    >
                      {room.status === 'available' ? 'Đặt phòng' :
                       room.status === 'unavailable' ? 'Đã hết phòng' :
                       room.status === 'maintenance' ? 'Đang bảo trì' :
                       'Không thể đặt'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalRoomPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalRoomPages}
                page={pageRoom}
                onChange={(e, value) => setPageRoom(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={openBookingDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt phòng</DialogTitle>
        <DialogContent>
          {selectedRoom && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>{selectedRoom.name}</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                Loại phòng: {selectedRoom.type || 'Chưa cập nhật'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                Giá: {selectedRoom.price.toLocaleString()} VNĐ / đêm
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                Sức chứa: {selectedRoom.capacity} người
              </Typography>
              <Typography 
                sx={{ 
                  color: selectedRoom.status === 'available' ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Trạng thái: {
                  selectedRoom.status === 'available' ? 'Còn phòng' :
                  selectedRoom.status === 'unavailable' ? 'Đã hết phòng' :
                  selectedRoom.status === 'maintenance' ? 'Đang bảo trì' :
                  'Chưa cập nhật'
                }
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <TextField
                  label="Ngày nhận phòng"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  label="Ngày trả phòng"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleBookingSubmit} variant="contained" color="primary">
            Xác nhận đặt phòng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelRooms; 