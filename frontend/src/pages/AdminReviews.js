import React, { useEffect, useState } from 'react';
import { getAllReviews, deleteReview, getAllHotels, getAllUsers } from '../services/api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchHotels();
    fetchUsers();

    // Tự động cập nhật mỗi 30 giây
    const interval = setInterval(() => {
      fetchReviews();
      fetchHotels();
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllReviews();
      setReviews(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải đánh giá');
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

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch {}
  };

  const handleDelete = async (review) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await deleteReview(review._id);
        toast.success('Đã xóa đánh giá');
        fetchReviews();
      } catch {
        toast.error('Lỗi xóa đánh giá');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Quản lý đánh giá</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Khách sạn</TableCell>
              <TableCell>Đánh giá</TableCell>
              <TableCell>Bình luận</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
            ) : reviews.length === 0 ? (
              <TableRow><TableCell colSpan={5}>Không có đánh giá</TableCell></TableRow>
            ) : reviews.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.userId?.name || ''}</TableCell>
                <TableCell>{r.hotelId?.name || ''}</TableCell>
                <TableCell>{r.rating}</TableCell>
                <TableCell>{r.comment}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(r)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminReviews; 