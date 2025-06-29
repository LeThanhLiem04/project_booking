import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  DialogContentText,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import {
  getAllUsers,
  getAllBookings,
  getStats,
  getAllReviews,
  deleteReview,
  getAllRooms,
  deleteRoom,
  getAllHotels,
  deleteHotel,
  updateUser,
  updateBooking,
  updateRoom,
  updateHotel,
  createHotel,
  createRoom,
  deleteUser,
  deleteBooking,
} from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const AdminPanel = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [confirmingBookingId, setConfirmingBookingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      // Thêm delay giữa các request để tránh rate limiting
      await fetchUsers();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchBookings();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchStats();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchReviews();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchRooms();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchHotels();
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Không thể tải người dùng: ${err.message}`);
      toast.error('Không thể tải người dùng');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await getAllBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(`Không thể tải đơn đặt phòng: ${err.message}`);
      toast.error('Không thể tải đơn đặt phòng');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await getStats();
      setStats(response.data || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(`Không thể tải số liệu thống kê: ${err.message}`);
      toast.error('Không thể tải số liệu thống kê');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await getAllReviews();
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(`Không thể tải đánh giá: ${err.message}`);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await getAllRooms();
      setRooms(response.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(`Không thể tải phòng: ${err.message}`);
      toast.error('Không thể tải phòng');
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchHotels = async () => {
    try {
      setLoadingHotels(true);
      const response = await getAllHotels();
      setHotels(response.data || []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(`Không thể tải khách sạn: ${err.message}`);
      toast.error('Không thể tải khách sạn');
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleOpenDeleteDialog = (type, item) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      if (dialogType === 'room') {
        if (!formData.name || !formData.type || !formData.price || !formData.capacity || !formData.hotelId) {
          toast.error('Vui lòng nhập đầy đủ Room Number, Type, Price, Capacity và chọn Hotel!');
          return;
        }
      }
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      switch (dialogType) {
        case 'user':
          await updateUser(formData._id, { role: formData.role });
          setUsers(users.map(u => u._id === formData._id ? { ...u, role: formData.role } : u));
          toast.success('Thao tác thành công');
          handleCloseDialog();
          return;
        case 'booking':
          await updateBooking(selectedItem._id, formData);
          await fetchBookings();
          break;
        case 'room':
          if (selectedItem) {
            await updateRoom(selectedItem._id, formDataToSend);
          } else {
            await createRoom(formDataToSend);
          }
          await fetchRooms();
          break;
        case 'hotel':
          if (selectedItem) {
            await updateHotel(selectedItem._id, formDataToSend);
          } else {
            await createHotel(formDataToSend);
          }
          await fetchHotels();
          break;
        default:
          break;
      }
      toast.success('Thao tác thành công');
      handleCloseDialog();
    } catch (err) {
      console.error('Lỗi khi gửi biểu mẫu:', err);
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      switch (dialogType) {
        case 'review':
          await deleteReview(selectedItem._id);
          setReviews(reviews.filter((r) => r._id !== selectedItem._id));
          break;
        case 'room':
          await deleteRoom(selectedItem._id);
          setRooms(rooms.filter((r) => r._id !== selectedItem._id));
          break;
        case 'hotel':
          await deleteHotel(selectedItem._id);
          setHotels(hotels.filter((h) => h._id !== selectedItem._id));
          break;
        case 'user':
          await deleteUser(selectedItem._id);
          setUsers(users.filter((u) => u._id !== selectedItem._id));
          break;
        case 'booking':
          await deleteBooking(selectedItem._id);
          setBookings(bookings.filter((b) => b._id !== selectedItem._id));
          break;
        default:
          break;
      }
      toast.success('Đã xóa mục thành công');
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Lỗi khi xóa mục:', err);
      console.error('Error deleting item:', err);
      toast.error('Failed to delete item');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      setConfirmingBookingId(bookingId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Yêu cầu xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      // Tìm thông tin booking hiện tại
      const currentBooking = bookings.find(b => b._id === bookingId);
      if (!currentBooking) {
        toast.error('Không tìm thấy đơn đặt phòng');
        return;
      }

      // Log thông tin booking để debug
      console.log('Chi tiết đơn đặt phòng hiện tại:', {
        id: currentBooking._id,
        roomName: currentBooking.roomId?.name,
        hotelName: currentBooking.roomId?.hotelId?.name,
        checkInDate: currentBooking.checkInDate,
        checkOutDate: currentBooking.checkOutDate,
        totalPrice: currentBooking.totalPrice
      });

      // Chuẩn bị dữ liệu gửi đi
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

      console.log('Sending confirmation request with data:', bookingData);

      // Thêm retry logic
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
          break; // Nếu thành công, thoát khỏi vòng lặp
        } catch (error) {
          if (error.response?.status === 429 && retries > 1) {
            // Nếu bị rate limit và còn retry, đợi 2 giây rồi thử lại
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries--;
            continue;
          }
          throw error; // Nếu lỗi khác hoặc hết retry, throw error
        }
      }

      if (response?.data) {
        // Update local state immediately
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'confirmed' }
              : booking
          )
        );
        
        // Hiển thị thông báo thành công và làm mới dữ liệu
        toast.success(
          <div>
            <p>Xác nhận đặt phòng thành công!</p>
            <p>Một email xác nhận đã được gửi đến {currentBooking.userId?.email || 'người dùng'}.</p>
          </div>
        );
        setConfirmingBookingId(null);
        fetchBookings(); // Cập nhật lại danh sách booking sau khi xác nhận
      } else {
        console.error('Booking confirmation failed for unexpected reason.', response);
        toast.error('Xác nhận đặt phòng thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận đặt phòng:', error);
      toast.error('Xác nhận đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setConfirmingBookingId(null);
    }
  };

  const renderForm = () => {
    switch (dialogType) {
      case 'user':
        return (
          <>
            <TextField
              name="username"
              label="Username"
              value={formData.username || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="email"
              label="Email"
              value={formData.email || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role || ''}
                onChange={handleFormChange}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 'booking':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || ''}
                onChange={handleFormChange}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="checkInDate"
              label="Check In Date"
              type="date"
              value={formData.checkInDate || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="checkOutDate"
              label="Check Out Date"
              type="date"
              value={formData.checkOutDate || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Room</InputLabel>
              <Select
                name="roomId"
                value={formData.roomId || ''}
                onChange={handleFormChange}
                label="Room"
              >
                {rooms.map((room) => (
                  <MenuItem key={room._id} value={room._id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>User</InputLabel>
              <Select
                name="userId"
                value={formData.userId || ''}
                onChange={handleFormChange}
                label="User"
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      case 'room':
        return (
          <>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="room-image-input"
            />
            <label htmlFor="room-image-input">
              <Button variant="contained" component="span" fullWidth sx={{ mb: 2 }}>
                Upload Room Image
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={imagePreview}
                  alt="Room preview"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                />
              </Box>
            )}
            <TextField
              name="name"
              label="Room Number"
              value={formData.name || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="type"
              label="Room Type"
              value={formData.type || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="price"
              label="Price"
              type="number"
              value={formData.price || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="capacity"
              label="Capacity"
              type="number"
              value={formData.capacity || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Hotel</InputLabel>
              <Select
                name="hotelId"
                value={formData.hotelId || ''}
                onChange={handleFormChange}
                label="Hotel"
              >
                {hotels.map((hotel) => (
                  <MenuItem key={hotel._id} value={hotel._id}>
                    {hotel.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || ''}
                onChange={handleFormChange}
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 'hotel':
        return (
          <>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="hotel-image-input"
            />
            <label htmlFor="hotel-image-input">
              <Button variant="contained" component="span" fullWidth sx={{ mb: 2 }}>
                Upload Hotel Image
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={imagePreview}
                  alt="Hotel preview"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                />
              </Box>
            )}
            <TextField
              name="name"
              label="Hotel Name"
              value={formData.name || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="city"
              label="City"
              value={formData.city || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              name="rating"
              label="Rating"
              type="number"
              value={formData.rating || ''}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 5, step: 0.1 }}
            />
          </>
        );
      default:
        return null;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
        <Typography>You do not have permission to access this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Users" />
        <Tab label="Bookings" />
        <Tab label="Stats" />
        <Tab label="Reviews" />
        <Tab label="Rooms" />
        <Tab label="Hotels" />
      </Tabs>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>Không tìm thấy người dùng nào.</TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog('user', u)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteDialog('user', u)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingBookings ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>Không tìm thấy đơn đặt phòng nào.</TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.userId?.email}</TableCell>
                    <TableCell>{booking.roomId?.name}</TableCell>
                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status.toUpperCase()} 
                        color={
                          booking.status === 'confirmed' ? 'success' :
                          booking.status === 'cancelled' ? 'error' :
                          'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog('booking', booking)}
                        size="small"
                        disabled={confirmingBookingId === booking._id}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog('booking', booking)}
                        size="small"
                        disabled={confirmingBookingId === booking._id}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {booking.status === 'pending' && (
                        <IconButton
                          color="success"
                          onClick={() => handleConfirmBooking(booking._id)}
                          size="small"
                          disabled={confirmingBookingId === booking._id}
                        >
                          {confirmingBookingId === booking._id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <CheckCircleIcon />
                          )}
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 2 && (
        <Box>
          {loadingStats ? (
            <CircularProgress />
          ) : stats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6">Total Bookings</Typography>
                  <Typography variant="h4">{stats.totalBookings}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6">Total Revenue</Typography>
                  <Typography variant="h4">${stats.totalRevenue}</Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography>No stats available.</Typography>
          )}
        </Box>
      )}

      {tabValue === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingReviews ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>Không tìm thấy đánh giá nào.</TableCell>
                </TableRow>
              ) : (
                reviews.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>{r.userId?.username || 'N/A'}</TableCell>
                    <TableCell>{r.hotelId?.name || 'N/A'}</TableCell>
                    <TableCell>{r.rating}</TableCell>
                    <TableCell>{r.comment}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog('review', r)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 4 && (
        <TableContainer component={Paper}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('room')}
            >
              Add Room
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Room Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingRooms ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>Không tìm thấy phòng nào.</TableCell>
                </TableRow>
              ) : (
                rooms.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={`Room ${r.name}`}
                          style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                        />
                      ) : (
                        'No image available'
                      )}
                    </TableCell>
                    <TableCell>{r.hotelId?.name || 'N/A'}</TableCell>
                    <TableCell>{r.name || 'N/A'}</TableCell>
                    <TableCell>{r.type || 'N/A'}</TableCell>
                    <TableCell>${r.price || 'N/A'}</TableCell>
                    <TableCell>{r.capacity || 'N/A'}</TableCell>
                    <TableCell>{r.status || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog('room', r)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 5 && (
        <TableContainer component={Paper}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('hotel')}
            >
              Add Hotel
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Hotel Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingHotels ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : hotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>Không tìm thấy khách sạn nào.</TableCell>
                </TableRow>
              ) : (
                hotels.map((h) => (
                  <TableRow key={h._id}>
                    <TableCell>
                      {h.image ? (
                        <img
                          src={h.image}
                          alt={`Hotel ${h.name}`}
                          style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                        />
                      ) : (
                        'No image available'
                      )}
                    </TableCell>
                    <TableCell>{h.name || 'N/A'}</TableCell>
                    <TableCell>{h.description || 'N/A'}</TableCell>
                    <TableCell>{h.address || 'N/A'}</TableCell>
                    <TableCell>{h.city || 'N/A'}</TableCell>
                    <TableCell>{h.rating || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog('hotel', h)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogType === 'user' ? 'Add User' : dialogType === 'booking' ? 'Edit Booking' : dialogType === 'room' ? 'Edit Room' : dialogType === 'hotel' ? 'Edit Hotel' : ''}</DialogTitle>
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;