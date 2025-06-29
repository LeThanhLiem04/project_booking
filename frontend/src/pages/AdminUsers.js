import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../services/api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, InputAdornment, Avatar, Chip, Pagination } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setOpenDialog(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await deleteUser(user._id);
        toast.success('Đã xóa người dùng');
        fetchUsers();
      } catch {
        toast.error('Lỗi xóa người dùng');
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDialogSave = async () => {
    try {
      await updateUser(selectedUser._id, formData);
      toast.success('Cập nhật thành công');
      fetchUsers();
      handleDialogClose();
    } catch {
      toast.error('Lỗi cập nhật');
    }
  };

  // Lọc user theo search
  const filteredUsers = users.filter(u => {
    const username = u.username || u.name || '';
    const matchSearch =
      username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Handle Download Excel
  const handleDownloadExcel = () => {
    const dataToExport = filteredUsers.map(user => ({
      Username: user.username || user.name || '',
      Email: user.email,
      Role: user.role,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachNguoiDung");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'danh_sach_nguoi_dung_' + Date.now() + '.xlsx');
  };

  // Reset page về 1 khi filter thay đổi
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Quản lý người dùng</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'stretch' }}>
        <TextField
          placeholder="Tìm kiếm theo username hoặc email..."
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
          <InputLabel id="role-filter-label">Lọc theo vai trò</InputLabel>
          <Select
            labelId="role-filter-label"
            value={roleFilter}
            label="Lọc theo vai trò"
            onChange={e => setRoleFilter(e.target.value)}
            size="small"
            sx={{ height: '40px', minHeight: '40px', maxHeight: '40px', display: 'flex', alignItems: 'center' }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="admin">Quản trị viên</MenuItem>
            <MenuItem value="user">Người dùng</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="success" onClick={handleDownloadExcel} sx={{ height: 40 }}>
          Tải xuống Excel
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên người dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow><TableCell colSpan={7}>Không có người dùng</TableCell></TableRow>
            ) : paginatedUsers.map((u) => (
              <TableRow key={u._id}>
                <TableCell>
                  {u.avatarUrl ? (
                    <Avatar src={u.avatarUrl} alt={u.username || u.name || ''} />
                  ) : (
                    <Avatar>{(u.username || u.name || 'U').charAt(0).toUpperCase()}</Avatar>
                  )}
                </TableCell>
                <TableCell>{u.username || u.name || ''}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.role === 'admin' ? (
                    <Chip label="Quản trị viên" color="warning" size="small" />
                  ) : u.role === 'user' ? (
                    (u.address && u.phone) ?
                      <Chip label="Người dùng" color="success" size="small" /> :
                      <Chip label="Người dùng" color="default" size="small" />
                  ) : (
                    u.role
                  )}
                </TableCell>
                <TableCell>{u.phone || 'Chưa cập nhật'}</TableCell>
                <TableCell>
                  {u.address ? (
                    u.address
                  ) : (
                    <Chip label="Chưa cập nhật" color="default" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(u)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredUsers.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / rowsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Cập nhật người dùng</DialogTitle>
        <DialogContent>
          {/* Bỏ phần sửa role */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button onClick={handleDialogSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 