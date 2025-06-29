import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Box, Typography, Paper, Link, Container } from '@mui/material';
import { toast } from 'react-toastify';
import { Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Register form submitted:', form);
      const user = await register(form);
      console.log('Register successful, user:', user);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      console.error('Đăng ký thất bại:', error);
      toast.error(error.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexDirection: { xs: 'column', md: 'row' }, // Stack vertically on small screens, horizontally on medium and up
    }}>
      <video
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2,
        }}
      >
        <source src="https://www.shutterstock.com/shutterstock/videos/3438942789/preview/stock-footage-purple-neon-colored-illustration-video-with-a-lofi-art-anime-a-girl-sleeps-on-her-stomach-at-a.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        zIndex: -1,
      }} />

      {/* Left section for image */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' }, // Hide on small screens, show on medium and up
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '100vh',
        backgroundImage: 'url(https://ezihotel.vn/wp-content/uploads/2023/12/trang-web-dat-phong-khach-san-truc-tuyen.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Right section for form */}
      <Container maxWidth="sm" sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        p: 3,
      }}>
        <Paper elevation={3} sx={{
          p: 4,
          // Removed maxWidth and mx: 'auto' as parent Container handles centering and width
          bgcolor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background for the form
          width: '100%', // Ensure it takes full width of its container
          maxWidth: '400px', // Limit max width of the form itself
          borderRadius: 2, // Added borderRadius for consistent styling
        }}>
          <Typography variant="h5" gutterBottom align="center">
            Đăng ký
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Họ tên"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              disabled={isLoading}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              disabled={isLoading}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              disabled={isLoading}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <Link component={RouterLink} to="/login">
                  Đăng nhập
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;