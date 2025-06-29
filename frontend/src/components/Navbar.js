import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Button,
  Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import HotelIcon from '@mui/icons-material/Hotel';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import InfoIcon from '@mui/icons-material/Info';
import { Chat as ChatIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  console.log('Navbar User Object:', user);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
    window.location.reload();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#212121' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          >
            <MenuItem component={Link} to="/" onClick={handleCloseNavMenu}>
              <ListItemIcon>
                <HomeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Trang chủ</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to="/hotels" onClick={handleCloseNavMenu}>
              <ListItemIcon>
                <HotelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Khách sạn</ListItemText>
            </MenuItem>
            <MenuItem component={Link} to="/rooms" onClick={handleCloseNavMenu}>
              <ListItemIcon>
                <MeetingRoomIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Phòng</ListItemText>
            </MenuItem>
            {user && (
              <MenuItem component={Link} to="/my-bookings" onClick={handleCloseNavMenu}>
                <ListItemIcon>
                  <BookmarkAddedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Đặt phòng của tôi</ListItemText>
              </MenuItem>
            )}
            {user && (
              <MenuItem component={Link} to="/my-payments" onClick={handleCloseNavMenu}>
                <ListItemIcon>
                  <PaymentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Lịch sử Thanh toán</ListItemText>
              </MenuItem>
            )}
            <MenuItem component={Link} to="/contact" onClick={handleCloseNavMenu}>
              <ListItemIcon>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Liên hệ</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          BOOKING HOTEL
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
          <Button component={Link} to="/" sx={{ my: 2, color: 'white', display: 'block' }}>
            Trang chủ
          </Button>
          <Button component={Link} to="/hotels" sx={{ my: 2, color: 'white', display: 'block' }}>
            Khách sạn
          </Button>
          <Button component={Link} to="/rooms" sx={{ my: 2, color: 'white', display: 'block' }}>
            Phòng
          </Button>
          {user && (
            <Button component={Link} to="/my-bookings" sx={{ my: 2, color: 'white', display: 'block' }}>
              Đặt phòng của tôi
            </Button>
          )}
{user && (
            <Button component={Link} to="/my-payments" sx={{ my: 2, color: 'white', display: 'block' }}>
              Lịch sử Thanh toán
            </Button>
          )}
          <Button component={Link} to="/contact" sx={{ my: 2, color: 'white', display: 'block' }}>
            Liên hệ
          </Button>
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          <NotificationBell />
          {user ? (
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={user.name || user.email} src={user.avatarUrl || ''} />
            </IconButton>
          ) : (
            <Button component={Link} to="/login" variant="contained" color="secondary">
              Đăng nhập
            </Button>
          )}
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Hồ sơ</ListItemText>
            </MenuItem>
            {user?.role === 'admin' && (
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin'); }}>
    <ListItemIcon>
                  <InfoIcon fontSize="small" />
    </ListItemIcon>
                <ListItemText>Bảng điều khiển Admin</ListItemText>
  </MenuItem>
)}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                {/* <LogoutIcon fontSize="small" /> */}
              </ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 