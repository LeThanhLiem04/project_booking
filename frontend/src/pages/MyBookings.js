import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { getBookings } from '../services/api';
import { 
  Box, Typography, Grid, Card, CardContent, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Pagination
} from '@mui/material';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 6;

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data } = await getBookings();
        setBookings(data || []);
        setPage(1);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Không thể tải các đơn đặt phòng');
        toast.error('Không thể tải các đơn đặt phòng');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.checkInDate);
    const bookingMonth = bookingDate.getMonth() + 1;

    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'completed' && (booking.status === 'completed' || booking.status === 'confirmed')) ||
                          (statusFilter === 'pending' && booking.status === 'pending');
    const matchesMonth = monthFilter === 'all' || bookingMonth === parseInt(monthFilter);

    return matchesStatus && matchesMonth;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography>Vui lòng đăng nhập để xem đơn đặt phòng của bạn.</Typography>
      </Box>
    );
  }

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

  const months = [
    { value: 'all', label: 'Tất cả các tháng' },
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Đơn đặt phòng của tôi
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Lọc theo trạng thái"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="completed">Đã hoàn thành</MenuItem>
            <MenuItem value="pending">Chưa hoàn thành</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="month-filter-label">Lọc theo tháng</InputLabel>
          <Select
            labelId="month-filter-label"
            value={monthFilter}
            label="Lọc theo tháng"
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            {months.map(month => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredBookings.length === 0 ? (
        <Typography>Không tìm thấy đơn đặt phòng nào phù hợp với bộ lọc.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedBookings.map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {booking.roomId?.hotelId?.name || 'Khách sạn'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phòng: {booking.roomId?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ngày nhận phòng: {new Date(booking.checkInDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ngày trả phòng: {new Date(booking.checkOutDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng tiền: {booking.totalPrice?.toLocaleString()} VNĐ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái: {booking.status}
                    </Typography>
                    {booking.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to={`/booking/${booking._id}`}
                        sx={{ mt: 2 }}
                      >
                        Xem chi tiết và thanh toán
                      </Button>
                    )}
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
    </Box>
  );
};

export default MyBookings;