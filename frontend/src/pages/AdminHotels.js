import React, { useEffect, useState } from 'react';
import { getAllHotels, createHotel, updateHotel, deleteHotel } from '../services/api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Pagination } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await getAllHotels();
      setHotels(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách khách sạn');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotel) => {
    setSelectedHotel(hotel);
    setFormData(hotel);
    setImagePreview(hotel.image || null);
    setOpenDialog(true);
  };

  const handleDelete = async (hotel) => {
    if (window.confirm('Bạn có chắc muốn xóa khách sạn này?')) {
      try {
        await deleteHotel(hotel._id);
        toast.success('Đã xóa khách sạn');
        fetchHotels();
      } catch {
        toast.error('Lỗi xóa khách sạn');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedHotel(null);
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
      if (selectedHotel) {
        await updateHotel(selectedHotel._id, formDataToSend);
        toast.success('Cập nhật thành công');
      } else {
        await createHotel(formDataToSend);
        toast.success('Thêm khách sạn thành công');
      }
      fetchHotels();
      handleDialogClose();
    } catch {
      toast.error('Lỗi lưu khách sạn');
    }
  };

  const filteredHotels = hotels.filter(h => {
    const name = h.name || '';
    const city = h.city || '';
    const address = h.address || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginatedHotels = filteredHotels.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Quản lý khách sạn</Typography>
      <TextField
        placeholder="Tìm kiếm theo tên, thành phố hoặc địa chỉ..."
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
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setOpenDialog(true)}>Thêm khách sạn</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên khách sạn</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Thành phố</TableCell>
              <TableCell>Đánh giá</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
            ) : paginatedHotels.length === 0 ? (
              <TableRow><TableCell colSpan={7}>Không có khách sạn</TableCell></TableRow>
            ) : paginatedHotels.map((h) => (
              <TableRow key={h._id}>
                <TableCell>
                  {h.image ? (
                    <img src={h.image} alt={`Hotel ${h.name}`} style={{ width: 100, maxHeight: 80, objectFit: 'cover' }} />
                  ) : (
                    'Không có ảnh'
                  )}
                </TableCell>
                <TableCell>{h.name}</TableCell>
                <TableCell>{h.description}</TableCell>
                <TableCell>{h.address}</TableCell>
                <TableCell>{h.city}</TableCell>
                <TableCell>{h.rating}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(h)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(h)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredHotels.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredHotels.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedHotel ? 'Cập nhật khách sạn' : 'Thêm khách sạn'}</DialogTitle>
        <DialogContent>
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="hotel-image-input"
          />
          <label htmlFor="hotel-image-input">
            <Button variant="contained" component="span" fullWidth sx={{ mb: 2 }}>
              Tải ảnh khách sạn lên
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
          <TextField label="Tên khách sạn" name="name" value={formData.name || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Mô tả" name="description" value={formData.description || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Địa chỉ" name="address" value={formData.address || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Thành phố" name="city" value={formData.city || ''} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Đánh giá" name="rating" value={formData.rating || ''} onChange={handleFormChange} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button onClick={handleDialogSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminHotels; 