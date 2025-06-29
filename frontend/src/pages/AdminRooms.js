import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllRooms, createRoom, updateRoom, deleteRoom, getAllHotels } from '../services/api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, InputAdornment, Chip, Pagination } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const AdminRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchRooms();
      fetchHotels();
    }
  }, [user]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await getAllRooms();
      setRooms(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await getAllHotels();
      setHotels(res.data || []);
    } catch {}
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    const roomDataForForm = {
      ...room,
      hotelId: room.hotelId?._id || room.hotelId || '',
    };
    setFormData(roomDataForForm);
    setImagePreview(room.image || null);
    setOpenDialog(true);
  };

  const handleDelete = async (room) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
      try {
        await deleteRoom(room._id);
        toast.success('Đã xóa phòng');
        fetchRooms();
      } catch {
        toast.error('Lỗi xóa phòng');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedRoom(null);
    setFormData({});
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDialogSave = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      if (selectedRoom) {
        await updateRoom(selectedRoom._id, formDataToSend);
        toast.success('Cập nhật thành công');
      } else {
        await createRoom(formDataToSend);
        toast.success('Thêm phòng thành công');
      }
      fetchRooms();
      handleDialogClose();
    } catch {
      toast.error('Lỗi lưu phòng');
    }
  };

  const filteredRooms = rooms.filter(r => {
    const name = r.name || '';
    const type = r.type || '';
    const hotelName = hotels.find(h => h._id === r.hotelId)?.name || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      type.toLowerCase().includes(search.toLowerCase()) ||
      hotelName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginatedRooms = filteredRooms.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Quản lý phòng</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'stretch' }}>
        <TextField
          placeholder="Tìm kiếm theo tên phòng, loại phòng hoặc khách sạn..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          margin="none"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, height: '40px', minHeight: '40px', maxHeight: '40px', alignSelf: 'stretch' }}
        />
        <FormControl sx={{ minWidth: 180, height: '40px', minHeight: '40px', maxHeight: '40px', alignSelf: 'stretch', justifyContent: 'center' }} margin="none">
          <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Lọc theo trạng thái"
            onChange={e => setStatusFilter(e.target.value)}
            size="small"
            sx={{ height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', alignItems: 'center' }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="available">Còn phòng</MenuItem>
            <MenuItem value="occupied">Đã có người ở</MenuItem>
            <MenuItem value="maintenance">Đang bảo trì</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setOpenDialog(true)}>Thêm phòng</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên phòng</TableCell>
              <TableCell>Loại phòng</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Sức chứa</TableCell>
              <TableCell>Khách sạn</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
            ) : paginatedRooms.length === 0 ? (
              <TableRow><TableCell colSpan={8}>Không có phòng</TableCell></TableRow>
            ) : paginatedRooms.map((r) => (
              <TableRow key={r._id}>
                <TableCell>
                  {r.image ? (
                    <img src={r.image} alt={`Room ${r.name}`} style={{ width: 100, maxHeight: 80, objectFit: 'cover' }} />
                  ) : (
                    'Không có ảnh'
                  )}
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.price}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell>{r.hotelId?.name || ''}</TableCell>
                <TableCell>
                  {r.status === 'available' && (
                    <Chip label="Còn phòng" color="success" size="small" />
                  )}
                  {r.status === 'occupied' && (
                    <Chip label="Đã có người ở" color="warning" size="small" />
                  )}
                  {r.status === 'maintenance' && (
                    <Chip label="Đang bảo trì" color="error" size="small" />
                  )}
                  {!(r.status === 'available' || r.status === 'occupied' || r.status === 'maintenance') && r.status}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(r)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(r)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredRooms.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredRooms.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRoom ? 'Cập nhật phòng' : 'Thêm phòng'}</DialogTitle>
        <DialogContent>
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="room-image-input"
          />
          <label htmlFor="room-image-input">
            <Button variant="contained" component="span" fullWidth sx={{ mb: 2 }}>
              Tải ảnh phòng lên
            </Button>
          </label>
          {imagePreview && (
            <Box sx={{ mb: 2 }}>
              <img
                src={imagePreview}
                alt="Ảnh xem trước"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
              />
            </Box>
          )}
          <TextField label="Tên phòng" name="name" value={formData.name || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Loại phòng" name="type" value={formData.type || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Giá" name="price" value={formData.price || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Sức chứa" name="capacity" value={formData.capacity || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Khách sạn</InputLabel>
            <Select name="hotelId" value={formData.hotelId || ''} onChange={handleFormChange} label="Khách sạn">
              {hotels.map(h => <MenuItem key={h._id} value={h._id}>{h.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái</InputLabel>
            <Select name="status" value={formData.status || ''} onChange={handleFormChange} label="Trạng thái">
              <MenuItem value="available">Còn phòng</MenuItem>
              <MenuItem value="occupied">Đã có người ở</MenuItem>
              <MenuItem value="maintenance">Đang bảo trì</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button onClick={handleDialogSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRooms; 