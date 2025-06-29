import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, Paper, Avatar, Button, TextField, IconButton, CircularProgress } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { updateUserProfile } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Thay bằng preset của bạn
const CLOUDINARY_CLOUD_NAME = 'dla5gvonz'; // Thay bằng cloud name của bạn

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatarUrl || null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  if (!user) {
    return <Typography variant="h6">Bạn chưa đăng nhập.</Typography>;
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          setAvatar(data.secure_url);
          toast.success('Tải ảnh lên thành công!');
        } else {
          toast.error('Tải ảnh lên thất bại!');
        }
      } catch (err) {
        toast.error('Lỗi khi tải ảnh lên Cloudinary!');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateUserProfile({ phone, address, avatarUrl: avatar });
      console.log('API update profile response:', res.data);
      const updatedUser = res.data.user || res.data;
      setUser(updatedUser);
      toast.success('Cập nhật thông tin thành công!');
      navigate('/profile');
    } catch (err) {
      toast.error('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 350, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Sửa thông tin cá nhân
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
          <Avatar src={avatar} sx={{ width: 80, height: 80, margin: '0 auto' }}>
            {!avatar && <AccountCircleIcon sx={{ fontSize: 80 }} />}
          </Avatar>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            sx={{ position: 'absolute', bottom: 0, right: 0 }}
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : <PhotoCamera />}
          </IconButton>
        </Box>
        <TextField
          label="Số điện thoại"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Địa chỉ"
          value={address}
          onChange={e => setAddress(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/profile')}>
            Trở về
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditProfile; 