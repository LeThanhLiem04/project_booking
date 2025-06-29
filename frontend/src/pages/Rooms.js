import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRooms, getRoomsByHotel, createBooking, getAvailableRooms } from '../services/api';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Pagination } from '@mui/material';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 6; // Số item hiển thị trên mỗi trang

const Rooms = () => {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [form, setForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
  });
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // Thêm state cho trang hiện tại

  const handleFilterChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let filteredRooms = [];
      if (form.checkIn && form.checkOut) {
        // Use new API to get available rooms
        const response = await getAvailableRooms(form.checkIn, form.checkOut, hotelId);
        filteredRooms = response.data || [];
      } else {
        let response;
        if (hotelId) {
          response = await getRoomsByHotel(hotelId);
        } else {
          response = await getRooms();
        }
        filteredRooms = response.data || [];
      }

      console.log('Rooms before filtering:', filteredRooms);

      // Cải thiện logic lọc theo vị trí
      if (form.location) {
        const searchTerms = form.location.toLowerCase().trim().split(' ');
        console.log('Search terms:', searchTerms);

        filteredRooms = filteredRooms.filter(room => {
          // Lấy thông tin khách sạn
          const hotel = room.hotelId || {};
          
          // Tạo chuỗi tìm kiếm từ tất cả các trường
          const searchableText = [
            hotel.name,
            hotel.address,
            room.name,
            room.type,
            hotel.city,
            hotel.district
          ]
            .filter(Boolean) // Loại bỏ các giá trị null/undefined
            .join(' ')
            .toLowerCase();

          console.log('Searchable text:', searchableText);

          // Kiểm tra xem tất cả các từ khóa có xuất hiện trong chuỗi tìm kiếm không
          const isMatch = searchTerms.every(term => searchableText.includes(term));
          
          console.log('Is match:', isMatch);
          return isMatch;
        });
      }

      console.log('Filtered rooms:', filteredRooms);
      setRooms(filteredRooms);
      setPage(1); // Reset trang về 1 khi lọc/tìm kiếm
    } catch (err) {
      console.error('Filter error:', err);
      setError('Không thể lọc phòng. Vui lòng thử lại sau.');
      toast.error('Không thể lọc phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        let response;
        if (hotelId) {
          response = await getRoomsByHotel(hotelId);
        } else {
          response = await getRooms();
        }
        console.log('Fetched rooms:', response.data);
        setRooms(response.data || []);
        setPage(1); // Reset trang về 1 khi dữ liệu thay đổi
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
      toast.success('Đặt phòng thành công! Tiến hành thanh toán.');
      setOpenBookingDialog(false);
      setCheckInDate('');
      setCheckOutDate('');
      navigate(`/booking/${booking._id}`);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(err.response?.data?.message || 'Đặt phòng thất bại');
    }
  };

  // Logic phân trang
  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = rooms.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang khi chuyển trang
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
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
      {/* Filter Section */}
      <Paper elevation={4} sx={{ mb: 4, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Tìm kiếm & Lọc phòng
        </Typography>
        <Box component="form" onSubmit={handleFilterSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <TextField
                label="Tìm kiếm theo tên khách sạn, địa chỉ hoặc loại phòng"
                name="location"
                value={form.location}
                onChange={handleFilterChange}
                fullWidth
                placeholder="Ví dụ: Hà Nội, Deluxe, Grand Hotel..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Ngày nhận phòng"
                name="checkIn"
                type="date"
                value={form.checkIn}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Ngày trả phòng"
                name="checkOut"
                type="date"
                value={form.checkOut}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button type="submit" variant="contained" color="success" fullWidth sx={{ height: '100%' }}>
                Tìm kiếm
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Typography variant="h4" gutterBottom>
        {hotelId ? 'Phòng trong khách sạn' : 'Tất cả phòng'}
      </Typography>
      {rooms.length === 0 ? (
        <Typography>Không có phòng nào.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedRooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room._id}>
                <Card>
                  {room.image && (
                    <CardMedia
                      component="img"
                      height="200"
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleBookNow(room)}
                        disabled={room.status !== 'available'}
                      >
                        Đặt ngay
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}

      {/* Dialog đặt phòng */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt phòng {selectedRoom?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Ngày nhận phòng"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
          <TextField
            label="Ngày trả phòng"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
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

export default Rooms;