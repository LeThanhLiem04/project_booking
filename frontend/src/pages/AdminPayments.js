import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Paper, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, TextField, Stack, Pagination, InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Search as SearchIcon } from '@mui/icons-material';

const ITEMS_PER_PAGE = 8;

const AdminPayments = () => {
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
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/payments');
        setPayments(response.data || []);
      } catch (err) {
        setError('Không thể tải danh sách thanh toán');
        toast.error('Không thể tải danh sách thanh toán');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const completedBookingIds = new Set(payments.filter(p => p.status === 'completed').map(p => p.bookingId?._id || p.bookingId));
  const filteredPayments = payments.filter(payment => {
    if (
      payment.status === 'pending' &&
      completedBookingIds.has(payment.bookingId?._id || payment.bookingId)
    ) {
      return false;
    }
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false;
    }
    const paymentDate = new Date(payment.createdAt);
    if (startDate && paymentDate < startDate) {
      return false;
    }
    if (endDate && paymentDate > endDate) {
      return false;
    }
    const hotelName = payment.bookingId?.roomId?.hotelId?.name?.toLowerCase() || '';
    if (hotelSearch && !hotelName.includes(hotelSearch.toLowerCase())) {
      return false;
    }
    const userEmail = payment.bookingId?.userId?.email?.toLowerCase() || '';
    const userName = payment.bookingId?.userId?.name?.toLowerCase() || '';
    if (userSearch && !userEmail.includes(userSearch.toLowerCase()) && !userName.includes(userSearch.toLowerCase())) {
      return false;
    }
    if (minPrice && payment.amount < Number(minPrice)) {
      return false;
    }
    if (maxPrice && payment.amount > Number(maxPrice)) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setPage(value);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, maxWidth: 1200, mx: 'auto' }}>
        <TextField
          sx={{ width: '100%' }}
          label="Tìm kiếm người dùng (email hoặc tên)"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Typography variant="h5" gutterBottom sx={{ p: 3, textAlign: 'center' }}>
        Quản lý Thanh toán
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
                      Người dùng: {payment.bookingId?.userId?.email || payment.bookingId?.userId?.name || 'Không xác định'}
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

export default AdminPayments; 