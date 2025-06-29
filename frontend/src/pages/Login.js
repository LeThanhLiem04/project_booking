import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Login form submitted with email:', email);
      const user = await login(email, password);
      console.log('Login successful, user:', user);
      toast.success('Đăng nhập thành công!');
      
      // Chuyển hướng dựa vào role của user
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed in Login.js:', error.message);
      toast.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
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
        <Box sx={{
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background for the form
          width: '100%', // Ensure it takes full width of its container
          maxWidth: '400px', // Limit max width of the form itself
        }}>
          <Typography variant="h4" gutterBottom align="center">
            Đăng nhập
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Chưa có tài khoản?{' '}
            <Button onClick={() => navigate('/register')} disabled={isLoading}>
              Đăng ký
            </Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;