import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink, useNavigate, Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Footer from './Footer';
import NotificationBell from './NotificationBell';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
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
          zIndex: -1,
        }}
      >
        <source src="https://www.shutterstock.com/shutterstock/videos/3438942789/preview/stock-footage-purple-neon-colored-illustration-video-with-a-lofi-art-anime-a-girl-sleeps-on-her-stomach-at-a.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <AppBar position="fixed" sx={{ backgroundColor: '#000' }}>
        <Toolbar sx={{ justifyContent: 'space-between', backgroundColor: '#000' }}>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 0, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <img src="/Brikk_logo-1.gif" style={{ height: 48, display: 'block' }} />
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/" sx={{ color: '#fff', '&:hover': { color: '#00eaff' } }}>Trang chủ</Button>
            <Button color="inherit" component={RouterLink} to="/hotels" sx={{ color: '#fff', '&:hover': { color: '#00eaff' } }}>Khách sạn</Button>
            <Button color="inherit" component={RouterLink} to="/rooms" sx={{ color: '#fff', '&:hover': { color: '#00eaff' } }}>Phòng</Button>
            {user && (
              <Button color="inherit" component={RouterLink} to="/my-bookings" sx={{ color: '#fff', '&:hover': { color: '#e91e63' } }}>Đơn của tôi</Button>
            )}
            <Button color="inherit" component={RouterLink} to="/contact" sx={{ color: '#fff', '&:hover': { color: '#00eaff' } }}>Liên hệ</Button>
            {user?.role === 'admin' && (
              <Button color="inherit" component={RouterLink} to="/admin" sx={{ color: '#fff', '&:hover': { color: '#00eaff' } }}>Bảng điều khiển</Button>
            )}
          </Box>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationBell />
              <Button
                color="inherit"
                onClick={handleMenu}
                sx={{ color: '#fff', textTransform: 'none', display: 'flex', alignItems: 'center' }}
                startIcon={
                  user.avatarUrl && user.avatarUrl !== '' ? (
                    <Avatar src={user.avatarUrl} sx={{ width: 24, height: 24 }} />
                  ) : (
                    <AccountCircleIcon />
                  )
                }
              >
                Tài khoản
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Trang cá nhân
                </MenuItem>
                <MenuItem onClick={() => { navigate('/my-payments'); handleClose(); }}>
                  <ListItemIcon>
                    <AccessTimeIcon fontSize="small" />
                  </ListItemIcon>
                  Lịch sử
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login" sx={{ color: '#fff', '&:hover': { color: '#e91e63' } }}>Đăng nhập</Button>
              <Button color="inherit" component={RouterLink} to="/register" sx={{ color: '#fff', '&:hover': { color: '#e91e63' } }}>Đăng ký</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, pt: '64px', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ flexGrow: 1, background: '#fff', borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0, 234, 255, 0.15)', border: '1.5px solid #b2ebf2', p: 3 }}>
          <Outlet />
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;