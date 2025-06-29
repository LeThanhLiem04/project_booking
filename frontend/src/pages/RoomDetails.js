import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomsByHotel, createBooking, getBookingById } from '../services/api'; // Add createBooking and getBookingById imports
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RoomDetails = () => {
  const { hotelId } = useParams(); // Get hotelId from the URL
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const navigate = useNavigate();
  const { triggerNotificationRefresh } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await getRoomsByHotel(hotelId);
        console.log('Fetched rooms for hotel:', response.data);
        setRooms(response.data || []);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        console.error('Error response:', err.response);
        setError('Không thể tải phòng. Vui lòng thử lại sau.');
        toast.error('Không thể tải phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [hotelId]);

  const handleBookNow = (room) => {
    setSelectedRoom(room);
    setOpenBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    try {
      const bookingData = {
        roomId: selectedRoom._id,
        checkInDate,
        checkOutDate,
      };
      const { data: booking } = await createBooking(bookingData);

      if (booking && booking._id) {
        // Fetch the created booking to get full details including paymentIntentId
        const { data: fetchedBooking } = await getBookingById(booking._id);
        toast.success('Đặt phòng thành công! Tiến hành thanh toán.');
        setOpenBookingDialog(false);
        setCheckInDate('');
        setCheckOutDate('');
        triggerNotificationRefresh(); // Cập nhật thông báo chuông
        navigate(`/booking/${fetchedBooking._id}`);
      } else {
        console.error('Đối tượng đặt phòng hoặc _id bị thiếu sau khi tạo.', booking);
        toast.error('Không thể lấy chi tiết đặt phòng để thanh toán. Vui lòng kiểm tra các đặt phòng của bạn.');
      }
    } catch (err) {
      console.error('Lỗi đặt phòng:', err);
      toast.error(err.response?.data?.message || 'Đặt phòng thất bại');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography>Đang tải chi tiết phòng...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Danh sách phòng
      </Typography>
      {rooms.length === 0 ? (
        <Typography>Không có phòng nào cho khách sạn này.</Typography>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room._id}>
              <Card>
                {room.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:3001${room.image}`}
                    alt={room.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{room.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Giá: {room.price.toLocaleString()} VNĐ / đêm
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sức chứa: {room.capacity} khách
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => handleBookNow(room)}
                  >
                    Đặt phòng
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)}>
        <DialogTitle>Đặt phòng: {selectedRoom?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Ngày nhận phòng"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Ngày trả phòng"
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookingDialog(false)}>Hủy</Button>
          <Button onClick={handleBookingSubmit} color="primary" variant="contained">Xác nhận đặt phòng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomDetails;