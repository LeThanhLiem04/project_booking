import React, { useEffect, useState } from 'react';
import { getAllBookings, updateBooking, deleteBooking, getAllRooms, getAllUsers } from '../services/api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip, InputAdornment, Pagination } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmingBookingId, setConfirmingBookingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchUsers();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      setBookings(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await getAllRooms();
      setRooms(res.data || []);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch {}
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    const roomDetails = rooms.find(r => r._id === (booking.roomId?._id || booking.roomId));
    const userDetails = users.find(u => u._id === (booking.userId?._id || booking.userId));

    const bookingDataForForm = {
      ...booking,
      roomId: roomDetails || booking.roomId,
      userId: userDetails || booking.userId,
      checkInDate: booking.checkInDate ? new Date(booking.checkInDate).toISOString().split('T')[0] : '',
      checkOutDate: booking.checkOutDate ? new Date(booking.checkOutDate).toISOString().split('T')[0] : '',
    };
    setFormData(bookingDataForForm);
    setOpenDialog(true);
  };

  const handleDelete = async (booking) => {
    if (window.confirm('Bạn có chắc muốn xóa đặt phòng này?')) {
      try {
        await deleteBooking(booking._id);
        toast.success('Đã xóa đặt phòng');
        fetchBookings();
      } catch {
        toast.error('Lỗi xóa đặt phòng');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDialogSave = async () => {
    try {
      await updateBooking(selectedBooking._id, formData);
      toast.success('Cập nhật thành công');
      fetchBookings();
      handleDialogClose();
    } catch {
      toast.error('Lỗi cập nhật');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      setConfirmingBookingId(bookingId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      const currentBooking = bookings.find(b => b._id === bookingId);
      if (!currentBooking) {
        toast.error('Booking not found');
        return;
      }
      const bookingData = {
        bookingId: currentBooking._id,
        bookingDetails: {
          roomName: currentBooking.roomId?.name,
          hotelName: currentBooking.roomId?.hotelId?.name,
          checkInDate: new Date(currentBooking.checkInDate).toLocaleDateString(),
          checkOutDate: new Date(currentBooking.checkOutDate).toLocaleDateString(),
          totalPrice: currentBooking.totalPrice,
          userName: currentBooking.userId?.username || currentBooking.userId?.email
        }
      };
      let retries = 3;
      let response;
      while (retries > 0) {
        try {
          response = await axios.put(
            `http://localhost:3001/api/bookings/${bookingId}/confirm`,
            bookingData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          break;
        } catch (error) {
          if (error.response?.status === 429 && retries > 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries--;
            continue;
          }
          throw error;
        }
      }
      if (response?.data) {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'confirmed' }
              : booking
          )
        );
        toast.success('Booking confirmed successfully!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchBookings();
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (error) {
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setConfirmingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    let user = '';
    if (b.userId && typeof b.userId === 'object') {
      user = b.userId.email || b.userId.name || b.userId.username || '';
    } else {
      const u = users.find(u => u._id === b.userId);
      user = u?.email || u?.name || '';
    }
    let room = '';
    if (b.roomId && typeof b.roomId === 'object') {
      room = b.roomId.name || '';
    } else {
      const r = rooms.find(r => r._id === b.roomId);
      room = r?.name || '';
    }
    const matchSearch = (
      user.toLowerCase().includes(search.toLowerCase()) ||
      room.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedBookings = filteredBookings.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Handle Download Excel
  const handleDownloadExcel = () => {
    const dataToExport = filteredBookings.map(booking => ({
      User: booking.userId?.email || booking.userId?.name || booking.userId?.username || 'Không rõ',
      Room: booking.roomId?.name || 'Không rõ',
      'Check In': booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : '',
      'Check Out': booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : '',
      Status: booking.status,
      'Total Price': booking.totalPrice,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachDatPhong");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'danh_sach_dat_phong_' + Date.now() + '.xlsx');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Quản lý đặt phòng</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Tìm kiếm theo user hoặc phòng..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 180, ml: 2 }}>
          <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Lọc theo trạng thái"
            onChange={e => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="pending">Đang chờ</MenuItem>
            <MenuItem value="confirmed">Đã xác nhận</MenuItem>
            <MenuItem value="cancelled">Đã hủy</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="success" onClick={handleDownloadExcel} sx={{ ml: 2, height: 56 }}>
          Tải xuống Excel
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Phòng</TableCell>
              <TableCell>Ngày nhận phòng</TableCell>
              <TableCell>Ngày trả phòng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow><TableCell colSpan={8}>Không có đặt phòng</TableCell></TableRow>
            ) : paginatedBookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{booking.userId?.email || booking.userId?.name || booking.userId?.username || 'N/A'}</TableCell>
                <TableCell>{booking.roomId?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={
                      booking.status === 'confirmed' ? 'Đã xác nhận' :
                      booking.status === 'cancelled' ? 'Đã hủy' :
                      booking.status === 'pending' ? 'Đang chờ' :
                      booking.status
                    }
                    color={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{booking.totalPrice?.toLocaleString()} VNĐ</TableCell>
                <TableCell>{new Date(booking.createdAt).toLocaleDateString()} {new Date(booking.createdAt).toLocaleTimeString()}</TableCell>
                <TableCell align="right">
                  {booking.status === 'pending' && (
                    <IconButton
                      color="success"
                      onClick={() => handleConfirmBooking(booking._id)}
                      disabled={confirmingBookingId === booking._id}
                      size="small"
                    >
                      {confirmingBookingId === booking._id ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    </IconButton>
                  )}
                  <IconButton color="primary" onClick={() => handleEdit(booking)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(booking)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredBookings.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredBookings.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật đặt phòng</DialogTitle>
        <DialogContent>
          {formData.roomId && (
            <Typography variant="subtitle1" gutterBottom>
              Phòng: {formData.roomId.name || 'Không rõ tên phòng'}
            </Typography>
          )}
          {formData.userId && (
            <Typography variant="subtitle1" gutterBottom>
              Người dùng: {formData.userId.email || formData.userId.name || formData.userId.username || 'Không rõ người dùng'}
            </Typography>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select name="status" value={formData.status || ''} onChange={handleFormChange} label="Trạng thái">
              <MenuItem value="pending">Đang chờ</MenuItem>
              <MenuItem value="confirmed">Đã xác nhận</MenuItem>
              <MenuItem value="cancelled">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Ngày nhận phòng"
            name="checkInDate"
            type="date"
            value={formData.checkInDate || ''}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Ngày trả phòng"
            name="checkOutDate"
            type="date"
            value={formData.checkOutDate || ''}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Tổng giá"
            name="totalPrice"
            value={formData.totalPrice || ''}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button onClick={handleDialogSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookings; 