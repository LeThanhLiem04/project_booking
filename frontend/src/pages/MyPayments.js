import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box, Typography, CircularProgress, Paper, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, TextField, Stack,
  Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { useLocation } from 'react-router-dom';

const ITEMS_PER_PAGE = 6; // Số item hiển thị trên mỗi trang

const MyPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hotelSearch, setHotelSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const location = useLocation();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get('/payments/my-payments');
        setPayments(response.data || []);
        console.log('Fetched payments for MyPayments:', response.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Không thể tải lịch sử thanh toán');
        toast.error('Không thể tải lịch sử thanh toán');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  // Lọc payments: nếu có đơn completed cho cùng bookingId thì ẩn đơn pending của bookingId đó
  const completedBookingIds = new Set(payments.filter(p => p.status === 'completed').map(p => p.bookingId?._id || p.bookingId));
  const filteredPayments = payments.filter(payment => {
    const queryParams = new URLSearchParams(location.search);
    const paymentIdFromUrl = queryParams.get('id');

    if (paymentIdFromUrl && payment._id !== paymentIdFromUrl) {
      return false;
    }

    // Ẩn đơn pending nếu đã có completed cùng bookingId
    if (
      payment.status === 'pending' &&
      completedBookingIds.has(payment.bookingId?._id || payment.bookingId)
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false;
    }

    // Date range filter
    const paymentDate = new Date(payment.createdAt);
    if (startDate && paymentDate < startDate) {
      return false;
    }
    if (endDate && paymentDate > endDate) {
      return false;
    }

    // Hotel search filter
    const hotelName = payment.bookingId?.roomId?.hotelId?.name?.toLowerCase() || '';
    if (hotelSearch && !hotelName.includes(hotelSearch.toLowerCase())) {
      return false;
    }

    // Price range filter
    if (minPrice && payment.amount < Number(minPrice)) {
      return false;
    }
    if (maxPrice && payment.amount > Number(maxPrice)) {
      return false;
    }

    return true;
  });

  // Tính toán số trang
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  
  // Lấy danh sách thanh toán cho trang hiện tại
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography>Vui lòng đăng nhập để xem lịch sử thanh toán của bạn.</Typography>
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

  return (
    <Box sx={{
      maxWidth: 1200,
      mx: 'auto',
    }}>
      <Typography variant="h5" gutterBottom sx={{ p: 3 }}>
        Lịch sử Thanh toán của tôi
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="payment-status-filter-label">Lọc theo trạng thái</InputLabel>
                <Select
                  labelId="payment-status-filter-label"
                  value={statusFilter}
                  label="Lọc theo trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="pending">Đang chờ</MenuItem>
                  <MenuItem value="completed">Đã hoàn thành</MenuItem>
                  <MenuItem value="failed">Thất bại</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Từ ngày"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Đến ngày"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tìm kiếm khách sạn"
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá tối thiểu (VNĐ)"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá tối đa (VNĐ)"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {filteredPayments.length === 0 ? (
        <Typography sx={{ p: 3 }}>Không tìm thấy giao dịch thanh toán nào phù hợp với bộ lọc.</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {paginatedPayments.map((payment) => (
              <Grid item xs={12} sm={6} md={4} key={payment._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {payment.bookingId?.roomId?.hotelId?.name || 'Khách sạn không xác định'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phòng: {payment.bookingId?.roomId?.name || 'Phòng không xác định'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số tiền: {payment.amount?.toLocaleString()} VNĐ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phương thức: {payment.paymentMethod}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái: {payment.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ngày thanh toán: {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Phân trang */}
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

export default MyPayments; 